import { DEFAULT_HANDLE_STYLE, getDefaultNodeSize, isContainerNodeType, isCandidateNodeType, } from './types.js';
import { createTextTexture } from './texture.js';
import { getWorldPosition, reparent } from './scene-graph.js';
import { AccessibilityTree } from './accessibility.js';
/**
 * Owns the canonical node list.
 * Groups, compositions, and leaf nodes are stored in separate z-order buckets
 * so the renderer can keep compositions above groups without changing layout.
 */
export class NodeStore {
    gl;
    ctx;
    textCanvas;
    /** Group nodes — drawn first (behind compositions and leaves). */
    groups = new Map();
    /** Leaf nodes — drawn last (in front of groups and compositions). */
    nodes = new Map();
    _nextId = 0;
    a11yTree;
    connectionMode;
    handleStyle;
    currentTheme = 'dark';
    constructor(gl, ctx, textCanvas, connectionMode = 'node', handleStyle = DEFAULT_HANDLE_STYLE) {
        this.gl = gl;
        this.ctx = ctx;
        this.textCanvas = textCanvas;
        this.a11yTree = new AccessibilityTree();
        this.connectionMode = connectionMode;
        this.handleStyle = { ...handleStyle };
    }
    /** The id that the next call to add() will assign. Useful for labelling. */
    get nextNodeId() {
        return this._nextId + 1;
    }
    /**
     * Returns a combined Map view of all nodes (containers + leaves).
     * Used by scene-graph functions that need to traverse the full tree.
     */
    get allNodesMap() {
        const combined = new Map();
        this.groups.forEach((node, id) => combined.set(id, node));
        this.nodes.forEach((node, id) => combined.set(id, node));
        return combined;
    }
    /** O(1) lookup across both maps. */
    get(id) {
        return this.nodes.get(id) ?? this.groups.get(id);
    }
    /**
     * Returns the ids that would be removed by `remove(id)`.
     *
     * Container nodes cascade to descendants. Leaf nodes may still have
     * descendants in the current tree model, but those children are promoted
     * rather than deleted.
     */
    collectRemovedIds(id) {
        const node = this.get(id);
        if (!node)
            return [];
        if (!isContainerNodeType(node.nodeType)) {
            return [id];
        }
        const removedIds = [id];
        for (const childId of node.childIds) {
            removedIds.push(...this.collectRemovedIds(childId));
        }
        return removedIds;
    }
    /** Create a new node at world coordinates (localX, localY). */
    add(localX, localY, text, theme, nodeType = 'node', idOverride) {
        const id = idOverride ?? ++this._nextId;
        this._nextId = Math.max(this._nextId, id);
        const { width, height } = getDefaultNodeSize(nodeType);
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
    setConnectionMode(connectionMode) {
        if (this.connectionMode === connectionMode)
            return;
        this.connectionMode = connectionMode;
        for (const node of this.allNodesMap.values()) {
            node.handles = this.createHandleState(node.id, node.nodeType, node.handles);
        }
    }
    setHandleStyle(handleStyle) {
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
    duplicateIntoComposition(sourceId, compositionId, theme) {
        const source = this.get(sourceId);
        const composition = this.get(compositionId);
        if (!source || !composition)
            return null;
        if (source.nodeType !== 'node')
            return null;
        if (composition.nodeType !== 'composition')
            return null;
        const world = getWorldPosition(source.id, this.allNodesMap);
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
    remove(id) {
        const node = this.get(id);
        if (!node)
            return;
        if (isContainerNodeType(node.nodeType)) {
            const childrenToRemove = [...node.childIds];
            for (const childId of childrenToRemove) {
                this.remove(childId);
            }
        }
        else {
            const allNodes = this.allNodesMap;
            const childrenToReparent = [...node.childIds];
            for (const childId of childrenToReparent) {
                reparent(childId, node.parentId, allNodes);
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
        this.gl.deleteTexture(node.texture);
        this.groups.delete(id);
        this.nodes.delete(id);
        this.a11yTree.removeNode(id);
    }
    /** Returns the currently selected node, if any. */
    getSelected() {
        for (const node of this.groups.values()) {
            if (node.isSelected)
                return node;
        }
        for (const node of this.nodes.values()) {
            if (node.isSelected)
                return node;
        }
        return undefined;
    }
    /** Deselect every node. */
    deselectAll() {
        this.groups.forEach((node) => (node.isSelected = false));
        this.nodes.forEach((node) => (node.isSelected = false));
    }
    /** Clear isDropTarget on every node. */
    clearDropTargets() {
        this.groups.forEach((node) => (node.isDropTarget = false));
        this.nodes.forEach((node) => (node.isDropTarget = false));
    }
    /** Rebuild textures for all nodes under a new theme. */
    regenerateTextures(theme) {
        this.currentTheme = theme;
        const regen = (node) => this.refreshNodeTexture(node, theme);
        this.groups.forEach(regen);
        this.nodes.forEach(regen);
    }
    /** Update the label text of a node and regenerate its texture. */
    updateLabel(id, newLabel, theme) {
        const node = this.get(id);
        if (!node)
            return;
        node.text = newLabel;
        this.currentTheme = theme;
        this.refreshNodeTexture(node, theme);
        this.a11yTree.updateLabel(id, newLabel, node.nodeType);
    }
    updateHandleConnectionState(nodeId, side, isConnected) {
        const node = this.get(nodeId);
        if (!node)
            return;
        const handle = node.handles.find((entry) => entry.side === side);
        if (!handle || handle.isConnected === isConnected)
            return;
        handle.isConnected = isConnected;
    }
    /** Assign a new parent to a child node, preserving world position. */
    setParent(childId, newParentId) {
        const changed = reparent(childId, newParentId, this.allNodesMap);
        if (!changed)
            return false;
        this.syncNodePresentation(childId);
        return true;
    }
    /** Restore a node to an exact local position and parent. */
    restoreNodePlacement(childId, localX, localY, parentId) {
        const node = this.get(childId);
        if (!node)
            return false;
        if (parentId !== null) {
            const parent = this.get(parentId);
            if (!parent || !isContainerNodeType(parent.nodeType))
                return false;
        }
        if (node.parentId !== null) {
            const currentParent = this.get(node.parentId);
            if (currentParent) {
                currentParent.childIds = currentParent.childIds.filter((id) => id !== childId);
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
    forceRestoreNodePlacement(childId, localX, localY, parentId) {
        const node = this.get(childId);
        if (!node)
            return false;
        if (node.parentId !== null) {
            const currentParent = this.get(node.parentId);
            if (currentParent) {
                currentParent.childIds = currentParent.childIds.filter((id) => id !== childId);
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
     * All visible nodes in render order:
     * groups first, compositions second, leaves last.
     */
    visibleNodes() {
        const result = [];
        this.groups.forEach((node) => {
            if (node.visible && node.nodeType === 'group')
                result.push(node);
        });
        this.groups.forEach((node) => {
            if (node.visible && node.nodeType === 'composition')
                result.push(node);
        });
        this.nodes.forEach((node) => {
            if (node.visible)
                result.push(node);
        });
        return result;
    }
    /** Re-calculates bounds of a container node based on its children. */
    updateContainerBounds(containerId, theme) {
        const container = this.groups.get(containerId);
        if (!container || !isContainerNodeType(container.nodeType))
            return;
        const defaultSize = getDefaultNodeSize(container.nodeType);
        if (container.childIds.length === 0) {
            container.width = defaultSize.width;
            container.height = defaultSize.height;
            this.gl.deleteTexture(container.texture);
            container.texture = createTextTexture(this.gl, this.ctx, this.textCanvas, container.text, container.width, container.height, theme, container.nodeType);
            return;
        }
        const paddingX = 20;
        const paddingY = 50;
        const paddingBottom = 40;
        const gapY = 10;
        let totalChildHeight = 0;
        let maxChildWidth = 0;
        const children = container.childIds
            .map((id) => this.get(id))
            .filter((node) => Boolean(node));
        for (const child of children) {
            maxChildWidth = Math.max(maxChildWidth, child.width);
            totalChildHeight += child.height;
        }
        totalChildHeight += Math.max(0, children.length - 1) * gapY;
        container.width = Math.max(defaultSize.width, maxChildWidth + paddingX * 2);
        container.height = Math.max(defaultSize.height, totalChildHeight + paddingY + paddingBottom);
        let currentY = paddingY;
        for (const child of children) {
            child.localX = (container.width - child.width) / 2;
            child.localY = currentY;
            currentY += child.height + gapY;
        }
        this.gl.deleteTexture(container.texture);
        container.texture = createTextTexture(this.gl, this.ctx, this.textCanvas, container.text, container.width, container.height, theme, container.nodeType);
    }
    /** Compatibility wrapper for the previous group-specific API. */
    updateGroupBounds(groupId, theme) {
        this.updateContainerBounds(groupId, theme);
    }
    /** Ensure a node is stored in the correct map based on its nodeType. */
    syncToMap(node) {
        if (isContainerNodeType(node.nodeType)) {
            this.groups.set(node.id, node);
        }
        else {
            this.nodes.set(node.id, node);
        }
    }
    insertNode(node) {
        this.syncToMap(node);
        this.a11yTree.addNode(node.id, node.text, node.nodeType);
    }
    refreshNodeTexture(node, theme) {
        const oldTexture = node.texture;
        node.texture = createTextTexture(this.gl, this.ctx, this.textCanvas, node.text, node.width, node.height, theme ?? this.currentTheme, node.nodeType, this.shouldCollapseNode(node));
        this.gl.deleteTexture(oldTexture);
    }
    syncNodePresentation(nodeId) {
        const node = this.get(nodeId);
        if (!node)
            return;
        if (node.nodeType !== 'node') {
            return;
        }
        const shouldCollapse = this.shouldCollapseNode(node);
        const { width, height } = getDefaultNodeSize(node.nodeType, shouldCollapse);
        if (node.width === width && node.height === height)
            return;
        node.width = width;
        node.height = height;
        this.refreshNodeTexture(node, this.currentTheme);
    }
    shouldCollapseNode(node) {
        if (node.nodeType === 'composition-child')
            return true;
        if (node.nodeType !== 'node')
            return false;
        if (node.parentId === null)
            return false;
        const parent = this.get(node.parentId);
        return parent?.nodeType === 'group';
    }
    createHandleState(candidateId, nodeType, existingHandles = []) {
        if (!isCandidateNodeType(nodeType, this.connectionMode))
            return [];
        return ['left', 'right'].map((side) => ({
            candidateId,
            side,
            isConnected: existingHandles.find((handle) => handle.side === side)?.isConnected ?? false,
            style: { ...this.handleStyle },
        }));
    }
    createNodeRecord(params) {
        const { id, localX, localY, width, height, text, theme, nodeType, parentId, visible = true, isSelected = false, isDropTarget = false, } = params;
        const r = id & 0xff;
        const g = (id >> 8) & 0xff;
        const b = (id >> 16) & 0xff;
        const handles = this.createHandleState(id, nodeType);
        return {
            id,
            localX,
            localY,
            width,
            height,
            text,
            texture: createTextTexture(this.gl, this.ctx, this.textCanvas, text, width, height, theme, nodeType),
            pickColor: [r / 255, g / 255, b / 255],
            isSelected,
            visible,
            parentId,
            childIds: [],
            nodeType,
            isDropTarget,
            handles,
        };
    }
}
//# sourceMappingURL=node-store.js.map