import { EdgeStore } from "./edge-store.js";
import { HistoryStack, HistoryStackOptions } from "./history.js";
import {
  EdgeHistorySnapshot,
  NodeHistorySnapshot,
  NodePlacementSnapshot,
  SelectionKind,
  SelectionSnapshot,
  captureEdgeHistorySnapshot,
  captureNodeHistorySnapshot,
  cloneNodeProps,
} from "./history-snapshots.js";
import {
  Command,
  CommandContext,
  CreateNodeCommand,
  ConnectCommand,
  DeleteNodeCommand,
  DuplicateIntoCompositionCommand,
  MoveSelectionCommand,
  ReparentCommand,
  UpdateLabelCommand,
  UpdatePropCommand,
} from "./commands.js";
import { NodeStore } from "./node-store.js";
import { getWorldPosition } from "./scene-graph.js";
import {
  DEFAULT_HANDLE_STYLE,
  EdgeData,
  HandleSide,
  NodeData,
  NodePropType,
  NodeType,
  ThemeName,
  isContainerNodeType,
} from "./types.js";

// SelectionKind and SelectionSnapshot are imported from history-snapshots.ts

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

const noopSideEffects: WorldActionSideEffects = {
  showProperties: () => {},
  hideProperties: () => {},
};

// NodePlacementSnapshot is imported from history-snapshots.ts

export class WorldActionDriver {
  readonly store: NodeStore;
  readonly edgeStore: EdgeStore;
  readonly history: HistoryStack;

  private readonly sideEffects: WorldActionSideEffects;
  private readonly theme: ThemeName;
  private selectedNodeIds = new Set<number>();
  private selectedEdgeIds = new Set<number>();
  private selectionKind: SelectionKind = null;

  constructor(options: WorldActionDriverOptions = {}) {
    this.theme = options.theme ?? "dark";
    this.sideEffects = { ...noopSideEffects, ...options.sideEffects };
    this.store = new NodeStore(
      {} as WebGL2RenderingContext,
      "node",
      DEFAULT_HANDLE_STYLE
    );
    this.edgeStore = new EdgeStore();
    this.history = new HistoryStack({ maxHistory: options.maxHistory });
  }

  get selectedNodes(): number[] {
    return [...this.selectedNodeIds];
  }

  get selectedEdges(): number[] {
    return [...this.selectedEdgeIds];
  }

  selectOnlyNode(nodeId: number): void {
    this.clearSelectionState();
    const node = this.store.get(nodeId);
    if (!node) return;
    node.isSelected = true;
    this.selectedNodeIds.add(nodeId);
    this.selectionKind = "node";
    this.syncPropertiesPanel();
  }

  clearSelection(): void {
    this.clearSelectionState();
    this.syncPropertiesPanel();
  }

  createNode(
    nodeType: NodeType,
    worldX: number,
    worldY: number,
    parentId: number | null = null
  ): NodeData | null {
    const selectionBefore = this.captureSelectionSnapshot();
    const label =
      nodeType === "group"
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
    this.pushCommand(new CreateNodeCommand({
      snapshot,
      parentId,
      selectionBefore,
      selectOnRedo: true,
    }));

    return node;
  }

  connect(
    sourceNodeId: number,
    sourceHandleSide: HandleSide,
    targetNodeId: number,
    targetHandleSide: HandleSide
  ): EdgeData | null {
    if (
      !this.isValidConnection(
        sourceNodeId,
        sourceHandleSide,
        targetNodeId,
        targetHandleSide
      )
    ) {
      return null;
    }

    const edge = this.edgeStore.add({
      sourceNodeId,
      sourceHandleSide,
      targetNodeId,
      targetHandleSide,
    });
    if (!edge) return null;

    this.syncHandleStates(edge.sourceNodeId);
    this.syncHandleStates(edge.targetNodeId);
    this.applyCompositionReferenceForEdge(edge);
    const snapshot = captureEdgeHistorySnapshot(edge);

    this.pushCommand(new ConnectCommand({
      edgeSnapshot: snapshot,
    }));

    return edge;
  }

  deleteNode(nodeId: number): void {
    const node = this.store.get(nodeId);
    if (!node) return;

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

  moveNodes(
    nodeIds: number[],
    deltaX: number,
    deltaY: number,
    affectedParentIds: Array<number | null> = []
  ): void {
    const roots = nodeIds
      .map((id) => this.store.get(id))
      .filter((node): node is NodeData => Boolean(node));
    if (roots.length === 0) return;

    const selectionBefore = this.captureSelectionSnapshot();
    const beforeSnapshots = this.captureNodeSnapshots(nodeIds);
    const beforePlacements = new Map<number, NodePlacementSnapshot>();
    for (const node of roots) {
      beforePlacements.set(node.id, this.captureNodePlacement(node));
      const world = getWorldPosition(node.id, this.store.allNodesMap);
      const targetX = world.x + deltaX;
      const targetY = world.y + deltaY;
      if (node.parentId === null) {
        node.localX = targetX;
        node.localY = targetY;
      } else {
        const parentWorld = getWorldPosition(node.parentId, this.store.allNodesMap);
        node.localX = targetX - parentWorld.x;
        node.localY = targetY - parentWorld.y;
      }
    }
    const refreshIds = new Set<number | null>([
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

  reparentNode(nodeId: number, parentId: number | null): boolean {
    const node = this.store.get(nodeId);
    if (!node) return false;

    const selectionBefore = this.captureSelectionSnapshot();
    const beforeSnapshot = this.captureNodeSnapshot(node);
    const oldParentId = node.parentId;
    if (!this.store.setParent(nodeId, parentId)) return false;
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

  duplicateIntoComposition(sourceId: number, compositionId: number): NodeData | null {
    const selectionBefore = this.captureSelectionSnapshot();
    const clone = this.store.duplicateIntoComposition(sourceId, compositionId, this.theme);
    if (!clone) return null;

    const cloneSnapshot = this.captureNodeSnapshot(clone);
    this.clearSelectionState();
    this.setNodeSelected(clone.id, true);
    this.refreshContainerChain(compositionId);
    this.syncPropertiesPanel();

    const source = this.store.get(sourceId);
    if (!source) return null;
    this.pushCommand(new DuplicateIntoCompositionCommand({
      sourceId,
      sourcePlacement: { localX: source.localX, localY: source.localY, parentId: source.parentId },
      cloneSnapshot,
      compositionId,
      selectionBefore,
    }));

    return clone;
  }

  updateLabel(nodeId: number, label: string): boolean {
    const node = this.store.get(nodeId);
    if (!node || node.text === label) return false;
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

  updatePropValue(nodeId: number, label: string, value: string | boolean): boolean {
    const node = this.store.get(nodeId);
    if (!node?.props) return false;

    const beforeSnapshot = this.captureNodeSnapshot(node);
    if (!this.setPropValue(node.props, label, value)) return false;
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

  undo(): boolean {
    const changed = this.history.undo(this.commandContext);
    this.syncToolbarState();
    return changed;
  }

  redo(): boolean {
    const changed = this.history.redo(this.commandContext);
    this.syncToolbarState();
    return changed;
  }

  private pushCommand(command: Command): void {
    this.history.push(command);
    this.syncToolbarState();
  }

  private get commandContext(): CommandContext {
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
    };
  }

  private captureSelectionSnapshot(): SelectionSnapshot {
    return {
      kind: this.selectionKind,
      nodeIds: [...this.selectedNodeIds],
      edgeIds: [...this.selectedEdgeIds],
    };
  }

  private restoreSelectionSnapshot(snapshot: SelectionSnapshot): void {
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

  private clearSelectionState(): void {
    for (const nodeId of this.selectedNodeIds) {
      const node = this.store.get(nodeId);
      if (node) node.isSelected = false;
    }
    for (const edgeId of this.selectedEdgeIds) {
      const edge = this.edgeStore.get(edgeId);
      if (edge) edge.isSelected = false;
    }
    this.selectedNodeIds.clear();
    this.selectedEdgeIds.clear();
    this.selectionKind = null;
  }

  private setNodeSelected(nodeId: number, isSelected: boolean): void {
    const node = this.store.get(nodeId);
    if (!node) return;
    node.isSelected = isSelected;
    if (isSelected) {
      this.selectedNodeIds.add(nodeId);
    } else {
      this.selectedNodeIds.delete(nodeId);
    }
    this.syncSelectionKind();
  }

  private setEdgeSelected(edgeId: number, isSelected: boolean): void {
    const edge = this.edgeStore.get(edgeId);
    if (!edge) return;
    edge.isSelected = isSelected;
    if (isSelected) {
      this.selectedEdgeIds.add(edgeId);
    } else {
      this.selectedEdgeIds.delete(edgeId);
    }
    this.syncSelectionKind();
  }

  private syncSelectionKind(): void {
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

  private syncPropertiesPanel(): void {
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

  private syncToolbarState(): void {
    if (this.history.canUndo()) {
      this.sideEffects.enableUndo?.();
    } else {
      this.sideEffects.disableUndo?.();
    }

    if (this.history.canRedo()) {
      this.sideEffects.enableRedo?.();
    } else {
      this.sideEffects.disableRedo?.();
    }
  }

  private captureNodePlacement(node: NodeData): NodePlacementSnapshot {
    return {
      localX: node.localX,
      localY: node.localY,
      parentId: node.parentId,
    };
  }

  private captureNodeSnapshot(node: NodeData): NodeHistorySnapshot {
    return captureNodeHistorySnapshot(node);
  }

  private captureNodeSnapshots(nodeIds: Iterable<number>): NodeHistorySnapshot[] {
    const snapshots: NodeHistorySnapshot[] = [];
    const visited = new Set<number>();
    for (const nodeId of nodeIds) {
      const node = this.store.get(nodeId);
      if (!node) continue;
      const visit = (current: NodeData): void => {
        if (visited.has(current.id)) return;
        visited.add(current.id);
        snapshots.push(this.captureNodeSnapshot(current));
        for (const childId of current.childIds) {
          const child = this.store.get(childId);
          if (child) visit(child);
        }
      };
      visit(node);
    }
    return snapshots;
  }

  private captureEdgeSnapshotsForSelection(
    nodeIds: Iterable<number>,
    edgeIds: Iterable<number>
  ): EdgeHistorySnapshot[] {
    const nodeIdSet = new Set(nodeIds);
    const edgeIdSet = new Set(edgeIds);
    const snapshots: EdgeHistorySnapshot[] = [];

    for (const edge of this.edgeStore.allEdges()) {
      if (
        edgeIdSet.has(edge.id) ||
        nodeIdSet.has(edge.sourceNodeId) ||
        nodeIdSet.has(edge.targetNodeId)
      ) {
        snapshots.push(captureEdgeHistorySnapshot(edge));
      }
    }

    return snapshots;
  }

  private applyNodeSnapshot(snapshot: NodeHistorySnapshot): void {
    let node = this.store.get(snapshot.id);
    if (!node) {
      node = this.store.add(
        snapshot.localX,
        snapshot.localY,
        snapshot.text,
        this.theme,
        snapshot.nodeType,
        snapshot.id
      );
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
      isConnected:
        snapshot.handleStates.find((entry) => entry.side === handle.side)
          ?.isConnected ?? false,
    }));
    this.store.forceRestoreNodePlacement(
      snapshot.id,
      snapshot.localX,
      snapshot.localY,
      snapshot.parentId
    );
    node.width = snapshot.width;
    node.height = snapshot.height;
  }

  private restoreNodeSnapshots(snapshots: NodeHistorySnapshot[]): void {
    for (const snapshot of snapshots) {
      this.applyNodeSnapshot(snapshot);
    }
  }

  private restoreEdgeSnapshots(snapshots: EdgeHistorySnapshot[]): void {
    for (const snapshot of snapshots) {
      const edge = this.edgeStore.add({
        ...snapshot,
        idOverride: snapshot.id,
      });
      if (!edge) continue;
      this.syncHandleStates(edge.sourceNodeId);
      this.syncHandleStates(edge.targetNodeId);
      this.applyCompositionReferenceForEdge(edge);
    }
  }

  private isValidConnection(
    sourceNodeId: number,
    sourceHandleSide: HandleSide,
    targetNodeId: number,
    targetHandleSide: HandleSide
  ): boolean {
    if (sourceNodeId === targetNodeId) return false;

    const sourceNode = this.store.get(sourceNodeId);
    const targetNode = this.store.get(targetNodeId);
    if (!sourceNode || !targetNode) return false;

    if (sourceHandleSide === targetHandleSide) return false;
    if (
      sourceNode.nodeType === "node" &&
      targetNode.nodeType === "composition" &&
      !this.canCreateCompositionReference(sourceNodeId, targetNodeId)
    ) {
      return false;
    }

    if (this.edgeStore.hasConnection(sourceNodeId, sourceHandleSide)) return false;
    if (this.edgeStore.hasConnection(targetNodeId, targetHandleSide)) return false;
    return true;
  }

  private isCompositionReferenceEdge(edge: EdgeData | EdgeHistorySnapshot): boolean {
    const source = this.store.get(edge.sourceNodeId);
    const target = this.store.get(edge.targetNodeId);
    return source?.nodeType === "node" && target?.nodeType === "composition";
  }

  private canCreateCompositionReference(
    sourceNodeId: number,
    targetCompositionId: number
  ): boolean {
    const source = this.store.get(sourceNodeId);
    const target = this.store.get(targetCompositionId);
    if (!source || !target) return false;
    if (source.nodeType !== "node" || target.nodeType !== "composition") {
      return false;
    }
    if (source.parentId === null) return false;

    const parent = this.store.get(source.parentId);
    if (parent?.nodeType !== "group") return false;

    return (
      source.compositionRefId === null ||
      source.compositionRefId === targetCompositionId
    );
  }

  private applyCompositionReferenceForEdge(edge: EdgeData | EdgeHistorySnapshot): void {
    if (!this.isCompositionReferenceEdge(edge)) return;
    if (!this.canCreateCompositionReference(edge.sourceNodeId, edge.targetNodeId)) {
      return;
    }

    const source = this.store.get(edge.sourceNodeId);
    const oldParentId = source?.parentId ?? null;
    if (
      this.store.setCompositionReference(
        edge.sourceNodeId,
        edge.targetNodeId,
        this.theme
      )
    ) {
      this.sideEffects.setCompositionReference?.(edge.sourceNodeId, edge.targetNodeId);
      this.refreshContainerChain(oldParentId);
    }
  }

  private clearCompositionReferenceForEdge(edge: EdgeData | EdgeHistorySnapshot): void {
    if (!this.isCompositionReferenceEdge(edge)) return;

    const source = this.store.get(edge.sourceNodeId);
    if (!source || source.compositionRefId !== edge.targetNodeId) return;

    const oldParentId = source.parentId;
    if (this.store.clearCompositionReference(source.id, this.theme)) {
      this.sideEffects.clearCompositionReference?.(source.id, edge.targetNodeId);
      this.refreshContainerChain(oldParentId);
    }
  }

  private removeNodesAndEdges(
    nodeIds: Iterable<number>,
    edgeIds: Iterable<number>
  ): void {
    const removedNodeIds = new Set<number>();
    for (const nodeId of nodeIds) {
      for (const removedId of this.store.collectRemovedIds(nodeId)) {
        removedNodeIds.add(removedId);
      }
    }

    const removedIdSet = new Set(removedNodeIds);
    const removedEdges = this.edgeStore.removeEdgesForNodes(removedNodeIds);
    const affectedNodeIds = new Set<number>();

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

  private removeNodeAndIncidentEdges(nodeId: number): void {
    this.removeNodesAndEdges([nodeId], []);
  }

  private syncHandleStates(nodeId: number): void {
    this.store.updateHandleConnectionState(
      nodeId,
      "left",
      this.edgeStore.hasConnection(nodeId, "left")
    );
    this.store.updateHandleConnectionState(
      nodeId,
      "right",
      this.edgeStore.hasConnection(nodeId, "right")
    );
  }

  private refreshContainerChain(containerId: number | null): void {
    this.sideEffects.refreshContainerChain?.(containerId);
    let currentId = containerId;
    while (currentId !== null) {
      const current = this.store.get(currentId);
      if (!current || !isContainerNodeType(current.nodeType)) return;
      this.store.updateContainerBounds(currentId, this.theme);
      currentId = current.parentId;
    }
  }

  private refreshContainerChains(containerIds: Iterable<number | null>): void {
    for (const containerId of containerIds) {
      this.refreshContainerChain(containerId);
    }
  }

  private setPropValue(
    props: NodePropType,
    targetLabel: string,
    newValue: string | boolean
  ): boolean {
    const primitives = [
      ...Object.values(props.booleans).flat(),
      ...Object.values(props.texts).flat(),
      ...Object.values(props.enums).flat(),
    ];

    for (const primitive of primitives) {
      if (primitive.label !== targetLabel) continue;
      if (primitive.value === newValue) return false;
      primitive.value = newValue;
      return true;
    }

    return false;
  }
}
