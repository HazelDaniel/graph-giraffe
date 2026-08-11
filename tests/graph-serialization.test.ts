import { describe, expect, it } from "vitest";
import {
  WorldActionDriver,
  WorldActionSideEffects,
} from "../src/scripts/world-action-driver.js";
import {
  serializeGraph,
  deserializeGraph,
  GraphSnapshot,
  SerializedNode,
} from "../src/scripts/graph-serialization.js";
import { cloneNodeProps } from "../src/scripts/history-snapshots.js";
import { NodeData, TextureSource } from "../src/scripts/types.js";
import { getWorldPosition } from "../src/scripts/scene-graph.js";

// ─── Helpers ─────────────────────────────────────────────

function createEffects(): WorldActionSideEffects {
  return {
    showProperties: () => {},
    hideProperties: () => {},
    refreshContainerChain: () => {},
    setCompositionReference: () => {},
    clearCompositionReference: () => {},
  };
}

function createDriver() {
  const effects = createEffects();
  const driver = new WorldActionDriver({ sideEffects: effects });
  return driver;
}

/**
 * Helper to create a minimal snapshot for testing with the serialize function.
 * Uses empty texture sources since WorldActionDriver doesn't use TextureRegistry.
 */
function exportFromDriver(
  driver: WorldActionDriver,
  overrides?: Partial<{
    theme: "dark" | "light" | "neon";
    connectionMode: "group" | "node";
    bgColor: [number, number, number, number];
    fontColor: [number, number, number, number];
    camera: { panX: number; panY: number; zoom: number };
    textureSources: TextureSource[];
  }>
): GraphSnapshot {
  return serializeGraph({
    store: driver.store,
    edgeStore: driver.edgeStore,
    textureSources: overrides?.textureSources ?? [],
    theme: overrides?.theme ?? "dark",
    connectionMode: overrides?.connectionMode ?? "node",
    bgColor: overrides?.bgColor ?? [0, 0, 0, 1],
    fontColor: overrides?.fontColor ?? [1, 1, 1, 1],
    camera: overrides?.camera ?? { panX: 0, panY: 0, zoom: 1 },
  });
}

function importIntoDriver(
  driver: WorldActionDriver,
  snapshot: GraphSnapshot
): void {
  const editorState = deserializeGraph({
    snapshot,
    store: driver.store,
    edgeStore: driver.edgeStore,
    theme: "dark",
  });
  // In real editor, caller applies editorState to UI.
  // In tests we just verify it's returned correctly.
}

function assertNodeFieldsMatch(
  actual: NodeData,
  expected: SerializedNode
): void {
  expect(actual.id).toBe(expected.id);
  expect(actual.nodeType).toBe(expected.nodeType);
  expect(actual.localX).toBe(expected.localX);
  expect(actual.localY).toBe(expected.localY);
  expect(actual.width).toBe(expected.width);
  expect(actual.height).toBe(expected.height);
  expect(actual.text).toBe(expected.text);
  expect(actual.textureIds.body).toBe(expected.textureIds.body);
  expect(actual.textureIds.head).toBe(expected.textureIds.head);
  expect(actual.parentId).toBe(expected.parentId);
  expect(actual.compositionRefId).toBe(expected.compositionRefId);
  expect(Boolean(actual.isLocked)).toBe(Boolean(expected.isLocked));
  expect(Boolean(actual.isCollapsed)).toBe(Boolean(expected.isCollapsed));
}

// ─── Tests ───────────────────────────────────────────────

describe("graph serialization — round trips", () => {
  it("round-trips an empty graph", () => {
    const driver = createDriver();
    const snapshot = exportFromDriver(driver);

    expect(snapshot.version).toBe(1);
    expect(snapshot.nodes).toHaveLength(0);
    expect(snapshot.edges).toHaveLength(0);
    expect(snapshot.textures).toHaveLength(0);

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    expect(driver2.store.allNodesMap.size).toBe(0);
    expect(driver2.edgeStore.allEdges()).toHaveLength(0);
  });

  it("round-trips a single node", () => {
    const driver = createDriver();
    const node = driver.createNode("node", 42, 99)!;
    expect(node).toBeDefined();

    const snapshot = exportFromDriver(driver);
    expect(snapshot.nodes).toHaveLength(1);
    expect(snapshot.nodes[0].id).toBe(node.id);
    expect(snapshot.nodes[0].localX).toBe(42);
    expect(snapshot.nodes[0].localY).toBe(99);
    expect(snapshot.nodes[0].text).toBe(node.text);

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    const restored = driver2.store.get(node.id);
    expect(restored).toBeDefined();
    assertNodeFieldsMatch(restored!, snapshot.nodes[0]);
  });

  it("round-trips multiple nodes with edges", () => {
    const driver = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 240, 0)!;
    const c = driver.createNode("node", 480, 0)!;

    const e1 = driver.connect(a.id, "right", b.id, "left")!;
    const e2 = driver.connect(b.id, "right", c.id, "left")!;
    expect(e1).toBeDefined();
    expect(e2).toBeDefined();

    const snapshot = exportFromDriver(driver);
    expect(snapshot.nodes).toHaveLength(3);
    expect(snapshot.edges).toHaveLength(2);

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    expect(driver2.store.allNodesMap.size).toBe(3);
    expect(driver2.edgeStore.allEdges()).toHaveLength(2);

    // Verify edge topology
    const edges = driver2.edgeStore.allEdges();
    const edge1 = edges.find((e) => e.sourceNodeId === a.id)!;
    expect(edge1.targetNodeId).toBe(b.id);
    expect(edge1.sourceHandleSide).toBe("right");
    expect(edge1.targetHandleSide).toBe("left");

    const edge2 = edges.find((e) => e.sourceNodeId === b.id)!;
    expect(edge2.targetNodeId).toBe(c.id);

    // Verify handle connection state was rebuilt
    const restoredA = driver2.store.get(a.id)!;
    const restoredB = driver2.store.get(b.id)!;
    expect(
      restoredA.handles.find((h) => h.side === "right")?.isConnected
    ).toBe(true);
    expect(
      restoredB.handles.find((h) => h.side === "left")?.isConnected
    ).toBe(true);
    expect(
      restoredB.handles.find((h) => h.side === "right")?.isConnected
    ).toBe(true);
  });

  it("round-trips parent-child hierarchy (group + children)", () => {
    const driver = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const childA = driver.createNode("node", 10, 10, group.id)!;
    const childB = driver.createNode("node", 10, 80, group.id)!;

    const snapshot = exportFromDriver(driver);

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    const restoredGroup = driver2.store.get(group.id)!;
    expect(restoredGroup).toBeDefined();
    expect(restoredGroup.nodeType).toBe("group");
    expect(restoredGroup.childIds).toContain(childA.id);
    expect(restoredGroup.childIds).toContain(childB.id);

    const restoredChildA = driver2.store.get(childA.id)!;
    expect(restoredChildA.parentId).toBe(group.id);
  });

  it("round-trips node props with deep equality", () => {
    const driver = createDriver();
    const node = driver.createNode("node", 0, 0)!;
    expect(node.props).toBeDefined();

    // Capture original props before export
    const originalProps = cloneNodeProps(node.props);

    const snapshot = exportFromDriver(driver);

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    const restored = driver2.store.get(node.id)!;
    expect(restored.props).toBeDefined();
    expect(restored.props!.groups).toEqual(originalProps!.groups);

    // Deep compare booleans
    for (const [groupKey, entries] of Object.entries(originalProps!.booleans)) {
      expect(restored.props!.booleans[groupKey]).toHaveLength(entries.length);
      for (let i = 0; i < entries.length; i++) {
        expect(restored.props!.booleans[groupKey][i].label).toBe(
          entries[i].label
        );
        expect(restored.props!.booleans[groupKey][i].value).toBe(
          entries[i].value
        );
      }
    }
  });

  it("round-trips editor state (theme, colors, camera)", () => {
    const driver = createDriver();
    driver.createNode("node", 0, 0)!;

    const bgColor: [number, number, number, number] = [0.1, 0.2, 0.3, 1.0];
    const fontColor: [number, number, number, number] = [0.9, 0.8, 0.7, 1.0];
    const camera = { panX: 100, panY: -50, zoom: 2.5 };

    const snapshot = exportFromDriver(driver, {
      theme: "neon",
      connectionMode: "group",
      bgColor,
      fontColor,
      camera,
    });

    expect(snapshot.editor.theme).toBe("neon");
    expect(snapshot.editor.connectionMode).toBe("group");
    expect(snapshot.editor.bgColor).toEqual(bgColor);
    expect(snapshot.editor.fontColor).toEqual(fontColor);
    expect(snapshot.editor.camera).toEqual(camera);

    // Verify the returned editor state from deserialization
    const driver2 = createDriver();
    const editorState = deserializeGraph({
      snapshot,
      store: driver2.store,
      edgeStore: driver2.edgeStore,
      theme: "dark",
    });

    expect(editorState.theme).toBe("neon");
    expect(editorState.connectionMode).toBe("group");
    expect(editorState.bgColor).toEqual(bgColor);
    expect(editorState.fontColor).toEqual(fontColor);
    expect(editorState.camera).toEqual(camera);
  });

  it("ensures ID counter continuity after import", () => {
    const driver = createDriver();
    driver.createNode("node", 0, 0)!;
    driver.createNode("node", 240, 0)!;
    const c = driver.createNode("node", 480, 0)!;

    const snapshot = exportFromDriver(driver);
    const maxNodeId = Math.max(...snapshot.nodes.map((n) => n.id));

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    // New node should get an ID higher than all imported IDs
    const newNode = driver2.createNode("node", 720, 0)!;
    expect(newNode.id).toBeGreaterThan(maxNodeId);
  });

  it("rejects snapshots with unsupported version", () => {
    const driver = createDriver();
    const snapshot = exportFromDriver(driver);
    // Mutate version to an unsupported value
    (snapshot as any).version = 99;

    const driver2 = createDriver();
    expect(() => importIntoDriver(driver2, snapshot)).toThrow(
      /Unsupported graph snapshot version: 99/
    );
  });

  it("round-trips a subgraph with collapsed state", () => {
    const driver = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 240, 0)!;
    const subgraph = driver.createSubgraph([a.id, b.id])!;

    driver.toggleSubgraphCollapse(subgraph.id);
    expect(driver.store.get(subgraph.id)?.isCollapsed).toBe(true);

    const snapshot = exportFromDriver(driver);
    const serializedSubgraph = snapshot.nodes.find(
      (n) => n.id === subgraph.id
    )!;
    expect(serializedSubgraph.isCollapsed).toBe(true);

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    const restoredSubgraph = driver2.store.get(subgraph.id)!;
    expect(restoredSubgraph.nodeType).toBe("subgraph");
    expect(restoredSubgraph.isCollapsed).toBe(true);
    expect(restoredSubgraph.childIds).toContain(a.id);
    expect(restoredSubgraph.childIds).toContain(b.id);
  });

  it("round-trips a subgraph clone's original reference", () => {
    const driver = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const original = driver.createSubgraph([a.id])!;
    const clone = driver.cloneSubgraph(original.id)!;
    expect(clone.subgraphRefId).toBe(original.id);

    const snapshot = exportFromDriver(driver);
    const serializedOriginal = snapshot.nodes.find(
      (n) => n.id === original.id
    )!;
    const serializedClone = snapshot.nodes.find((n) => n.id === clone.id)!;
    expect(serializedClone.subgraphRefId).toBe(original.id);
    expect(serializedOriginal.subgraphRefIds).toContain(clone.id);

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    const restoredClone = driver2.store.get(clone.id)!;
    const restoredOriginal = driver2.store.get(original.id)!;
    expect(restoredClone.subgraphRefId).toBe(original.id);
    expect(restoredOriginal.subgraphRefIds).toContain(clone.id);
  });

  it("round-trips a composition with composition-child nodes", () => {
    const driver = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const source = driver.createNode("node", 10, 10, group.id)!;
    const composition = driver.createNode("composition", 50, 50, group.id)!;

    const clone = driver.duplicateIntoComposition(source.id, composition.id)!;
    expect(clone).toBeDefined();
    expect(clone.nodeType).toBe("composition-child");

    const snapshot = exportFromDriver(driver);

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    const restoredComposition = driver2.store.get(composition.id)!;
    expect(restoredComposition.nodeType).toBe("composition");
    expect(restoredComposition.childIds).toContain(clone.id);

    const restoredClone = driver2.store.get(clone.id)!;
    expect(restoredClone.nodeType).toBe("composition-child");
    expect(restoredClone.parentId).toBe(composition.id);
  });

  it("round-trips hub nodes with fan-in/fan-out edges", () => {
    const driver = createDriver();
    const sourceA = driver.createNode("node", 0, 0)!;
    const sourceB = driver.createNode("node", 220, 0)!;
    const hub = driver.createNode("hub", 220, 120)!;
    const sink = driver.createNode("node", 440, 0)!;

    driver.connect(sourceA.id, "right", hub.id, "left")!;
    driver.connect(sourceB.id, "right", hub.id, "left")!;
    driver.connect(hub.id, "right", sink.id, "left")!;

    const snapshot = exportFromDriver(driver);
    expect(snapshot.edges).toHaveLength(3);

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    expect(driver2.edgeStore.allEdges()).toHaveLength(3);
    const restoredHub = driver2.store.get(hub.id)!;
    expect(restoredHub.nodeType).toBe("hub");
    expect(
      restoredHub.handles.find((h) => h.side === "left")?.isConnected
    ).toBe(true);
    expect(
      restoredHub.handles.find((h) => h.side === "right")?.isConnected
    ).toBe(true);
  });

  it("clears existing state before import", () => {
    const driver = createDriver();
    driver.createNode("node", 0, 0)!;
    driver.createNode("node", 240, 0)!;
    expect(driver.store.allNodesMap.size).toBe(2);

    // Create a different graph
    const driver2 = createDriver();
    driver2.createNode("hub", 100, 100)!;
    const snapshot = exportFromDriver(driver2);

    // Import into the first driver (should clear existing nodes)
    importIntoDriver(driver, snapshot);

    expect(driver.store.allNodesMap.size).toBe(1);
    const nodes = [...driver.store.allNodesMap.values()];
    expect(nodes[0].nodeType).toBe("hub");
  });

  it("serializes uploaded textures but not default ones", () => {
    const driver = createDriver();
    driver.createNode("node", 0, 0);

    const uploadedTextures: TextureSource[] = [
      {
        id: "custom-skin",
        label: "My Skin",
        kind: "node-body",
        sourceType: "upload",
        svgText: "<svg>custom</svg>",
      },
      {
        id: "default-skin",
        label: "Default",
        kind: "node-body",
        sourceType: "default",
        svgText: "<svg>default</svg>",
      },
    ];

    const snapshot = exportFromDriver(driver, {
      textureSources: uploadedTextures,
    });

    expect(snapshot.textures).toHaveLength(1);
    expect(snapshot.textures[0].id).toBe("custom-skin");
    expect(snapshot.textures[0].svgText).toBe("<svg>custom</svg>");
  });

  it("preserves edge properties through round-trip", () => {
    const driver = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 240, 0)!;

    const edge = driver.connect(a.id, "right", b.id, "left")!;
    expect(edge).toBeDefined();

    const snapshot = exportFromDriver(driver);
    const serializedEdge = snapshot.edges[0];
    expect(serializedEdge.edgeType).toBe(edge.edgeType);
    expect(serializedEdge.headType).toBe(edge.headType);
    expect(serializedEdge.headSkinId).toBe(edge.headSkinId);
    expect(serializedEdge.label).toBe(edge.label);

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    const restoredEdge = driver2.edgeStore.allEdges()[0];
    expect(restoredEdge.id).toBe(edge.id);
    expect(restoredEdge.edgeType).toBe(edge.edgeType);
    expect(restoredEdge.headType).toBe(edge.headType);
    expect(restoredEdge.headSkinId).toBe(edge.headSkinId);
    expect(restoredEdge.sourceHandleSide).toBe("right");
    expect(restoredEdge.targetHandleSide).toBe("left");
  });

  it("omits transient fields from the snapshot", () => {
    const driver = createDriver();
    const node = driver.createNode("node", 0, 0)!;
    driver.selectOnlyNode(node.id);
    expect(node.isSelected).toBe(true);

    const snapshot = exportFromDriver(driver);
    const serialized = snapshot.nodes[0];

    // These transient fields should NOT be in the serialized output
    expect("isSelected" in serialized).toBe(false);
    expect("visible" in serialized).toBe(false);
    expect("pickColor" in serialized).toBe(false);
    expect("handles" in serialized).toBe(false);
    expect("isDropTarget" in serialized).toBe(false);
  });

  it("handles deeply nested parent chains", () => {
    const driver = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const childA = driver.createNode("node", 10, 10, group.id)!;
    const childB = driver.createNode("node", 10, 80, group.id)!;
    expect(childA).toBeDefined();
    expect(childB).toBeDefined();

    // Create subgraph wrapping the group
    const subgraph = driver.createSubgraph([group.id])!;
    expect(subgraph).toBeDefined();

    const snapshot = exportFromDriver(driver);

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    // Verify 3-level hierarchy: subgraph > group > [childA, childB]
    const restoredChildA = driver2.store.get(childA.id)!;
    expect(restoredChildA.parentId).toBe(group.id);

    const restoredGroup = driver2.store.get(group.id)!;
    expect(restoredGroup.parentId).toBe(subgraph.id);
    expect(restoredGroup.childIds).toContain(childA.id);
    expect(restoredGroup.childIds).toContain(childB.id);

    const restoredSubgraph = driver2.store.get(subgraph.id)!;
    expect(restoredSubgraph.parentId).toBeNull();
    expect(restoredSubgraph.childIds).toContain(group.id);
  });

  it("edge ID counters continue above imported max", () => {
    const driver = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 240, 0)!;
    const c = driver.createNode("node", 480, 0)!;

    driver.connect(a.id, "right", b.id, "left")!;
    driver.connect(b.id, "right", c.id, "left")!;

    const snapshot = exportFromDriver(driver);
    const maxEdgeId = Math.max(...snapshot.edges.map((e) => e.id));

    const driver2 = createDriver();
    importIntoDriver(driver2, snapshot);

    // Create a new edge — its ID should be above all imported edge IDs
    const d = driver2.createNode("node", 720, 0)!;
    const newEdge = driver2.connect(c.id, "right", d.id, "left");
    expect(newEdge).toBeDefined();
    expect(newEdge!.id).toBeGreaterThan(maxEdgeId);
  });
});

describe("graph serialization — snapshot structure", () => {
  it("snapshot has correct version field", () => {
    const driver = createDriver();
    const snapshot = exportFromDriver(driver);
    expect(snapshot.version).toBe(1);
  });

  it("snapshot captures ID counters", () => {
    const driver = createDriver();
    driver.createNode("node", 0, 0)!;
    driver.createNode("node", 240, 0)!;

    const snapshot = exportFromDriver(driver);
    // counters should reflect the internal _nextId values
    expect(snapshot.counters.nodeId).toBeGreaterThan(0);
    expect(snapshot.counters.edgeId).toBeGreaterThanOrEqual(0);
  });

  it("nodes with no props serialize props as undefined", () => {
    const driver = createDriver();
    const group = driver.createNode("group", 0, 0)!;

    const snapshot = exportFromDriver(driver);
    const serializedGroup = snapshot.nodes.find((n) => n.id === group.id)!;
    expect(serializedGroup.props).toBeUndefined();
  });
});
