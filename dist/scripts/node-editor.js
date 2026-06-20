import { BGGeometryNode, GeometryNode } from "./geometry.js";
import { createProgram, getBGShaderLocations, getShaderLocations, } from "./shader.js";
import { PickFBO } from "./pick-fbo.js";
import { Camera } from "./camera.js";
import { EdgeStore } from "./edge-store.js";
import { buildEdgeRouteGeometry, hitTestEdgePolyline, } from "./edge-geometry.js";
import { NodeStore } from "./node-store.js";
import { Renderer } from "./renderer.js";
import { UIControls } from "./controls.js";
import { HistoryStack } from "./history.js";
import { DEFAULT_HANDLE_STYLE, NODE_LAYOUT, isCandidateNodeType, isContainerNodeType, } from "./types.js";
import { MsdfAtlas } from "./msdf-text.js";
import { getHandleScreenGeometry, isPointInsideHandle, } from "./handle-geometry.js";
import { getWorldPosition } from "./scene-graph.js";
import { TextureRegistry } from "./texture-registry.js";
/**
 * NodeEditor is the single public class exposed to the entry point.
 * It owns every internal module and wires them together via callbacks.
 * No internal type leaks out of this file's public API.
 */
export class NodeEditor {
    canvasId;
    backgroundCanvasId;
    vsSource;
    fsSource;
    bgVsSource;
    bgFsSource;
    msdfVsSource;
    msdfFsSource;
    nodeTextureUploadList;
    camera;
    store;
    edgeStore;
    pickFBO;
    renderer;
    controls;
    history;
    bgColor = [
        7 / 255,
        7 / 255,
        8 / 255,
        1.0,
    ];
    theme = "dark";
    draggingNode = null;
    dragSnapshot = null;
    dragOffsetX = 0;
    dragOffsetY = 0;
    isPanning = false;
    lastMouseX = 0;
    lastMouseY = 0;
    connectionMode;
    activeConnectionDrag = null;
    hoveredHandle = null;
    selectedNodeIds = new Set();
    selectedEdgeIds = new Set();
    selectionKind = null;
    isMultiSelectMode = false;
    isZooming = false;
    activeLabelEdit = null;
    selectionRep = null;
    draggingSelection = null;
    activeTouches = new Map();
    gestureMode = false;
    pinchDistance = null;
    static _instance = null;
    static async create(canvasId, backgroundCanvasId, vsSource, fsSource, bgVsSource, bgFsSource, msdfVsSource, msdfFsSource, options = {}, nodeTextureUploadList = []) {
        if (this._instance)
            return this._instance;
        this._instance = new NodeEditor(canvasId, backgroundCanvasId, vsSource, fsSource, bgVsSource, bgFsSource, msdfVsSource, msdfFsSource, options, nodeTextureUploadList);
        await this._instance.init();
        return this._instance;
    }
    msdfAtlas;
    iconAtlas;
    constructor(canvasId, backgroundCanvasId, vsSource, fsSource, bgVsSource, bgFsSource, msdfVsSource, msdfFsSource, options = {}, nodeTextureUploadList) {
        this.canvasId = canvasId;
        this.backgroundCanvasId = backgroundCanvasId;
        this.vsSource = vsSource;
        this.fsSource = fsSource;
        this.bgVsSource = bgVsSource;
        this.bgFsSource = bgFsSource;
        this.msdfVsSource = msdfVsSource;
        this.msdfFsSource = msdfFsSource;
        this.nodeTextureUploadList = nodeTextureUploadList;
        const canvas = document.getElementById(canvasId);
        const backgroundCanvas = document.getElementById(backgroundCanvasId);
        if (!canvas)
            throw new Error(`Canvas "${canvasId}" not found`);
        if (!backgroundCanvas)
            throw new Error(`Canvas "${backgroundCanvasId}" not found`);
        const gl = canvas.getContext("webgl2");
        if (!gl)
            throw new Error("WebGL2 is not supported in this browser");
        this.connectionMode = options.connectionMode ?? "node";
        // gl.enable(gl.DEPTH_TEST); // TODO: enable this so we can benefit from instancing with our current approach to drawing of nodes and labels
        this.camera = new Camera();
        this.store = new NodeStore(gl, this.connectionMode, options.handleStyle ?? DEFAULT_HANDLE_STYLE);
        this.edgeStore = new EdgeStore();
        this.history = new HistoryStack();
        this.pickFBO = new PickFBO(gl, canvas.width, canvas.height);
    }
    async init() {
        const canvas = document.getElementById(this.canvasId);
        const gl = canvas.getContext("webgl2");
        const program = createProgram(gl, this.vsSource, this.fsSource);
        const msdfProgram = createProgram(gl, this.msdfVsSource, this.msdfFsSource);
        const bgProgram = createProgram(gl, this.bgVsSource, this.bgFsSource);
        this.msdfAtlas = new MsdfAtlas(gl);
        this.iconAtlas = new MsdfAtlas(gl);
        await Promise.all([
            this.msdfAtlas.load('assets/msdf-atlas.png', 'assets/msdf-atlas.json'),
            this.iconAtlas.load('assets/icon-atlas.png', 'assets/icon-atlas.json')
        ]);
        const locations = getShaderLocations(gl, program);
        const bgLocations = getBGShaderLocations(gl, bgProgram);
        // We instantiate Renderer here now since it needs MsdfAtlas which is loaded asynchronously
        // wait, Renderer is instantiated in constructor currently. I need to move it here or initialize it in init().
        const backgroundCanvas = document.getElementById(this.backgroundCanvasId);
        const labelCanvas = document.getElementById("2d-label-canvas");
        const geometry = new GeometryNode(gl, "rounded-square");
        const bgGeometry = new BGGeometryNode(gl, "grid", backgroundCanvas);
        this.renderer = new Renderer(gl, canvas, backgroundCanvas, program, locations, geometry, bgGeometry, this.store, this.edgeStore, this.camera, bgProgram, bgLocations, labelCanvas, () => this.activeConnectionDrag, () => this.bgColor, msdfProgram, this.msdfAtlas, this.iconAtlas);
        const container = document.getElementById("sidebar");
        const historyPane = document.getElementById("undo-redo-wrapper");
        const toolPane = document.getElementById("tool-panel");
        if (!container)
            throw new Error('"sidebar" element not found');
        if (!toolPane)
            throw new Error('"tool-panel" element not found');
        this.uploadTextureSources();
        this.controls = new UIControls(canvas, container, historyPane, toolPane, {
            onAddNode: () => this.handleAddNode(canvas, "node"),
            onAddGroup: () => this.handleAddNode(canvas, "group"),
            onAddComposition: () => this.handleAddComposition(canvas),
            onToggleMultiSelect: () => this.toggleMultiSelectMode(),
            onUndo: () => this.undo(),
            onRedo: () => this.redo(),
            onDeleteNode: () => this.handleDeleteSelected(),
            onBgColorChange: (r, g, b, a) => {
                this.bgColor = [r, g, b, a];
            },
            onThemeChange: (theme) => {
                this.theme = theme;
                this.store.regenerateTextures(theme);
            },
            onGlobalTextureChange: (kind, textureId) => {
                this.handleGlobalTextureChange(kind, textureId);
            },
            onLabelChange: (newLabel) => {
                const selected = this.getSingleSelectedNode();
                if (selected && selected.nodeType !== "composition") {
                    this.store.updateLabel(selected.id, newLabel, this.theme);
                }
            },
            onLabelCommit: () => this.commitLabelEdit(),
            onPointerDown: (e) => this.handlePointerDown(e, canvas),
            onPointerMove: (e) => this.handlePointerMove(e, canvas),
            onPointerUp: (e) => this.handlePointerUp(e, canvas),
            onPointerCancel: (e) => this.handlePointerCancel(e, canvas),
            onWheel: (e) => this.handleWheel(e, canvas),
        });
        this.controls.setMultiSelectActive(this.isMultiSelectMode);
        window.addEventListener("resize", () => this.handleResize(canvas));
        window.addEventListener("keydown", (e) => this.handleKeyDown(e));
        this.handleResize(canvas);
        this.syncToolbarState();
    }
    distance(p1, p2) {
        const dx = p2.clientX - p1.clientX;
        const dy = p2.clientY - p1.clientY;
        return Math.hypot(dx, dy);
    }
    midpoint(p1, p2) {
        return {
            x: (p1.clientX + p2.clientX) / 2,
            y: (p1.clientY + p2.clientY) / 2,
        };
    }
    uploadTextureSources() {
        for (const textureUpload of this.nodeTextureUploadList) {
            TextureRegistry.addUploaded(textureUpload);
        }
    }
    render() {
        this.renderer.startLoop();
    }
    setConnectionMode(connectionMode) {
        this.connectionMode = connectionMode;
        this.store.setConnectionMode(connectionMode);
    }
    handleGlobalTextureChange(kind, textureId) {
        let didChange = false;
        // Apply the new texture to all nodes that match the kind logic.
        // For leaf nodes: 'node-body' maps to body, 'node-head' maps to head, etc.
        const applyToNodes = (nodes) => {
            for (const node of nodes) {
                if ((node.nodeType === "node" && kind === "node-body") ||
                    (node.nodeType === "group" && kind === "group-body") ||
                    (node.nodeType === "composition" && kind === "composition-body") ||
                    (node.nodeType === "composition-child" && kind === "node-body") || // fallback for body
                    (node.nodeType === "node" &&
                        node.compositionRefId !== null &&
                        kind === "composition-reference-body")) {
                    if (node.textureIds.body !== textureId) {
                        node.textureIds.body = textureId;
                        didChange = true;
                    }
                }
                if ((node.nodeType === "node" && kind === "node-head") ||
                    (node.nodeType === "group" && kind === "group-head") ||
                    (node.nodeType === "composition" && kind === "composition-head") ||
                    (node.nodeType === "composition-child" &&
                        kind === "composition-child-head") ||
                    (node.nodeType === "node" &&
                        node.compositionRefId !== null &&
                        kind === "composition-reference-child-head")) {
                    if (node.textureIds.head !== textureId) {
                        node.textureIds.head = textureId;
                        didChange = true;
                    }
                }
            }
        };
        applyToNodes(this.store.nodes.values());
        applyToNodes(this.store.groups.values());
        if (didChange) {
            // In a real app we might want to push a history entry for the global style change
            // For now, we just force a re-render. Since we didn't touch overlayTexture,
            // the renderer will automatically pick up the new textureIds from the cache on the next frame.
        }
    }
    undo() {
        if (!this.history.undo())
            return;
        this.syncToolbarState();
    }
    redo() {
        if (!this.history.redo())
            return;
        this.syncToolbarState();
    }
    handleResize(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.renderer.resize(canvas.width, canvas.height);
        this.pickFBO.resize(canvas.width, canvas.height);
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
    clearSelectionState() {
        this.selectedNodeIds.forEach((nodeId) => {
            const node = this.store.get(nodeId);
            if (node)
                node.isSelected = false;
        });
        this.selectedEdgeIds.forEach((edgeId) => {
            const edge = this.edgeStore.get(edgeId);
            if (edge)
                edge.isSelected = false;
        });
        this.selectedNodeIds.clear();
        this.selectedEdgeIds.clear();
        this.selectionKind = null;
        this.selectionRep = null;
    }
    syncSelectionKind() {
        if (this.selectedNodeIds.size > 0 && this.selectedEdgeIds.size > 0) {
            return;
        }
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
    selectOnlyNode(nodeId) {
        this.clearSelectionState();
        this.setNodeSelected(nodeId, true);
    }
    selectOnlyEdge(edgeId) {
        this.clearSelectionState();
        this.setEdgeSelected(edgeId, true);
    }
    captureNodePlacement(node) {
        return {
            localX: node.localX,
            localY: node.localY,
            parentId: node.parentId,
        };
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
    pickIgnoringNodeIds(screenX, screenY, hiddenNodeIds) {
        const hiddenIds = new Set(hiddenNodeIds);
        const hiddenNodes = [];
        for (const nodeId of hiddenIds) {
            const node = this.store.get(nodeId);
            if (!node || !node.visible)
                continue;
            node.visible = false;
            hiddenNodes.push(node);
        }
        const pickedId = this.pick(screenX, screenY);
        for (const node of hiddenNodes) {
            node.visible = true;
        }
        return pickedId;
    }
    getSelectionDragRoots() {
        if (this.selectedNodeIds.size === 0 || this.selectedEdgeIds.size > 0) {
            return [];
        }
        const selectedIds = new Set(this.selectedNodeIds);
        const roots = [];
        for (const nodeId of this.selectedNodeIds) {
            const node = this.store.get(nodeId);
            if (!node)
                continue;
            let currentParentId = node.parentId;
            let isDescendantOfSelection = false;
            while (currentParentId !== null) {
                if (selectedIds.has(currentParentId)) {
                    isDescendantOfSelection = true;
                    break;
                }
                const parent = this.store.get(currentParentId);
                currentParentId = parent?.parentId ?? null;
            }
            if (!isDescendantOfSelection) {
                roots.push(node);
            }
        }
        return roots;
    }
    startSelectionDrag(worldX, worldY, selectionRep) {
        const roots = this.getSelectionDragRoots();
        if (roots.length === 0)
            return;
        this.selectionRep = selectionRep;
        this.draggingSelection = {
            startWorldX: worldX,
            startWorldY: worldY,
            entries: roots.map((node) => ({
                nodeId: node.id,
                beforePlacement: this.captureNodePlacement(node),
                beforeWorld: getWorldPosition(node.id, this.store.allNodesMap),
            })),
        };
    }
    moveSelectionDrag(worldX, worldY) {
        const selectionDrag = this.draggingSelection;
        if (!selectionDrag)
            return;
        const deltaX = worldX - selectionDrag.startWorldX;
        const deltaY = worldY - selectionDrag.startWorldY;
        for (const entry of selectionDrag.entries) {
            const node = this.store.get(entry.nodeId);
            if (!node)
                continue;
            const targetX = entry.beforeWorld.x + deltaX;
            const targetY = entry.beforeWorld.y + deltaY;
            if (entry.beforePlacement.parentId === null) {
                node.localX = targetX;
                node.localY = targetY;
                continue;
            }
            const parentWorld = getWorldPosition(entry.beforePlacement.parentId, this.store.allNodesMap);
            node.localX = targetX - parentWorld.x;
            node.localY = targetY - parentWorld.y;
        }
        this.store.clearDropTargets();
    }
    inferSelectionDropTarget(screenX, screenY, selectionDrag) {
        if (!this.selectionRep || this.selectionRep.nodeType === "group") {
            return null;
        }
        const hiddenIds = this.collectSubtreeIds(selectionDrag.entries.map((entry) => entry.nodeId));
        const pickedId = this.pickIgnoringNodeIds(screenX, screenY, hiddenIds);
        if (pickedId === 0)
            return null;
        let pickedNode = this.store.get(pickedId);
        while (pickedNode) {
            if (pickedNode.id !== this.selectionRep.id &&
                isContainerNodeType(pickedNode.nodeType)) {
                if (this.selectionRep.nodeType === "composition") {
                    return pickedNode.nodeType === "group" ? pickedNode : null;
                }
                return pickedNode;
            }
            if (pickedNode.parentId === null)
                break;
            pickedNode = this.store.get(pickedNode.parentId);
        }
        return null;
    }
    applySelectionDrop(selectionDrag, hoveredContainer) {
        const rootIds = selectionDrag.entries.map((entry) => entry.nodeId);
        const beforeSnapshots = this.captureNodeSnapshots(rootIds);
        const cloneSnapshots = [];
        const affectedParents = new Set();
        const cloneIds = [];
        const removedReferenceEdgeSnapshots = [];
        let didChange = false;
        if (hoveredContainer?.nodeType === "composition") {
            if (this.selectionRep && this.selectionRep.nodeType !== "group") {
                for (const entry of selectionDrag.entries) {
                    const node = this.store.get(entry.nodeId);
                    if (!node || node.nodeType !== "node")
                        continue;
                    const clone = this.store.duplicateIntoComposition(node.id, hoveredContainer.id, this.theme);
                    if (!clone)
                        continue;
                    cloneIds.push(clone.id);
                    affectedParents.add(hoveredContainer.id);
                    didChange = true;
                }
            }
        }
        else if (hoveredContainer?.nodeType === "group") {
            if (this.selectionRep && this.selectionRep.nodeType !== "group") {
                for (const entry of selectionDrag.entries) {
                    const node = this.store.get(entry.nodeId);
                    if (!node)
                        continue;
                    const oldParentId = node.parentId;
                    if (!this.store.setParent(node.id, hoveredContainer.id))
                        continue;
                    if (oldParentId !== null) {
                        affectedParents.add(oldParentId);
                    }
                    affectedParents.add(hoveredContainer.id);
                    didChange = true;
                }
            }
        }
        else {
            for (const entry of selectionDrag.entries) {
                const node = this.store.get(entry.nodeId);
                if (!node)
                    continue;
                if (node.parentId === null)
                    continue;
                const parent = this.store.get(node.parentId);
                if (!parent || !isContainerNodeType(parent.nodeType))
                    continue;
                const oldParentId = node.parentId;
                if (node.nodeType === "node") {
                    if (!this.store.setParent(node.id, null))
                        continue;
                    removedReferenceEdgeSnapshots.push(...this.removeCompositionReferenceEdgesForNode(node.id));
                    affectedParents.add(oldParentId);
                    didChange = true;
                    continue;
                }
                if (node.nodeType === "composition" ||
                    node.nodeType === "composition-child") {
                    affectedParents.add(oldParentId);
                    didChange = true;
                }
            }
        }
        this.refreshContainerChains(affectedParents);
        const afterSnapshots = this.captureNodeSnapshots(rootIds);
        for (const cloneId of cloneIds) {
            const clone = this.store.get(cloneId);
            if (!clone)
                continue;
            cloneSnapshots.push(this.captureNodeSnapshot(clone));
        }
        return {
            beforeSnapshots,
            afterSnapshots,
            cloneSnapshots,
            removedReferenceEdgeSnapshots,
            affectedParentIds: [...affectedParents],
            didChange,
        };
    }
    getSingleSelectedNode() {
        if (this.selectedNodeIds.size !== 1 || this.selectedEdgeIds.size > 0) {
            return null;
        }
        const nodeId = this.selectedNodeIds.values().next().value;
        if (nodeId === undefined)
            return null;
        return this.store.get(nodeId) ?? null;
    }
    getSelectedGroupTarget() {
        const selected = this.getSingleSelectedNode();
        if (!selected)
            return null;
        if (selected.nodeType === "group")
            return selected;
        if (selected.parentId === null)
            return null;
        const parent = this.store.get(selected.parentId);
        if (parent && parent.nodeType === "group")
            return parent;
        return null;
    }
    restoreSelectionSnapshot(snapshot) {
        this.clearSelectionState();
        for (const nodeId of snapshot.nodeIds) {
            const node = this.store.get(nodeId);
            if (node) {
                node.isSelected = true;
                this.selectedNodeIds.add(nodeId);
            }
        }
        for (const edgeId of snapshot.edgeIds) {
            const edge = this.edgeStore.get(edgeId);
            if (edge) {
                edge.isSelected = true;
                this.selectedEdgeIds.add(edgeId);
            }
        }
        this.selectionKind = snapshot.kind;
        this.syncSelectionKind();
    }
    clearSelectionAndHideProperties() {
        this.clearSelectionState();
        this.controls.hideProperties();
    }
    toggleMultiSelectMode() {
        this.isMultiSelectMode = !this.isMultiSelectMode;
        this.controls.setMultiSelectActive(this.isMultiSelectMode);
    }
    selectNodeByClick(nodeId) {
        const canExtendSelection = this.isMultiSelectMode &&
            (this.selectionKind === null || this.selectionKind === "node");
        if (!canExtendSelection) {
            this.clearSelectionState();
            this.setNodeSelected(nodeId, true);
            return;
        }
        if (this.selectedNodeIds.has(nodeId)) {
            if (this.selectedNodeIds.size === 1) {
                this.clearSelectionState();
            }
            else {
                this.setNodeSelected(nodeId, false);
            }
            return;
        }
        this.setNodeSelected(nodeId, true);
    }
    selectEdgeByClick(edgeId) {
        const canExtendSelection = this.isMultiSelectMode &&
            (this.selectionKind === null || this.selectionKind === "edge");
        if (!canExtendSelection) {
            this.clearSelectionState();
            this.setEdgeSelected(edgeId, true);
            return;
        }
        if (this.selectedEdgeIds.has(edgeId)) {
            if (this.selectedEdgeIds.size === 1) {
                this.clearSelectionState();
            }
            else {
                this.setEdgeSelected(edgeId, false);
            }
            return;
        }
        this.setEdgeSelected(edgeId, true);
    }
    beginLabelEdit(node) {
        this.activeLabelEdit = {
            nodeId: node.id,
            previousLabel: node.text,
        };
    }
    commitLabelEdit() {
        const session = this.activeLabelEdit;
        if (!session)
            return;
        this.activeLabelEdit = null;
        const node = this.store.get(session.nodeId);
        if (!node || node.text === session.previousLabel)
            return;
        const nextLabel = node.text;
        this.pushHistory({
            undo: () => {
                this.store.updateLabel(node.id, session.previousLabel, this.theme);
                if (this.getSingleSelectedNode()?.id === node.id &&
                    node.nodeType !== "composition") {
                    this.controls.showProperties(session.previousLabel);
                }
                this.syncToolbarState();
            },
            redo: () => {
                this.store.updateLabel(node.id, nextLabel, this.theme);
                if (this.getSingleSelectedNode()?.id === node.id &&
                    node.nodeType !== "composition") {
                    this.controls.showProperties(nextLabel);
                }
                this.syncToolbarState();
            },
        });
    }
    captureNodeSnapshot(node) {
        return {
            id: node.id,
            nodeType: node.nodeType,
            localX: node.localX,
            localY: node.localY,
            width: node.width,
            height: node.height,
            text: node.text,
            textureIds: { ...node.textureIds },
            visible: node.visible,
            isSelected: node.isSelected,
            isDropTarget: Boolean(node.isDropTarget),
            parentId: node.parentId,
            childIds: [...node.childIds],
            compositionRefId: node.compositionRefId,
            handleStates: node.handles.map((handle) => ({
                side: handle.side,
                isConnected: handle.isConnected,
            })),
        };
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
    captureNodeSnapshots(nodeIds) {
        const snapshots = [];
        const visited = new Set();
        for (const nodeId of nodeIds) {
            const root = this.store.get(nodeId);
            if (!root || visited.has(root.id))
                continue;
            const visit = (node) => {
                if (visited.has(node.id))
                    return;
                visited.add(node.id);
                snapshots.push(this.captureNodeSnapshot(node));
                for (const childId of node.childIds) {
                    const child = this.store.get(childId);
                    if (child)
                        visit(child);
                }
            };
            visit(root);
        }
        return snapshots;
    }
    captureEdgeSnapshots(nodeIds) {
        const nodeIdSet = new Set(nodeIds);
        return this.edgeStore
            .allEdges()
            .filter((edge) => nodeIdSet.has(edge.sourceNodeId) || nodeIdSet.has(edge.targetNodeId))
            .map((edge) => ({ ...edge }));
    }
    captureEdgeSnapshotsForSelection(nodeIds, edgeIds) {
        const nodeIdSet = new Set(nodeIds);
        const edgeIdSet = new Set(edgeIds);
        const snapshots = [];
        for (const edge of this.edgeStore.allEdges()) {
            if (edgeIdSet.has(edge.id) ||
                nodeIdSet.has(edge.sourceNodeId) ||
                nodeIdSet.has(edge.targetNodeId)) {
                snapshots.push({ ...edge });
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
                sourceHandleSide: snapshot.sourceHandleSide,
                targetHandleSide: snapshot.targetHandleSide,
                edgeType: snapshot.edgeType,
                headType: snapshot.headType,
                label: snapshot.label,
                isSelected: snapshot.isSelected,
                visible: snapshot.visible,
                idOverride: snapshot.id,
            });
            if (edge) {
                this.syncHandleStates(edge.sourceNodeId);
                this.syncHandleStates(edge.targetNodeId);
                this.applyCompositionReferenceForEdge(edge);
            }
        }
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
            this.refreshContainerChain(oldParentId);
        }
    }
    refreshCompositionReferenceNodes(compositionId) {
        const refs = this.store.getCompositionReferenceNodes(compositionId);
        this.store.refreshCompositionReferences(compositionId, this.theme);
        for (const ref of refs) {
            this.refreshContainerChain(ref.parentId);
        }
    }
    removeCompositionReferenceEdgesForNode(nodeId) {
        const removed = [];
        for (const edge of this.edgeStore.allEdges()) {
            if (edge.sourceNodeId !== nodeId)
                continue;
            if (!this.isCompositionReferenceEdge(edge))
                continue;
            const snapshot = { ...edge };
            const removedEdge = this.edgeStore.remove(edge.id);
            if (!removedEdge)
                continue;
            this.clearCompositionReferenceForEdge(snapshot);
            this.syncHandleStates(snapshot.sourceNodeId);
            this.syncHandleStates(snapshot.targetNodeId);
            removed.push(snapshot);
        }
        return removed;
    }
    refreshAfterRestoration(rootParentId) {
        if (rootParentId !== null) {
            this.refreshContainerChain(rootParentId);
        }
        this.syncToolbarState();
    }
    deleteNodeTreeWithHistory(nodeId) {
        const node = this.store.get(nodeId);
        if (!node)
            return;
        this.activeLabelEdit = null;
        const selectionBefore = this.captureSelectionSnapshot();
        const snapshots = this.captureSubtreeSnapshots(nodeId);
        const removedIds = this.store.collectRemovedIds(nodeId);
        const edgeSnapshots = this.captureEdgeSnapshotsForSelection(removedIds, []);
        const parentId = node.parentId;
        this.removeNodeAndIncidentEdges(nodeId);
        this.clearSelectionAndHideProperties();
        if (parentId !== null) {
            this.refreshContainerChain(parentId);
        }
        this.pushHistory({
            undo: () => {
                this.restoreNodeSnapshots(snapshots);
                this.restoreEdgeSnapshots(edgeSnapshots);
                this.restoreSelectionSnapshot(selectionBefore);
                this.refreshAfterRestoration(parentId);
            },
            redo: () => {
                this.removeNodeAndIncidentEdges(nodeId);
                this.clearSelectionAndHideProperties();
                if (parentId !== null) {
                    this.refreshContainerChain(parentId);
                }
                this.syncToolbarState();
            },
        });
    }
    deleteEdgeWithHistory(edgeId) {
        const edge = this.edgeStore.get(edgeId);
        if (!edge)
            return;
        this.activeLabelEdit = null;
        const selectionBefore = this.captureSelectionSnapshot();
        const snapshot = { ...edge };
        this.edgeStore.remove(edgeId);
        this.clearCompositionReferenceForEdge(snapshot);
        this.syncHandleStates(edge.sourceNodeId);
        this.syncHandleStates(edge.targetNodeId);
        this.clearSelectionAndHideProperties();
        this.pushHistory({
            undo: () => {
                const restored = this.edgeStore.add({
                    ...snapshot,
                    idOverride: snapshot.id,
                });
                if (restored) {
                    this.syncHandleStates(restored.sourceNodeId);
                    this.syncHandleStates(restored.targetNodeId);
                    this.applyCompositionReferenceForEdge(restored);
                }
                this.restoreSelectionSnapshot(selectionBefore);
                this.syncToolbarState();
            },
            redo: () => {
                const removed = this.edgeStore.remove(edgeId);
                if (removed) {
                    this.clearCompositionReferenceForEdge(removed);
                    this.syncHandleStates(removed.sourceNodeId);
                    this.syncHandleStates(removed.targetNodeId);
                }
                this.clearSelectionAndHideProperties();
                this.syncToolbarState();
            },
        });
    }
    deleteCurrentSelectionWithHistory() {
        const nodeIds = [...this.selectedNodeIds];
        const edgeIds = [...this.selectedEdgeIds];
        if (nodeIds.length === 0 && edgeIds.length === 0) {
            return;
        }
        if (nodeIds.length === 1 && edgeIds.length === 0) {
            this.deleteNodeTreeWithHistory(nodeIds[0]);
            return;
        }
        if (nodeIds.length === 0 && edgeIds.length === 1) {
            this.deleteEdgeWithHistory(edgeIds[0]);
            return;
        }
        this.activeLabelEdit = null;
        const selectionBefore = this.captureSelectionSnapshot();
        const snapshots = this.captureNodeSnapshots(nodeIds);
        const removedIds = new Set();
        for (const nodeId of nodeIds) {
            for (const removedId of this.store.collectRemovedIds(nodeId)) {
                removedIds.add(removedId);
            }
        }
        const edgeSnapshots = this.captureEdgeSnapshotsForSelection(removedIds, edgeIds);
        const parentIds = new Set();
        for (const nodeId of nodeIds) {
            const node = this.store.get(nodeId);
            if (node && node.parentId !== null) {
                parentIds.add(node.parentId);
            }
        }
        this.removeNodesAndEdges(removedIds, edgeIds);
        this.clearSelectionAndHideProperties();
        for (const parentId of parentIds) {
            this.refreshContainerChain(parentId);
        }
        this.pushHistory({
            undo: () => {
                this.restoreNodeSnapshots(snapshots);
                this.restoreEdgeSnapshots(edgeSnapshots);
                this.restoreSelectionSnapshot(selectionBefore);
                for (const parentId of parentIds) {
                    this.refreshContainerChain(parentId);
                }
                this.syncToolbarState();
            },
            redo: () => {
                this.removeNodesAndEdges(removedIds, edgeIds);
                this.clearSelectionAndHideProperties();
                for (const parentId of parentIds) {
                    this.refreshContainerChain(parentId);
                }
                this.syncToolbarState();
            },
        });
    }
    createNodeWithHistory(nodeType, worldX, worldY, parentId = null) {
        const selectionBefore = this.captureSelectionSnapshot();
        const label = nodeType === "group"
            ? `Group ${this.store.nextNodeId}`
            : `Node ${this.store.nextNodeId}`;
        const node = this.store.add(worldX, worldY, label, this.theme, nodeType);
        if (parentId !== null && !this.store.setParent(node.id, parentId)) {
            this.store.remove(node.id);
            return null;
        }
        if (parentId !== null) {
            this.refreshContainerChain(parentId);
        }
        const snapshot = this.captureNodeSnapshot(node);
        this.pushHistory({
            undo: () => {
                this.removeNodeAndIncidentEdges(snapshot.id);
                this.restoreSelectionSnapshot(selectionBefore);
                if (parentId !== null) {
                    this.refreshContainerChain(parentId);
                }
                this.syncToolbarState();
            },
            redo: () => {
                this.applyNodeSnapshot(snapshot);
                if (parentId !== null) {
                    this.refreshContainerChain(parentId);
                }
                this.restoreSelectionSnapshot(selectionBefore);
                this.syncToolbarState();
            },
        });
        return node;
    }
    handleAddNode(canvas, nodeType) {
        const screenX = Math.random() * (canvas.width - 200) + 100;
        const screenY = Math.random() * (canvas.height - 200) + 100;
        const { x, y } = this.camera.screenToWorld(screenX, screenY);
        this.createNodeWithHistory(nodeType, x, y);
    }
    handleAddComposition(canvas) {
        const selectionBefore = this.captureSelectionSnapshot();
        const targetGroup = this.getSelectedGroupTarget();
        if (!targetGroup)
            return;
        const screenX = Math.random() * (canvas.width - 240) + 120;
        const screenY = Math.random() * (canvas.height - 240) + 120;
        const { x, y } = this.camera.screenToWorld(screenX, screenY);
        const composition = this.store.add(x, y, `Composition ${this.store.nextNodeId}`, this.theme, "composition");
        if (!this.store.setParent(composition.id, targetGroup.id)) {
            this.store.remove(composition.id);
            return;
        }
        this.refreshContainerChain(targetGroup.id);
        const snapshot = this.captureNodeSnapshot(composition);
        this.clearSelectionState();
        this.setNodeSelected(composition.id, true);
        this.controls.hideProperties();
        this.pushHistory({
            undo: () => {
                this.removeNodeAndIncidentEdges(snapshot.id);
                this.restoreSelectionSnapshot(selectionBefore);
                this.refreshContainerChain(snapshot.parentId);
                this.controls.hideProperties();
                this.syncToolbarState();
            },
            redo: () => {
                this.applyNodeSnapshot(snapshot);
                this.clearSelectionState();
                this.setNodeSelected(snapshot.id, true);
                this.controls.hideProperties();
                this.refreshContainerChain(snapshot.parentId);
                this.syncToolbarState();
            },
        });
    }
    handleDeleteSelected() {
        this.deleteCurrentSelectionWithHistory();
    }
    pick(screenX, screenY) {
        this.pickFBO.bind();
        this.renderer["gl"].clearColor(1.0, 1.0, 1.0, 1.0);
        this.renderer["gl"].clear(this.renderer["gl"].COLOR_BUFFER_BIT |
            this.renderer["gl"].DEPTH_BUFFER_BIT);
        this.renderer.drawNodes(true);
        const pixels = this.pickFBO.readPixel(screenX, screenY);
        this.pickFBO.unbind();
        if (pixels[0] === 255 && pixels[1] === 255 && pixels[2] === 255) {
            return 0;
        }
        return pixels[0] + (pixels[1] << 8) + (pixels[2] << 16);
    }
    hitTestHandle(screenX, screenY) {
        const visibleNodes = this.store.visibleNodes();
        for (let i = visibleNodes.length - 1; i >= 0; i--) {
            const node = visibleNodes[i];
            if (!isCandidateNodeType(node.nodeType, this.connectionMode))
                continue;
            if (node.handles.length === 0)
                continue;
            const { x, y } = getWorldPosition(node.id, this.store.allNodesMap);
            for (const handle of node.handles) {
                const geometry = getHandleScreenGeometry(x, y, node, handle, this.camera.zoom, this.camera.panX, this.camera.panY);
                if (isPointInsideHandle(screenX, screenY, geometry)) {
                    return {
                        nodeId: node.id,
                        handle,
                        geometry,
                    };
                }
            }
        }
        return null;
    }
    getHoveredContainer(screenX, screenY, source, hiddenNodeIds = [source.id]) {
        if (source.nodeType === "composition-child")
            return null;
        const pickedId = this.pickIgnoringNodeIds(screenX, screenY, hiddenNodeIds);
        if (pickedId === 0)
            return null;
        let pickedNode = this.store.get(pickedId);
        while (pickedNode) {
            if (pickedNode.id !== source.id &&
                isContainerNodeType(pickedNode.nodeType)) {
                if (source.nodeType === "composition") {
                    return pickedNode.nodeType === "group" ? pickedNode : null;
                }
                return pickedNode;
            }
            if (pickedNode.parentId === null)
                break;
            pickedNode = this.store.get(pickedNode.parentId);
        }
        return null;
    }
    syncToolbarState() {
        if (this.hasSelection()) {
            this.controls.enableDelete();
        }
        else {
            this.controls.disableDelete();
        }
        if (this.getSelectedGroupTarget()) {
            this.controls.enableAddComposition();
        }
        else {
            this.controls.disableAddComposition();
        }
        if (this.history.canUndo()) {
            this.controls.enableUndo();
        }
        else {
            this.controls.disableUndo();
        }
        if (this.history.canRedo()) {
            this.controls.enableRedo();
        }
        else {
            this.controls.disableRedo();
        }
    }
    refreshContainerChain(containerId) {
        let currentId = containerId;
        while (currentId !== null) {
            const current = this.store.get(currentId);
            if (!current || !isContainerNodeType(current.nodeType))
                return;
            this.store.updateContainerBounds(currentId, this.theme);
            if (current.nodeType === "composition") {
                this.refreshCompositionReferenceNodes(current.id);
            }
            currentId = current.parentId;
        }
    }
    refreshContainerChains(containerIds) {
        const visited = new Set();
        for (const containerId of containerIds) {
            let currentId = containerId;
            while (currentId !== null && !visited.has(currentId)) {
                const current = this.store.get(currentId);
                if (!current || !isContainerNodeType(current.nodeType))
                    break;
                visited.add(currentId);
                this.store.updateContainerBounds(currentId, this.theme);
                if (current.nodeType === "composition") {
                    this.refreshCompositionReferenceNodes(current.id);
                }
                currentId = current.parentId;
            }
        }
    }
    handlePointerDown(e, canvas) {
        if (e.pointerType !== "mouse") {
            e.preventDefault();
        }
        this.capturePointer(canvas, e);
        if (e.pointerType === "mouse") {
            this.handleMouseDown(e, canvas);
            return;
        }
        if (e.pointerType !== "touch")
            return;
        this.activeTouches.set(e.pointerId, e);
        if (this.activeTouches.size === 1) {
            this.handleMouseDown(e, canvas);
        }
        if (this.activeTouches.size === 2) {
            /*
             * Switch to gesture mode.
             */
            this.gestureMode = true;
            this.isPanning = false;
            this.draggingNode = null;
            this.activeConnectionDrag = null;
            const touches = [...this.activeTouches.values()];
            this.pinchDistance = this.distance(touches[0], touches[1]);
            const center = this.midpoint(touches[0], touches[1]);
            this.draggingNode = null;
            this.dragSnapshot = null;
            this.activeConnectionDrag = null;
            this.startPan(center.x, center.y);
        }
    }
    handleMouseDown(e, canvas) {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            this.startPan(e.clientX, e.clientY);
            return;
        }
        const { left, top } = canvas.getBoundingClientRect();
        const screenX = e.clientX - left;
        const screenY = e.clientY - top;
        const handleHit = this.hitTestHandle(screenX, screenY);
        if (handleHit) {
            this.activeConnectionDrag = {
                sourceNodeId: handleHit.nodeId,
                sourceHandleSide: handleHit.handle.side,
                screenX,
                screenY,
            };
            this.selectedEdgeIds.forEach((edgeId) => {
                const edge = this.edgeStore.get(edgeId);
                if (edge)
                    edge.isSelected = false;
            });
            this.selectedEdgeIds.clear();
            this.selectionKind = this.selectedNodeIds.size > 0 ? "node" : null;
            this.hoveredHandle = handleHit;
            this.draggingNode = null;
            this.dragSnapshot = null;
            this.syncToolbarState();
            return;
        }
        const nodeId = this.pick(screenX, screenY);
        const node = this.store.get(nodeId);
        if (!node) {
            const edgeHit = this.hitTestEdge(screenX, screenY);
            if (edgeHit) {
                this.controls.hideProperties();
                this.selectEdgeByClick(edgeHit.id);
                this.hoveredHandle = null;
                this.draggingNode = null;
                this.dragSnapshot = null;
                this.syncToolbarState();
                return;
            }
            this.clearSelectionAndHideProperties();
            this.draggingNode = null;
            this.dragSnapshot = null;
            this.hoveredHandle = null;
            this.syncToolbarState();
            this.startPan(e.clientX, e.clientY);
            return;
        }
        const { x: worldX, y: worldY } = this.camera.screenToWorld(screenX, screenY);
        const nodeWorld = getWorldPosition(node.id, this.store.allNodesMap);
        const localClickX = worldX - nodeWorld.x;
        const localClickY = worldY - nodeWorld.y;
        const closeX = node.width - NODE_LAYOUT.closeBtnPaddingRight;
        const closeY = isContainerNodeType(node.nodeType)
            ? 20
            : NODE_LAYOUT.headerHeight / 2;
        const closeDx = localClickX - closeX;
        const closeDy = localClickY - closeY;
        if (closeDx * closeDx + closeDy * closeDy <=
            NODE_LAYOUT.closeBtnClickRadius * NODE_LAYOUT.closeBtnClickRadius) {
            this.deleteNodeTreeWithHistory(node.id);
            this.draggingNode = null;
            this.dragSnapshot = null;
            this.hoveredHandle = null;
            return;
        }
        if (node.nodeType === "node" ||
            node.nodeType === "composition-child" ||
            node.nodeType === "group") {
            const editX = node.width - NODE_LAYOUT.editBtnPaddingRight;
            const editY = isContainerNodeType(node.nodeType)
                ? 20
                : NODE_LAYOUT.headerHeight / 2;
            const editDx = localClickX - editX;
            const editDy = localClickY - editY;
            if (editDx * editDx + editDy * editDy <=
                NODE_LAYOUT.editBtnClickRadius * NODE_LAYOUT.editBtnClickRadius) {
                this.beginLabelEdit(node);
                this.selectOnlyNode(node.id);
                this.controls.showProperties(node.text);
                this.hoveredHandle = null;
                this.syncToolbarState();
                return;
            }
        }
        if (node.nodeType === "group") {
            const plusX = node.width / 2;
            const plusY = node.height - NODE_LAYOUT.plusBtnPaddingBottom;
            const plusDx = localClickX - plusX;
            const plusDy = localClickY - plusY;
            if (plusDx * plusDx + plusDy * plusDy <=
                NODE_LAYOUT.plusBtnClickRadius * NODE_LAYOUT.plusBtnClickRadius) {
                this.createNodeWithHistory("node", 0, 0, node.id);
                this.hoveredHandle = null;
                this.syncToolbarState();
                return;
            }
        }
        const canDragSelection = this.isMultiSelectMode &&
            this.selectionKind === "node" &&
            this.selectedNodeIds.size > 1 &&
            this.selectedNodeIds.has(node.id);
        if (canDragSelection) {
            this.controls.hideProperties();
            this.draggingNode = null;
            this.dragSnapshot = null;
            this.startSelectionDrag(worldX, worldY, node);
            this.hoveredHandle = null;
            this.syncToolbarState();
            return;
        }
        this.controls.hideProperties();
        this.selectNodeByClick(node.id);
        this.hoveredHandle = null;
        this.draggingNode = node;
        this.dragSnapshot = {
            localX: node.localX,
            localY: node.localY,
            parentId: node.parentId,
        };
        this.dragOffsetX = worldX - nodeWorld.x;
        this.dragOffsetY = worldY - nodeWorld.y;
        this.syncToolbarState();
    }
    startPan(clientX, clientY) {
        this.isPanning = true;
        this.lastMouseX = clientX;
        this.lastMouseY = clientY;
    }
    handlePointerMove(e, canvas) {
        if (e.pointerType !== "mouse") {
            e.preventDefault();
        }
        if (e.pointerType === "mouse") {
            this.handleMouseMove(e, canvas);
            return;
        }
        if (e.pointerType !== "touch")
            return;
        this.activeTouches.set(e.pointerId, e);
        if (!this.gestureMode) {
            if (this.activeTouches.size === 1) {
                this.handleMouseMove(e, canvas);
                return;
            }
        }
        else {
            if (this.activeTouches.size === 2) {
                const touches = [...this.activeTouches.values()];
                const center = this.midpoint(touches[0], touches[1]);
                this.camera.pan(center.x - this.lastMouseX, center.y - this.lastMouseY);
                this.lastMouseX = center.x;
                this.lastMouseY = center.y;
                const distance = this.distance(touches[0], touches[1]);
                if (this.pinchDistance !== null) {
                    const delta = this.pinchDistance - distance;
                    const rect = canvas.getBoundingClientRect();
                    this.camera.zoomAt(center.x - rect.left, center.y - rect.top, delta);
                }
                this.pinchDistance = distance;
            }
        }
    }
    handleMouseMove(e, canvas) {
        if (this.isPanning) {
            this.camera.pan(e.clientX - this.lastMouseX, e.clientY - this.lastMouseY);
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            return;
        }
        const { left, top } = canvas.getBoundingClientRect();
        const screenX = e.clientX - left;
        const screenY = e.clientY - top;
        const { x: worldX, y: worldY } = this.camera.screenToWorld(screenX, screenY);
        if (this.activeConnectionDrag) {
            this.activeConnectionDrag.screenX = screenX;
            this.activeConnectionDrag.screenY = screenY;
            this.hoveredHandle = this.hitTestHandle(screenX, screenY);
            return;
        }
        if (this.draggingSelection) {
            this.moveSelectionDrag(worldX, worldY);
            return;
        }
        if (!this.draggingNode)
            return;
        const targetX = worldX - this.dragOffsetX;
        const targetY = worldY - this.dragOffsetY;
        if (this.draggingNode.parentId === null) {
            this.draggingNode.localX = targetX;
            this.draggingNode.localY = targetY;
        }
        else {
            const parentWorld = getWorldPosition(this.draggingNode.parentId, this.store.allNodesMap);
            this.draggingNode.localX = targetX - parentWorld.x;
            this.draggingNode.localY = targetY - parentWorld.y;
        }
        this.store.clearDropTargets();
        if (this.draggingNode.nodeType === "node" ||
            this.draggingNode.nodeType === "composition") {
            const hoveredContainer = this.getHoveredContainer(screenX, screenY, this.draggingNode);
            if (hoveredContainer) {
                hoveredContainer.isDropTarget = true;
            }
        }
    }
    handlePointerUp(e, canvas) {
        if (e.pointerType === "mouse") {
            this.handleMouseUp(e, canvas);
            this.releasePointer(canvas, e);
            return;
        }
        this.activeTouches.delete(e.pointerId);
        if (this.gestureMode && this.activeTouches.size < 2) {
            this.gestureMode = false;
            this.pinchDistance = null;
            this.isPanning = false;
        }
        if (this.activeTouches.size === 0) {
            this.handleMouseUp(e, canvas);
        }
        this.releasePointer(canvas, e);
    }
    handlePointerCancel(e, canvas) {
        this.handlePointerUp(e, canvas);
    }
    capturePointer(canvas, e) {
        if (!canvas.setPointerCapture)
            return;
        try {
            canvas.setPointerCapture(e.pointerId);
        }
        catch {
            // Some browsers may reject capture if the pointer is no longer active.
        }
    }
    releasePointer(canvas, e) {
        if (!canvas.hasPointerCapture?.(e.pointerId))
            return;
        try {
            canvas.releasePointerCapture(e.pointerId);
        }
        catch {
            // Ignore release failures during pointer cancellation teardown.
        }
    }
    handleMouseUp(e, canvas) {
        this.isPanning = false;
        if (this.activeConnectionDrag) {
            const source = this.activeConnectionDrag;
            const target = this.hoveredHandle;
            if (target &&
                this.isValidConnection(source.sourceNodeId, source.sourceHandleSide, target.nodeId, target.handle.side)) {
                const edge = this.edgeStore.add({
                    sourceNodeId: source.sourceNodeId,
                    sourceHandleSide: source.sourceHandleSide,
                    targetNodeId: target.nodeId,
                    targetHandleSide: target.handle.side,
                });
                if (edge) {
                    this.syncHandleStates(edge.sourceNodeId);
                    this.syncHandleStates(edge.targetNodeId);
                    this.applyCompositionReferenceForEdge(edge);
                    const snapshot = { ...edge };
                    this.pushHistory({
                        undo: () => {
                            const removed = this.edgeStore.remove(snapshot.id);
                            if (removed) {
                                this.clearCompositionReferenceForEdge(removed);
                                this.syncHandleStates(removed.sourceNodeId);
                                this.syncHandleStates(removed.targetNodeId);
                            }
                            this.syncToolbarState();
                        },
                        redo: () => {
                            const restored = this.edgeStore.add({
                                ...snapshot,
                                idOverride: snapshot.id,
                            });
                            if (restored) {
                                this.syncHandleStates(restored.sourceNodeId);
                                this.syncHandleStates(restored.targetNodeId);
                                this.applyCompositionReferenceForEdge(restored);
                            }
                            this.syncToolbarState();
                        },
                    });
                }
            }
            this.activeConnectionDrag = null;
            this.hoveredHandle = null;
            this.syncToolbarState();
            return;
        }
        if (this.draggingSelection) {
            const { left, top } = canvas.getBoundingClientRect();
            const screenX = e.clientX - left;
            const screenY = e.clientY - top;
            const selectionDrag = this.draggingSelection;
            const selectionBefore = this.captureSelectionSnapshot();
            const hoveredContainer = this.inferSelectionDropTarget(screenX, screenY, selectionDrag);
            const dropResult = this.applySelectionDrop(selectionDrag, hoveredContainer);
            this.draggingSelection = null;
            this.draggingNode = null;
            this.dragSnapshot = null;
            this.selectionRep = null;
            this.store.clearDropTargets();
            if (dropResult.didChange) {
                this.pushHistory({
                    undo: () => {
                        for (const snapshot of dropResult.cloneSnapshots) {
                            this.removeNodeAndIncidentEdges(snapshot.id);
                        }
                        this.restoreNodeSnapshots(dropResult.beforeSnapshots);
                        this.restoreEdgeSnapshots(dropResult.removedReferenceEdgeSnapshots);
                        this.restoreSelectionSnapshot(selectionBefore);
                        for (const parentId of dropResult.affectedParentIds) {
                            this.refreshContainerChain(parentId);
                        }
                        this.syncToolbarState();
                    },
                    redo: () => {
                        this.restoreNodeSnapshots(dropResult.afterSnapshots);
                        for (const snapshot of dropResult.removedReferenceEdgeSnapshots) {
                            const removed = this.edgeStore.remove(snapshot.id);
                            if (removed) {
                                this.clearCompositionReferenceForEdge(removed);
                                this.syncHandleStates(removed.sourceNodeId);
                                this.syncHandleStates(removed.targetNodeId);
                            }
                        }
                        for (const snapshot of dropResult.cloneSnapshots) {
                            this.restoreNodeSnapshots([snapshot]);
                        }
                        this.restoreSelectionSnapshot(selectionBefore);
                        for (const parentId of dropResult.affectedParentIds) {
                            this.refreshContainerChain(parentId);
                        }
                        this.syncToolbarState();
                    },
                });
            }
            this.syncToolbarState();
            return;
        }
        if (this.draggingNode && this.dragSnapshot) {
            const { left, top } = canvas.getBoundingClientRect();
            const screenX = e.clientX - left;
            const screenY = e.clientY - top;
            const source = this.draggingNode;
            const snapshot = this.dragSnapshot;
            const selectionBefore = this.captureSelectionSnapshot();
            let historyEntry = null;
            if (source.nodeType === "node") {
                const hoveredContainer = this.getHoveredContainer(screenX, screenY, source);
                if (hoveredContainer?.nodeType === "composition") {
                    const clone = this.store.duplicateIntoComposition(source.id, hoveredContainer.id, this.theme);
                    this.store.restoreNodePlacement(source.id, snapshot.localX, snapshot.localY, snapshot.parentId);
                    if (clone) {
                        const cloneSnapshot = this.captureNodeSnapshot(clone);
                        this.clearSelectionState();
                        this.setNodeSelected(clone.id, true);
                        this.refreshContainerChain(hoveredContainer.id);
                        historyEntry = {
                            undo: () => {
                                this.removeNodeAndIncidentEdges(cloneSnapshot.id);
                                this.restoreSelectionSnapshot(selectionBefore);
                                this.refreshContainerChain(hoveredContainer.id);
                                this.syncToolbarState();
                            },
                            redo: () => {
                                this.store.restoreNodePlacement(source.id, snapshot.localX, snapshot.localY, snapshot.parentId);
                                const createdClone = this.store.duplicateIntoComposition(source.id, hoveredContainer.id, this.theme);
                                if (createdClone) {
                                    this.clearSelectionState();
                                    this.setNodeSelected(createdClone.id, true);
                                    this.refreshContainerChain(hoveredContainer.id);
                                }
                                this.syncToolbarState();
                            },
                        };
                    }
                }
                else if (hoveredContainer?.nodeType === "group") {
                    const oldParentId = source.parentId;
                    const beforePlacement = {
                        localX: snapshot.localX,
                        localY: snapshot.localY,
                        parentId: snapshot.parentId,
                    };
                    if (this.store.setParent(source.id, hoveredContainer.id)) {
                        const afterPlacement = {
                            localX: source.localX,
                            localY: source.localY,
                            parentId: source.parentId,
                        };
                        this.refreshContainerChain(hoveredContainer.id);
                        if (oldParentId !== null && oldParentId !== hoveredContainer.id) {
                            this.refreshContainerChain(oldParentId);
                        }
                        if (beforePlacement.localX !== afterPlacement.localX ||
                            beforePlacement.localY !== afterPlacement.localY ||
                            beforePlacement.parentId !== afterPlacement.parentId) {
                            historyEntry = {
                                undo: () => {
                                    this.store.restoreNodePlacement(source.id, beforePlacement.localX, beforePlacement.localY, beforePlacement.parentId);
                                    this.refreshContainerChain(afterPlacement.parentId);
                                    this.refreshContainerChain(beforePlacement.parentId);
                                    this.restoreSelectionSnapshot(selectionBefore);
                                    this.syncToolbarState();
                                },
                                redo: () => {
                                    this.store.restoreNodePlacement(source.id, afterPlacement.localX, afterPlacement.localY, afterPlacement.parentId);
                                    this.refreshContainerChain(beforePlacement.parentId);
                                    this.refreshContainerChain(afterPlacement.parentId);
                                    this.restoreSelectionSnapshot(selectionBefore);
                                    this.syncToolbarState();
                                },
                            };
                        }
                    }
                    else {
                        this.store.restoreNodePlacement(source.id, snapshot.localX, snapshot.localY, snapshot.parentId);
                    }
                }
                else {
                    const oldParentId = source.parentId;
                    const beforePlacement = {
                        localX: snapshot.localX,
                        localY: snapshot.localY,
                        parentId: snapshot.parentId,
                    };
                    if (this.store.setParent(source.id, null)) {
                        const removedReferenceEdgeSnapshots = this.removeCompositionReferenceEdgesForNode(source.id);
                        const afterPlacement = {
                            localX: source.localX,
                            localY: source.localY,
                            parentId: source.parentId,
                        };
                        if (oldParentId !== null) {
                            this.refreshContainerChain(oldParentId);
                        }
                        if (beforePlacement.localX !== afterPlacement.localX ||
                            beforePlacement.localY !== afterPlacement.localY ||
                            beforePlacement.parentId !== afterPlacement.parentId) {
                            historyEntry = {
                                undo: () => {
                                    this.store.restoreNodePlacement(source.id, beforePlacement.localX, beforePlacement.localY, beforePlacement.parentId);
                                    this.restoreEdgeSnapshots(removedReferenceEdgeSnapshots);
                                    this.refreshContainerChain(afterPlacement.parentId);
                                    this.refreshContainerChain(beforePlacement.parentId);
                                    this.restoreSelectionSnapshot(selectionBefore);
                                    this.syncToolbarState();
                                },
                                redo: () => {
                                    this.store.restoreNodePlacement(source.id, afterPlacement.localX, afterPlacement.localY, afterPlacement.parentId);
                                    for (const edgeSnapshot of removedReferenceEdgeSnapshots) {
                                        const removed = this.edgeStore.remove(edgeSnapshot.id);
                                        if (removed) {
                                            this.clearCompositionReferenceForEdge(removed);
                                            this.syncHandleStates(removed.sourceNodeId);
                                            this.syncHandleStates(removed.targetNodeId);
                                        }
                                    }
                                    this.refreshContainerChain(beforePlacement.parentId);
                                    this.refreshContainerChain(afterPlacement.parentId);
                                    this.restoreSelectionSnapshot(selectionBefore);
                                    this.syncToolbarState();
                                },
                            };
                        }
                    }
                    else {
                        this.store.restoreNodePlacement(source.id, snapshot.localX, snapshot.localY, snapshot.parentId);
                    }
                }
            }
            else if (source.nodeType === "composition") {
                const hoveredContainer = this.getHoveredContainer(screenX, screenY, source);
                if (hoveredContainer?.nodeType === "group") {
                    const oldParentId = source.parentId;
                    const beforePlacement = {
                        localX: snapshot.localX,
                        localY: snapshot.localY,
                        parentId: snapshot.parentId,
                    };
                    if (this.store.setParent(source.id, hoveredContainer.id)) {
                        const afterPlacement = {
                            localX: source.localX,
                            localY: source.localY,
                            parentId: source.parentId,
                        };
                        this.refreshContainerChain(source.id);
                        if (oldParentId !== null && oldParentId !== hoveredContainer.id) {
                            this.refreshContainerChain(oldParentId);
                        }
                        if (beforePlacement.localX !== afterPlacement.localX ||
                            beforePlacement.localY !== afterPlacement.localY ||
                            beforePlacement.parentId !== afterPlacement.parentId) {
                            historyEntry = {
                                undo: () => {
                                    this.store.restoreNodePlacement(source.id, beforePlacement.localX, beforePlacement.localY, beforePlacement.parentId);
                                    this.refreshContainerChain(source.id);
                                    this.refreshContainerChain(beforePlacement.parentId);
                                    this.restoreSelectionSnapshot(selectionBefore);
                                    this.syncToolbarState();
                                },
                                redo: () => {
                                    this.store.restoreNodePlacement(source.id, afterPlacement.localX, afterPlacement.localY, afterPlacement.parentId);
                                    this.refreshContainerChain(source.id);
                                    this.refreshContainerChain(beforePlacement.parentId);
                                    this.restoreSelectionSnapshot(selectionBefore);
                                    this.syncToolbarState();
                                },
                            };
                        }
                    }
                    else {
                        this.store.restoreNodePlacement(source.id, snapshot.localX, snapshot.localY, snapshot.parentId);
                        this.refreshContainerChain(source.id);
                    }
                }
                else {
                    this.store.restoreNodePlacement(source.id, snapshot.localX, snapshot.localY, snapshot.parentId);
                    this.refreshContainerChain(source.id);
                }
            }
            if (historyEntry) {
                this.pushHistory(historyEntry);
            }
        }
        this.store.clearDropTargets();
        this.draggingNode = null;
        this.dragSnapshot = null;
        this.syncToolbarState();
    }
    isValidConnection(sourceNodeId, sourceHandleSide, targetNodeId, targetHandleSide) {
        if (sourceNodeId === targetNodeId)
            return false;
        const sourceNode = this.store.get(sourceNodeId);
        const targetNode = this.store.get(targetNodeId);
        if (!sourceNode || !targetNode)
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
    hitTestEdge(screenX, screenY) {
        const edges = this.edgeStore.allEdges().filter((edge) => edge.visible);
        for (let i = edges.length - 1; i >= 0; i--) {
            const geometry = buildEdgeRouteGeometry(edges[i], this.store, this.camera);
            if (!geometry)
                continue;
            if (hitTestEdgePolyline(screenX, screenY, geometry.screenPoints)) {
                return { id: edges[i].id };
            }
        }
        return null;
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
    hasSelection() {
        return this.selectedNodeIds.size > 0 || this.selectedEdgeIds.size > 0;
    }
    handleWheel(e, canvas) {
        e.preventDefault();
        const { left, top } = canvas.getBoundingClientRect();
        this.isZooming = Math.abs(e.deltaY) > 80; // TODO: we'll stop drawing group node labels when isZooming to  optimize rendering
        this.camera.zoomAt(e.clientX - left, e.clientY - top, e.deltaY);
    }
    handleKeyDown(e) {
        const target = e.target;
        if (target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement ||
            target?.isContentEditable) {
            return;
        }
        const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey;
        const isRedo = (e.ctrlKey || e.metaKey) &&
            (e.key.toLowerCase() === "y" ||
                (e.key.toLowerCase() === "z" && e.shiftKey));
        if (isUndo) {
            e.preventDefault();
            this.undo();
            return;
        }
        if (isRedo) {
            e.preventDefault();
            this.redo();
        }
    }
}
//# sourceMappingURL=node-editor.js.map