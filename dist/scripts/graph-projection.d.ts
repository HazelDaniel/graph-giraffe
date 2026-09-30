import type { EdgeData, GraphProjection, NodeData } from "./types.js";
/** Create a detached renderer-neutral node projection. */
export declare function projectNode(node: NodeData): NodeData;
/** Create a detached renderer-neutral edge projection. */
export declare function projectEdge(edge: EdgeData): EdgeData;
/** Project the semantic graph without exposing store or renderer objects. */
export declare function projectGraph(nodes: Iterable<NodeData>, edges: Iterable<EdgeData>): GraphProjection;
