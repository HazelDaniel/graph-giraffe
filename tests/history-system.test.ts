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
import { getWorldPosition } from "../src/scripts/scene-graph.js";

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

  it("rejects connections that cross subgraph boundaries", () => {
    const { driver } = createDriver();
    const outside = driver.createNode("node", 0, 0)!;
    const insideA = driver.createNode("node", 120, 0)!;
    const insideB = driver.createNode("node", 240, 0)!;
    const otherInside = driver.createNode("node", 360, 0)!;
    driver.createSubgraph([insideA.id, insideB.id])!;
    driver.createSubgraph([otherInside.id])!;

    expect(driver.connect(outside.id, "right", insideA.id, "left")).toBeNull();
    expect(driver.connect(insideA.id, "right", otherInside.id, "left")).toBeNull();
    expectGraphIntegrity(driver);
  });

  it("allows connections within the same subgraph", () => {
    const { driver } = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 240, 0)!;
    const subgraph = driver.createSubgraph([a.id, b.id])!;

    expect(driver.connect(a.id, "right", b.id, "left")).toBeTruthy();
    expect(driver.store.get(a.id)?.parentId).toBe(subgraph.id);
    expectGraphIntegrity(driver);
  });

  it("allows hubs to fan in on the left and fan out on the right", () => {
    const { driver } = createDriver();
    const sourceA = driver.createNode("node", 0, 0)!;
    const sourceB = driver.createNode("node", 220, 0)!;
    const sinkA = driver.createNode("node", 440, 0)!;
    const sinkB = driver.createNode("node", 660, 0)!;
    const hub = driver.createNode("hub", 220, 120)!;

    expect(driver.connect(sourceA.id, "right", hub.id, "left")).toBeTruthy();
    expect(driver.connect(sourceB.id, "right", hub.id, "left")).toBeTruthy();
    expect(driver.connect(hub.id, "right", sinkA.id, "left")).toBeTruthy();
    expect(driver.connect(hub.id, "right", sinkB.id, "left")).toBeTruthy();
    expect(driver.connect(hub.id, "left", sinkA.id, "right")).toBeNull();
    expect(driver.connect(sourceA.id, "right", hub.id, "right")).toBeNull();
    expectGraphIntegrity(driver);
  });

  it("creates a hub and seed edge from a dropped connection", () => {
    const { driver } = createDriver();
    const source = driver.createNode("node", 0, 0)!;

    const hub = driver.createHubFromConnectionDrop(source.id, "right", 200, 40)!;
    const edge = driver.edgeStore.allEdges()[0]!;

    expect(hub.nodeType).toBe("hub");
    expect(edge).toBeDefined();
    expect(edge.sourceNodeId).toBe(source.id);
    expect(edge.targetNodeId).toBe(hub.id);
    expect(edge.targetHandleSide).toBe("left");
    expect(driver.selectedNodes).toEqual([hub.id]);
    expect(driver.store.get(hub.id)?.handles.find((h) => h.side === "left")?.isConnected).toBe(true);
    expect(driver.store.get(hub.id)?.handles.find((h) => h.side === "right")?.isConnected).toBe(false);
    expectGraphIntegrity(driver);
  });

  it("keeps subgraphs behind groups, compositions, and leaves in z order", () => {
    const { driver } = createDriver();
    const subgraphA = driver.createNode("subgraph", 0, 0)!;
    const subgraphB = driver.createNode("subgraph", 240, 0)!;
    const group = driver.createNode("group", 480, 0)!;
    const composition = driver.createNode("composition", 720, 0)!;
    const node = driver.createNode("node", 960, 0)!;

    expect(driver.store.getZForNode(subgraphB.id, new Set())).toBeLessThan(
      driver.store.getZForNode(subgraphA.id, new Set())
    );
    expect(driver.store.getZForNode(subgraphA.id, new Set())).toBeLessThan(
      driver.store.getZForNode(group.id, new Set())
    );
    expect(driver.store.getZForNode(group.id, new Set())).toBeLessThan(
      driver.store.getZForNode(composition.id, new Set())
    );
    expect(driver.store.getZForNode(composition.id, new Set())).toBeLessThan(
      driver.store.getZForNode(node.id, new Set())
    );
    expectGraphIntegrity(driver);
  });

  it("allows connections through a nested subgraph when both nodes share the same outer subgraph", () => {
    const { driver } = createDriver();
    const source = driver.createNode("node", 0, 0)!;
    const nestedNode = driver.createNode("node", 240, 0)!;
    const innerSubgraph = driver.createSubgraph([nestedNode.id])!;
    const outerSubgraph = driver.createSubgraph([source.id, innerSubgraph.id])!;

    expect(driver.connect(source.id, "right", innerSubgraph.id, "left")).toBeTruthy();
    expect(driver.store.get(outerSubgraph.id)?.childIds).toContain(innerSubgraph.id);
    expectGraphIntegrity(driver);
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

  it("shrinks a subgraph when its boundary groups move closer together", () => {
    const { driver } = createDriver();
    const a = driver.createNode("group", 0, 0)!;
    const b = driver.createNode("group", 140, 20)!;
    const subgraph = driver.createSubgraph([a.id, b.id])!;
    const beforeWidth = driver.store.get(subgraph.id)?.width ?? 0;
    const beforeWorld = getWorldPosition(a.id, driver.store.allNodesMap);

    driver.moveNodes([a.id], 100, 0, [subgraph.id]);

    expect(driver.store.get(a.id)?.parentId).toBe(subgraph.id);
    const movedWorld = getWorldPosition(a.id, driver.store.allNodesMap);
    const subgraphWorld = getWorldPosition(subgraph.id, driver.store.allNodesMap);
    const subgraphNode = driver.store.get(subgraph.id)!;
    expect(movedWorld.x).toBe(beforeWorld.x + 100);
    expect(movedWorld.x).toBeGreaterThanOrEqual(subgraphWorld.x + 24);
    expect(movedWorld.x + a.width).toBeLessThanOrEqual(
      subgraphWorld.x + subgraphNode.width
    );
    expect(subgraphNode.width).toBeLessThan(beforeWidth);
    expectGraphIntegrity(driver);
  });

  it("moves collapsed subgraph children with the frame and preserves the final layout on expand", () => {
    const { driver } = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 140, 20)!;
    const subgraph = driver.createSubgraph([a.id, b.id])!;
    const beforeAWorld = getWorldPosition(a.id, driver.store.allNodesMap);
    const beforeBWorld = getWorldPosition(b.id, driver.store.allNodesMap);

    driver.toggleSubgraphCollapse(subgraph.id);
    driver.moveNodes([subgraph.id], 90, 60, [subgraph.parentId]);

    const movedAWorld = getWorldPosition(a.id, driver.store.allNodesMap);
    const movedBWorld = getWorldPosition(b.id, driver.store.allNodesMap);
    expect(movedAWorld).toEqual({
      x: beforeAWorld.x + 90,
      y: beforeAWorld.y + 60,
    });
    expect(movedBWorld).toEqual({
      x: beforeBWorld.x + 90,
      y: beforeBWorld.y + 60,
    });

    driver.undo();
    expect(getWorldPosition(a.id, driver.store.allNodesMap)).toEqual(beforeAWorld);
    expect(getWorldPosition(b.id, driver.store.allNodesMap)).toEqual(beforeBWorld);

    driver.redo();
    expect(getWorldPosition(a.id, driver.store.allNodesMap)).toEqual(movedAWorld);
    expect(getWorldPosition(b.id, driver.store.allNodesMap)).toEqual(movedBWorld);

    driver.toggleSubgraphCollapse(subgraph.id);
    const expandedSubgraph = driver.store.get(subgraph.id)!;
    const expandedWorld = getWorldPosition(subgraph.id, driver.store.allNodesMap);
    expect(expandedWorld.x).toBeLessThanOrEqual(movedAWorld.x - 24);
    expect(expandedWorld.y).toBeLessThanOrEqual(movedAWorld.y - 42);
    expect(movedBWorld.x + b.width).toBeLessThanOrEqual(
      expandedWorld.x + expandedSubgraph.width
    );
    expect(movedBWorld.y + b.height).toBeLessThanOrEqual(
      expandedWorld.y + expandedSubgraph.height
    );
    expectGraphIntegrity(driver);
  });

  it("moves collapsed subgraph descendants without changing their internal parent offsets", () => {
    const { driver } = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const child = driver.createNode("node", 24, 18, group.id)!;
    const subgraph = driver.createSubgraph([group.id])!;
    const groupLocalBefore = { x: group.localX, y: group.localY };
    const childLocalBefore = { x: child.localX, y: child.localY };
    const childWorldBefore = getWorldPosition(child.id, driver.store.allNodesMap);

    driver.toggleSubgraphCollapse(subgraph.id);
    driver.moveNodes([subgraph.id], 80, 50, [subgraph.parentId]);

    expect(group.localX).toBe(groupLocalBefore.x + 80);
    expect(group.localY).toBe(groupLocalBefore.y + 50);
    expect(child.localX).toBe(childLocalBefore.x);
    expect(child.localY).toBe(childLocalBefore.y);
    expect(getWorldPosition(child.id, driver.store.allNodesMap)).toEqual({
      x: childWorldBefore.x + 80,
      y: childWorldBefore.y + 50,
    });
    expect(driver.store.isEffectivelyVisible(group.id)).toBe(false);
    expect(driver.store.isEffectivelyVisible(child.id)).toBe(false);
    expectGraphIntegrity(driver);
  });

  it("moves descendants inside nested subgraphs when a collapsed parent subgraph moves", () => {
    const { driver } = createDriver();
    const nestedLeaf = driver.createNode("node", 20, 20)!;
    const nestedSubgraph = driver.createSubgraph([nestedLeaf.id])!;
    const outerLeaf = driver.createNode("node", 200, 40)!;
    const outerSubgraph = driver.createSubgraph([nestedSubgraph.id, outerLeaf.id])!;
    const beforeWorld = getWorldPosition(nestedLeaf.id, driver.store.allNodesMap);

    driver.toggleSubgraphCollapse(outerSubgraph.id);
    driver.moveNodes([outerSubgraph.id], 80, 50, [outerSubgraph.parentId]);

    expect(getWorldPosition(nestedLeaf.id, driver.store.allNodesMap)).toEqual({
      x: beforeWorld.x + 80,
      y: beforeWorld.y + 50,
    });
    expectGraphIntegrity(driver);
  });

  it("rejects reparenting into a group nested inside a subgraph", () => {
    const { driver } = createDriver();
    const source = driver.createNode("node", 0, 0)!;
    const targetGroup = driver.createNode("group", 200, 0)!;
    driver.createSubgraph([targetGroup.id])!;

    expect(driver.reparentNode(source.id, targetGroup.id)).toBe(false);
    expect(driver.store.get(source.id)?.parentId).toBeNull();
    expectGraphIntegrity(driver);
  });

  it("rejects cloning into a composition nested inside a subgraph", () => {
    const { driver } = createDriver();
    const source = driver.createNode("node", 0, 0)!;
    const composition = driver.createNode("composition", 200, 0)!;
    driver.createSubgraph([composition.id])!;

    expect(driver.duplicateIntoComposition(source.id, composition.id)).toBeNull();
    expect(driver.store.get(source.id)?.compositionRefId).toBeNull();
    expectGraphIntegrity(driver);
  });

  it("allows leaf nodes that are direct children of a subgraph to move", () => {
    const { driver } = createDriver();
    const child = driver.createNode("node", 20, 20)!;
    const subgraph = driver.createSubgraph([child.id])!;
    const beforeWorld = getWorldPosition(child.id, driver.store.allNodesMap);

    driver.moveNodes([child.id], 120, 0, [subgraph.id]);

    expect(getWorldPosition(child.id, driver.store.allNodesMap)).toEqual({
      x: beforeWorld.x + 120,
      y: beforeWorld.y,
    });
    expect(driver.store.get(child.id)?.parentId).toBe(subgraph.id);
    expectGraphIntegrity(driver);
  });

  it("allows groups to become children of a subgraph", () => {
    const { driver } = createDriver();
    const group = driver.createNode("group", 0, 0)!;
    const node = driver.createNode("node", 80, 40)!;
    const subgraph = driver.createSubgraph([group.id, node.id])!;

    expect(driver.store.get(group.id)?.parentId).toBe(subgraph.id);
    expect(driver.store.get(subgraph.id)?.childIds).toContain(group.id);
    expectGraphIntegrity(driver);
  });

  it("allows reparenting within the same subgraph", () => {
    const { driver } = createDriver();
    const sourceGroup = driver.createNode("group", 0, 0)!;
    const targetGroup = driver.createNode("group", 220, 0)!;
    const node = driver.createNode("node", 20, 20, sourceGroup.id)!;
    driver.createSubgraph([sourceGroup.id, targetGroup.id])!;

    expect(driver.reparentNode(node.id, targetGroup.id)).toBe(true);
    expect(driver.store.get(node.id)?.parentId).toBe(targetGroup.id);
    expectGraphIntegrity(driver);
  });

  it("allows cloning into a composition within the same subgraph", () => {
    const { driver } = createDriver();
    const sourceGroup = driver.createNode("group", 0, 0)!;
    const targetGroup = driver.createNode("group", 220, 0)!;
    const node = driver.createNode("node", 20, 20, sourceGroup.id)!;
    const composition = driver.createNode("composition", 40, 40, targetGroup.id)!;
    driver.createSubgraph([sourceGroup.id, targetGroup.id, composition.id])!;

    const clone = driver.duplicateIntoComposition(node.id, composition.id)!;
    expect(clone.nodeType).toBe("composition-child");
    expect(driver.store.get(composition.id)?.childIds).toContain(clone.id);
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

  it("rejects hubs from being nested inside groups", () => {
    const { driver } = createDriver();
    const hub = driver.createNode("hub", 0, 0)!;
    const group = driver.createNode("group", 240, 0)!;

    expect(driver.store.setParent(hub.id, group.id)).toBe(false);
    expect(driver.reparentNode(hub.id, group.id)).toBe(false);
    expect(driver.store.get(hub.id)?.parentId).toBeNull();
    expectGraphIntegrity(driver);
  });
});
