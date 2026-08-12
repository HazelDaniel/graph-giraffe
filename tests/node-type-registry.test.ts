import { describe, expect, it } from "vitest";
import {
  NodeTypeRegistry,
  NodeTypeDescriptor,
} from "../src/scripts/node-type-registry.js";
import {
  BUILTIN_DESCRIPTORS,
  hubDescriptor,
  subgraphDescriptor,
  nodeDescriptor,
  groupDescriptor,
  compositionDescriptor,
  compositionChildDescriptor,
} from "../src/scripts/builtin-types.js";

function createRegistry(
  ...extras: NodeTypeDescriptor[]
): NodeTypeRegistry {
  const reg = new NodeTypeRegistry();
  for (const desc of BUILTIN_DESCRIPTORS) reg.register(desc);
  for (const desc of extras) reg.register(desc);
  return reg;
}

function makeCustomDescriptor(
  overrides: Partial<NodeTypeDescriptor> & { type: string }
): NodeTypeDescriptor {
  return {
    category: "leaf",
    zTier: 0.4,
    defaultSize: { width: 100, height: 80 },
    handles: { always: true, sides: ["left", "right"], multiConnect: false },
    isConnectionCandidate: () => true,
    allowedParents: null,
    canBeRoot: true,
    defaultTextureIds: { body: "", head: "" },
    renderMode: "rounded-rect",
    renderConfig: {
      fillColor: [0.1, 0.1, 0.1, 1],
      borderColor: [0.5, 0.5, 0.5, 1],
      borderWidth: 1,
      radius: 8,
    },
    toolbarActions: ["edit", "delete"],
    ...overrides,
  };
}

describe("NodeTypeRegistry", () => {
  describe("register + get", () => {
    it("registers and retrieves a custom type", () => {
      const custom = makeCustomDescriptor({ type: "sensor" });
      const reg = createRegistry(custom);
      expect(reg.get("sensor")).toBe(custom);
      expect(reg.has("sensor")).toBe(true);
    });

    it("throws on duplicate registration", () => {
      const reg = createRegistry();
      const custom = makeCustomDescriptor({ type: "node" }); // already built-in
      expect(() => reg.register(custom)).toThrow("already registered");
    });

    it("returns undefined for unknown types", () => {
      const reg = createRegistry();
      expect(reg.get("unknown")).toBeUndefined();
      expect(reg.has("unknown")).toBe(false);
    });
  });

  describe("category queries", () => {
    it("classifies built-in container types", () => {
      const reg = createRegistry();
      expect(reg.isContainer("group")).toBe(true);
      expect(reg.isContainer("composition")).toBe(true);
      expect(reg.isContainer("subgraph")).toBe(true);
    });

    it("classifies built-in leaf types", () => {
      const reg = createRegistry();
      expect(reg.isLeaf("node")).toBe(true);
      expect(reg.isLeaf("hub")).toBe(true);
      expect(reg.isLeaf("composition-child")).toBe(true);
    });

    it("classifies a custom container type", () => {
      const custom = makeCustomDescriptor({
        type: "custom-container",
        category: "container",
      });
      const reg = createRegistry(custom);
      expect(reg.isContainer("custom-container")).toBe(true);
      expect(reg.isLeaf("custom-container")).toBe(false);
    });
  });

  describe("getZTier", () => {
    it("returns correct z-tier for built-in types", () => {
      const reg = createRegistry();
      expect(reg.getZTier("node")).toBe(0.4);
      expect(reg.getZTier("group")).toBe(0);
      expect(reg.getZTier("subgraph")).toBe(-0.05);
    });

    it("returns default for unknown types", () => {
      const reg = createRegistry();
      expect(reg.getZTier("unknown")).toBe(0.4);
    });
  });

  describe("getDefaultSize", () => {
    it("returns default size for node", () => {
      const reg = createRegistry();
      const size = reg.getDefaultSize("node");
      expect(size).toEqual({ width: 190, height: 150 });
    });

    it("returns default size for composition (220x200 container standard)", () => {
      const reg = createRegistry();
      const size = reg.getDefaultSize("composition");
      expect(size).toEqual({ width: 220, height: 200 });
    });

    it("returns collapsed size for subgraph when collapsed", () => {
      const reg = createRegistry();
      const size = reg.getDefaultSize("subgraph", true);
      expect(size).toEqual({ width: 190, height: 30 }); // NODE_LAYOUT.headerHeight
    });

    it("returns normal size when not collapsed", () => {
      const reg = createRegistry();
      const size = reg.getDefaultSize("subgraph", false);
      expect(size).toEqual({ width: 220, height: 160 });
    });

    it("returns default for unknown types", () => {
      const reg = createRegistry();
      const size = reg.getDefaultSize("unknown");
      expect(size).toEqual({ width: 190, height: 150 });
    });

    it("returns a copy, not a reference", () => {
      const reg = createRegistry();
      const a = reg.getDefaultSize("node");
      const b = reg.getDefaultSize("node");
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });

  describe("canReparentTo", () => {
    it("allows node into group", () => {
      const reg = createRegistry();
      expect(reg.canReparentTo("node", "group")).toBe(true);
    });

    it("allows node into subgraph", () => {
      const reg = createRegistry();
      expect(reg.canReparentTo("node", "subgraph")).toBe(true);
    });

    it("prevents node into composition", () => {
      const reg = createRegistry();
      expect(reg.canReparentTo("node", "composition")).toBe(false);
    });

    it("allows root placement for types with canBeRoot", () => {
      const reg = createRegistry();
      expect(reg.canReparentTo("node", null)).toBe(true);
      expect(reg.canReparentTo("group", null)).toBe(true);
    });

    it("prevents root placement for composition-child", () => {
      const reg = createRegistry();
      expect(reg.canReparentTo("composition-child", null)).toBe(false);
    });

    it("prevents reparenting into a leaf", () => {
      const reg = createRegistry();
      expect(reg.canReparentTo("node", "node")).toBe(false);
    });

    it("handles custom type with allowedParents: null (any container)", () => {
      const custom = makeCustomDescriptor({
        type: "wildcard",
        allowedParents: null,
      });
      const reg = createRegistry(custom);
      expect(reg.canReparentTo("wildcard", "group")).toBe(true);
      expect(reg.canReparentTo("wildcard", "composition")).toBe(true);
      expect(reg.canReparentTo("wildcard", "subgraph")).toBe(true);
    });
  });

  describe("connection queries", () => {
    it("isConnectionCandidate for node in 'node' mode", () => {
      const reg = createRegistry();
      expect(reg.isConnectionCandidate("node", "node")).toBe(true);
      expect(reg.isConnectionCandidate("hub", "node")).toBe(true);
      expect(reg.isConnectionCandidate("composition-child", "node")).toBe(false);
    });

    it("isConnectionCandidate for group in 'group' mode", () => {
      const reg = createRegistry();
      expect(reg.isConnectionCandidate("group", "group")).toBe(true);
      expect(reg.isConnectionCandidate("composition-child", "group")).toBe(false);
    });

    it("hasHandles returns true for always-on types", () => {
      const reg = createRegistry();
      expect(reg.hasHandles("node", "node")).toBe(true);
      expect(reg.hasHandles("hub", "node")).toBe(true);
      expect(reg.hasHandles("subgraph", "node")).toBe(true);
    });

    it("hasHandles returns false for group in node mode", () => {
      const reg = createRegistry();
      expect(reg.hasHandles("group", "node")).toBe(false);
    });

    it("allowsMultiConnect for hub", () => {
      const reg = createRegistry();
      expect(reg.allowsMultiConnect("hub")).toBe(true);
      expect(reg.allowsMultiConnect("node")).toBe(false);
    });
  });

  describe("isValidConnectionSide", () => {
    it("hub can only output from right", () => {
      const reg = createRegistry();
      expect(reg.isValidConnectionSide("hub", "right", "source")).toBe(true);
      expect(reg.isValidConnectionSide("hub", "left", "source")).toBe(false);
    });

    it("hub can only receive on left", () => {
      const reg = createRegistry();
      expect(reg.isValidConnectionSide("hub", "left", "target")).toBe(true);
      expect(reg.isValidConnectionSide("hub", "right", "target")).toBe(false);
    });

    it("subgraph has directional constraints", () => {
      const reg = createRegistry();
      expect(reg.isValidConnectionSide("subgraph", "right", "source")).toBe(true);
      expect(reg.isValidConnectionSide("subgraph", "left", "source")).toBe(false);
      expect(reg.isValidConnectionSide("subgraph", "left", "target")).toBe(true);
      expect(reg.isValidConnectionSide("subgraph", "right", "target")).toBe(false);
    });

    it("node has no directional constraints", () => {
      const reg = createRegistry();
      expect(reg.isValidConnectionSide("node", "left", "source")).toBe(true);
      expect(reg.isValidConnectionSide("node", "right", "source")).toBe(true);
      expect(reg.isValidConnectionSide("node", "left", "target")).toBe(true);
      expect(reg.isValidConnectionSide("node", "right", "target")).toBe(true);
    });

    it("returns true for unknown types (permissive default)", () => {
      const reg = createRegistry();
      expect(reg.isValidConnectionSide("unknown", "left", "source")).toBe(true);
    });

    it("custom type with directional constraints", () => {
      const custom = makeCustomDescriptor({
        type: "directional",
        handles: {
          always: true,
          sides: ["left", "right"],
          multiConnect: false,
          outputSides: ["right"],
          inputSides: ["left"],
        },
      });
      const reg = createRegistry(custom);
      expect(reg.isValidConnectionSide("directional", "right", "source")).toBe(true);
      expect(reg.isValidConnectionSide("directional", "left", "source")).toBe(false);
      expect(reg.isValidConnectionSide("directional", "left", "target")).toBe(true);
      expect(reg.isValidConnectionSide("directional", "right", "target")).toBe(false);
    });
  });

  describe("getToolbarActions", () => {
    it("returns correct actions for each built-in type", () => {
      const reg = createRegistry();
      expect(reg.getToolbarActions("node")).toEqual(["edit", "delete"]);
      expect(reg.getToolbarActions("hub")).toEqual(["edit", "delete"]);
      expect(reg.getToolbarActions("group")).toEqual(["spotlight", "edit", "delete"]);
      expect(reg.getToolbarActions("composition")).toEqual(["delete"]);
      expect(reg.getToolbarActions("composition-child")).toEqual(["edit", "delete"]);
    });

    it("returns normal actions for subgraph when not collapsed", () => {
      const reg = createRegistry();
      expect(reg.getToolbarActions("subgraph", false)).toEqual([
        "collapse", "ungraph", "clone", "edit", "delete",
      ]);
    });

    it("returns collapsed actions for subgraph when collapsed", () => {
      const reg = createRegistry();
      expect(reg.getToolbarActions("subgraph", true)).toEqual([
        "expand", "clone", "edit", "delete",
      ]);
    });

    it("returns empty for unknown types", () => {
      const reg = createRegistry();
      expect(reg.getToolbarActions("unknown")).toEqual([]);
    });
  });

  describe("contributesToChildWorldPosition", () => {
    it("group contributes to child position", () => {
      const reg = createRegistry();
      expect(reg.contributesToChildWorldPosition("group")).toBe(true);
    });

    it("composition contributes to child position", () => {
      const reg = createRegistry();
      expect(reg.contributesToChildWorldPosition("composition")).toBe(true);
    });

    it("subgraph does not contribute to child position", () => {
      const reg = createRegistry();
      expect(reg.contributesToChildWorldPosition("subgraph")).toBe(false);
    });

    it("defaults to true for unknown types", () => {
      const reg = createRegistry();
      expect(reg.contributesToChildWorldPosition("unknown")).toBe(true);
    });
  });

  describe("getAll iterator", () => {
    it("iterates all registered descriptors", () => {
      const custom = makeCustomDescriptor({ type: "sensor" });
      const reg = createRegistry(custom);
      const all = [...reg.getAll()];
      expect(all.length).toBe(BUILTIN_DESCRIPTORS.length + 1);
      expect(all).toContain(custom);
    });
  });

  describe("replace + renderMode enforcement", () => {
    it("replace() swaps an existing descriptor under the same type name", () => {
      const reg = createRegistry();
      const domNode = {
        ...nodeDescriptor,
        renderMode: "dom" as const,
        defaultTextureIds: { body: "", head: "" },
        domRenderer: { createView: () => document.createElement("div") },
      };
      reg.replace(domNode);
      expect(reg.get("node")).toBe(domNode);
      expect(reg.isDomRendered("node")).toBe(true);
      expect(reg.isLeaf("node")).toBe(true);
    });

    it("replace() registers a brand-new type when none exists", () => {
      const reg = createRegistry();
      const custom = makeCustomDescriptor({ type: "fresh" });
      reg.replace(custom);
      expect(reg.get("fresh")).toBe(custom);
    });

    it("replace() keeps container classification in sync", () => {
      const reg = createRegistry();
      const domGroup = {
        ...groupDescriptor,
        renderMode: "dom" as const,
        defaultTextureIds: { body: "", head: "" },
        domRenderer: { createView: () => document.createElement("div") },
      };
      reg.replace(domGroup);
      expect(reg.isContainer("group")).toBe(true);
      expect(reg.isLeaf("group")).toBe(false);
    });

    it("rejects DOM descriptors in webgl mode", () => {
      const reg = createRegistry();
      reg.setRenderMode("webgl");
      const domDesc = {
        ...nodeDescriptor,
        type: "dom-extra",
        renderMode: "dom" as const,
        defaultTextureIds: { body: "", head: "" },
        domRenderer: { createView: () => document.createElement("div") },
      };
      expect(() => reg.register(domDesc)).toThrow(/webgl mode/);
      expect(() => reg.replace(domDesc)).toThrow(/webgl mode/);
    });

    it("rejects non-DOM descriptors in dom mode", () => {
      const reg = new NodeTypeRegistry();
      reg.setRenderMode("dom");
      const webglDesc = makeCustomDescriptor({ type: "gl-only" });
      expect(() => reg.register(webglDesc)).toThrow(/dom mode/);
      expect(() => reg.replace(webglDesc)).toThrow(/dom mode/);
    });

    it("allows DOM descriptors in dom mode", () => {
      const reg = new NodeTypeRegistry();
      reg.setRenderMode("dom");
      const domDesc = {
        ...nodeDescriptor,
        renderMode: "dom" as const,
        defaultTextureIds: { body: "", head: "" },
        domRenderer: { createView: () => document.createElement("div") },
      };
      reg.register(domDesc);
      expect(reg.isDomRendered("node")).toBe(true);
    });
  });

  describe("built-in descriptor integrity", () => {
    it("all 6 built-in descriptors have overlayConfig", () => {
      for (const desc of BUILTIN_DESCRIPTORS) {
        expect(desc.overlayConfig).toBeDefined();
      }
    });

    it("hub and subgraph have directional handle constraints", () => {
      expect(hubDescriptor.handles.outputSides).toEqual(["right"]);
      expect(hubDescriptor.handles.inputSides).toEqual(["left"]);
      expect(subgraphDescriptor.handles.outputSides).toEqual(["right"]);
      expect(subgraphDescriptor.handles.inputSides).toEqual(["left"]);
    });

    it("node has no directional constraints", () => {
      expect(nodeDescriptor.handles.outputSides).toBeUndefined();
      expect(nodeDescriptor.handles.inputSides).toBeUndefined();
    });

    it("subgraph has collapsedToolbarActions", () => {
      expect(subgraphDescriptor.collapsedToolbarActions).toEqual([
        "expand", "clone", "edit", "delete",
      ]);
    });

    it("group has usesCanvasLabel", () => {
      expect(groupDescriptor.usesCanvasLabel).toBe(true);
    });

    it("rounded-rect types have renderConfig", () => {
      expect(hubDescriptor.renderMode).toBe("rounded-rect");
      expect(hubDescriptor.renderConfig).toBeDefined();
      expect(subgraphDescriptor.renderMode).toBe("rounded-rect");
      expect(subgraphDescriptor.renderConfig).toBeDefined();
    });

    it("dom node types are queryable via isDomRendered / getDomRenderer", () => {
      const reg = createRegistry({
        ...nodeDescriptor,
        type: "dom-slider",
        renderMode: "dom",
        defaultTextureIds: { body: "", head: "" },
        domRenderer: {
          createView: () => document.createElement("div"),
          updateView: () => {},
          destroyView: () => {},
        },
      });

      expect(reg.isDomRendered("dom-slider")).toBe(true);
      expect(reg.isDomRendered("node")).toBe(false);
      expect(reg.isDomRendered("unknown")).toBe(false);
      expect(reg.getDomRenderer("dom-slider")).toBeDefined();
      expect(reg.getDomRenderer("node")).toBeUndefined();
    });
  });
});
