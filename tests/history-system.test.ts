import { describe, expect, it, vi } from "vitest";
import { HistoryStack } from "../src/scripts/history.js";
import {
  captureNodeHistorySnapshot,
  cloneNodeProps,
} from "../src/scripts/history-snapshots.js";
import {
  WorldActionDriver,
  WorldActionSideEffects,
} from "../src/scripts/world-action-driver.js";
import { NodeData } from "../src/scripts/types.js";

function createEffects(): WorldActionSideEffects & {
  shownNodes: NodeData[];
  hiddenCount: number;
  refreshed: Array<number | null>;
  compositionRefsSet: Array<[number, number]>;
  compositionRefsCleared: Array<[number, number]>;
} {
  const effects: WorldActionSideEffects & {
    shownNodes: NodeData[];
    hiddenCount: number;
    refreshed: Array<number | null>;
    compositionRefsSet: Array<[number, number]>;
    compositionRefsCleared: Array<[number, number]>;
  } = {
    shownNodes: [],
    hiddenCount: 0,
    refreshed: [],
    compositionRefsSet: [],
    compositionRefsCleared: [],
    showProperties(node) {
      effects.shownNodes.push(node);
    },
    hideProperties() {
      effects.hiddenCount += 1;
    },
    refreshContainerChain(containerId) {
      effects.refreshed.push(containerId);
    },
    setCompositionReference(nodeId, compositionId) {
      effects.compositionRefsSet.push([nodeId, compositionId]);
    },
    clearCompositionReference(nodeId, compositionId) {
      effects.compositionRefsCleared.push([nodeId, compositionId]);
    },
  };
  return effects;
}

function createDriver(maxHistory = 100) {
  const effects = createEffects();
  const driver = new WorldActionDriver({ maxHistory, sideEffects: effects });
  return { driver, effects };
}

function getPropValue(node: NodeData, label: string): string | boolean | undefined {
  if (!node.props) return undefined;
  const primitives = [
    ...Object.values(node.props.booleans).flat(),
    ...Object.values(node.props.texts).flat(),
    ...Object.values(node.props.enums).flat(),
  ];
  return primitives.find((primitive) => primitive.label === label)?.value;
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

describe("HistoryStack", () => {
  it("enforces maxHistory and discards the oldest entries", () => {
    const history = new HistoryStack({ maxHistory: 2 });
    const undo = vi.fn();
    const redo = vi.fn();

    history.push({ undo: () => undo("first"), redo });
    history.push({ undo: () => undo("second"), redo });
    history.push({ undo: () => undo("third"), redo });

    expect(history.undoDepth).toBe(2);
    expect(history.undo()).toBe(true);
    expect(history.undo()).toBe(true);
    expect(history.undo()).toBe(false);
    expect(undo.mock.calls.map(([value]) => value)).toEqual(["third", "second"]);
  });

  it("clears redo entries when a new action is pushed after undo", () => {
    const history = new HistoryStack();

    history.push({ undo: vi.fn(), redo: vi.fn() });
    history.push({ undo: vi.fn(), redo: vi.fn() });
    history.push({ undo: vi.fn(), redo: vi.fn() });
    history.undo();
    history.undo();

    expect(history.redoDepth).toBe(2);
    history.push({ undo: vi.fn(), redo: vi.fn() });
    expect(history.redoDepth).toBe(0);
    expect(history.undoDepth).toBe(2);
  });
});

describe("history snapshots", () => {
  it("deep clones nested props, texture ids, child ids, and handle state", () => {
    const { driver } = createDriver();
    const group = driver.createNode("group", 0, 0);
    const node = driver.createNode("node", 10, 20, group?.id ?? null);
    expect(node).toBeTruthy();

    const snapshot = captureNodeHistorySnapshot(node!);
    node!.textureIds.body = "changed-body";
    node!.childIds.push(999);
    node!.handles[0].isConnected = true;
    node!.props!.booleans.Appearance[0].value = false;

    expect(snapshot.textureIds.body).not.toBe("changed-body");
    expect(snapshot.childIds).toEqual([]);
    expect(snapshot.handleStates[0].isConnected).toBe(false);
    expect(snapshot.props?.booleans.Appearance[0].value).toBe(true);
    expect(cloneNodeProps(snapshot.props)).not.toBe(snapshot.props);
  });
});

describe("world action history", () => {
  it("undoes and redoes standard connections with handle state", () => {
    const { driver } = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 240, 0)!;

    const edge = driver.connect(a.id, "right", b.id, "left");
    expect(edge).toBeTruthy();
    expect(driver.store.get(a.id)?.handles.find((h) => h.side === "right")?.isConnected).toBe(true);

    driver.undo();
    expect(driver.edgeStore.allEdges()).toHaveLength(0);
    expect(driver.store.get(a.id)?.handles.find((h) => h.side === "right")?.isConnected).toBe(false);

    driver.redo();
    expect(driver.edgeStore.allEdges()).toHaveLength(1);
    expect(driver.store.get(b.id)?.handles.find((h) => h.side === "left")?.isConnected).toBe(true);
    expectGraphIntegrity(driver);
  });

  it("clears and restores composition references through connection history", () => {
    const { driver, effects } = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const source = driver.createNode("node", 10, 10, group.id)!;
    const composition = driver.createNode("composition", 50, 50, group.id)!;

    const edge = driver.connect(source.id, "right", composition.id, "left");
    expect(edge).toBeTruthy();
    expect(driver.store.get(source.id)?.compositionRefId).toBe(composition.id);
    expect(effects.compositionRefsSet).toEqual([[source.id, composition.id]]);

    driver.undo();
    expect(driver.store.get(source.id)?.compositionRefId).toBeNull();
    expect(effects.compositionRefsCleared).toContainEqual([source.id, composition.id]);

    driver.redo();
    expect(driver.store.get(source.id)?.compositionRefId).toBe(composition.id);
    expectGraphIntegrity(driver);
  });

  it("rejects invalid connections without pushing history", () => {
    const { driver } = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 240, 0)!;
    const depthBefore = driver.history.undoDepth;

    const edge = driver.connect(a.id, "left", b.id, "left");

    expect(edge).toBeNull();
    expect(driver.edgeStore.allEdges()).toHaveLength(0);
    expect(driver.history.undoDepth).toBe(depthBefore);
  });

  it("restores deleted subtrees and incident edges", () => {
    const { driver, effects } = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const childA = driver.createNode("node", 10, 10, group.id)!;
    const childB = driver.createNode("node", 10, 80, group.id)!;
    const outside = driver.createNode("node", 300, 10)!;
    driver.connect(childA.id, "right", outside.id, "left");
    driver.connect(childB.id, "left", outside.id, "right");
    driver.selectOnlyNode(childA.id);

    driver.deleteNode(group.id);
    expect(driver.store.get(group.id)).toBeUndefined();
    expect(driver.edgeStore.allEdges()).toHaveLength(0);

    driver.undo();
    expect(driver.store.get(group.id)?.childIds).toEqual([childA.id, childB.id]);
    expect(driver.edgeStore.allEdges()).toHaveLength(2);
    expect(driver.selectedNodes).toEqual([childA.id]);
    expect(effects.shownNodes.at(-1)?.id).toBe(childA.id);
    expectGraphIntegrity(driver);
  });

  it("undoes creation by removing the node and restores selection/properties on redo", () => {
    const { driver, effects } = createDriver();
    const node = driver.createNode("node", 10, 20)!;
    expect(driver.selectedNodes).toEqual([node.id]);
    expect(effects.shownNodes.at(-1)?.id).toBe(node.id);

    driver.undo();
    expect(driver.store.get(node.id)).toBeUndefined();
    expect(driver.selectedNodes).toEqual([]);
    expect(effects.hiddenCount).toBeGreaterThan(0);

    driver.redo();
    expect(driver.store.get(node.id)).toBeDefined();
    expect(driver.selectedNodes).toEqual([node.id]);
    expect(effects.shownNodes.at(-1)?.id).toBe(node.id);
    expectGraphIntegrity(driver);
  });

  it("restores single and multi-selection world-space translations", () => {
    const { driver } = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 100, 100)!;
    const c = driver.createNode("node", 200, 200)!;

    driver.moveNodes([a.id, b.id, c.id], 25, -10);
    expect(driver.store.get(a.id)?.localX).toBe(25);
    expect(driver.store.get(c.id)?.localY).toBe(190);

    driver.undo();
    expect(driver.store.get(a.id)?.localX).toBe(0);
    expect(driver.store.get(b.id)?.localY).toBe(100);
    expect(driver.store.get(c.id)?.localX).toBe(200);

    driver.redo();
    expect(driver.store.get(b.id)?.localX).toBe(125);
    expectGraphIntegrity(driver);
  });

  it("refreshes parent bounds when undoing a child move", () => {
    const { driver, effects } = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const child = driver.createNode("node", 10, 10, group.id)!;
    effects.refreshed.length = 0;

    driver.moveNodes([child.id], 0, 120, [group.id]);
    driver.undo();

    expect(driver.store.get(child.id)?.localY).toBe(50);
    expect(effects.refreshed).toContain(group.id);
    expectGraphIntegrity(driver);
  });

  it("tracks nested prop mutations, recalculated height, and selected-node sidebar sync", () => {
    const { driver, effects } = createDriver();
    const node = driver.createNode("node", 0, 0)!;
    driver.selectOnlyNode(node.id);
    const beforeHeight = node.height;

    expect(driver.updatePropValue(node.id, "Shadow", false)).toBe(true);
    expect(getPropValue(driver.store.get(node.id)!, "Shadow")).toBe(false);
    expect(driver.store.get(node.id)?.height).toBe(beforeHeight);

    driver.undo();
    expect(getPropValue(driver.store.get(node.id)!, "Shadow")).toBe(true);
    expect(effects.shownNodes.at(-1)?.id).toBe(node.id);

    driver.redo();
    expect(getPropValue(driver.store.get(node.id)!, "Shadow")).toBe(false);
  });

  it("updates labels through undo/redo and refreshes the properties panel title", () => {
    const { driver, effects } = createDriver();
    const node = driver.createNode("node", 0, 0)!;
    driver.selectOnlyNode(node.id);

    driver.updateLabel(node.id, "Database");
    expect(driver.store.get(node.id)?.text).toBe("Database");

    driver.undo();
    expect(driver.store.get(node.id)?.text).toBe("Node 1");
    expect(effects.shownNodes.at(-1)?.text).toBe("Node 1");

    driver.redo();
    expect(driver.store.get(node.id)?.text).toBe("Database");
    expect(effects.shownNodes.at(-1)?.text).toBe("Database");
  });

  it("undoes reparenting and composition duplication without stale references", () => {
    const { driver } = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const node = driver.createNode("node", 300, 20)!;
    const composition = driver.createNode("composition", 0, 0, group.id)!;

    expect(driver.reparentNode(node.id, group.id)).toBe(true);
    expect(driver.store.get(node.id)?.parentId).toBe(group.id);
    driver.undo();
    expect(driver.store.get(node.id)?.parentId).toBeNull();
    driver.redo();
    expect(driver.store.get(group.id)?.childIds).toContain(node.id);

    driver.selectOnlyNode(node.id);
    const clone = driver.duplicateIntoComposition(node.id, composition.id)!;
    expect(clone.nodeType).toBe("composition-child");
    expect(driver.selectedNodes).toEqual([clone.id]);

    driver.undo();
    expect(driver.store.get(clone.id)).toBeUndefined();
    expect(driver.selectedNodes).toEqual([node.id]);
    expect(driver.store.get(composition.id)?.childIds).not.toContain(clone.id);
    expectGraphIntegrity(driver);
  });
});
