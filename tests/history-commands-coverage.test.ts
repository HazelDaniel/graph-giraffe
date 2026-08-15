import { describe, expect, it } from "vitest";
import {
  WorldActionDriver,
  WorldActionSideEffects,
} from "../src/scripts/world-action-driver.js";
import { NodeData } from "../src/scripts/types.js";
import { getWorldPosition } from "../src/scripts/scene-graph.js";

function createEffects(): WorldActionSideEffects & {
  shownNodes: NodeData[];
  refreshed: Array<number | null>;
} {
  const effects: WorldActionSideEffects & {
    shownNodes: NodeData[];
    refreshed: Array<number | null>;
  } = {
    shownNodes: [],
    refreshed: [],
    showProperties(node) {
      effects.shownNodes.push(node);
    },
    hideProperties() {},
    refreshContainerChain(containerId) {
      effects.refreshed.push(containerId);
    },
  };
  return effects;
}

function createDriver(maxHistory = 100) {
  const effects = createEffects();
  const driver = new WorldActionDriver({ maxHistory, sideEffects: effects });
  return { driver, effects };
}

function expectGraphIntegrity(driver: WorldActionDriver): void {
  const nodes = driver.store.allNodesMap;

  for (const node of nodes.values()) {
    for (const childId of node.childIds) {
      const child = nodes.get(childId);
      expect(child, `missing child ${childId}`).toBeDefined();
      expect(child?.parentId).toBe(node.id);
    }

    const seen = new Set<number>();
    let current: NodeData | undefined = node;
    while (current) {
      expect(seen.has(current.id), `parent cycle at ${current.id}`).toBe(false);
      seen.add(current.id);
      current =
        current.parentId === null ? undefined : driver.store.get(current.parentId);
    }
  }

  for (const edge of driver.edgeStore.allEdges()) {
    expect(nodes.has(edge.sourceNodeId), `missing edge source ${edge.id}`).toBe(true);
    expect(nodes.has(edge.targetNodeId), `missing edge target ${edge.id}`).toBe(true);
  }
}

describe("DeleteEdgeCommand", () => {
  it("removes a single edge and restores it on undo, preserving handle state and selection", () => {
    const { driver } = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 240, 0)!;
    const edge = driver.connect(a.id, "right", b.id, "left")!;

    driver.selectOnlyNode(a.id);
    expect(driver.deleteEdge(edge.id)).toBe(true);
    expect(driver.edgeStore.allEdges()).toHaveLength(0);
    expect(driver.store.get(a.id)?.handles.find((h) => h.side === "right")?.isConnected).toBe(false);
    expect(driver.store.get(b.id)?.handles.find((h) => h.side === "left")?.isConnected).toBe(false);
    expect(driver.selectedNodes).toEqual([]);

    driver.undo();
    expect(driver.edgeStore.allEdges()).toHaveLength(1);
    expect(driver.edgeStore.get(edge.id)?.sourceNodeId).toBe(a.id);
    expect(driver.store.get(a.id)?.handles.find((h) => h.side === "right")?.isConnected).toBe(true);
    expect(driver.store.get(b.id)?.handles.find((h) => h.side === "left")?.isConnected).toBe(true);
    expect(driver.selectedNodes).toEqual([a.id]);
    expectGraphIntegrity(driver);

    driver.redo();
    expect(driver.edgeStore.allEdges()).toHaveLength(0);
    expect(driver.store.get(a.id)?.handles.find((h) => h.side === "right")?.isConnected).toBe(false);
    expectGraphIntegrity(driver);
  });

  it("is a no-op for a missing edge and pushes no history", () => {
    const { driver } = createDriver();
    const depthBefore = driver.history.undoDepth;
    expect(driver.deleteEdge(9999)).toBe(false);
    expect(driver.history.undoDepth).toBe(depthBefore);
  });

  it("clears and restores a composition reference on the edge", () => {
    const { driver } = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const source = driver.createNode("node", 10, 10, group.id)!;
    const composition = driver.createNode("composition", 50, 50, group.id)!;
    const edge = driver.connect(source.id, "right", composition.id, "left")!;
    expect(driver.store.get(source.id)?.compositionRefId).toBe(composition.id);

    driver.deleteEdge(edge.id);
    expect(driver.store.get(source.id)?.compositionRefId).toBeNull();

    driver.undo();
    expect(driver.store.get(source.id)?.compositionRefId).toBe(composition.id);
    expectGraphIntegrity(driver);
  });
});

describe("DeleteSelectionCommand", () => {
  it("deletes mixed node+edge selections and restores everything on undo", () => {
    const { driver } = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 240, 0)!;
    const c = driver.createNode("node", 480, 0)!;
    const edgeAB = driver.connect(a.id, "right", b.id, "left")!;
    const edgeBC = driver.connect(b.id, "right", c.id, "left")!;

    driver.selectOnlyNode(a.id);
    driver.edgeStore.get(edgeBC.id)!.isSelected = true;
    // Node a + edge BC selected: mixed selection → DeleteSelectionCommand.
    expect(driver.deleteSelection([a.id], [edgeBC.id])).toBe(true);

    expect(driver.store.get(a.id)).toBeUndefined();
    expect(driver.edgeStore.get(edgeAB.id)).toBeUndefined();
    expect(driver.edgeStore.get(edgeBC.id)).toBeUndefined();
    expect(driver.store.get(b.id)).toBeDefined();
    expect(driver.store.get(c.id)).toBeDefined();

    driver.undo();
    expect(driver.store.get(a.id)).toBeDefined();
    expect(driver.edgeStore.get(edgeAB.id)).toBeDefined();
    expect(driver.edgeStore.get(edgeBC.id)).toBeDefined();
    expect(driver.edgeStore.get(edgeBC.id)?.isSelected).toBe(true);
    expect(driver.selectedNodes).toEqual([a.id]);
    expect(driver.store.get(a.id)?.handles.find((h) => h.side === "right")?.isConnected).toBe(true);
    expect(driver.store.get(b.id)?.handles.find((h) => h.side === "left")?.isConnected).toBe(true);
    expectGraphIntegrity(driver);

    driver.redo();
    expect(driver.store.get(a.id)).toBeUndefined();
    expect(driver.edgeStore.allEdges()).toHaveLength(0);
    expectGraphIntegrity(driver);
  });

  it("deletes multiple nodes together and restores the full subtree on undo", () => {
    const { driver } = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const childA = driver.createNode("node", 10, 10, group.id)!;
    const childB = driver.createNode("node", 10, 80, group.id)!;
    const outside = driver.createNode("node", 300, 10)!;
    driver.connect(childA.id, "right", outside.id, "left");

    driver.selectOnlyNode(group.id);
    expect(driver.deleteSelection([group.id, outside.id], [])).toBe(true);
    expect(driver.store.get(group.id)).toBeUndefined();
    expect(driver.store.get(childA.id)).toBeUndefined();
    expect(driver.store.get(outside.id)).toBeUndefined();
    expect(driver.edgeStore.allEdges()).toHaveLength(0);

    driver.undo();
    expect(driver.store.get(group.id)?.childIds).toEqual([childA.id, childB.id]);
    expect(driver.store.get(childA.id)?.parentId).toBe(group.id);
    expect(driver.edgeStore.allEdges()).toHaveLength(1);
    expect(driver.selectedNodes).toEqual([group.id]);
    expectGraphIntegrity(driver);
  });

  it("routes a lone node to DeleteNodeCommand and a lone edge to DeleteEdgeCommand", () => {
    const { driver } = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 240, 0)!;
    const edge = driver.connect(a.id, "right", b.id, "left")!;

    driver.deleteSelection([], [edge.id]);
    expect(driver.edgeStore.allEdges()).toHaveLength(0);
    driver.undo();
    expect(driver.edgeStore.allEdges()).toHaveLength(1);
    driver.redo();

    driver.deleteSelection([a.id], []);
    expect(driver.store.get(a.id)).toBeUndefined();
    driver.undo();
    expect(driver.store.get(a.id)).toBeDefined();
    expectGraphIntegrity(driver);
  });

  it("returns false and pushes nothing for an empty selection", () => {
    const { driver } = createDriver();
    const depthBefore = driver.history.undoDepth;
    expect(driver.deleteSelection([], [])).toBe(false);
    expect(driver.history.undoDepth).toBe(depthBefore);
  });
});

describe("MoveNodeCommand", () => {
  it("translates a single root node in world space and restores it on undo/redo", () => {
    const { driver } = createDriver();
    const node = driver.createNode("node", 100, 200)!;

    expect(driver.moveNode(node.id, 50, -30)).toBe(true);
    expect(driver.store.get(node.id)?.localX).toBe(150);
    expect(driver.store.get(node.id)?.localY).toBe(170);

    driver.undo();
    expect(driver.store.get(node.id)?.localX).toBe(100);
    expect(driver.store.get(node.id)?.localY).toBe(200);

    driver.redo();
    expect(driver.store.get(node.id)?.localX).toBe(150);
    expect(driver.store.get(node.id)?.localY).toBe(170);
    expectGraphIntegrity(driver);
  });

  it("keeps a parented node's world position consistent with the delta", () => {
    const { driver } = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const child = driver.createNode("node", 24, 18, group.id)!;
    const beforeWorld = getWorldPosition(child.id, driver.store.allNodesMap);

    driver.moveNode(child.id, 80, 40);
    expect(getWorldPosition(child.id, driver.store.allNodesMap)).toEqual({
      x: beforeWorld.x + 80,
      y: beforeWorld.y + 40,
    });

    driver.undo();
    expect(getWorldPosition(child.id, driver.store.allNodesMap)).toEqual(beforeWorld);
    driver.redo();
    expect(getWorldPosition(child.id, driver.store.allNodesMap)).toEqual({
      x: beforeWorld.x + 80,
      y: beforeWorld.y + 40,
    });
    expectGraphIntegrity(driver);
  });

  it("restores the pre-move selection state", () => {
    const { driver } = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    driver.selectOnlyNode(a.id);

    driver.moveNode(a.id, 10, 10);
    expect(driver.selectedNodes).toEqual([a.id]);

    driver.undo();
    expect(driver.selectedNodes).toEqual([a.id]);
    driver.redo();
    expect(driver.selectedNodes).toEqual([a.id]);
    expectGraphIntegrity(driver);
  });

  it("is a no-op for a zero delta and for a missing node", () => {
    const { driver } = createDriver();
    const node = driver.createNode("node", 0, 0)!;
    const depthBefore = driver.history.undoDepth;
    expect(driver.moveNode(node.id, 0, 0)).toBe(false);
    expect(driver.moveNode(9999, 5, 5)).toBe(false);
    expect(driver.history.undoDepth).toBe(depthBefore);
  });
});

describe("UngraphCommand", () => {
  it("dissolves a subgraph, freeing its children, and restores it on undo", () => {
    const { driver } = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 240, 0)!;
    const subgraph = driver.createSubgraph([a.id, b.id])!;
    const parentId = subgraph.parentId;

    expect(driver.ungraphSubgraph(subgraph.id)).toBe(true);
    expect(driver.store.get(subgraph.id)).toBeUndefined();
    expect(driver.store.get(a.id)?.parentId).toBe(parentId);
    expect(driver.store.get(b.id)?.parentId).toBe(parentId);

    driver.undo();
    expect(driver.store.get(subgraph.id)).toBeDefined();
    expect(driver.store.get(subgraph.id)?.childIds).toEqual(
      expect.arrayContaining([a.id, b.id])
    );
    expect(driver.store.get(a.id)?.parentId).toBe(subgraph.id);
    expect(driver.store.get(b.id)?.parentId).toBe(subgraph.id);
    expect(driver.selectedNodes).toEqual([subgraph.id]);
    expectGraphIntegrity(driver);

    driver.redo();
    expect(driver.store.get(subgraph.id)).toBeUndefined();
    expect(driver.store.get(a.id)?.parentId).toBe(parentId);
    expectGraphIntegrity(driver);
  });

  it("removes boundary edges on ungraph and restores them on undo", () => {
    const { driver } = createDriver();
    const inside = driver.createNode("node", 0, 0)!;
    const outside = driver.createNode("node", 400, 0)!;
    const subgraph = driver.createSubgraph([inside.id])!;

    // Connections across a subgraph boundary are rejected by the public API,
    // so seed the boundary edge directly — the state a legacy/imported graph
    // would carry.
    const edge = driver.edgeStore.add({
      sourceNodeId: inside.id,
      sourceHandleSide: "right",
      targetNodeId: outside.id,
      targetHandleSide: "left",
    })!;
    expect(edge).toBeDefined();
    expect(driver.edgeStore.get(edge.id)).toBeDefined();

    driver.ungraphSubgraph(subgraph.id);
    expect(driver.edgeStore.get(edge.id)).toBeUndefined();
    expect(driver.store.get(inside.id)?.handles.find((h) => h.side === "right")?.isConnected).toBe(false);
    expect(driver.store.get(outside.id)?.handles.find((h) => h.side === "left")?.isConnected).toBe(false);

    driver.undo();
    expect(driver.edgeStore.get(edge.id)).toBeDefined();
    expect(driver.store.get(inside.id)?.handles.find((h) => h.side === "right")?.isConnected).toBe(true);
    expect(driver.store.get(outside.id)?.handles.find((h) => h.side === "left")?.isConnected).toBe(true);
    expectGraphIntegrity(driver);

    driver.redo();
    expect(driver.edgeStore.get(edge.id)).toBeUndefined();
    expectGraphIntegrity(driver);
  });

  it("is a no-op for a non-subgraph or missing node", () => {
    const { driver } = createDriver();
    const node = driver.createNode("node", 0, 0)!;
    const depthBefore = driver.history.undoDepth;
    expect(driver.ungraphSubgraph(node.id)).toBe(false);
    expect(driver.ungraphSubgraph(9999)).toBe(false);
    expect(driver.history.undoDepth).toBe(depthBefore);
  });
});

describe("ToggleLockCommand", () => {
  it("toggles a group's lock and restores it on undo/redo", () => {
    const { driver } = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    expect(driver.store.get(group.id)?.isLocked).toBe(false);

    expect(driver.toggleLock(group.id)).toBe(true);
    expect(driver.store.get(group.id)?.isLocked).toBe(true);

    driver.undo();
    expect(driver.store.get(group.id)?.isLocked).toBe(false);

    driver.redo();
    expect(driver.store.get(group.id)?.isLocked).toBe(true);
    expectGraphIntegrity(driver);
  });

  it("toggles lock on any node type and keeps the rest of the node intact", () => {
    const { driver } = createDriver();
    const node = driver.createNode("node", 0, 0)!;
    const label = driver.store.get(node.id)?.text;

    driver.toggleLock(node.id);
    expect(driver.store.get(node.id)?.isLocked).toBe(true);
    expect(driver.store.get(node.id)?.text).toBe(label);
    expect(driver.store.get(node.id)?.localX).toBe(0);

    driver.undo();
    expect(driver.store.get(node.id)?.isLocked).toBe(false);
    expect(driver.store.get(node.id)?.text).toBe(label);
    expectGraphIntegrity(driver);
  });

  it("is a no-op for a missing node", () => {
    const { driver } = createDriver();
    const depthBefore = driver.history.undoDepth;
    expect(driver.toggleLock(9999)).toBe(false);
    expect(driver.history.undoDepth).toBe(depthBefore);
  });
});
