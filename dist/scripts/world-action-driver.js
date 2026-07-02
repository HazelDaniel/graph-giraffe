import { EdgeStore } from "./edge-store.js";
import { HistoryStack } from "./history.js";
import { captureEdgeHistorySnapshot, captureNodeHistorySnapshot, cloneNodeProps, } from "./history-snapshots.js";
import { CreateNodeCommand, CreateSubgraphCommand, ConnectCommand, DeleteNodeCommand, DuplicateIntoCompositionCommand, MoveSelectionCommand, ReparentCommand, ToggleSubgraphCollapseCommand, UngraphCommand, UpdateLabelCommand, UpdatePropCommand, } from "./commands.js";
import { NodeStore } from "./node-store.js";
import { getParentFrameWorldPosition, getWorldPosition, } from "./scene-graph.js";
import { DEFAULT_HANDLE_STYLE, isContainerNodeType, } from "./types.js";
const noopSideEffects = {
    showProperties: () => { },
    hideProperties: () => { },
};
// NodePlacementSnapshot is imported from history-snapshots.ts
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
                : nodeType === "subgraph"
                    ? `Subgraph ${this.store.nextNodeId}`
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
        this.pushCommand(new CreateNodeCommand({
            snapshot,
            parentId,
            selectionBefore,
            selectOnRedo: true,
        }));
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
        this.pushCommand(new ConnectCommand({
            edgeSnapshot: snapshot,
        }));
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
        this.pushCommand(new DeleteNodeCommand({
            nodeId,
            nodeSnapshots: snapshots,
            edgeSnapshots,
            selectionBefore,
            parentId,
        }));
    }
    moveNodes(nodeIds, deltaX, deltaY, affectedParentIds = []) {
        const roots = nodeIds
            .map((id) => this.store.get(id))
            .filter((node) => Boolean(node));
        if (roots.length === 0)
            return;
        const selectionBefore = this.captureSelectionSnapshot();
        const collapsedSubgraphRoot = roots.length === 1 &&
            roots[0].nodeType === "subgraph" &&
            roots[0].isCollapsed
            ? roots[0]
            : null;
        if (collapsedSubgraphRoot) {
            const beforeSnapshots = this.captureSubtreeSnapshots(collapsedSubgraphRoot.id);
            const beforePlacement = this.captureNodePlacement(collapsedSubgraphRoot);
            const world = getWorldPosition(collapsedSubgraphRoot.id, this.store.allNodesMap);
            const targetX = world.x + deltaX;
            const targetY = world.y + deltaY;
            if (collapsedSubgraphRoot.parentId === null) {
                collapsedSubgraphRoot.localX = targetX;
                collapsedSubgraphRoot.localY = targetY;
            }
            else {
                const parentWorld = getParentFrameWorldPosition(collapsedSubgraphRoot.parentId, this.store.allNodesMap);
                collapsedSubgraphRoot.localX = targetX - parentWorld.x;
                collapsedSubgraphRoot.localY = targetY - parentWorld.y;
            }
            const appliedDeltaX = collapsedSubgraphRoot.localX - beforePlacement.localX;
            const appliedDeltaY = collapsedSubgraphRoot.localY - beforePlacement.localY;
            this.store.translateDescendants(collapsedSubgraphRoot.id, appliedDeltaX, appliedDeltaY);
            const refreshIds = new Set([
                ...affectedParentIds,
                collapsedSubgraphRoot.id,
                collapsedSubgraphRoot.parentId,
            ]);
            this.refreshContainerChains(refreshIds);
            const afterSnapshots = this.captureSubtreeSnapshots(collapsedSubgraphRoot.id);
            this.pushCommand(new MoveSelectionCommand({
                beforeSnapshots,
                afterSnapshots,
                cloneSnapshots: [],
                removedReferenceEdgeSnapshots: [],
                selectionBefore,
                affectedParentIds: [...refreshIds],
            }));
            return;
        }
        const beforeSnapshots = this.captureNodeSnapshots(nodeIds);
        for (const node of roots) {
            const world = getWorldPosition(node.id, this.store.allNodesMap);
            const targetX = world.x + deltaX;
            const targetY = world.y + deltaY;
            if (node.parentId === null) {
                node.localX = targetX;
                node.localY = targetY;
            }
            else {
                const parentWorld = getParentFrameWorldPosition(node.parentId, this.store.allNodesMap);
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
        this.pushCommand(new MoveSelectionCommand({
            beforeSnapshots,
            afterSnapshots,
            cloneSnapshots: [],
            removedReferenceEdgeSnapshots: [],
            selectionBefore,
            affectedParentIds: [...refreshIds],
        }));
    }
    reparentNode(nodeId, parentId) {
        const node = this.store.get(nodeId);
        if (!node)
            return false;
        const sourceOwningSubgraphId = this.getOwningSubgraphId(nodeId);
        if (parentId === null) {
            if (sourceOwningSubgraphId !== null)
                return false;
        }
        else {
            const target = this.store.get(parentId);
            if (!target || !isContainerNodeType(target.nodeType))
                return false;
            if (!this.canReparentIntoContainer(sourceOwningSubgraphId, target))
                return false;
        }
        const selectionBefore = this.captureSelectionSnapshot();
        const beforeSnapshot = this.captureNodeSnapshot(node);
        const oldParentId = node.parentId;
        if (!this.store.setParent(nodeId, parentId))
            return false;
        const afterSnapshot = this.captureNodeSnapshot(node);
        this.refreshContainerChain(oldParentId);
        this.refreshContainerChain(parentId);
        this.pushCommand(new ReparentCommand({
            nodeId,
            beforePlacement: { localX: beforeSnapshot.localX, localY: beforeSnapshot.localY, parentId: oldParentId },
            afterPlacement: { localX: afterSnapshot.localX, localY: afterSnapshot.localY, parentId },
            selectionBefore,
            removedReferenceEdgeSnapshots: [],
            extraRefreshIds: [],
        }));
        return true;
    }
    duplicateIntoComposition(sourceId, compositionId) {
        const sourceOwningSubgraphId = this.getOwningSubgraphId(sourceId);
        const targetOwningSubgraphId = this.getOwningSubgraphId(compositionId);
        if (sourceOwningSubgraphId !== targetOwningSubgraphId)
            return null;
        const selectionBefore = this.captureSelectionSnapshot();
        const clone = this.store.duplicateIntoComposition(sourceId, compositionId, this.theme);
        if (!clone)
            return null;
        const cloneSnapshot = this.captureNodeSnapshot(clone);
        this.clearSelectionState();
        this.setNodeSelected(clone.id, true);
        this.refreshContainerChain(compositionId);
        this.syncPropertiesPanel();
        const source = this.store.get(sourceId);
        if (!source)
            return null;
        this.pushCommand(new DuplicateIntoCompositionCommand({
            sourceId,
            sourcePlacement: { localX: source.localX, localY: source.localY, parentId: source.parentId },
            cloneSnapshot,
            compositionId,
            selectionBefore,
        }));
        return clone;
    }
    createSubgraph(nodeIds) {
        const roots = nodeIds
            .map((id) => this.store.get(id))
            .filter((node) => Boolean(node));
        if (roots.length === 0)
            return null;
        const selectionBefore = this.captureSelectionSnapshot();
        const rootIds = roots.map((node) => node.id);
        const beforeSnapshots = this.captureNodeSnapshots(rootIds);
        const removedEdgeSnapshots = this.removeBoundaryEdgesForRoots(rootIds);
        const anchorWorld = getWorldPosition(roots[0].id, this.store.allNodesMap);
        const subgraph = this.store.add(anchorWorld.x, anchorWorld.y, `Subgraph ${this.store.nextNodeId}`, this.theme, "subgraph");
        const commonParent = roots.every((root) => root.parentId === roots[0].parentId)
            ? roots[0].parentId
            : null;
        if (commonParent !== null) {
            this.store.setParent(subgraph.id, commonParent);
        }
        for (const root of roots) {
            this.store.setParent(root.id, subgraph.id);
        }
        this.store.updateContainerBounds(subgraph.id, this.theme);
        const afterSnapshots = this.captureNodeSnapshots(rootIds);
        const subgraphSnapshot = this.captureNodeSnapshot(subgraph);
        this.clearSelectionState();
        this.setNodeSelected(subgraph.id, true);
        this.pushCommand(new CreateSubgraphCommand({
            subgraphSnapshot,
            childBeforeSnapshots: beforeSnapshots,
            childAfterSnapshots: afterSnapshots,
            removedEdgeSnapshots,
            selectionBefore,
        }));
        return subgraph;
    }
    toggleSubgraphCollapse(subgraphId) {
        const node = this.store.get(subgraphId);
        if (!node || node.nodeType !== "subgraph")
            return false;
        const beforeSnapshot = this.captureNodeSnapshot(node);
        node.isCollapsed = !node.isCollapsed;
        this.store.syncNodePresentation(node.id);
        this.store.updateContainerBounds(node.id, this.theme);
        this.refreshContainerChain(node.parentId);
        const afterSnapshot = this.captureNodeSnapshot(node);
        this.pushCommand(new ToggleSubgraphCollapseCommand({
            beforeSnapshot,
            afterSnapshot,
        }));
        return true;
    }
    ungraphSubgraph(subgraphId) {
        const subgraph = this.store.get(subgraphId);
        if (!subgraph || subgraph.nodeType !== "subgraph")
            return false;
        const selectionBefore = this.captureSelectionSnapshot();
        const subgraphSnapshot = this.captureNodeSnapshot(subgraph);
        const childIds = [...subgraph.childIds];
        const childBeforeSnapshots = this.captureNodeSnapshots(childIds);
        const removedEdgeSnapshots = this.removeBoundaryEdgesForRoots([subgraphId]);
        this.store.removeContainerOnly(subgraphId);
        const childAfterSnapshots = this.captureNodeSnapshots(childIds);
        this.clearSelectionState();
        this.refreshContainerChain(subgraphSnapshot.parentId);
        this.pushCommand(new UngraphCommand({
            subgraphSnapshot,
            childBeforeSnapshots,
            childAfterSnapshots,
            removedEdgeSnapshots,
            selectionBefore,
        }));
        return true;
    }
    updateLabel(nodeId, label) {
        const node = this.store.get(nodeId);
        if (!node || node.text === label)
            return false;
        const beforeSnapshot = this.captureNodeSnapshot(node);
        this.store.updateLabel(nodeId, label, this.theme);
        const afterSnapshot = this.captureNodeSnapshot(node);
        this.pushCommand(new UpdateLabelCommand({
            nodeId,
            previousLabel: beforeSnapshot.text,
            nextLabel: label,
        }));
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
        this.store.syncNodePresentation(nodeId);
        const afterSnapshot = this.captureNodeSnapshot(node);
        const parentId = node.parentId;
        this.refreshContainerChain(parentId);
        this.pushCommand(new UpdatePropCommand({
            beforeSnapshot,
            afterSnapshot,
            selectionBefore: this.captureSelectionSnapshot(),
            parentId,
        }));
        this.syncPropertiesPanel();
        return true;
    }
    undo() {
        const changed = this.history.undo(this.commandContext);
        this.syncToolbarState();
        return changed;
    }
    redo() {
        const changed = this.history.redo(this.commandContext);
        this.syncToolbarState();
        return changed;
    }
    pushCommand(command) {
        this.history.push(command);
        this.syncToolbarState();
    }
    collectSubtreeIds(rootIds) {
        const collected = new Set();
        const visit = (nodeId) => {
            if (collected.has(nodeId))
                return;
            const node = this.store.get(nodeId);
            if (!node)
                return;
            collected.add(nodeId);
            for (const childId of node.childIds) {
                visit(childId);
            }
        };
        for (const rootId of rootIds) {
            visit(rootId);
        }
        return [...collected];
    }
    captureBoundaryEdgeSnapshots(rootIds) {
        const subtreeIds = new Set(this.collectSubtreeIds(rootIds));
        const snapshots = [];
        for (const edge of this.edgeStore.allEdges()) {
            const sourceInside = subtreeIds.has(edge.sourceNodeId);
            const targetInside = subtreeIds.has(edge.targetNodeId);
            if (sourceInside === targetInside)
                continue;
            snapshots.push({ ...edge });
        }
        return snapshots;
    }
    removeBoundaryEdgesForRoots(rootIds) {
        const snapshots = this.captureBoundaryEdgeSnapshots(rootIds);
        for (const snapshot of snapshots) {
            const removed = this.edgeStore.remove(snapshot.id);
            if (!removed)
                continue;
            this.clearCompositionReferenceForEdge(snapshot);
            this.syncHandleStates(snapshot.sourceNodeId);
            this.syncHandleStates(snapshot.targetNodeId);
        }
        return snapshots;
    }
    get commandContext() {
        return {
            store: this.store,
            edgeStore: this.edgeStore,
            theme: this.theme,
            applyNodeSnapshot: (s) => this.applyNodeSnapshot(s),
            restoreNodeSnapshots: (s) => this.restoreNodeSnapshots(s),
            restoreEdgeSnapshots: (s) => this.restoreEdgeSnapshots(s),
            removeNodeAndIncidentEdges: (id) => this.removeNodeAndIncidentEdges(id),
            removeNodesAndEdges: (nIds, eIds) => this.removeNodesAndEdges(nIds, eIds),
            clearSelectionState: () => this.clearSelectionState(),
            setNodeSelected: (id, sel) => this.setNodeSelected(id, sel),
            restoreSelectionSnapshot: (s) => this.restoreSelectionSnapshot(s),
            refreshContainerChain: (id) => this.refreshContainerChain(id),
            syncPropertiesPanel: () => this.syncPropertiesPanel(),
            syncToolbarState: () => this.syncToolbarState(),
            syncHandleStates: (id) => this.syncHandleStates(id),
            applyCompositionReferenceForEdge: (e) => this.applyCompositionReferenceForEdge(e),
            clearCompositionReferenceForEdge: (e) => this.clearCompositionReferenceForEdge(e),
            removeContainerOnly: (id) => this.store.removeContainerOnly(id),
        };
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
    captureSubtreeSnapshots(rootId) {
        const root = this.store.get(rootId);
        if (!root)
            return [];
        const snapshots = [];
        const visit = (node) => {
            snapshots.push(this.captureNodeSnapshot(node));
            for (const childId of node.childIds) {
                const child = this.store.get(childId);
                if (child)
                    visit(child);
            }
        };
        visit(root);
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
        node.isLocked = snapshot.isLocked;
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
        if (sourceNode.nodeType === "subgraph" && sourceHandleSide !== "right")
            return false;
        if (targetNode.nodeType === "subgraph" && targetHandleSide !== "left")
            return false;
        const sourceOwningSubgraphId = sourceNode.nodeType === "subgraph" ? null : this.getOwningSubgraphId(sourceNodeId);
        const targetOwningSubgraphId = targetNode.nodeType === "subgraph" ? null : this.getOwningSubgraphId(targetNodeId);
        if (sourceOwningSubgraphId !== targetOwningSubgraphId)
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
    getOwningSubgraphId(nodeId) {
        const node = this.store.get(nodeId);
        if (!node)
            return null;
        let currentId = node.parentId;
        while (currentId !== null) {
            const ancestor = this.store.get(currentId);
            if (!ancestor)
                break;
            if (ancestor.nodeType === "subgraph")
                return ancestor.id;
            currentId = ancestor.parentId;
        }
        return null;
    }
    canReparentIntoContainer(sourceOwningSubgraphId, target) {
        if (target.nodeType === "subgraph") {
            const targetOwningSubgraphId = this.getOwningSubgraphId(target.id);
            return (sourceOwningSubgraphId === target.id ||
                sourceOwningSubgraphId === targetOwningSubgraphId);
        }
        return sourceOwningSubgraphId === this.getOwningSubgraphId(target.id);
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
    removeNodesAndEdges(nodeIds, edgeIds) {
        const removedNodeIds = new Set();
        for (const nodeId of nodeIds) {
            for (const removedId of this.store.collectRemovedIds(nodeId)) {
                removedNodeIds.add(removedId);
            }
        }
        const removedIdSet = new Set(removedNodeIds);
        const removedEdges = this.edgeStore.removeEdgesForNodes(removedNodeIds);
        const affectedNodeIds = new Set();
        const selectedEdgeIdSet = new Set(edgeIds);
        for (const edgeId of selectedEdgeIdSet) {
            const removed = this.edgeStore.remove(edgeId);
            if (removed) {
                removedEdges.push(removed);
            }
        }
        for (const edge of removedEdges) {
            if (!removedIdSet.has(edge.sourceNodeId)) {
                this.clearCompositionReferenceForEdge(edge);
            }
            if (!removedIdSet.has(edge.sourceNodeId)) {
                affectedNodeIds.add(edge.sourceNodeId);
            }
            if (!removedIdSet.has(edge.targetNodeId)) {
                affectedNodeIds.add(edge.targetNodeId);
            }
        }
        for (const nodeId of removedNodeIds) {
            this.store.remove(nodeId);
        }
        for (const affectedNodeId of affectedNodeIds) {
            this.syncHandleStates(affectedNodeId);
        }
    }
    removeNodeAndIncidentEdges(nodeId) {
        this.removeNodesAndEdges([nodeId], []);
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
}
//# sourceMappingURL=world-action-driver.js.map