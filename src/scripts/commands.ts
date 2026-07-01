import { EdgeStore } from "./edge-store.js";
import { NodeStore } from "./node-store.js";
import {
  EdgeHistorySnapshot,
  NodeHistorySnapshot,
  NodePlacementSnapshot,
  SelectionSnapshot,
} from "./history-snapshots.js";
import {
  EdgeData,
  NodeData,
  ThemeName,
} from "./types.js";

// ---------------------------------------------------------------------------
// Command interfaces
// ---------------------------------------------------------------------------

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
  // Data stores
  readonly store: NodeStore;
  readonly edgeStore: EdgeStore;
  readonly theme: ThemeName;

  // High-level snapshot operations
  applyNodeSnapshot(snapshot: NodeHistorySnapshot): void;
  restoreNodeSnapshots(snapshots: NodeHistorySnapshot[]): void;
  restoreEdgeSnapshots(snapshots: EdgeHistorySnapshot[]): void;

  // Node/edge mutation helpers
  removeNodeAndIncidentEdges(nodeId: number): void;
  removeNodesAndEdges(
    nodeIds: Iterable<number>,
    edgeIds: Iterable<number>
  ): void;
  removeContainerOnly(nodeId: number): void;

  // Selection management
  clearSelectionState(): void;
  setNodeSelected(nodeId: number, selected: boolean): void;
  restoreSelectionSnapshot(snapshot: SelectionSnapshot): void;

  // Side-effects
  refreshContainerChain(containerId: number | null): void;
  syncPropertiesPanel(): void;
  syncToolbarState(): void;
  syncHandleStates(nodeId: number): void;
  applyCompositionReferenceForEdge(
    edge: EdgeData | EdgeHistorySnapshot
  ): void;
  clearCompositionReferenceForEdge(
    edge: EdgeData | EdgeHistorySnapshot
  ): void;
}

// ---------------------------------------------------------------------------
// Command implementations
// ---------------------------------------------------------------------------

/**
 * Node property mutation (checkbox, text field, enum change in sidebar).
 */
export class UpdatePropCommand implements Command {
  readonly type = "update-prop";
  readonly payload: {
    beforeSnapshot: NodeHistorySnapshot;
    afterSnapshot: NodeHistorySnapshot;
    selectionBefore: SelectionSnapshot;
    parentId: number | null;
  };

  constructor(payload: UpdatePropCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.applyNodeSnapshot(this.payload.beforeSnapshot);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncPropertiesPanel();
    ctx.refreshContainerChain(this.payload.parentId);
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.applyNodeSnapshot(this.payload.afterSnapshot);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncPropertiesPanel();
    ctx.refreshContainerChain(this.payload.parentId);
    ctx.syncToolbarState();
  }
}

/**
 * Label text edit (double-click node → type → commit).
 */
export class UpdateLabelCommand implements Command {
  readonly type = "update-label";
  readonly payload: {
    nodeId: number;
    previousLabel: string;
    nextLabel: string;
  };

  constructor(payload: UpdateLabelCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.store.updateLabel(
      this.payload.nodeId,
      this.payload.previousLabel,
      ctx.theme
    );
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.store.updateLabel(
      this.payload.nodeId,
      this.payload.nextLabel,
      ctx.theme
    );
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
}

/**
 * Single node tree deletion (node + all descendants + incident edges).
 */
export class DeleteNodeCommand implements Command {
  readonly type = "delete-node";
  readonly payload: {
    nodeId: number;
    nodeSnapshots: NodeHistorySnapshot[];
    edgeSnapshots: EdgeHistorySnapshot[];
    selectionBefore: SelectionSnapshot;
    parentId: number | null;
  };

  constructor(payload: DeleteNodeCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.restoreNodeSnapshots(this.payload.nodeSnapshots);
    ctx.restoreEdgeSnapshots(this.payload.edgeSnapshots);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.refreshContainerChain(this.payload.parentId);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.removeNodeAndIncidentEdges(this.payload.nodeId);
    ctx.clearSelectionState();
    ctx.syncPropertiesPanel();
    if (this.payload.parentId !== null) {
      ctx.refreshContainerChain(this.payload.parentId);
    }
    ctx.syncToolbarState();
  }
}

/**
 * Single edge deletion.
 */
export class DeleteEdgeCommand implements Command {
  readonly type = "delete-edge";
  readonly payload: {
    edgeSnapshot: EdgeHistorySnapshot;
    selectionBefore: SelectionSnapshot;
  };

  constructor(payload: DeleteEdgeCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.restoreEdgeSnapshots([this.payload.edgeSnapshot]);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    const removed = ctx.edgeStore.remove(this.payload.edgeSnapshot.id);
    if (removed) {
      ctx.clearCompositionReferenceForEdge(removed);
      ctx.syncHandleStates(removed.sourceNodeId);
      ctx.syncHandleStates(removed.targetNodeId);
    }
    ctx.clearSelectionState();
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
}

/**
 * Multi-selection deletion (multiple nodes and/or edges at once).
 */
export class DeleteSelectionCommand implements Command {
  readonly type = "delete-selection";
  readonly payload: {
    nodeSnapshots: NodeHistorySnapshot[];
    edgeSnapshots: EdgeHistorySnapshot[];
    selectionBefore: SelectionSnapshot;
    removedNodeIds: number[];
    removedEdgeIds: number[];
    parentIds: number[];
  };

  constructor(payload: DeleteSelectionCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.restoreNodeSnapshots(this.payload.nodeSnapshots);
    ctx.restoreEdgeSnapshots(this.payload.edgeSnapshots);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    for (const parentId of this.payload.parentIds) {
      ctx.refreshContainerChain(parentId);
    }
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.removeNodesAndEdges(
      this.payload.removedNodeIds,
      this.payload.removedEdgeIds
    );
    ctx.clearSelectionState();
    ctx.syncPropertiesPanel();
    for (const parentId of this.payload.parentIds) {
      ctx.refreshContainerChain(parentId);
    }
    ctx.syncToolbarState();
  }
}

/**
 * Node creation (regular node, group, or composition).
 */
export class CreateNodeCommand implements Command {
  readonly type = "create-node";
  readonly payload: {
    snapshot: NodeHistorySnapshot;
    parentId: number | null;
    selectionBefore: SelectionSnapshot;
    /** If true, select the created node and sync properties on redo. */
    selectOnRedo: boolean;
  };

  constructor(payload: CreateNodeCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.removeNodeAndIncidentEdges(this.payload.snapshot.id);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.refreshContainerChain(this.payload.parentId);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.applyNodeSnapshot(this.payload.snapshot);
    ctx.refreshContainerChain(this.payload.parentId);
    if (this.payload.selectOnRedo) {
      ctx.clearSelectionState();
      ctx.setNodeSelected(this.payload.snapshot.id, true);
    } else {
      ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    }
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
}

/**
 * Edge creation (handle-to-handle connection drag).
 */
export class ConnectCommand implements Command {
  readonly type = "connect";
  readonly payload: {
    edgeSnapshot: EdgeHistorySnapshot;
  };

  constructor(payload: ConnectCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    const removed = ctx.edgeStore.remove(this.payload.edgeSnapshot.id);
    if (removed) {
      ctx.clearCompositionReferenceForEdge(removed);
      ctx.syncHandleStates(removed.sourceNodeId);
      ctx.syncHandleStates(removed.targetNodeId);
    }
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.restoreEdgeSnapshots([this.payload.edgeSnapshot]);
    ctx.syncToolbarState();
  }
}

/**
 * Group lock/unlock toggle.
 */
export class ToggleLockCommand implements Command {
  readonly type = "toggle-lock";
  readonly payload: {
    beforeSnapshot: NodeHistorySnapshot;
    afterSnapshot: NodeHistorySnapshot;
  };

  constructor(payload: ToggleLockCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.applyNodeSnapshot(this.payload.beforeSnapshot);
  }

  redo(ctx: CommandContext): void {
    ctx.applyNodeSnapshot(this.payload.afterSnapshot);
  }
}

export class ToggleSubgraphCollapseCommand implements Command {
  readonly type = "toggle-subgraph-collapse";
  readonly payload: {
    beforeSnapshot: NodeHistorySnapshot;
    afterSnapshot: NodeHistorySnapshot;
  };

  constructor(payload: ToggleSubgraphCollapseCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.applyNodeSnapshot(this.payload.beforeSnapshot);
    ctx.refreshContainerChain(this.payload.beforeSnapshot.id);
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.applyNodeSnapshot(this.payload.afterSnapshot);
    ctx.refreshContainerChain(this.payload.afterSnapshot.id);
    ctx.syncToolbarState();
  }
}

export class CreateSubgraphCommand implements Command {
  readonly type = "create-subgraph";
  readonly payload: {
    subgraphSnapshot: NodeHistorySnapshot;
    childBeforeSnapshots: NodeHistorySnapshot[];
    childAfterSnapshots: NodeHistorySnapshot[];
    removedEdgeSnapshots: EdgeHistorySnapshot[];
    selectionBefore: SelectionSnapshot;
  };

  constructor(payload: CreateSubgraphCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.removeContainerOnly(this.payload.subgraphSnapshot.id);
    ctx.restoreNodeSnapshots(this.payload.childBeforeSnapshots);
    ctx.restoreEdgeSnapshots(this.payload.removedEdgeSnapshots);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.refreshContainerChain(this.payload.subgraphSnapshot.parentId);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.applyNodeSnapshot(this.payload.subgraphSnapshot);
    ctx.restoreNodeSnapshots(this.payload.childAfterSnapshots);
    for (const edge of this.payload.removedEdgeSnapshots) {
      const removed = ctx.edgeStore.remove(edge.id);
      if (removed) {
        ctx.syncHandleStates(removed.sourceNodeId);
        ctx.syncHandleStates(removed.targetNodeId);
      }
    }
    ctx.clearSelectionState();
    ctx.setNodeSelected(this.payload.subgraphSnapshot.id, true);
    ctx.refreshContainerChain(this.payload.subgraphSnapshot.id);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
}

export class UngraphCommand implements Command {
  readonly type = "ungraph";
  readonly payload: {
    subgraphSnapshot: NodeHistorySnapshot;
    childBeforeSnapshots: NodeHistorySnapshot[];
    childAfterSnapshots: NodeHistorySnapshot[];
    removedEdgeSnapshots: EdgeHistorySnapshot[];
    selectionBefore: SelectionSnapshot;
  };

  constructor(payload: UngraphCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.applyNodeSnapshot(this.payload.subgraphSnapshot);
    ctx.restoreNodeSnapshots(this.payload.childBeforeSnapshots);
    ctx.restoreEdgeSnapshots(this.payload.removedEdgeSnapshots);
    ctx.clearSelectionState();
    ctx.setNodeSelected(this.payload.subgraphSnapshot.id, true);
    ctx.refreshContainerChain(this.payload.subgraphSnapshot.id);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.removeContainerOnly(this.payload.subgraphSnapshot.id);
    for (const edge of this.payload.removedEdgeSnapshots) {
      const removed = ctx.edgeStore.remove(edge.id);
      if (removed) {
        ctx.syncHandleStates(removed.sourceNodeId);
        ctx.syncHandleStates(removed.targetNodeId);
      }
    }
    ctx.restoreNodeSnapshots(this.payload.childAfterSnapshots);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.refreshContainerChain(this.payload.subgraphSnapshot.parentId);
    ctx.syncPropertiesPanel();
    ctx.syncToolbarState();
  }
}

/**
 * Multi-selection drop (drag a group of selected nodes, potentially onto
 * a container — may create clones and remove reference edges).
 */
export class MoveSelectionCommand implements Command {
  readonly type = "move-selection";
  readonly payload: {
    beforeSnapshots: NodeHistorySnapshot[];
    afterSnapshots: NodeHistorySnapshot[];
    cloneSnapshots: NodeHistorySnapshot[];
    removedReferenceEdgeSnapshots: EdgeHistorySnapshot[];
    selectionBefore: SelectionSnapshot;
    affectedParentIds: (number | null)[];
  };

  constructor(payload: MoveSelectionCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    for (const snapshot of this.payload.cloneSnapshots) {
      ctx.removeNodeAndIncidentEdges(snapshot.id);
    }
    ctx.restoreNodeSnapshots(this.payload.beforeSnapshots);
    ctx.restoreEdgeSnapshots(this.payload.removedReferenceEdgeSnapshots);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    for (const parentId of this.payload.affectedParentIds) {
      ctx.refreshContainerChain(parentId);
    }
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.restoreNodeSnapshots(this.payload.afterSnapshots);
    for (const snapshot of this.payload.removedReferenceEdgeSnapshots) {
      const removed = ctx.edgeStore.remove(snapshot.id);
      if (removed) {
        ctx.clearCompositionReferenceForEdge(removed);
        ctx.syncHandleStates(removed.sourceNodeId);
        ctx.syncHandleStates(removed.targetNodeId);
      }
    }
    for (const snapshot of this.payload.cloneSnapshots) {
      ctx.restoreNodeSnapshots([snapshot]);
    }
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    for (const parentId of this.payload.affectedParentIds) {
      ctx.refreshContainerChain(parentId);
    }
    ctx.syncToolbarState();
  }
}

/**
 * Node duplication into a composition (drag node → drop onto composition).
 * The source node snaps back; a clone is created inside the composition.
 */
export class DuplicateIntoCompositionCommand implements Command {
  readonly type = "duplicate-into-composition";
  readonly payload: {
    sourceId: number;
    sourcePlacement: NodePlacementSnapshot;
    cloneSnapshot: NodeHistorySnapshot;
    compositionId: number;
    selectionBefore: SelectionSnapshot;
  };

  constructor(payload: DuplicateIntoCompositionCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.removeNodeAndIncidentEdges(this.payload.cloneSnapshot.id);
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.refreshContainerChain(this.payload.compositionId);
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.store.restoreNodePlacement(
      this.payload.sourceId,
      this.payload.sourcePlacement.localX,
      this.payload.sourcePlacement.localY,
      this.payload.sourcePlacement.parentId
    );
    ctx.applyNodeSnapshot(this.payload.cloneSnapshot);
    ctx.clearSelectionState();
    ctx.setNodeSelected(this.payload.cloneSnapshot.id, true);
    ctx.refreshContainerChain(this.payload.compositionId);
    ctx.syncToolbarState();
  }
}

/**
 * Single-node reparent (drag a node into / out of a group or composition).
 * Optionally removes composition reference edges when un-parenting.
 */
export class ReparentCommand implements Command {
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

  constructor(payload: ReparentCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.store.restoreNodePlacement(
      this.payload.nodeId,
      this.payload.beforePlacement.localX,
      this.payload.beforePlacement.localY,
      this.payload.beforePlacement.parentId
    );
    if (this.payload.removedReferenceEdgeSnapshots.length > 0) {
      ctx.restoreEdgeSnapshots(this.payload.removedReferenceEdgeSnapshots);
    }
    ctx.refreshContainerChain(this.payload.afterPlacement.parentId);
    ctx.refreshContainerChain(this.payload.beforePlacement.parentId);
    for (const id of this.payload.extraRefreshIds) {
      ctx.refreshContainerChain(id);
    }
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.store.restoreNodePlacement(
      this.payload.nodeId,
      this.payload.afterPlacement.localX,
      this.payload.afterPlacement.localY,
      this.payload.afterPlacement.parentId
    );
    for (const edgeSnapshot of this.payload.removedReferenceEdgeSnapshots) {
      const removed = ctx.edgeStore.remove(edgeSnapshot.id);
      if (removed) {
        ctx.clearCompositionReferenceForEdge(removed);
        ctx.syncHandleStates(removed.sourceNodeId);
        ctx.syncHandleStates(removed.targetNodeId);
      }
    }
    ctx.refreshContainerChain(this.payload.beforePlacement.parentId);
    ctx.refreshContainerChain(this.payload.afterPlacement.parentId);
    for (const id of this.payload.extraRefreshIds) {
      ctx.refreshContainerChain(id);
    }
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncToolbarState();
  }
}

/**
 * Simple world-space position change (group drag, no reparenting).
 */
export class MoveNodeCommand implements Command {
  readonly type = "move-node";
  readonly payload: {
    nodeId: number;
    beforePlacement: NodePlacementSnapshot;
    afterPlacement: NodePlacementSnapshot;
    selectionBefore: SelectionSnapshot;
  };

  constructor(payload: MoveNodeCommand["payload"]) {
    this.payload = payload;
  }

  undo(ctx: CommandContext): void {
    ctx.store.restoreNodePlacement(
      this.payload.nodeId,
      this.payload.beforePlacement.localX,
      this.payload.beforePlacement.localY,
      this.payload.beforePlacement.parentId
    );
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncToolbarState();
  }

  redo(ctx: CommandContext): void {
    ctx.store.restoreNodePlacement(
      this.payload.nodeId,
      this.payload.afterPlacement.localX,
      this.payload.afterPlacement.localY,
      this.payload.afterPlacement.parentId
    );
    ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
    ctx.syncToolbarState();
  }
}
