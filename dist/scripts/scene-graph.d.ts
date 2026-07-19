import { NodeData } from './types.js';
import type { NodeTypeRegistry } from './node-type-registry.js';
/**
 * Computes the absolute world-space position of a node by recursively
 * walking up the parent chain. Root nodes (parentId === null) return their
 * localX/localY directly as world coordinates.
 *
 * This is intentionally a pure function — it has no side effects and does
 * not mutate any node. Renderers and drag handlers call it on demand.
 */
export declare function getWorldPosition(nodeId: number, nodes: Map<number, NodeData>, registry?: NodeTypeRegistry): {
    x: number;
    y: number;
};
export declare function getParentFrameWorldPosition(parentId: number | null, nodes: Map<number, NodeData>, registry?: NodeTypeRegistry): {
    x: number;
    y: number;
};
export declare function getOwningSubgraphId(nodeId: number, nodes: Map<number, NodeData>): number | null;
/**
 * Re-parents a node to a new parent (or to the root if newParentId is null).
 *
 * The node's visual (world) position is preserved: we compute the current
 * world position first, then derive the new local offset that produces
 * the same world position under the new parent. This prevents the node
 * from "jumping" when it is re-parented.
 */
export declare function reparent(childId: number, newParentId: number | null, nodes: Map<number, NodeData>, registry?: NodeTypeRegistry): boolean;
