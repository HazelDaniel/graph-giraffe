import { EdgeData, EdgeHeadSkinId, EdgeHeadType, EdgeType, HandleSide, NodeData, NodePropType, NodeTextureIds, NodeType } from "./types.js";
export interface NodeHistorySnapshot {
    id: number;
    nodeType: NodeType;
    localX: number;
    localY: number;
    width: number;
    height: number;
    text: string;
    textureIds: NodeTextureIds;
    visible: boolean;
    isSelected: boolean;
    isDropTarget: boolean;
    isLocked: boolean;
    isCollapsed: boolean;
    parentId: number | null;
    childIds: number[];
    compositionRefId: number | null;
    subgraphRefId: number | null;
    subgraphRefIds?: number[];
    props?: NodePropType;
    handleStates: Array<{
        side: HandleSide;
        isConnected: boolean;
    }>;
}
export interface EdgeHistorySnapshot {
    id: number;
    sourceNodeId: number;
    sourceHandleSide: HandleSide;
    targetNodeId: number;
    targetHandleSide: HandleSide;
    edgeType: EdgeType;
    headType: EdgeHeadType;
    headSkinId: EdgeHeadSkinId;
    label: string;
    isSelected: boolean;
    visible: boolean;
}
export declare function nodePropValueEqual(left: string | string[] | boolean, right: string | string[] | boolean): boolean;
export declare function cloneNodeProps(props: NodePropType | undefined): NodePropType | undefined;
export declare function nodePropsEqual(left: NodePropType | undefined, right: NodePropType | undefined): boolean;
export declare function captureNodeHistorySnapshot(node: NodeData): NodeHistorySnapshot;
export declare function captureEdgeHistorySnapshot(edge: EdgeData): EdgeHistorySnapshot;
/**
 * Orders node snapshots so every parent is restored before its children.
 *
 * Snapshot arrays are built from Set-insertion order, which is input-order
 * dependent (e.g. deleteSelection may list a child before its parent). When a
 * child is restored before its parent exists, applyNodeSnapshot cannot
 * re-attach it (forceRestoreNodePlacement bails on a missing parent) and the
 * child ends up orphaned. Parents-first ordering makes undo/redo deterministic
 * regardless of capture order.
 */
export declare function orderSnapshotsParentsFirst(snapshots: NodeHistorySnapshot[]): NodeHistorySnapshot[];
export type SelectionKind = "node" | "edge" | null;
export interface SelectionSnapshot {
    kind: SelectionKind;
    nodeIds: number[];
    edgeIds: number[];
}
export interface NodePlacementSnapshot {
    localX: number;
    localY: number;
    parentId: number | null;
}
