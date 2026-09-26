import { describe, expect, it, vi } from "vitest";
import { EdgeStore } from "../src/scripts/edge-store.js";
import { GraphEventEmitter } from "../src/scripts/events.js";
import { NodeStore } from "../src/scripts/node-store.js";
import { NodeTypeRegistry } from "../src/scripts/node-type-registry.js";
import { nodeDescriptor } from "../src/scripts/builtin-types.js";
import { DEFAULT_HANDLE_STYLE } from "../src/scripts/types.js";
import type { NodePropType } from "../src/scripts/types.js";
import { NodeEditor } from "../src/scripts/node-editor.js";

describe("connection-derived primitive state", () => {
  it("reduces props after an edge is added and removed", () => {
    const registry = new NodeTypeRegistry();
    const reducer = vi.fn(({ node, incidentEdges }: {
      node: { props?: NodePropType };
      incidentEdges: readonly unknown[];
    }) => ({
      groups: ["connection"],
      booleans: {},
      texts: {
        connection: [{
          label: "Connections",
          value: String(incidentEdges.length),
          uiPrimitive: "text",
        }],
      },
      enums: {},
    }));
    registry.register({
      ...nodeDescriptor,
      type: "semantic-node",
      connectionStateReducer: reducer,
    });

    const store = new NodeStore(
      {} as WebGL2RenderingContext,
      "node",
      DEFAULT_HANDLE_STYLE,
      registry
    );
    const edgeStore = new EdgeStore();
    const events = new GraphEventEmitter();
    const geometryChanges: number[][] = [];
    events.on("geometry:change", ({ nodeIds }) => geometryChanges.push(nodeIds));

    const source = store.add(0, 0, "source", "dark", "semantic-node");
    const target = store.add(100, 0, "target", "dark", "semantic-node");
    const edge = edgeStore.add({
      sourceNodeId: source.id,
      targetNodeId: target.id,
      sourceHandleSide: "right",
      targetHandleSide: "left",
    });
    expect(edge).toBeDefined();

    const editor = Object.create(NodeEditor.prototype) as NodeEditor & {
      store: NodeStore;
      edgeStore: EdgeStore;
      typeRegistry: NodeTypeRegistry;
      events: GraphEventEmitter;
    };
    editor.store = store;
    editor.edgeStore = edgeStore;
    editor.typeRegistry = registry;
    editor.events = events;

    (editor as unknown as { applyConnectionStateForEdge: Function })
      .applyConnectionStateForEdge(edge, "add");
    expect(reducer).toHaveBeenCalledWith(expect.objectContaining({ action: "add" }));
    expect(source.props?.texts.connection?.[0]?.value).toBe("1");
    expect(target.props?.texts.connection?.[0]?.value).toBe("1");

    edgeStore.remove(edge.id);
    (editor as unknown as { applyConnectionStateForEdge: Function })
      .applyConnectionStateForEdge(edge, "remove");
    expect(source.props?.texts.connection?.[0]?.value).toBe("0");
    expect(target.props?.texts.connection?.[0]?.value).toBe("0");
    expect(geometryChanges).toHaveLength(4);
  });
});
