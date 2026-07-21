import { EdgeData, EdgeHeadSkinId, EdgeHeadType, EdgeType, HandleSide } from './types.js';
export interface CreateEdgeParams {
    sourceNodeId: number;
    sourceHandleSide: HandleSide;
    targetNodeId: number;
    targetHandleSide: HandleSide;
    sourceCanHaveMultipleConnections?: boolean;
    targetCanHaveMultipleConnections?: boolean;
    edgeType?: EdgeType;
    headType?: EdgeHeadType;
    headSkinId?: EdgeHeadSkinId;
    label?: string;
    isSelected?: boolean;
    visible?: boolean;
    idOverride?: number;
}
/**
 * Canonical edge collection with adjacency indexes for fast incident-edge
 * cleanup when nodes are deleted.
 */
export declare class EdgeStore {
    readonly edges: Map<number, EdgeData>;
    private adjacency;
    private _nextId;
    get nextEdgeId(): number;
    allEdges(): EdgeData[];
    /** Remove all edges and reset internal counters. Used during graph import. */
    clear(): void;
    /**
     * Ensure the internal ID counter is at least `value`.
     * Called after graph import so new edges get IDs above the imported max.
     */
    restoreIdCounter(value: number): void;
    get(id: number): EdgeData | undefined;
    hasConnection(nodeId: number, side: HandleSide): boolean;
    add(params: CreateEdgeParams): EdgeData | null;
    remove(id: number): EdgeData | null;
    removeEdgesForNode(nodeId: number): EdgeData[];
    removeEdgesForNodes(nodeIds: Iterable<number>): EdgeData[];
    private findEdgeByEndpoints;
    private addAdjacency;
    private removeAdjacency;
}
