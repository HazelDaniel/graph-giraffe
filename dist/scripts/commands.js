// ---------------------------------------------------------------------------
// Command implementations
// ---------------------------------------------------------------------------
/**
 * Node property mutation (checkbox, text field, enum change in sidebar).
 */
export class UpdatePropCommand {
    type = "update-prop";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.applyNodeSnapshot(this.payload.beforeSnapshot);
        ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        ctx.syncPropertiesPanel();
        ctx.refreshContainerChain(this.payload.parentId);
        ctx.syncToolbarState();
    }
    redo(ctx) {
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
export class UpdateLabelCommand {
    type = "update-label";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.store.updateLabel(this.payload.nodeId, this.payload.previousLabel, ctx.theme);
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
    redo(ctx) {
        ctx.store.updateLabel(this.payload.nodeId, this.payload.nextLabel, ctx.theme);
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
}
/**
 * Single node tree deletion (node + all descendants + incident edges).
 *
 * When the deleted node is a subgraph, clones referencing it cascade too, and
 * deleting a clone prunes it from its original's reference table. Any original
 * whose reference table changed while surviving the deletion is captured in
 * `referencedOriginals` so undo restores it exactly.
 */
export class DeleteNodeCommand {
    type = "delete-node";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.restoreNodeSnapshots(this.payload.nodeSnapshots);
        ctx.restoreEdgeSnapshots(this.payload.edgeSnapshots);
        if (this.payload.referencedOriginals) {
            ctx.restoreNodeSnapshots(this.payload.referencedOriginals);
        }
        ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        ctx.refreshContainerChain(this.payload.parentId);
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
    redo(ctx) {
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
export class DeleteEdgeCommand {
    type = "delete-edge";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.restoreEdgeSnapshots([this.payload.edgeSnapshot]);
        ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        ctx.syncToolbarState();
    }
    redo(ctx) {
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
export class DeleteSelectionCommand {
    type = "delete-selection";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.restoreNodeSnapshots(this.payload.nodeSnapshots);
        ctx.restoreEdgeSnapshots(this.payload.edgeSnapshots);
        if (this.payload.referencedOriginals) {
            ctx.restoreNodeSnapshots(this.payload.referencedOriginals);
        }
        ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        for (const parentId of this.payload.parentIds) {
            ctx.refreshContainerChain(parentId);
        }
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
    redo(ctx) {
        ctx.removeNodesAndEdges(this.payload.removedNodeIds, this.payload.removedEdgeIds);
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
export class CreateNodeCommand {
    type = "create-node";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.removeNodeAndIncidentEdges(this.payload.snapshot.id);
        ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        ctx.refreshContainerChain(this.payload.parentId);
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
    redo(ctx) {
        ctx.applyNodeSnapshot(this.payload.snapshot);
        ctx.refreshContainerChain(this.payload.parentId);
        if (this.payload.selectOnRedo) {
            ctx.clearSelectionState();
            ctx.setNodeSelected(this.payload.snapshot.id, true);
        }
        else {
            ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        }
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
}
/**
 * Hub creation from a dropped connection endpoint.
 * The hub and its first edge are created together as one undoable action.
 */
export class CreateHubFromConnectionDropCommand {
    type = "create-hub-from-connection-drop";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.removeNodesAndEdges([this.payload.hubSnapshot.id], [this.payload.edgeSnapshot.id]);
        ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        ctx.refreshContainerChain(this.payload.parentId);
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
    redo(ctx) {
        ctx.applyNodeSnapshot(this.payload.hubSnapshot);
        ctx.restoreEdgeSnapshots([this.payload.edgeSnapshot]);
        ctx.clearSelectionState();
        ctx.setNodeSelected(this.payload.hubSnapshot.id, true);
        ctx.refreshContainerChain(this.payload.parentId);
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
}
/**
 * Edge creation (handle-to-handle connection drag).
 */
export class ConnectCommand {
    type = "connect";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        const removed = ctx.edgeStore.remove(this.payload.edgeSnapshot.id);
        if (removed) {
            ctx.clearCompositionReferenceForEdge(removed);
            ctx.syncHandleStates(removed.sourceNodeId);
            ctx.syncHandleStates(removed.targetNodeId);
        }
        ctx.syncToolbarState();
    }
    redo(ctx) {
        ctx.restoreEdgeSnapshots([this.payload.edgeSnapshot]);
        ctx.syncToolbarState();
    }
}
/**
 * Group lock/unlock toggle.
 */
export class ToggleLockCommand {
    type = "toggle-lock";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.applyNodeSnapshot(this.payload.beforeSnapshot);
    }
    redo(ctx) {
        ctx.applyNodeSnapshot(this.payload.afterSnapshot);
    }
}
export class ToggleSubgraphCollapseCommand {
    type = "toggle-subgraph-collapse";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.applyNodeSnapshot(this.payload.beforeSnapshot);
        ctx.refreshContainerChain(this.payload.beforeSnapshot.id);
        ctx.syncToolbarState();
    }
    redo(ctx) {
        ctx.applyNodeSnapshot(this.payload.afterSnapshot);
        ctx.refreshContainerChain(this.payload.afterSnapshot.id);
        ctx.syncToolbarState();
    }
}
export class CreateSubgraphCommand {
    type = "create-subgraph";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.removeContainerOnly(this.payload.subgraphSnapshot.id);
        ctx.restoreNodeSnapshots(this.payload.childBeforeSnapshots);
        ctx.restoreEdgeSnapshots(this.payload.removedEdgeSnapshots);
        ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        ctx.refreshContainerChain(this.payload.subgraphSnapshot.parentId);
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
    redo(ctx) {
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
export class CloneSubgraphCommand {
    type = "clone-subgraph";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.removeNodeAndIncidentEdges(this.payload.cloneSnapshot.id);
        ctx.applyNodeSnapshot(this.payload.originalBeforeSnapshot);
        ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        ctx.refreshContainerChain(this.payload.parentId);
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
    redo(ctx) {
        ctx.applyNodeSnapshot(this.payload.originalAfterSnapshot);
        ctx.applyNodeSnapshot(this.payload.cloneSnapshot);
        ctx.refreshContainerChain(this.payload.parentId);
        if (this.payload.selectOnRedo) {
            ctx.clearSelectionState();
            ctx.setNodeSelected(this.payload.cloneSnapshot.id, true);
        }
        else {
            ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        }
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
}
export class UngraphCommand {
    type = "ungraph";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.applyNodeSnapshot(this.payload.subgraphSnapshot);
        ctx.restoreNodeSnapshots(this.payload.childBeforeSnapshots);
        ctx.restoreEdgeSnapshots(this.payload.removedEdgeSnapshots);
        ctx.clearSelectionState();
        ctx.setNodeSelected(this.payload.subgraphSnapshot.id, true);
        ctx.refreshContainerChain(this.payload.subgraphSnapshot.id);
        ctx.syncPropertiesPanel();
        ctx.syncToolbarState();
    }
    redo(ctx) {
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
export class MoveSelectionCommand {
    type = "move-selection";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
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
    redo(ctx) {
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
export class DuplicateIntoCompositionCommand {
    type = "duplicate-into-composition";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.removeNodeAndIncidentEdges(this.payload.cloneSnapshot.id);
        ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        ctx.refreshContainerChain(this.payload.compositionId);
        ctx.syncToolbarState();
    }
    redo(ctx) {
        ctx.store.restoreNodePlacement(this.payload.sourceId, this.payload.sourcePlacement.localX, this.payload.sourcePlacement.localY, this.payload.sourcePlacement.parentId);
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
export class ReparentCommand {
    type = "reparent";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.store.restoreNodePlacement(this.payload.nodeId, this.payload.beforePlacement.localX, this.payload.beforePlacement.localY, this.payload.beforePlacement.parentId);
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
    redo(ctx) {
        ctx.store.restoreNodePlacement(this.payload.nodeId, this.payload.afterPlacement.localX, this.payload.afterPlacement.localY, this.payload.afterPlacement.parentId);
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
export class MoveNodeCommand {
    type = "move-node";
    payload;
    constructor(payload) {
        this.payload = payload;
    }
    undo(ctx) {
        ctx.store.restoreNodePlacement(this.payload.nodeId, this.payload.beforePlacement.localX, this.payload.beforePlacement.localY, this.payload.beforePlacement.parentId);
        ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        ctx.syncToolbarState();
    }
    redo(ctx) {
        ctx.store.restoreNodePlacement(this.payload.nodeId, this.payload.afterPlacement.localX, this.payload.afterPlacement.localY, this.payload.afterPlacement.parentId);
        ctx.restoreSelectionSnapshot(this.payload.selectionBefore);
        ctx.syncToolbarState();
    }
}
//# sourceMappingURL=commands.js.map