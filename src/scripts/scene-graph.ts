import { NodeData, isContainerNodeType } from './types.js';
import type { NodeTypeRegistry } from './node-type-registry.js';

/**
 * Computes the absolute world-space position of a node by recursively
 * walking up the parent chain. Root nodes (parentId === null) return their
 * localX/localY directly as world coordinates.
 *
 * This is intentionally a pure function — it has no side effects and does
 * not mutate any node. Renderers and drag handlers call it on demand.
 */
export function getWorldPosition(
  nodeId: number,
  nodes: Map<number, NodeData>,
  registry?: NodeTypeRegistry
): { x: number; y: number } {
  const node = nodes.get(nodeId);
  if (!node) return { x: 0, y: 0 };

  let x = node.localX;
  let y = node.localY;
  let currentParentId = node.parentId;

  while (currentParentId !== null) {
    const parent = nodes.get(currentParentId);
    if (!parent) break;

    const contributes = registry
      ? registry.contributesToChildWorldPosition(parent.nodeType)
      : parent.nodeType !== 'subgraph';

    if (contributes) {
      x += parent.localX;
      y += parent.localY;
    }

    currentParentId = parent.parentId;
  }

  return { x, y };
}

export function getParentFrameWorldPosition(
  parentId: number | null,
  nodes: Map<number, NodeData>,
  registry?: NodeTypeRegistry
): { x: number; y: number } {
  if (parentId === null) return { x: 0, y: 0 };

  const parent = nodes.get(parentId);
  if (!parent) return { x: 0, y: 0 };

  const contributes = registry
    ? registry.contributesToChildWorldPosition(parent.nodeType)
    : parent.nodeType !== 'subgraph';

  if (!contributes) {
    return getParentFrameWorldPosition(parent.parentId, nodes, registry);
  }

  return getWorldPosition(parentId, nodes, registry);
}

export function getOwningSubgraphId(
  nodeId: number,
  nodes: Map<number, NodeData>
): number | null {
  const node = nodes.get(nodeId);
  if (!node) return null;

  let currentId: number | null = node.parentId;
  while (currentId !== null) {
    const ancestor = nodes.get(currentId);
    if (!ancestor) break;
    if (ancestor.nodeType === 'subgraph') return ancestor.id;
    currentId = ancestor.parentId;
  }

  return null;
}

/**
 * Re-parents a node to a new parent (or to the root if newParentId is null).
 *
 * The node's visual (world) position is preserved: we compute the current
 * world position first, then derive the new local offset that produces
 * the same world position under the new parent. This prevents the node
 * from "jumping" when it is re-parented.
 */
export function reparent(
  childId: number,
  newParentId: number | null,
  nodes: Map<number, NodeData>,
  registry?: NodeTypeRegistry,
  removedAncestorId?: number
): boolean {
  const child = nodes.get(childId);
  if (!child) return false;

  if (child.parentId === newParentId) {
    return true;
  }

  if (registry) {
    if (!registry.canReparentTo(child.nodeType, newParentId !== null ? nodes.get(newParentId)?.nodeType ?? null : null)) {
      return false;
    }
    if (newParentId === null && !registry.get(child.nodeType)?.canBeRoot) {
      return false;
    }
  } else {
    if (newParentId === null) {
      if (child.nodeType === 'composition' || child.nodeType === 'composition-child') {
        return false;
      }
    } else {
      const newParent = nodes.get(newParentId);
      if (!newParent) return false;
      if (!isContainerNodeType(newParent.nodeType)) return false;

      if (child.nodeType === 'group') {
        if (newParent.nodeType !== 'subgraph') return false;
      }

      if (child.nodeType === 'hub') {
        if (newParent.nodeType === 'group') return false;
      }

      if (child.nodeType === 'composition') {
        if (newParent.nodeType !== 'group' && newParent.nodeType !== 'subgraph') return false;
      }

      if (child.nodeType === 'composition-child') {
        if (newParent.nodeType !== 'composition') return false;
      }

      if (child.nodeType === 'node') {
        if (newParent.nodeType === 'composition') return false;
      }

      if (child.nodeType === 'subgraph') {
        if (newParent.nodeType === 'composition') return false;
      }
    }
  }

  if (newParentId !== null) {
    const newParent = nodes.get(newParentId);
    if (!newParent) return false;
    if (!registry && !isContainerNodeType(newParent.nodeType)) return false;
    if (registry && !registry.isContainer(newParent.nodeType)) return false;
  }

  if (
    newParentId !== null &&
    isAncestor(newParentId, childId, nodes, removedAncestorId)
  ) {
    return false;
  }

  const childWorld = getWorldPosition(childId, nodes, registry);

  if (child.parentId !== null) {
    const oldParent = nodes.get(child.parentId);
    if (oldParent) {
      oldParent.childIds = oldParent.childIds.filter((id) => id !== childId);
    }
  }

  if (newParentId !== null) {
    const newParent = nodes.get(newParentId);
    if (!newParent) return false;
    const newParentWorld = getParentFrameWorldPosition(newParentId, nodes, registry);
    child.localX = childWorld.x - newParentWorld.x;
    child.localY = childWorld.y - newParentWorld.y;

    if (newParent && !newParent.childIds.includes(childId)) {
      newParent.childIds.push(childId);
    }
  } else {
    child.localX = childWorld.x;
    child.localY = childWorld.y;
  }

  child.parentId = newParentId;
  return true;
}

/**
 * Returns true if `ancestorId` is an ancestor of `nodeId` in the tree.
 * Used to prevent cycles when re-parenting.
 *
 * When `removedAncestorId` is given (the container being removed by
 * removeContainerOnly), a path through that container is not treated as an
 * ancestor chain: the children are being promoted past the removed container
 * up to its parent, which cannot create a cycle.
 */
function isAncestor(
  ancestorId: number,
  nodeId: number,
  nodes: Map<number, NodeData>,
  removedAncestorId?: number
): boolean {
  let current = nodes.get(nodeId);
  while (current && current.parentId !== null) {
    if (current.parentId === removedAncestorId) return false;
    if (current.parentId === ancestorId) return true;
    current = nodes.get(current.parentId);
  }
  return false;
}
