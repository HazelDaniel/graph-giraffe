import {
  ConnectionMode,
  DEFAULT_HANDLE_STYLE,
  HandleStyle,
  HandleSide,
  NodeHandleData,
  getDefaultNodeSize,
  isContainerNodeType,
  isCandidateNodeType,
  isNodePrimitiveType,
  NodeData,
  ThemeName,
  NodeType,
  NodePropType
} from './types.js';
import {
  CompositionReferencePreviewChild,
} from './texture.js';
import { getDefaultTextureIds, getCompositionReferenceTextureIds } from './texture-registry.js';
import {
  getParentFrameWorldPosition,
  getOwningSubgraphId,
  getWorldPosition,
  reparent,
} from './scene-graph.js';
import { AccessibilityTree } from './accessibility.js';
import type { NodeTypeRegistry } from './node-type-registry.js';

/**
 * Owns the canonical node list.
 * Groups, compositions, and leaf nodes are stored in separate z-order buckets
 * so the renderer can keep compositions above groups without changing layout.
 */
export class NodeStore {
  /** Group nodes — drawn first (behind compositions and leaves). */
  readonly groups: Map<number, NodeData> = new Map();
  /** Leaf nodes — drawn last (in front of groups and compositions). */
  readonly nodes: Map<number, NodeData> = new Map();
  private _nextId: number = 0;
  /** Per-type creation order for tiered z-ordering. */
  private _groupOrder: Map<number, number> = new Map();
  private _nextGroupOrder: number = 0;
  private _compositionOrder: Map<number, number> = new Map();
  private _nextCompositionOrder: number = 0;
  private _leafOrder: Map<number, number> = new Map();
  private _nextLeafOrder: number = 0;
  private a11yTree: AccessibilityTree;
  private connectionMode: ConnectionMode;
  private handleStyle: HandleStyle;
  private currentTheme: ThemeName = 'dark';

  constructor(
    private gl: WebGL2RenderingContext,
    connectionMode: ConnectionMode = 'node',
    handleStyle: HandleStyle = DEFAULT_HANDLE_STYLE,
    private registry?: NodeTypeRegistry
  ) {
    this.a11yTree = new AccessibilityTree();
    this.connectionMode = connectionMode;
    this.handleStyle = { ...handleStyle };
  }

  getTheme(): ThemeName {
    return this.currentTheme;
  }

  /** Remove all nodes and reset internal counters. Used during graph import. */
  clear(): void {
    this.groups.clear();
    this.nodes.clear();
    this._groupOrder.clear();
    this._nextGroupOrder = 0;
    this._compositionOrder.clear();
    this._nextCompositionOrder = 0;
    this._leafOrder.clear();
    this._nextLeafOrder = 0;
    this._nextId = 0;
  }

  /**
   * Ensure the internal ID counter is at least `value`.
   * Called after graph import so new nodes get IDs above the imported max.
   */
  restoreIdCounter(value: number): void {
    this._nextId = Math.max(this._nextId, value);
  }

  /** Expose the registry for renderer-adjacent views like the minimap. */
  getRegistry(): NodeTypeRegistry | undefined {
    return this.registry;
  }

  /** The id that the next call to add() will assign. Useful for labelling. */
  get nextNodeId(): number {
    return this._nextId + 1;
  }

  /**
   * Returns a combined Map view of all nodes (containers + leaves).
   * Used by scene-graph functions that need to traverse the full tree.
   */
  get allNodesMap(): Map<number, NodeData> {
    const combined = new Map<number, NodeData>();
    this.groups.forEach((node, id) => combined.set(id, node));
    this.nodes.forEach((node, id) => combined.set(id, node));
    return combined;
  }

  /** O(1) lookup across both maps. */
  get(id: number): NodeData | undefined {
    return this.nodes.get(id) ?? this.groups.get(id);
  }

  /**
   * Returns the ids that would be removed by `remove(id)`.
   *
   * Container nodes cascade to descendants. Leaf nodes may still have
   * descendants in the current tree model, but those children are promoted
   * rather than deleted.
   */
  collectRemovedIds(id: number): number[] {
    const node = this.get(id);
    if (!node) return [];

    if (!isContainerNodeType(node.nodeType)) {
      return [id];
    }

    const removedIds = [id];
    for (const childId of node.childIds) {
      removedIds.push(...this.collectRemovedIds(childId));
    }
    return removedIds;
  }

  /**
   * Expand a set of root ids into the full removal set, cascading subgraph
   * clones: removing an original subgraph also removes every clone that
   * references it (via `subgraphRefIds`), plus their descendants.
   */
  collectRemovedIdsWithClones(rootIds: Iterable<number>): number[] {
    const removed = new Set<number>();
    const addSubtree = (id: number): void => {
      for (const removedId of this.collectRemovedIds(id)) {
        removed.add(removedId);
      }
    };

    for (const rootId of rootIds) {
      addSubtree(rootId);
    }

    let changed = true;
    while (changed) {
      changed = false;
      for (const removedId of [...removed]) {
        const node = this.get(removedId);
        if (!node || node.nodeType !== "subgraph") continue;
        for (const cloneId of node.subgraphRefIds ?? []) {
          if (removed.has(cloneId)) continue;
          addSubtree(cloneId);
          changed = true;
        }
      }
    }

    return [...removed];
  }

  /** Create a new node at world coordinates (localX, localY). */
  add(
    localX: number,
    localY: number,
    text: string,
    theme: ThemeName,
    nodeType: NodeType = 'node',
    idOverride?: number
  ): NodeData {
    const id = idOverride ?? ++this._nextId;
    this._nextId = Math.max(this._nextId, id);

    const desc = this.registry?.get(nodeType);
    const zTier = desc?.zTier ?? 0.4;

    if (zTier < 0.1) {
      this._groupOrder.set(id, this._nextGroupOrder++);
    } else if (zTier >= 0.1 && zTier < 0.3) {
      this._compositionOrder.set(id, this._nextCompositionOrder++);
    } else {
      this._leafOrder.set(id, this._nextLeafOrder++);
    }

    const defaultSize = desc
      ? desc.defaultSize
      : getDefaultNodeSize(nodeType);
    const { width, height } = defaultSize;
    const node = this.createNodeRecord({
      id,
      localX,
      localY,
      width,
      height,
      text,
      theme,
      nodeType,
      parentId: null,
    });

    this.insertNode(node);
    return node;
  }

  setConnectionMode(connectionMode: ConnectionMode): void {
    if (this.connectionMode === connectionMode) return;
    this.connectionMode = connectionMode;

    for (const node of this.allNodesMap.values()) {
      node.handles = this.createHandleState(node.id, node.nodeType, node.handles);
    }
  }

  setHandleStyle(handleStyle: HandleStyle): void {
    this.handleStyle = { ...handleStyle };
    for (const node of this.allNodesMap.values()) {
      node.handles = this.createHandleState(node.id, node.nodeType, node.handles);
    }
  }

  /**
   * Duplicate a normal node into a composition as a composition-child.
   * The source node remains untouched; the clone is returned so callers can
   * select or further manipulate it.
   */
  duplicateIntoComposition(
    sourceId: number,
    compositionId: number,
    theme: ThemeName
  ): NodeData | null {
    const source = this.get(sourceId);
    const composition = this.get(compositionId);
    if (!source || !composition) return null;
    if (!isNodePrimitiveType(source.nodeType)) return null;
    if (composition.nodeType !== 'composition') return null;

    const world = getWorldPosition(source.id, this.allNodesMap, this.registry);
    const clone = this.add(world.x, world.y, source.text, theme, 'composition-child');
    if (!this.setParent(clone.id, composition.id)) {
      this.remove(clone.id);
      return null;
    }

    this.updateContainerBounds(composition.id, theme);
    return clone;
  }

  /**
   * Remove a node and free its GPU texture.
   * Container nodes cascade to their descendants. Leaf nodes still keep the
   * old promotion path as a safety net for future leaf variants.
   */
  remove(id: number): void {
    const node = this.get(id);
    if (!node) return;

    if (isContainerNodeType(node.nodeType)) {
      const childrenToRemove = [...node.childIds];
      for (const childId of childrenToRemove) {
        this.remove(childId);
      }
    } else {
      const allNodes = this.allNodesMap;
      const childrenToReparent = [...node.childIds];
      for (const childId of childrenToReparent) {
        reparent(childId, node.parentId, allNodes, this.registry);
        const child = allNodes.get(childId);
        if (child) {
          this.syncNodePresentation(childId);
          this.syncToMap(child);
        }
      }
    }

    if (node.parentId !== null) {
      const parent = this.get(node.parentId);
      if (parent) {
        parent.childIds = parent.childIds.filter((childId) => childId !== id);
      }
    }

    this.groups.delete(id);
    this.nodes.delete(id);
    switch (node.nodeType) {
      case 'group':
      case 'subgraph':
        this._groupOrder.delete(id);
        break;
      case 'composition':
        this._compositionOrder.delete(id);
        break;
      default:
        this._leafOrder.delete(id);
        break;
    }
    this.a11yTree.removeNode(id);
  }

  /**
   * Removes a container while preserving its children in their current visual
   * positions by promoting them to the removed container's parent.
   */
  removeContainerOnly(id: number): boolean {
    const node = this.get(id);
    if (!node || !isContainerNodeType(node.nodeType)) return false;

    const parentId = node.parentId;
    const allNodes = this.allNodesMap;
    for (const childId of [...node.childIds]) {
      reparent(childId, parentId, allNodes, this.registry);
      const child = allNodes.get(childId);
      if (child) {
        this.syncNodePresentation(childId);
        this.syncToMap(child);
      }
    }

    if (parentId !== null) {
      const parent = this.get(parentId);
      if (parent) {
        parent.childIds = parent.childIds.filter((childId) => childId !== id);
      }
    }

    node.childIds = [];
    this.groups.delete(id);
    this.nodes.delete(id);
    this._groupOrder.delete(id);
    this._compositionOrder.delete(id);
    this._leafOrder.delete(id);
    this.a11yTree.removeNode(id);
    return true;
  }

  /**
   * Compute the z-value for a node using tiered per-type creation order.
   *
   * Three tiers keep subgraphs behind the rest of the scene:
   *   Subgraphs     → base z = -0.05 - subgraphIdx * Z_STEP (lowest)
   *   Groups        → base z = groupIdx * Z_STEP
   *   Compositions  → base z = Z_COMP_TIER + compIdx * Z_STEP
   *   Leaves        → base z = Z_LEAF_TIER + leafIdx * Z_STEP (highest)
   *
   * Selected non-container nodes and children of selected containers
   * get Z_SELECTION_BOOST to render on top of everything.
   */
  getZForNode(nodeId: number, selectedNodeIds: Set<number>): number {
    const Z_STEP = 0.001;
    const Z_SELECTION_BOOST = 0.5;

    const node = this.get(nodeId);
    if (!node) return 0;

    let baseZ: number;
    const zTier = this.registry?.getZTier(node.nodeType);

    if (zTier !== undefined) {
      if (zTier < 0) {
        baseZ = zTier - (this._groupOrder.get(nodeId) ?? 0) * Z_STEP;
      } else if (zTier < 0.1) {
        baseZ = (this._groupOrder.get(nodeId) ?? 0) * Z_STEP;
      } else if (zTier < 0.3) {
        baseZ = zTier + (this._compositionOrder.get(nodeId) ?? 0) * Z_STEP;
      } else {
        baseZ = zTier + (this._leafOrder.get(nodeId) ?? 0) * Z_STEP;
      }
    } else {
      const Z_COMP_TIER = 0.2;
      const Z_LEAF_TIER = 0.4;
      switch (node.nodeType) {
        case 'subgraph':
          baseZ = -0.05 - (this._groupOrder.get(nodeId) ?? 0) * Z_STEP;
          break;
        case 'group':
          baseZ = (this._groupOrder.get(nodeId) ?? 0) * Z_STEP;
          break;
        case 'composition':
          baseZ = Z_COMP_TIER + (this._compositionOrder.get(nodeId) ?? 0) * Z_STEP;
          break;
        default:
          baseZ = Z_LEAF_TIER + (this._leafOrder.get(nodeId) ?? 0) * Z_STEP;
          break;
      }
    }

    const isContainer = this.registry
      ? this.registry.isContainer(node.nodeType)
      : isContainerNodeType(node.nodeType);

    if (selectedNodeIds.has(nodeId) && !isContainer) {
      return baseZ + Z_SELECTION_BOOST;
    }

    // Child of selected container: boost so it renders above parent
    let currentId: number | null = node.parentId;
    while (currentId !== null) {
      if (selectedNodeIds.has(currentId)) {
        return baseZ + Z_SELECTION_BOOST;
      }
      const parent = this.get(currentId);
      if (!parent) break;
      currentId = parent.parentId;
    }

    return baseZ;
  }

  /** Returns the currently selected node, if any. */
  getSelected(): NodeData | undefined {
    for (const node of this.groups.values()) {
      if (node.isSelected) return node;
    }
    for (const node of this.nodes.values()) {
      if (node.isSelected) return node;
    }
    return undefined;
  }

  /** Deselect every node. */
  deselectAll(): void {
    this.groups.forEach((node) => (node.isSelected = false));
    this.nodes.forEach((node) => (node.isSelected = false));
  }

  /** Clear isDropTarget on every node. */
  clearDropTargets(): void {
    this.groups.forEach((node) => (node.isDropTarget = false));
    this.nodes.forEach((node) => (node.isDropTarget = false));
  }

  /** Rebuild textures for all nodes under a new theme. */
  regenerateTextures(theme: ThemeName): void {
    this.currentTheme = theme;
    // Theme swap no longer rebuilds textures per node.
    // Textures are shared and colors are injected via shader or dynamically drawn.
  }

  /** Update the label text of a node and regenerate its texture. */
  updateLabel(id: number, newLabel: string, theme: ThemeName): void {
    const node = this.get(id);
    if (!node) return;
    node.text = newLabel;
    this.currentTheme = theme;

    this.a11yTree.updateLabel(id, newLabel, node.nodeType);
  }

  updateHandleConnectionState(
    nodeId: number,
    side: NodeHandleData['side'],
    isConnected: boolean
  ): void {
    const node = this.get(nodeId);
    if (!node) return;

    const handle = node.handles.find((entry) => entry.side === side);
    if (!handle || handle.isConnected === isConnected) return;

    handle.isConnected = isConnected;
  }

  setCompositionReference(nodeId: number, compositionId: number, theme: ThemeName): boolean {
    const node = this.get(nodeId);
    const composition = this.get(compositionId);
    if (!node || !composition) return false;
    if (node.nodeType !== 'node' || composition.nodeType !== 'composition') return false;
    if (node.parentId === null) return false;

    node.compositionRefId = compositionId;
    node.textureIds = getCompositionReferenceTextureIds();
    this.currentTheme = theme;
    this.syncNodePresentation(nodeId);
    return true;
  }

  clearCompositionReference(nodeId: number, theme: ThemeName): boolean {
    const node = this.get(nodeId);
    if (!node || node.nodeType !== 'node' || node.compositionRefId === null) {
      return false;
    }

    node.compositionRefId = null;
    node.textureIds = getDefaultTextureIds('node');
    this.currentTheme = theme;
    this.syncNodePresentation(nodeId);
    return true;
  }

  getCompositionReferenceNodes(compositionId: number): NodeData[] {
    const refs: NodeData[] = [];
    for (const node of this.nodes.values()) {
      if (node.nodeType === 'node' && node.compositionRefId === compositionId) {
        refs.push(node);
      }
    }
    return refs;
  }

  refreshCompositionReferences(compositionId: number, theme: ThemeName): void {
    for (const node of this.getCompositionReferenceNodes(compositionId)) {
      this.syncNodePresentation(node.id);
    }
  }

  /** Assign a new parent to a child node, preserving world position. */
  setParent(childId: number, newParentId: number | null): boolean {
    const changed = reparent(childId, newParentId, this.allNodesMap, this.registry);
    if (!changed) return false;

    this.syncNodePresentation(childId);
    return true;
  }

  /** Restore a node to an exact local position and parent. */
  restoreNodePlacement(
    childId: number,
    localX: number,
    localY: number,
    parentId: number | null
  ): boolean {
    const node = this.get(childId);
    if (!node) return false;

    if (parentId !== null) {
      const parent = this.get(parentId);
      if (!parent || !isContainerNodeType(parent.nodeType)) return false;
      if (node.nodeType === 'hub' && parent.nodeType === 'group') return false;
    }

    if (node.parentId !== null) {
      const currentParent = this.get(node.parentId);
      if (currentParent) {
        currentParent.childIds = currentParent.childIds.filter(
          (id) => id !== childId
        );
      }
    }

    node.localX = localX;
    node.localY = localY;
    node.parentId = parentId;

    if (parentId !== null) {
      const parent = this.get(parentId);
      if (parent && !parent.childIds.includes(childId)) {
        parent.childIds.push(childId);
      }
    }

    this.syncNodePresentation(childId);
    return true;
  }

  /** Restore a node without re-validating the historical parent relationship. */
  forceRestoreNodePlacement(
    childId: number,
    localX: number,
    localY: number,
    parentId: number | null
  ): boolean {
    const node = this.get(childId);
    if (!node) return false;

    if (parentId !== null) {
      const parent = this.get(parentId);
      if (!parent || !isContainerNodeType(parent.nodeType)) return false;
      if (node.nodeType === 'hub' && parent.nodeType === 'group') return false;
    }

    if (node.parentId !== null) {
      const currentParent = this.get(node.parentId);
      if (currentParent) {
        currentParent.childIds = currentParent.childIds.filter(
          (id) => id !== childId
        );
      }
    }

    node.localX = localX;
    node.localY = localY;
    node.parentId = parentId;

    if (parentId !== null) {
      const parent = this.get(parentId);
      if (parent && !parent.childIds.includes(childId)) {
        parent.childIds.push(childId);
      }
    }

    this.syncNodePresentation(childId);
    return true;
  }

  /**
   * Translates the direct children of `rootId` by the same world delta.
   *
   * Collapsed subgraphs use this so the shell and direct children stay
   * aligned while nested descendants keep their relative offsets through
   * the normal parent chain.
   */
  translateDescendants(
    rootId: number,
    deltaX: number,
    deltaY: number
  ): void {
    if (deltaX === 0 && deltaY === 0) return;

    const root = this.get(rootId);
    if (!root) return;

    const visit = (node: NodeData): void => {
      for (const childId of node.childIds) {
        const child = this.get(childId);
        if (!child) continue;
        child.localX += deltaX;
        child.localY += deltaY;
        if (child.nodeType === 'subgraph') {
          visit(child);
        }
      }
    };

    visit(root);
  }

  /**
   * All visible nodes in render order:
   * containers back-to-front (by z-tier, e.g. subgraph < group < composition),
   * then leaves. Container classification is registry-driven so custom node
   * types registered through the plugin mirror the built-in containers.
   */
  visibleNodes(): NodeData[] {
    const result: NodeData[] = [];
    const registry = this.registry;
    const isVisible = (node: NodeData) =>
      node.visible && this.isEffectivelyVisible(node.id);

    if (registry) {
      const containers = [...this.groups.values()]
        .filter(isVisible)
        .sort(
          (a, b) => registry.getZTier(a.nodeType) - registry.getZTier(b.nodeType)
        );
      result.push(...containers);
    } else {
      this.groups.forEach((node) => {
        if (node.visible && node.nodeType === 'subgraph' && this.isEffectivelyVisible(node.id)) result.push(node);
      });
      this.groups.forEach((node) => {
        if (node.visible && node.nodeType === 'group' && this.isEffectivelyVisible(node.id)) result.push(node);
      });
      this.groups.forEach((node) => {
        if (node.visible && node.nodeType === 'composition' && this.isEffectivelyVisible(node.id)) result.push(node);
      });
    }

    this.nodes.forEach((node) => {
      if (node.visible && this.isEffectivelyVisible(node.id)) result.push(node);
    });
    return result;
  }

  isEffectivelyVisible(nodeId: number): boolean {
    const node = this.get(nodeId);
    if (!node || !node.visible) return false;

    let currentId = node.parentId;
    while (currentId !== null) {
      const parent = this.get(currentId);
      if (!parent || !parent.visible) return false;
      if (parent.nodeType === 'subgraph' && parent.isCollapsed) return false;
      currentId = parent.parentId;
    }

    return true;
  }

  /** Re-calculates bounds of a container node based on its children. */
  updateContainerBounds(containerId: number, theme: ThemeName): void {
    const container = this.groups.get(containerId);
    if (!container || !isContainerNodeType(container.nodeType)) return;

    if (container.nodeType === 'subgraph') {
      this.updateSubgraphBounds(container);
      return;
    }

    const defaultSize = getDefaultNodeSize(container.nodeType);
    if (container.childIds.length === 0) {
      container.width = defaultSize.width;
      container.height = defaultSize.height;
      return;
    }

    const paddingX = 0;
    const paddingY = 50;
    const paddingBottom = 40;
    const gapY = 10;

    let totalChildHeight = 0;
    let maxChildWidth = 0;

    const children = container.childIds
      .map((id) => this.get(id))
      .filter((node): node is NodeData => Boolean(node));

    for (const child of children) {
      maxChildWidth = Math.max(maxChildWidth, child.width);
      totalChildHeight += child.height;
    }
    totalChildHeight += Math.max(0, children.length - 1) * gapY;

    container.width = Math.max(defaultSize.width, maxChildWidth + paddingX * 2);
    container.height = Math.max(
      defaultSize.height,
      totalChildHeight + paddingY + paddingBottom
    );

    let currentY = paddingY;
    for (const child of children) {
      child.localX = (container.width - child.width) / 2;
      child.localY = currentY;
      currentY += child.height + gapY;
    }

  }

  /** Compatibility wrapper for the previous group-specific API. */
  updateGroupBounds(groupId: number, theme: ThemeName): void {
    this.updateContainerBounds(groupId, theme);
  }

  /** Ensure a node is stored in the correct map based on its nodeType. */
  private syncToMap(node: NodeData): void {
    const isContainer = this.registry
      ? this.registry.isContainer(node.nodeType)
      : isContainerNodeType(node.nodeType);
    if (isContainer) {
      this.groups.set(node.id, node);
    } else {
      this.nodes.set(node.id, node);
    }
  }

  private insertNode(node: NodeData): void {
    this.syncToMap(node);
    this.a11yTree.addNode(node.id, node.text, node.nodeType);
  }



  syncNodePresentation(nodeId: number): void {
    const node = this.get(nodeId);
    if (!node) return;

    if (!isNodePrimitiveType(node.nodeType)) {
      return;
    }

    const shouldCollapse = this.shouldCollapseNode(node);
    const { width, height } = this.getPresentedNodeSize(node, shouldCollapse);

    const expectedTextureIds = node.compositionRefId !== null
      ? getCompositionReferenceTextureIds()
      : getDefaultTextureIds(node.nodeType);

    node.width = width;
    node.height = height;
    node.textureIds = expectedTextureIds;
  }

  /**
   * Effective collapse state, i.e. whether the node is *presented* collapsed.
   *
   * `node.isCollapsed` alone is NOT the whole story: it only records the
   * explicit, serializable toggle (subgraph collapse). Leaf types additionally
   * collapse *derived* from membership — a primitive dropped inside a group is
   * rendered head-only. Callers that gate rendering/interaction on collapse
   * must use this accessor, not read `node.isCollapsed` directly.
   */
  isNodeCollapsed(node: NodeData): boolean {
    return Boolean(node.isCollapsed) || this.shouldCollapseNode(node);
  }

  shouldCollapseNode(node: NodeData): boolean {
    if (node.compositionRefId !== null) return false;
    if (node.nodeType === 'composition-child') return true;
    if (!isNodePrimitiveType(node.nodeType)) return false;
    if (node.parentId === null) return false;

    const parent = this.get(node.parentId);
    return parent?.nodeType === 'group';
  }

  private getPresentedNodeSize(
    node: NodeData,
    shouldCollapse: boolean
  ): { width: number; height: number } {
    if (node.nodeType === 'node' && node.compositionRefId !== null) {
      const composition = this.get(node.compositionRefId);
      if (composition?.nodeType === 'composition') {
        return {
          width: composition.width,
          height: composition.height,
        };
      }
      return getDefaultNodeSize('composition');
    }

    const defaultSize = getDefaultNodeSize(node.nodeType, shouldCollapse, this.registry);

    // If the node has props and is not collapsed, derive height from props schema
    if (node.nodeType === 'node' && !shouldCollapse && node.props) {
      return { width: defaultSize.width, height: this.calculatePropHeight(node.props) };
    }

    return defaultSize;
  }

  private getCompositionReferencePreviewChildren(
    node: NodeData
  ): CompositionReferencePreviewChild[] | null {
    if (node.nodeType !== 'node' || node.compositionRefId === null) {
      return null;
    }

    const composition = this.get(node.compositionRefId);
    if (!composition || composition.nodeType !== 'composition') {
      return [];
    }

    return composition.childIds
      .map((childId) => this.get(childId))
      .filter((child): child is NodeData => Boolean(child))
      .map((child) => ({
        text: child.text,
        width: child.width,
        height: child.height,
      }));
  }

  private createHandleState(
    candidateId: number,
    nodeType: NodeType,
    existingHandles: NodeHandleData[] = []
  ): NodeHandleData[] {
    if (this.registry) {
      if (!this.registry.hasHandles(nodeType, this.connectionMode)) return [];
      const desc = this.registry.get(nodeType)!;
      return (desc.handles.sides as HandleSide[]).map((side) => ({
        candidateId,
        side,
        isConnected:
          existingHandles.find((handle) => handle.side === side)?.isConnected ?? false,
        style: { ...this.handleStyle },
      }));
    }

    if (nodeType === "branch") {
      return (["top", "left", "right"] as const).map((side) => ({
        candidateId,
        side,
        isConnected:
          existingHandles.find((handle) => handle.side === side)?.isConnected ?? false,
        style: { ...this.handleStyle },
      }));
    }

    if (nodeType === 'subgraph' || isNodePrimitiveType(nodeType)) {
      return (['left', 'right'] as const).map((side) => ({
        candidateId,
        side,
        isConnected:
          existingHandles.find((handle) => handle.side === side)?.isConnected ?? false,
        style: { ...this.handleStyle },
      }));
    }

    if (!isCandidateNodeType(nodeType, this.connectionMode)) return [];

    return (['left', 'right'] as const).map((side) => ({
      candidateId,
      side,
      isConnected:
        existingHandles.find((handle) => handle.side === side)?.isConnected ?? false,
      style: { ...this.handleStyle },
    }));
  }

  private createNodeRecord(params: {
    id: number;
    localX: number;
    localY: number;
    width: number;
    height: number;
    text: string;
    theme: ThemeName;
    nodeType: NodeType;
    parentId: number | null;
    visible?: boolean;
    isSelected?: boolean;
    isDropTarget?: boolean;
    isLocked?: boolean;
    isCollapsed?: boolean;
  }): NodeData {
    const {
      id,
      localX,
      localY,
      width,
      height,
      text,
      theme,
      nodeType,
      parentId,
      visible = true,
      isSelected = false,
      isDropTarget = false,
      isLocked = false,
      isCollapsed = false,
    } = params;

    const r = id & 0xff;
    const g = (id >> 8) & 0xff;
    const b = (id >> 16) & 0xff;
    const handles = this.createHandleState(id, nodeType);

    const desc = this.registry?.get(nodeType);
    const textureIds = desc
      ? { ...desc.defaultTextureIds }
      : getDefaultTextureIds(nodeType);
    const props = desc?.createDefaultProps
      ? desc.createDefaultProps()
      : nodeType === 'node' ? this.createDefaultProps() : undefined;

    const result: NodeData = {
      id,
      localX,
      localY,
      width,
      height,
      text,
      textureIds,
      pickColor: [r / 255, g / 255, b / 255],
      isSelected,
      visible,
      parentId,
      childIds: [],
      nodeType,
      compositionRefId: null,
      subgraphRefId: null,
      isDropTarget,
      isLocked,
      isCollapsed,
      handles,
      props,
    };

    if (result.props) {
      const desc = this.registry?.get(nodeType);
      if (desc?.calculateHeight) {
        result.height = desc.calculateHeight(result);
      } else if (nodeType === 'node') {
        result.height = this.calculatePropHeight(result.props);
      }
    }

    return result;
  }

  private updateSubgraphBounds(subgraph: NodeData): void {
    const collapsed = Boolean(subgraph.isCollapsed);
    const defaultSize = getDefaultNodeSize('subgraph', collapsed);

    if (collapsed || subgraph.childIds.length === 0) {
      subgraph.width = defaultSize.width;
      subgraph.height = defaultSize.height;
      return;
    }

    const padding = 24;
    const titleHeight = 42;
    const parentWorld = getParentFrameWorldPosition(
      subgraph.parentId,
      this.allNodesMap,
      this.registry
    );
    const children = subgraph.childIds
      .map((id) => this.get(id))
      .filter((node): node is NodeData => Boolean(node));

    if (children.length === 0) {
      subgraph.width = defaultSize.width;
      subgraph.height = defaultSize.height;
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const child of children) {
      const childWorld = getWorldPosition(child.id, this.allNodesMap);
      const childX = childWorld.x - parentWorld.x;
      const childY = childWorld.y - parentWorld.y;
      minX = Math.min(minX, childX);
      minY = Math.min(minY, childY);
      maxX = Math.max(maxX, childX + child.width);
      maxY = Math.max(maxY, childY + child.height);
    }

    subgraph.localX = minX - padding - parentWorld.x;
    subgraph.localY = minY - titleHeight - parentWorld.y;
    subgraph.width = (maxX - minX) + padding * 2;
    subgraph.height = (maxY - minY) + titleHeight + padding;
  }

  private calculatePropHeight(props: NodePropType): number {
    let lineCount = 0;

    // Count ungrouped items directly
    lineCount += (props.booleans["ungrouped"]?.length ?? 0);
    lineCount += (props.texts["ungrouped"]?.length ?? 0);
    lineCount += (props.enums["ungrouped"]?.length ?? 0);

    // Count grouped items
    for (let i = 0; i < props.groups.length; i++) {
      const g = props.groups[i];
      const bc = props.booleans[g]?.length ?? 0;
      const tc = props.texts[g]?.length ?? 0;
      const ec = props.enums[g]?.length ?? 0;
      const total = bc + tc + ec;
      if (total > 0) {
        lineCount += 1 + total; // heading + items
      }
    }

    // headerHeight (30) + top padding (16) + (lineCount * 20) + bottom padding (16)
    return 30 + 16 + (lineCount * 20) + 16;
  }

  private createDefaultProps(): NodePropType {
    return {
      groups: ["Appearance", "Data", "Meta"],
      booleans: {
        "ungrouped": [{ label: "Visible", value: true, uiPrimitive: "checkbox" }, {label: "Primary", value: false, uiPrimitive: "checkbox"},],
        "Appearance": [{ label: "Shadow", value: true, uiPrimitive: "checkbox" }]
      },
      texts: {
        "Data": [{ label: "Value", value: "0", uiPrimitive: "range" }, {label: "default", value: "0", uiPrimitive: "range"}],
      },
      enums: {
        "Appearance": [{ label: "Size", value: "Medium", uiPrimitive: "select", options: ["Medium", "Large", "ExtraLarge"] }],
        "Meta": [{ label: "Depth", value: "Deep", uiPrimitive: "select", options: ["Shallow", "Steep", "Deep"] }],
      }
    };
  }
}
