import { describe, it, expect, beforeEach } from 'vitest';
import { NodeStore } from '../src/scripts/node-store.js';
import { EdgeStore } from '../src/scripts/edge-store.js';
import { NodeTypeRegistry } from '../src/scripts/node-type-registry.js';
import { BUILTIN_DESCRIPTORS } from '../src/scripts/builtin-types.js';
import { serializeGraph, deserializeGraph } from '../src/scripts/graph-serialization.js';
import { Camera } from '../src/scripts/camera.js';

describe('Branch Node Primitive', () => {
  let registry: NodeTypeRegistry;
  let store: NodeStore;
  let edgeStore: EdgeStore;

  beforeEach(() => {
    registry = new NodeTypeRegistry();
    for (const desc of BUILTIN_DESCRIPTORS) {
      registry.register(desc);
    }
    store = new NodeStore('dark', registry);
    edgeStore = new EdgeStore(registry);
  });

  it('registers branch descriptor correctly in registry', () => {
    expect(registry.has('branch')).toBe(true);
    const desc = registry.get('branch');
    expect(desc).toBeDefined();
    expect(desc?.type).toBe('branch');
    expect(desc?.category).toBe('leaf');
    expect(desc?.handles.sides).toEqual(['top', 'left', 'right']);
    expect(desc?.handles.inputSides).toEqual(['top']);
    expect(desc?.handles.outputSides).toEqual(['left', 'right']);
  });

  it('creates a branch node with 3 handles: top, left, right', () => {
    const branch = store.add(100, 100, 'Branch Node', 'dark', 'branch');
    expect(branch).toBeDefined();
    expect(branch.nodeType).toBe('branch');
    expect(branch.handles).toHaveLength(3);

    const sides = branch.handles.map((h) => h.side);
    expect(sides).toContain('top');
    expect(sides).toContain('left');
    expect(sides).toContain('right');
  });

  it('enforces connection directionality rules for branch handles', () => {
    const nodeA = store.add(0, 0, 'Source Node', 'dark', 'node');
    const branch = store.add(200, 0, 'Condition Branch', 'dark', 'branch');
    const nodeB = store.add(400, 0, 'Target Node', 'dark', 'node');

    // Inbound connection to branch's top handle -> SUCCESS
    expect(registry.isValidConnectionSide('branch', 'top', 'target')).toBe(true);
    const inEdge = edgeStore.add({
      sourceNodeId: nodeA.id,
      sourceHandleSide: 'right',
      targetNodeId: branch.id,
      targetHandleSide: 'top',
    });
    expect(inEdge).not.toBeNull();

    // Outbound connection from branch's top handle -> FAIL
    expect(registry.isValidConnectionSide('branch', 'top', 'source')).toBe(false);

    // Outbound connection from branch's left and right handles -> SUCCESS
    expect(registry.isValidConnectionSide('branch', 'left', 'source')).toBe(true);
    expect(registry.isValidConnectionSide('branch', 'right', 'source')).toBe(true);

    const outEdgeLeft = edgeStore.add({
      sourceNodeId: branch.id,
      sourceHandleSide: 'left',
      targetNodeId: nodeB.id,
      targetHandleSide: 'left',
    });
    expect(outEdgeLeft).not.toBeNull();

    // Inbound connection to branch's left or right handle -> FAIL
    expect(registry.isValidConnectionSide('branch', 'left', 'target')).toBe(false);
    expect(registry.isValidConnectionSide('branch', 'right', 'target')).toBe(false);
  });

  it('obeys subgraph container scoping rules', () => {
    const subgraph = store.add(0, 0, 'Main Subgraph', 'dark', 'subgraph');

    // Branch can be root
    expect(registry.canReparentTo('branch', null)).toBe(true);
    // Branch can be reparented inside subgraph
    expect(registry.canReparentTo('branch', 'subgraph')).toBe(true);
    // Branch cannot be reparented inside standard node or composition
    expect(registry.canReparentTo('branch', 'node')).toBe(false);
    expect(registry.canReparentTo('branch', 'composition')).toBe(false);

    const branch = store.add(50, 50, 'Scoped Branch', 'dark', 'branch');
    expect(store.setParent(branch.id, subgraph.id)).toBe(true);
    expect(branch.parentId).toBe(subgraph.id);
  });

  it('serializes and deserializes branch nodes and edges in round-trip', () => {
    const nodeA = store.add(10, 10, 'Input', 'dark', 'node');
    const branch = store.add(200, 50, 'Condition', 'dark', 'branch');
    const nodeB = store.add(400, 10, 'True Path', 'dark', 'node');
    const nodeC = store.add(400, 150, 'False Path', 'dark', 'node');

    edgeStore.add({
      sourceNodeId: nodeA.id,
      sourceHandleSide: 'right',
      targetNodeId: branch.id,
      targetHandleSide: 'top',
    });

    edgeStore.add({
      sourceNodeId: branch.id,
      sourceHandleSide: 'left',
      targetNodeId: nodeB.id,
      targetHandleSide: 'left',
    });

    edgeStore.add({
      sourceNodeId: branch.id,
      sourceHandleSide: 'right',
      targetNodeId: nodeC.id,
      targetHandleSide: 'left',
    });

    const camera = new Camera();
    const snapshot = serializeGraph({
      store,
      edgeStore,
      textureSources: [],
      theme: 'dark',
      connectionMode: 'node',
      bgColor: [0.06, 0.09, 0.16, 1.0],
      fontColor: [1, 1, 1, 1],
      camera,
    });

    expect(snapshot.nodes).toHaveLength(4);
    expect(snapshot.edges).toHaveLength(3);

    const newStore = new NodeStore('dark', registry);
    const newEdgeStore = new EdgeStore(registry);

    deserializeGraph({
      snapshot,
      store: newStore,
      edgeStore: newEdgeStore,
      theme: 'dark',
    });

    expect(newStore.allNodesMap.size).toBe(4);
    expect(newEdgeStore.allEdges()).toHaveLength(3);

    const deserializedBranch = newStore.get(branch.id);
    expect(deserializedBranch).toBeDefined();
    expect(deserializedBranch?.nodeType).toBe('branch');
    expect(deserializedBranch?.handles).toHaveLength(3);
  });
});
