import { EdgeStore } from "./edge-store.js";
import { HistoryStack, HistoryStackOptions } from "./history.js";
import { NodeStore } from "./node-store.js";
import { EdgeData, HandleSide, NodeData, NodePropValue, NodeType, ThemeName } from "./types.js";
export interface WorldActionSideEffects {
    showProperties(node: NodeData): void;
    hideProperties(): void;
    enableUndo?(): void;
    disableUndo?(): void;
    enableRedo?(): void;
    disableRedo?(): void;
    refreshContainerChain?(containerId: number | null): void;
    setCompositionReference?(nodeId: number, compositionId: number): void;
    clearCompositionReference?(nodeId: number, compositionId: number): void;
}
export interface WorldActionDriverOptions extends HistoryStackOptions {
    theme?: ThemeName;
    sideEffects?: Partial<WorldActionSideEffects>;
}
export declare class WorldActionDriver {
    readonly store: NodeStore;
    readonly edgeStore: EdgeStore;
    readonly history: HistoryStack;
    private readonly sideEffects;
    private readonly theme;
    private selectedNodeIds;
    private selectedEdgeIds;
    private selectionKind;
    constructor(options?: WorldActionDriverOptions);
    get selectedNodes(): number[];
    get selectedEdges(): number[];
    selectOnlyNode(nodeId: number): void;
    clearSelection(): void;
    createNode(nodeType: NodeType, worldX: number, worldY: number, parentId?: number | null): NodeData | null;
    connect(sourceNodeId: number, sourceHandleSide: HandleSide, targetNodeId: number, targetHandleSide: HandleSide): EdgeData | null;
    deleteNode(nodeId: number): void;
    /**
     * Single edge deletion, mirroring the editor's `deleteEdgeWithHistory`.
     *
     * Removes the edge (and any composition reference it carried), syncs handle
     * state on both endpoints, then pushes a {@link DeleteEdgeCommand}.
     */
    deleteEdge(edgeId: number): boolean;
    /**
     * Multi-selection deletion (nodes and/or edges), mirroring the editor's
     * `deleteCurrentSelectionWithHistory` dispatch: a lone node routes to
     * {@link DeleteNodeCommand}, a lone edge to {@link DeleteEdgeCommand}, and
     * anything larger to {@link DeleteSelectionCommand}.
     */
    deleteSelection(nodeIds: number[], edgeIds: number[]): boolean;
    /**
     * Single-node world-space translation, mirroring the editor's
     * {@link MoveNodeCommand} fallback (no reparenting, no container refit).
     *
     * Production only routes leaf primitives through MoveNodeCommand — container
     * roots (subgraph/group/composition) move via MoveSelectionCommand with
     * subtree snapshots and descendant translation, so reject them here to keep
     * the driver's command semantics identical.
     */
    moveNode(nodeId: number, deltaX: number, deltaY: number): boolean;
    /**
     * Group lock/unlock toggle, mirroring the editor's lock-button click.
     */
    toggleLock(nodeId: number): boolean;
    moveNodes(nodeIds: number[], deltaX: number, deltaY: number, affectedParentIds?: Array<number | null>): void;
    reparentNode(nodeId: number, parentId: number | null): boolean;
    duplicateIntoComposition(sourceId: number, compositionId: number): NodeData | null;
    createHubFromConnectionDrop(sourceNodeId: number, sourceHandleSide: HandleSide, worldX: number, worldY: number, parentId?: number | null): NodeData | null;
    createSubgraph(nodeIds: number[]): NodeData | null;
    cloneSubgraph(subgraphId: number): NodeData | null;
    toggleSubgraphCollapse(subgraphId: number): boolean;
    ungraphSubgraph(subgraphId: number): boolean;
    updateLabel(nodeId: number, label: string): boolean;
    updatePropValue(nodeId: number, label: string, value: NodePropValue): boolean;
    undo(): boolean;
    redo(): boolean;
    private pushCommand;
    private collectSubtreeIds;
    private captureBoundaryEdgeSnapshots;
    private removeBoundaryEdgesForRoots;
    private get commandContext();
    private captureSelectionSnapshot;
    private restoreSelectionSnapshot;
    private clearSelectionState;
    private setNodeSelected;
    private setEdgeSelected;
    private syncSelectionKind;
    private syncPropertiesPanel;
    private syncToolbarState;
    private captureNodePlacement;
    private captureNodeSnapshot;
    private captureNodeSnapshots;
    private captureSubtreeSnapshots;
    private captureReferencedOriginals;
    private captureEdgeSnapshotsForSelection;
    private applyNodeSnapshot;
    private restoreNodeSnapshots;
    private restoreEdgeSnapshots;
    private isValidConnection;
    private isCompositionReferenceEdge;
    private canCreateCompositionReference;
    private getOwningSubgraphId;
    private getOutermostSubgraphId;
    private canReparentIntoContainer;
    private applyCompositionReferenceForEdge;
    private clearCompositionReferenceForEdge;
    private removeNodesAndEdges;
    private removeNodeAndIncidentEdges;
    private syncHandleStates;
    private applyConnectionState;
    private refreshContainerChain;
    private refreshContainerChains;
    private setPropValue;
}
