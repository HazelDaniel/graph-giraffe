import { EdgeStore } from "./edge-store.js";
import { HistoryStack } from "./history.js";
import { captureEdgeHistorySnapshot, captureNodeHistorySnapshot, cloneNodeProps, } from "./history-snapshots.js";
import { NodeStore } from "./node-store.js";
import { getWorldPosition } from "./scene-graph.js";
import { DEFAULT_HANDLE_STYLE, isContainerNodeType, } from "./types.js";
const noopSideEffects = {
    showProperties: () => { },
    hideProperties: () => { },
};
export class WorldActionDriver {
    store;
    edgeStore;
    history;
    sideEffects;
    theme;
    selectedNodeIds = new Set();
    selectedEdgeIds = new Set();
    selectionKind = null;
    constructor(options = {}) {
        this.theme = options.theme ?? "dark";
        this.sideEffects = { ...noopSideEffects, ...options.sideEffects };
        this.store = new NodeStore({}, "node", DEFAULT_HANDLE_STYLE);
        this.edgeStore = new EdgeStore();
        this.history = new HistoryStack({ maxHistory: options.maxHistory });
    }
    get selectedNodes() {
        return [...this.selectedNodeIds];
    }
    get selectedEdges() {
        return [...this.selectedEdgeIds];
    }
    selectOnlyNode(nodeId) {
        this.clearSelectionState();
        const node = this.store.get(nodeId);
        if (!node)
            return;
        node.isSelected = true;
        this.selectedNodeIds.add(nodeId);
        this.selectionKind = "node";
        this.syncPropertiesPanel();
    }
    clearSelection() {
        this.clearSelectionState();
        this.syncPropertiesPanel();
    }
    createNode(nodeType, worldX, worldY, parentId = null) {
        const selectionBefore = this.captureSelectionSnapshot();
        const label = nodeType === "group"
            ? `Group ${this.store.nextNodeId}`
            : nodeType === "composition"
                ? `Composition ${this.store.nextNodeId}`
                : `Node ${this.store.nextNodeId}`;
        const node = this.store.add(worldX, worldY, label, this.theme, nodeType);
        if (parentId !== null && !this.store.setParent(node.id, parentId)) {
            this.store.remove(node.id);
            return null;
        }
        this.clearSelectionState();
        this.setNodeSelected(node.id, true);
        this.refreshContainerChain(parentId);
        this.syncPropertiesPanel();
        const snapshot = this.captureNodeSnapshot(node);
        this.pushHistory({
            undo: () => {
                this.removeNodeAndIncidentEdges(snapshot.id);
                this.restoreSelectionSnapshot(selectionBefore);
                this.refreshContainerChain(parentId);
                this.syncPropertiesPanel();
            },
            redo: () => {
                this.applyNodeSnapshot(snapshot);
                this.clearSelectionState();
                this.setNodeSelected(snapshot.id, true);
                this.refreshContainerChain(parentId);
                this.syncPropertiesPanel();
            },
        });
        return node;
    }
    connect(sourceNodeId, sourceHandleSide, targetNodeId, targetHandleSide) {
        if (!this.isValidConnection(sourceNodeId, sourceHandleSide, targetNodeId, targetHandleSide)) {
            return null;
        }
        const edge = this.edgeStore.add({
            sourceNodeId,
            sourceHandleSide,
            targetNodeId,
            targetHandleSide,
        });
        if (!edge)
            return null;
        this.syncHandleStates(edge.sourceNodeId);
        this.syncHandleStates(edge.targetNodeId);
        this.applyCompositionReferenceForEdge(edge);
        const snapshot = captureEdgeHistorySnapshot(edge);
        this.pushHistory({
            undo: () => {
                const removed = this.edgeStore.remove(snapshot.id);
                if (removed) {
                    this.clearCompositionReferenceForEdge(removed);
                    this.syncHandleStates(removed.sourceNodeId);
                    this.syncHandleStates(removed.targetNodeId);
                }
            },
            redo: () => {
                this.restoreEdgeSnapshots([snapshot]);
            },
        });
        return edge;
    }
    deleteNode(nodeId) {
        const node = this.store.get(nodeId);
        if (!node)
            return;
        const selectionBefore = this.captureSelectionSnapshot();
        const snapshots = this.captureNodeSnapshots([nodeId]);
        const removedIds = this.store.collectRemovedIds(nodeId);
        const edgeSnapshots = this.captureEdgeSnapshotsForSelection(removedIds, []);
        const parentId = node.parentId;
        this.removeNodeAndIncidentEdges(nodeId);
        this.clearSelectionState();
        this.refreshContainerChain(parentId);
        this.syncPropertiesPanel();
        this.pushHistory({
            undo: () => {
                this.restoreNodeSnapshots(snapshots);
                this.restoreEdgeSnapshots(edgeSnapshots);
                this.restoreSelectionSnapshot(selectionBefore);
                this.refreshContainerChain(parentId);
                this.syncPropertiesPanel();
            },
            redo: () => {
                this.removeNodeAndIncidentEdges(nodeId);
                this.clearSelectionState();
                this.refreshContainerChain(parentId);
                this.syncPropertiesPanel();
            },
        });
    }
    moveNodes(nodeIds, deltaX, deltaY, affectedParentIds = []) {
        const roots = nodeIds
            .map((id) => this.store.get(id))
            .filter((node) => Boolean(node));
        if (roots.length === 0)
            return;
        const selectionBefore = this.captureSelectionSnapshot();
        const beforeSnapshots = this.captureNodeSnapshots(nodeIds);
        const beforePlacements = new Map();
        for (const node of roots) {
            beforePlacements.set(node.id, this.captureNodePlacement(node));
            const world = getWorldPosition(node.id, this.store.allNodesMap);
            const targetX = world.x + deltaX;
            const targetY = world.y + deltaY;
            if (node.parentId === null) {
                node.localX = targetX;
                node.localY = targetY;
            }
            else {
                const parentWorld = getWorldPosition(node.parentId, this.store.allNodesMap);
                node.localX = targetX - parentWorld.x;
                node.localY = targetY - parentWorld.y;
            }
        }
        const refreshIds = new Set([
            ...affectedParentIds,
            ...roots.map((node) => node.parentId),
        ]);
        this.refreshContainerChains(refreshIds);
        const afterSnapshots = this.captureNodeSnapshots(nodeIds);
        this.pushHistory({
            undo: () => {
                this.restoreNodeSnapshots(beforeSnapshots);
                this.restoreSelectionSnapshot(selectionBefore);
                this.refreshContainerChains(refreshIds);
                this.syncPropertiesPanel();
            },
            redo: () => {
                this.restoreNodeSnapshots(afterSnapshots);
                this.restoreSelectionSnapshot(selectionBefore);
                this.refreshContainerChains(refreshIds);
                this.syncPropertiesPanel();
            },
        });
    }
    reparentNode(nodeId, parentId) {
        const node = this.store.get(nodeId);
        if (!node)
            return false;
        const selectionBefore = this.captureSelectionSnapshot();
        const beforeSnapshot = this.captureNodeSnapshot(node);
        const oldParentId = node.parentId;
        if (!this.store.setParent(nodeId, parentId))
            return false;
        const afterSnapshot = this.captureNodeSnapshot(node);
        this.refreshContainerChain(oldParentId);
        this.refreshContainerChain(parentId);
        this.pushHistory({
            undo: () => {
                this.applyNodeSnapshot(beforeSnapshot);
                this.restoreSelectionSnapshot(selectionBefore);
                this.refreshContainerChain(oldParentId);
                this.refreshContainerChain(parentId);
                this.syncPropertiesPanel();
            },
            redo: () => {
                this.applyNodeSnapshot(afterSnapshot);
                this.restoreSelectionSnapshot(selectionBefore);
                this.refreshContainerChain(oldParentId);
                this.refreshContainerChain(parentId);
                this.syncPropertiesPanel();
            },
        });
        return true;
    }
    duplicateIntoComposition(sourceId, compositionId) {
        const selectionBefore = this.captureSelectionSnapshot();
        const clone = this.store.duplicateIntoComposition(sourceId, compositionId, this.theme);
        if (!clone)
            return null;
        const cloneSnapshot = this.captureNodeSnapshot(clone);
        this.clearSelectionState();
        this.setNodeSelected(clone.id, true);
        this.refreshContainerChain(compositionId);
        this.syncPropertiesPanel();
        this.pushHistory({
            undo: () => {
                this.removeNodeAndIncidentEdges(cloneSnapshot.id);
                this.restoreSelectionSnapshot(selectionBefore);
                this.refreshContainerChain(compositionId);
                this.syncPropertiesPanel();
            },
            redo: () => {
                this.restoreNodeSnapshots([cloneSnapshot]);
                this.clearSelectionState();
                this.setNodeSelected(cloneSnapshot.id, true);
                this.refreshContainerChain(compositionId);
                this.syncPropertiesPanel();
            },
        });
        return clone;
    }
    updateLabel(nodeId, label) {
        const node = this.store.get(nodeId);
        if (!node || node.text === label)
            return false;
        const beforeSnapshot = this.captureNodeSnapshot(node);
        this.store.updateLabel(nodeId, label, this.theme);
        const afterSnapshot = this.captureNodeSnapshot(node);
        this.pushHistory({
            undo: () => {
                this.applyNodeSnapshot(beforeSnapshot);
                this.syncPropertiesPanel();
            },
            redo: () => {
                this.applyNodeSnapshot(afterSnapshot);
                this.syncPropertiesPanel();
            },
        });
        this.syncPropertiesPanel();
        return true;
    }
    updatePropValue(nodeId, label, value) {
        const node = this.store.get(nodeId);
        if (!node?.props)
            return false;
        const beforeSnapshot = this.captureNodeSnapshot(node);
        if (!this.setPropValue(node.props, label, value))
            return false;
        node.height = this.estimateNodePropHeight(node.props);
        const afterSnapshot = this.captureNodeSnapshot(node);
        const parentId = node.parentId;
        this.refreshContainerChain(parentId);
        this.pushHistory({
            undo: () => {
                this.applyNodeSnapshot(beforeSnapshot);
                this.refreshContainerChain(parentId);
                this.syncPropertiesPanel();
            },
            redo: () => {
                this.applyNodeSnapshot(afterSnapshot);
                this.refreshContainerChain(parentId);
                this.syncPropertiesPanel();
            },
        });
        this.syncPropertiesPanel();
        return true;
    }
    undo() {
        const changed = this.history.undo();
        this.syncToolbarState();
        return changed;
    }
    redo() {
        const changed = this.history.redo();
        this.syncToolbarState();
        return changed;
    }
    pushHistory(entry) {
        this.history.push(entry);
        this.syncToolbarState();
    }
    captureSelectionSnapshot() {
        return {
            kind: this.selectionKind,
            nodeIds: [...this.selectedNodeIds],
            edgeIds: [...this.selectedEdgeIds],
        };
    }
    restoreSelectionSnapshot(snapshot) {
        this.clearSelectionState();
        for (const nodeId of snapshot.nodeIds) {
            this.setNodeSelected(nodeId, true);
        }
        for (const edgeId of snapshot.edgeIds) {
            this.setEdgeSelected(edgeId, true);
        }
        this.selectionKind = snapshot.kind;
        this.syncSelectionKind();
    }
    clearSelectionState() {
        for (const nodeId of this.selectedNodeIds) {
            const node = this.store.get(nodeId);
            if (node)
                node.isSelected = false;
        }
        for (const edgeId of this.selectedEdgeIds) {
            const edge = this.edgeStore.get(edgeId);
            if (edge)
                edge.isSelected = false;
        }
        this.selectedNodeIds.clear();
        this.selectedEdgeIds.clear();
        this.selectionKind = null;
    }
    setNodeSelected(nodeId, isSelected) {
        const node = this.store.get(nodeId);
        if (!node)
            return;
        node.isSelected = isSelected;
        if (isSelected) {
            this.selectedNodeIds.add(nodeId);
        }
        else {
            this.selectedNodeIds.delete(nodeId);
        }
        this.syncSelectionKind();
    }
    setEdgeSelected(edgeId, isSelected) {
        const edge = this.edgeStore.get(edgeId);
        if (!edge)
            return;
        edge.isSelected = isSelected;
        if (isSelected) {
            this.selectedEdgeIds.add(edgeId);
        }
        else {
            this.selectedEdgeIds.delete(edgeId);
        }
        this.syncSelectionKind();
    }
    syncSelectionKind() {
        if (this.selectedNodeIds.size > 0) {
            this.selectionKind = "node";
            return;
        }
        if (this.selectedEdgeIds.size > 0) {
            this.selectionKind = "edge";
            return;
        }
        this.selectionKind = null;
    }
    syncPropertiesPanel() {
        if (this.selectedNodeIds.size !== 1 || this.selectedEdgeIds.size > 0) {
            this.sideEffects.hideProperties();
            return;
        }
        const nodeId = this.selectedNodeIds.values().next().value;
        const node = nodeId !== undefined ? this.store.get(nodeId) : undefined;
        if (!node || node.nodeType === "composition") {
            this.sideEffects.hideProperties();
            return;
        }
        this.sideEffects.showProperties(node);
    }
    syncToolbarState() {
        if (this.history.canUndo()) {
            this.sideEffects.enableUndo?.();
        }
        else {
            this.sideEffects.disableUndo?.();
        }
        if (this.history.canRedo()) {
            this.sideEffects.enableRedo?.();
        }
        else {
            this.sideEffects.disableRedo?.();
        }
    }
    captureNodePlacement(node) {
        return {
            localX: node.localX,
            localY: node.localY,
            parentId: node.parentId,
        };
    }
    captureNodeSnapshot(node) {
        return captureNodeHistorySnapshot(node);
    }
    captureNodeSnapshots(nodeIds) {
        const snapshots = [];
        const visited = new Set();
        for (const nodeId of nodeIds) {
            const node = this.store.get(nodeId);
            if (!node)
                continue;
            const visit = (current) => {
                if (visited.has(current.id))
                    return;
                visited.add(current.id);
                snapshots.push(this.captureNodeSnapshot(current));
                for (const childId of current.childIds) {
                    const child = this.store.get(childId);
                    if (child)
                        visit(child);
                }
            };
            visit(node);
        }
        return snapshots;
    }
    captureEdgeSnapshotsForSelection(nodeIds, edgeIds) {
        const nodeIdSet = new Set(nodeIds);
        const edgeIdSet = new Set(edgeIds);
        const snapshots = [];
        for (const edge of this.edgeStore.allEdges()) {
            if (edgeIdSet.has(edge.id) ||
                nodeIdSet.has(edge.sourceNodeId) ||
                nodeIdSet.has(edge.targetNodeId)) {
                snapshots.push(captureEdgeHistorySnapshot(edge));
            }
        }
        return snapshots;
    }
    applyNodeSnapshot(snapshot) {
        let node = this.store.get(snapshot.id);
        if (!node) {
            node = this.store.add(snapshot.localX, snapshot.localY, snapshot.text, this.theme, snapshot.nodeType, snapshot.id);
        }
        node.nodeType = snapshot.nodeType;
        node.localX = snapshot.localX;
        node.localY = snapshot.localY;
        node.width = snapshot.width;
        node.height = snapshot.height;
        node.text = snapshot.text;
        node.textureIds = { ...snapshot.textureIds };
        node.visible = snapshot.visible;
        node.isSelected = snapshot.isSelected;
        node.isDropTarget = snapshot.isDropTarget;
        node.childIds = [...snapshot.childIds];
        node.compositionRefId = snapshot.compositionRefId;
        node.props = cloneNodeProps(snapshot.props);
        node.handles = node.handles.map((handle) => ({
            ...handle,
            isConnected: snapshot.handleStates.find((entry) => entry.side === handle.side)
                ?.isConnected ?? false,
        }));
        this.store.forceRestoreNodePlacement(snapshot.id, snapshot.localX, snapshot.localY, snapshot.parentId);
        node.width = snapshot.width;
        node.height = snapshot.height;
    }
    restoreNodeSnapshots(snapshots) {
        for (const snapshot of snapshots) {
            this.applyNodeSnapshot(snapshot);
        }
    }
    restoreEdgeSnapshots(snapshots) {
        for (const snapshot of snapshots) {
            const edge = this.edgeStore.add({
                ...snapshot,
                idOverride: snapshot.id,
            });
            if (!edge)
                continue;
            this.syncHandleStates(edge.sourceNodeId);
            this.syncHandleStates(edge.targetNodeId);
            this.applyCompositionReferenceForEdge(edge);
        }
    }
    isValidConnection(sourceNodeId, sourceHandleSide, targetNodeId, targetHandleSide) {
        if (sourceNodeId === targetNodeId)
            return false;
        const sourceNode = this.store.get(sourceNodeId);
        const targetNode = this.store.get(targetNodeId);
        if (!sourceNode || !targetNode)
            return false;
        if (sourceHandleSide === targetHandleSide)
            return false;
        if (sourceNode.nodeType === "node" &&
            targetNode.nodeType === "composition" &&
            !this.canCreateCompositionReference(sourceNodeId, targetNodeId)) {
            return false;
        }
        if (this.edgeStore.hasConnection(sourceNodeId, sourceHandleSide))
            return false;
        if (this.edgeStore.hasConnection(targetNodeId, targetHandleSide))
            return false;
        return true;
    }
    isCompositionReferenceEdge(edge) {
        const source = this.store.get(edge.sourceNodeId);
        const target = this.store.get(edge.targetNodeId);
        return source?.nodeType === "node" && target?.nodeType === "composition";
    }
    canCreateCompositionReference(sourceNodeId, targetCompositionId) {
        const source = this.store.get(sourceNodeId);
        const target = this.store.get(targetCompositionId);
        if (!source || !target)
            return false;
        if (source.nodeType !== "node" || target.nodeType !== "composition") {
            return false;
        }
        if (source.parentId === null)
            return false;
        const parent = this.store.get(source.parentId);
        if (parent?.nodeType !== "group")
            return false;
        return (source.compositionRefId === null ||
            source.compositionRefId === targetCompositionId);
    }
    applyCompositionReferenceForEdge(edge) {
        if (!this.isCompositionReferenceEdge(edge))
            return;
        if (!this.canCreateCompositionReference(edge.sourceNodeId, edge.targetNodeId)) {
            return;
        }
        const source = this.store.get(edge.sourceNodeId);
        const oldParentId = source?.parentId ?? null;
        if (this.store.setCompositionReference(edge.sourceNodeId, edge.targetNodeId, this.theme)) {
            this.sideEffects.setCompositionReference?.(edge.sourceNodeId, edge.targetNodeId);
            this.refreshContainerChain(oldParentId);
        }
    }
    clearCompositionReferenceForEdge(edge) {
        if (!this.isCompositionReferenceEdge(edge))
            return;
        const source = this.store.get(edge.sourceNodeId);
        if (!source || source.compositionRefId !== edge.targetNodeId)
            return;
        const oldParentId = source.parentId;
        if (this.store.clearCompositionReference(source.id, this.theme)) {
            this.sideEffects.clearCompositionReference?.(source.id, edge.targetNodeId);
            this.refreshContainerChain(oldParentId);
        }
    }
    removeNodeAndIncidentEdges(nodeId) {
        const removedIds = this.store.collectRemovedIds(nodeId);
        const removedIdSet = new Set(removedIds);
        const removedEdges = this.edgeStore.removeEdgesForNodes(removedIds);
        const affectedNodeIds = new Set();
        for (const edge of removedEdges) {
            if (!removedIdSet.has(edge.sourceNodeId)) {
                this.clearCompositionReferenceForEdge(edge);
                affectedNodeIds.add(edge.sourceNodeId);
            }
            if (!removedIdSet.has(edge.targetNodeId)) {
                affectedNodeIds.add(edge.targetNodeId);
            }
        }
        for (const removedId of removedIds) {
            this.store.remove(removedId);
        }
        for (const affectedNodeId of affectedNodeIds) {
            this.syncHandleStates(affectedNodeId);
        }
    }
    syncHandleStates(nodeId) {
        this.store.updateHandleConnectionState(nodeId, "left", this.edgeStore.hasConnection(nodeId, "left"));
        this.store.updateHandleConnectionState(nodeId, "right", this.edgeStore.hasConnection(nodeId, "right"));
    }
    refreshContainerChain(containerId) {
        this.sideEffects.refreshContainerChain?.(containerId);
        let currentId = containerId;
        while (currentId !== null) {
            const current = this.store.get(currentId);
            if (!current || !isContainerNodeType(current.nodeType))
                return;
            this.store.updateContainerBounds(currentId, this.theme);
            currentId = current.parentId;
        }
    }
    refreshContainerChains(containerIds) {
        for (const containerId of containerIds) {
            this.refreshContainerChain(containerId);
        }
    }
    setPropValue(props, targetLabel, newValue) {
        const primitives = [
            ...Object.values(props.booleans).flat(),
            ...Object.values(props.texts).flat(),
            ...Object.values(props.enums).flat(),
        ];
        for (const primitive of primitives) {
            if (primitive.label !== targetLabel)
                continue;
            if (primitive.value === newValue)
                return false;
            primitive.value = newValue;
            return true;
        }
        return false;
    }
    estimateNodePropHeight(props) {
        let lineCount = 0;
        lineCount += props.booleans.ungrouped?.length ?? 0;
        lineCount += props.texts.ungrouped?.length ?? 0;
        lineCount += props.enums.ungrouped?.length ?? 0;
        for (const group of props.groups) {
            const itemCount = (props.booleans[group]?.length ?? 0) +
                (props.texts[group]?.length ?? 0) +
                (props.enums[group]?.length ?? 0);
            if (itemCount > 0) {
                lineCount += 1 + itemCount;
            }
        }
        return 30 + 16 + lineCount * 20 + 16;
    }
}
//# sourceMappingURL=world-action-driver.js.map