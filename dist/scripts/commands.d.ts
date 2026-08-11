import { EdgeStore } from "./edge-store.js";
import { NodeStore } from "./node-store.js";
import { EdgeHistorySnapshot, NodeHistorySnapshot, NodePlacementSnapshot, SelectionSnapshot } from "./history-snapshots.js";
import { EdgeData, ThemeName } from "./types.js";
/**
 * A serializable, replayable description of an editor action.
 *
 * Unlike the old `HistoryEntry` (opaque closures), every command carries a
 * plain-data `payload` that can be inspected, serialized, and replayed.
 */
export interface Command {
    readonly type: string;
    readonly payload: Record<string, unknown>;
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Everything a command needs to execute its undo/redo logic.
 *
 * The NodeEditor (and WorldActionDriver in tests) each build an adapter
 * object that satisfies this interface, wiring their own stores, selection
 * state, and UI controls into it.
 */
export interface CommandContext {
    readonly store: NodeStore;
    readonly edgeStore: EdgeStore;
    readonly theme: ThemeName;
    applyNodeSnapshot(snapshot: NodeHistorySnapshot): void;
    restoreNodeSnapshots(snapshots: NodeHistorySnapshot[]): void;
    restoreEdgeSnapshots(snapshots: EdgeHistorySnapshot[]): void;
    removeNodeAndIncidentEdges(nodeId: number): void;
    removeNodesAndEdges(nodeIds: Iterable<number>, edgeIds: Iterable<number>): void;
    removeContainerOnly(nodeId: number): void;
    clearSelectionState(): void;
    setNodeSelected(nodeId: number, selected: boolean): void;
    restoreSelectionSnapshot(snapshot: SelectionSnapshot): void;
    refreshContainerChain(containerId: number | null): void;
    syncPropertiesPanel(): void;
    syncToolbarState(): void;
    syncHandleStates(nodeId: number): void;
    applyCompositionReferenceForEdge(edge: EdgeData | EdgeHistorySnapshot): void;
    clearCompositionReferenceForEdge(edge: EdgeData | EdgeHistorySnapshot): void;
}
/**
 * Node property mutation (checkbox, text field, enum change in sidebar).
 */
export declare class UpdatePropCommand implements Command {
    readonly type = "update-prop";
    readonly payload: {
        beforeSnapshot: NodeHistorySnapshot;
        afterSnapshot: NodeHistorySnapshot;
        selectionBefore: SelectionSnapshot;
        parentId: number | null;
    };
    constructor(payload: UpdatePropCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Label text edit (double-click node → type → commit).
 */
export declare class UpdateLabelCommand implements Command {
    readonly type = "update-label";
    readonly payload: {
        nodeId: number;
        previousLabel: string;
        nextLabel: string;
    };
    constructor(payload: UpdateLabelCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Single node tree deletion (node + all descendants + incident edges).
 *
 * When the deleted node is a subgraph, clones referencing it cascade too, and
 * deleting a clone prunes it from its original's reference table. Any original
 * whose reference table changed while surviving the deletion is captured in
 * `referencedOriginals` so undo restores it exactly.
 */
export declare class DeleteNodeCommand implements Command {
    readonly type = "delete-node";
    readonly payload: {
        nodeId: number;
        nodeSnapshots: NodeHistorySnapshot[];
        edgeSnapshots: EdgeHistorySnapshot[];
        selectionBefore: SelectionSnapshot;
        parentId: number | null;
        referencedOriginals?: NodeHistorySnapshot[];
    };
    constructor(payload: DeleteNodeCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Single edge deletion.
 */
export declare class DeleteEdgeCommand implements Command {
    readonly type = "delete-edge";
    readonly payload: {
        edgeSnapshot: EdgeHistorySnapshot;
        selectionBefore: SelectionSnapshot;
    };
    constructor(payload: DeleteEdgeCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Multi-selection deletion (multiple nodes and/or edges at once).
 */
export declare class DeleteSelectionCommand implements Command {
    readonly type = "delete-selection";
    readonly payload: {
        nodeSnapshots: NodeHistorySnapshot[];
        edgeSnapshots: EdgeHistorySnapshot[];
        selectionBefore: SelectionSnapshot;
        removedNodeIds: number[];
        removedEdgeIds: number[];
        parentIds: number[];
        referencedOriginals?: NodeHistorySnapshot[];
    };
    constructor(payload: DeleteSelectionCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Node creation (regular node, group, or composition).
 */
export declare class CreateNodeCommand implements Command {
    readonly type = "create-node";
    readonly payload: {
        snapshot: NodeHistorySnapshot;
        parentId: number | null;
        selectionBefore: SelectionSnapshot;
        /** If true, select the created node and sync properties on redo. */
        selectOnRedo: boolean;
    };
    constructor(payload: CreateNodeCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Hub creation from a dropped connection endpoint.
 * The hub and its first edge are created together as one undoable action.
 */
export declare class CreateHubFromConnectionDropCommand implements Command {
    readonly type = "create-hub-from-connection-drop";
    readonly payload: {
        hubSnapshot: NodeHistorySnapshot;
        edgeSnapshot: EdgeHistorySnapshot;
        selectionBefore: SelectionSnapshot;
        parentId: number | null;
    };
    constructor(payload: CreateHubFromConnectionDropCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Edge creation (handle-to-handle connection drag).
 */
export declare class ConnectCommand implements Command {
    readonly type = "connect";
    readonly payload: {
        edgeSnapshot: EdgeHistorySnapshot;
    };
    constructor(payload: ConnectCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Group lock/unlock toggle.
 */
export declare class ToggleLockCommand implements Command {
    readonly type = "toggle-lock";
    readonly payload: {
        beforeSnapshot: NodeHistorySnapshot;
        afterSnapshot: NodeHistorySnapshot;
    };
    constructor(payload: ToggleLockCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
export declare class ToggleSubgraphCollapseCommand implements Command {
    readonly type = "toggle-subgraph-collapse";
    readonly payload: {
        beforeSnapshot: NodeHistorySnapshot;
        afterSnapshot: NodeHistorySnapshot;
    };
    constructor(payload: ToggleSubgraphCollapseCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
export declare class CreateSubgraphCommand implements Command {
    readonly type = "create-subgraph";
    readonly payload: {
        subgraphSnapshot: NodeHistorySnapshot;
        childBeforeSnapshots: NodeHistorySnapshot[];
        childAfterSnapshots: NodeHistorySnapshot[];
        removedEdgeSnapshots: EdgeHistorySnapshot[];
        selectionBefore: SelectionSnapshot;
    };
    constructor(payload: CreateSubgraphCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
export declare class CloneSubgraphCommand implements Command {
    readonly type = "clone-subgraph";
    readonly payload: {
        cloneSnapshot: NodeHistorySnapshot;
        originalBeforeSnapshot: NodeHistorySnapshot;
        originalAfterSnapshot: NodeHistorySnapshot;
        parentId: number | null;
        selectionBefore: SelectionSnapshot;
        selectOnRedo: boolean;
    };
    constructor(payload: CloneSubgraphCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
export declare class UngraphCommand implements Command {
    readonly type = "ungraph";
    readonly payload: {
        subgraphSnapshot: NodeHistorySnapshot;
        childBeforeSnapshots: NodeHistorySnapshot[];
        childAfterSnapshots: NodeHistorySnapshot[];
        removedEdgeSnapshots: EdgeHistorySnapshot[];
        selectionBefore: SelectionSnapshot;
    };
    constructor(payload: UngraphCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Multi-selection drop (drag a group of selected nodes, potentially onto
 * a container — may create clones and remove reference edges).
 */
export declare class MoveSelectionCommand implements Command {
    readonly type = "move-selection";
    readonly payload: {
        beforeSnapshots: NodeHistorySnapshot[];
        afterSnapshots: NodeHistorySnapshot[];
        cloneSnapshots: NodeHistorySnapshot[];
        removedReferenceEdgeSnapshots: EdgeHistorySnapshot[];
        selectionBefore: SelectionSnapshot;
        affectedParentIds: (number | null)[];
    };
    constructor(payload: MoveSelectionCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Node duplication into a composition (drag node → drop onto composition).
 * The source node snaps back; a clone is created inside the composition.
 */
export declare class DuplicateIntoCompositionCommand implements Command {
    readonly type = "duplicate-into-composition";
    readonly payload: {
        sourceId: number;
        sourcePlacement: NodePlacementSnapshot;
        cloneSnapshot: NodeHistorySnapshot;
        compositionId: number;
        selectionBefore: SelectionSnapshot;
    };
    constructor(payload: DuplicateIntoCompositionCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Single-node reparent (drag a node into / out of a group or composition).
 * Optionally removes composition reference edges when un-parenting.
 */
export declare class ReparentCommand implements Command {
    readonly type = "reparent";
    readonly payload: {
        nodeId: number;
        beforePlacement: NodePlacementSnapshot;
        afterPlacement: NodePlacementSnapshot;
        selectionBefore: SelectionSnapshot;
        removedReferenceEdgeSnapshots: EdgeHistorySnapshot[];
        /** Extra container IDs to refresh (e.g. the node itself if it's a composition). */
        extraRefreshIds: (number | null)[];
    };
    constructor(payload: ReparentCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
/**
 * Simple world-space position change (group drag, no reparenting).
 */
export declare class MoveNodeCommand implements Command {
    readonly type = "move-node";
    readonly payload: {
        nodeId: number;
        beforePlacement: NodePlacementSnapshot;
        afterPlacement: NodePlacementSnapshot;
        selectionBefore: SelectionSnapshot;
    };
    constructor(payload: MoveNodeCommand["payload"]);
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}
