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
import { captureNodeHistorySnapshot, cloneNodeProps, } from "./history-snapshots.js";
import { CreateNodeCommand, CreateHubFromConnectionDropCommand, CreateSubgraphCommand, CloneSubgraphCommand, ConnectCommand, DeleteNodeCommand, DeleteEdgeCommand, DeleteSelectionCommand, DuplicateIntoCompositionCommand, MoveNodeCommand, MoveSelectionCommand, ReparentCommand, ToggleLockCommand, ToggleSubgraphCollapseCommand, UngraphCommand, UpdateLabelCommand, UpdatePropCommand, } from "./commands.js";
import { GraphEventEmitter } from "./events.js";
import { DEFAULT_HANDLE_STYLE, NODE_LAYOUT, isCandidateNodeType, isContainerNodeType, isNodePrimitiveType, getSubgraphLinkLocal, } from "./types.js";
import { MsdfAtlas } from "./msdf-text.js";
import { getHandleScreenGeometry, isPointInsideHandle, } from "./handle-geometry.js";
import { getParentFrameWorldPosition, getWorldPosition, } from "./scene-graph.js";
import { TextureRegistry } from "./texture-registry.js";
import { NodeTypeRegistry } from "./node-type-registry.js";
import { DomNodeLayer } from "./dom-node-layer.js";
import { BUILTIN_DESCRIPTORS } from "./builtin-types.js";
import { computeCameraStateFromWorldPoint, } from "../components/minimap.js";
import { attachCommentLayer, } from "./overlay-primitives.js";
import { CLONE, COLLAPSE, DELETE, EDIT, EXPAND, SPOTLIGHT, UNGRAPH, } from "../sprite.js";
import { serializeGraph, deserializeGraph, } from "./graph-serialization.js";
const baseButtons = (items) => items.map(([action, glyph, label]) => ({ action, glyph, label }));
const TOOLBAR_ACTION_MAP = {
    edit: [EDIT, "Edit"],
    delete: [DELETE, "Delete"],
    clone: [CLONE, "Clone"],
    collapse: [COLLAPSE, "Collapse"],
    expand: [EXPAND, "Expand"],
    ungraph: [UNGRAPH, "Ungraph"],
    spotlight: [SPOTLIGHT, "Spotlight"],
};
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
    IconBGVsSource;
    IconBGFsSource;
    nodeTextureUploadList;
    events = new GraphEventEmitter();
    typeRegistry = new NodeTypeRegistry();
    cameraDirty = false;
    get debug() {
        return this.events.debug;
    }
    set debug(value) {
        this.events.debug = value;
    }
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
    fontColor = [
        (255 - 7) / 255,
        (255 - 7) / 255,
        (255 - 8) / 255,
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
    /**
     * The editor-wide rendering pipeline. `"webgl"` (default) draws every
     * primitive on the GPU; `"dom"` renders every node as a DOM view and is set
     * via `NodeEditorConfig.renderMode`. The two pipelines are mutually
     * exclusive — the DOM layer only exists in dom mode and the renderer skips
     * WebGL node bodies in dom mode.
     */
    renderMode;
    activeConnectionDrag = null;
    hoveredHandle = null;
    assetsPath;
    selectedNodeIds = new Set();
    selectedEdgeIds = new Set();
    selectionKind = null;
    isMultiSelectMode = false;
    activeLabelEdit = null;
    selectionRep = null;
    draggingSelection = null;
    selectionToolbar = null;
    selectionToolbarNodeId = null;
    selectionToolbarActionSignature = "";
    overlays = new Map();
    scalingOverlayContainer;
    fixedOverlayContainer;
    domNodeLayer = null;
    resizeObserver;
    activeTouches = new Map();
    gestureMode = false;
    pinchDistance = null;
    minimap = null;
    minimapEnabled = true;
    minimapRevision = 0;
    canvas;
    backgroundCanvas;
    static _instance = null;
    static async create(canvasId, backgroundCanvasId, vsSource, fsSource, bgVsSource, bgFsSource, msdfVsSource, msdfFsSource, IconBGVsSource, IconBGFsSource, options = {}, nodeTextureUploadList = []) {
        if (this._instance)
            return this._instance;
        this._instance = new NodeEditor(canvasId, backgroundCanvasId, vsSource, fsSource, bgVsSource, bgFsSource, msdfVsSource, msdfFsSource, IconBGVsSource, IconBGFsSource, options, nodeTextureUploadList);
        await this._instance.init();
        return this._instance;
    }
    msdfAtlas;
    iconAtlas;
    constructor(canvasId, backgroundCanvasId, vsSource, fsSource, bgVsSource, bgFsSource, msdfVsSource, msdfFsSource, IconBGVsSource, IconBGFsSource, options = {}, nodeTextureUploadList) {
        this.canvasId = canvasId;
        this.backgroundCanvasId = backgroundCanvasId;
        this.vsSource = vsSource;
        this.fsSource = fsSource;
        this.bgVsSource = bgVsSource;
        this.bgFsSource = bgFsSource;
        this.msdfVsSource = msdfVsSource;
        this.msdfFsSource = msdfFsSource;
        this.IconBGVsSource = IconBGVsSource;
        this.IconBGFsSource = IconBGFsSource;
        this.nodeTextureUploadList = nodeTextureUploadList;
        const canvas = document.getElementById(canvasId);
        const backgroundCanvas = document.getElementById(backgroundCanvasId);
        this.canvas = canvas;
        this.backgroundCanvas = backgroundCanvas;
        if (!canvas)
            throw new Error(`Canvas "${canvasId}" not found`);
        if (!backgroundCanvas)
            throw new Error(`Canvas "${backgroundCanvasId}" not found`);
        const gl = canvas.getContext("webgl2");
        if (!gl)
            throw new Error("WebGL2 is not supported in this browser");
        this.connectionMode = options.connectionMode ?? "node";
        this.assetsPath = options.assetsPath ?? "assets";
        this.minimapEnabled = options.minimap ?? true;
        this.renderMode = options.renderMode ?? "webgl";
        // Bind the registry to the editor's rendering mode so "replacing, not
        // additive" is enforced: built-in WebGL types only exist in webgl mode,
        // and DOM plugins replace them (same type names) in dom mode.
        this.typeRegistry.setRenderMode(this.renderMode);
        if (this.renderMode !== "dom") {
            for (const descriptor of BUILTIN_DESCRIPTORS) {
                this.typeRegistry.register(descriptor);
            }
        }
        // gl.enable(gl.DEPTH_TEST); // TODO: enable this so we can benefit from instancing with our current approach to drawing of nodes and labels
        this.camera = new Camera(this);
        this.store = new NodeStore(gl, this.connectionMode, options.handleStyle ?? DEFAULT_HANDLE_STYLE, this.typeRegistry);
        this.edgeStore = new EdgeStore();
        this.history = new HistoryStack();
        this.pickFBO = new PickFBO(gl, canvas.width, canvas.height);
    }
    async init() {
        const canvas = document.getElementById(this.canvasId);
        const gl = canvas.getContext("webgl2");
        const program = createProgram(gl, this.vsSource, this.fsSource);
        const msdfProgram = createProgram(gl, this.msdfVsSource, this.msdfFsSource);
        const iconBGProgam = createProgram(gl, this.IconBGVsSource, this.IconBGFsSource);
        const bgProgram = createProgram(gl, this.bgVsSource, this.bgFsSource);
        this.msdfAtlas = new MsdfAtlas(gl);
        this.iconAtlas = new MsdfAtlas(gl);
        const assetsPath = this.assetsPath;
        const basePath = assetsPath.endsWith("/") ? assetsPath : `${assetsPath}/`;
        try {
            await Promise.all([
                this.msdfAtlas.load(`${basePath}msdf-atlas.png`, `${basePath}msdf-atlas.json`),
                this.iconAtlas.load(`${basePath}icon-atlas.png`, `${basePath}icon-atlas.json`),
            ]);
        }
        catch (err) {
            throw new Error("assets failed to load!");
        }
        const locations = getShaderLocations(gl, program);
        const bgLocations = getBGShaderLocations(gl, bgProgram);
        // We instantiate Renderer here now since it needs MsdfAtlas which is loaded asynchronously
        const backgroundCanvas = document.getElementById(this.backgroundCanvasId);
        const labelCanvas = document.getElementById("2d-label-canvas");
        const geometry = new GeometryNode(gl, "rounded-square");
        const bgGeometry = new BGGeometryNode(gl, "dotted", backgroundCanvas);
        const scalingContainer = document.getElementById("gg-overlays-scaling");
        const fixedContainer = document.getElementById("gg-overlays-fixed");
        if (scalingContainer)
            this.scalingOverlayContainer = scalingContainer;
        if (fixedContainer)
            this.fixedOverlayContainer = fixedContainer;
        // The DOM layer only exists in dom mode. In webgl mode ALL primitives are
        // drawn on the WebGL context and no DOM node views are ever created, so the
        // two pipelines can never coexist on a page.
        if (this.renderMode === "dom") {
            this.domNodeLayer = new DomNodeLayer({
                store: this.store,
                registry: this.typeRegistry,
                events: this.events,
                container: this.scalingOverlayContainer,
            });
            this.domNodeLayer.syncAll();
        }
        this.renderer = new Renderer(gl, canvas, backgroundCanvas, program, locations, geometry, bgGeometry, this.store, this.edgeStore, this.camera, bgProgram, bgLocations, labelCanvas, () => this.activeConnectionDrag, () => this.bgColor, () => this.fontColor, () => this.selectedNodeIds, () => {
            this.updateSelectionToolbarPosition();
            this.domNodeLayer?.syncFrame();
            this.updateOverlays();
            this.refreshMinimap();
        }, msdfProgram, iconBGProgam, this.msdfAtlas, this.iconAtlas, this.typeRegistry, this.renderMode);
        // DOM views mirror the WebGL draw pass: hide views outside the viewport
        // so per-frame DOM cost tracks the on-screen graph, not the whole graph.
        this.domNodeLayer?.setCull((x, y, w, h) => this.renderer.isRectInViewport(x, y, w, h));
        const container = document.getElementById("sidebar");
        const historyPane = document.getElementById("undo-redo-wrapper");
        const toolPane = document.getElementById("tool-panel");
        if (!container)
            throw new Error('"sidebar" element not found');
        if (!toolPane)
            throw new Error('"tool-panel" element not found');
        this.uploadTextureSources();
        this.selectionToolbar = document.createElement("gg-selection-toolbar");
        document.body.appendChild(this.selectionToolbar);
        this.selectionToolbar.addEventListener("gg-selection-toolbar-action", (e) => {
            const customEvent = e;
            this.handleSelectionToolbarAction(customEvent.detail.action);
        });
        this.minimap = document.getElementById("minimap");
        if (this.minimap) {
            this.minimap.setEnabled(this.minimapEnabled);
            this.minimap.addEventListener("gg-minimap-navigate", (e) => {
                const customEvent = e;
                this.handleMinimapNavigate(customEvent.detail);
            });
        }
        this.controls = new UIControls(canvas, container, historyPane, toolPane, {
            onAddNode: () => this.handleAddNode(canvas, "node"),
            onAddGroup: () => this.handleAddNode(canvas, "group"),
            onAddBranch: () => this.handleAddNode(canvas, "branch"),
            onAddComposition: () => this.handleAddComposition(canvas),
            onToggleMultiSelect: () => this.toggleMultiSelectMode(),
            onCommentMode: () => this.toggleCommentMode(),
            onUndo: () => this.undo(),
            onRedo: () => this.redo(),
            onDeleteNode: () => this.handleDeleteSelected(),
            onImport: () => this.handleImport(),
            onExport: () => this.handleExport(),
            onSubgraphCreate: () => this.handleSubgraphCreation(),
            onBgColorChange: (r, g, b, a) => {
                this.bgColor = [r, g, b, a];
            },
            onFontColorChange: (r, g, b, a) => {
                this.fontColor = [r, g, b, a];
            },
            onThemeChange: (theme) => {
                this.theme = theme;
                TextureRegistry.theme = theme;
                this.store.regenerateTextures(theme);
                this.renderer.invalidateTextures();
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
        }, this.renderMode);
        this.controls.setMultiSelectActive(this.isMultiSelectMode);
        this.resizeObserver = new ResizeObserver(() => this.handleResize(canvas));
        this.resizeObserver.observe(canvas.parentElement ?? canvas);
        window.addEventListener("keydown", (e) => this.handleKeyDown(e));
        window.addEventListener("pointercancel", (e) => this.handlePointerCancel(e, canvas));
        this.setupPropGroupListener();
        this.handleResize(canvas);
        this.syncToolbarState();
        this.refreshMinimap();
    }
    setupPropGroupListener() {
        this.controls.nodePropGroup.addEventListener("gg-prop-change", (e) => {
            const customEvent = e;
            const { label, value } = customEvent.detail;
            if (this.selectedNodeIds.size === 1) {
                const nodeId = Array.from(this.selectedNodeIds)[0];
                const node = this.store.get(nodeId);
                if (node && node.props) {
                    const beforeSnapshot = this.captureNodeSnapshot(node);
                    const selectionBefore = this.captureSelectionSnapshot();
                    const didChange = this.updatePropValue(node.props, label, value);
                    if (!didChange)
                        return;
                    this.store.syncNodePresentation(node.id);
                    const afterSnapshot = this.captureNodeSnapshot(node);
                    const parentId = node.parentId;
                    if (parentId !== null) {
                        this.refreshContainerChain(parentId);
                    }
                    this.pushCommand(new UpdatePropCommand({
                        beforeSnapshot,
                        afterSnapshot,
                        selectionBefore,
                        parentId,
                    }));
                    this.events.dispatch("node:propChange", {
                        nodeId: node.id,
                        nodeType: node.nodeType,
                        label,
                        value,
                    });
                }
            }
        });
    }
    syncPropertiesPanelForSelection() {
        const selected = this.getSingleSelectedNode();
        if (selected && selected.nodeType !== "composition") {
            this.controls.showProperties(selected);
            return;
        }
        this.controls.hideProperties();
    }
    updatePropValue(props, targetLabel, newValue) {
        if (!props)
            return false;
        const primitives = [
            ...Object.values(props.booleans || {}).flat(),
            ...Object.values(props.texts || {}).flat(),
            ...Object.values(props.enums || {}).flat(),
        ];
        for (const primitive of primitives) {
            if (primitive.label === targetLabel) {
                if (primitive.value === newValue)
                    return false;
                primitive.value = newValue;
                return true;
            }
        }
        return false;
    }
    validateConfig(config) {
        return {
            connectionMode: config.connectionMode ?? "node",
            handleStyle: config.handleStyle ?? DEFAULT_HANDLE_STYLE,
            assetsPath: config.assetsPath ?? "assets",
            minimap: config.minimap ?? true,
            renderMode: config.renderMode ?? "webgl",
        };
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
    /**
     * Draw a single frame on demand instead of starting the continuous 60fps
     * loop. Coalesce calls on the caller's side (e.g. subscribe to
     * `history:command`, `camera:change`, `selection:change`, `node:drag`, and
     * interaction events, then render once per frame). An editor rendered this
     * way costs ~0% CPU while idle. Does not affect editors that use the
     * default continuous `render()` loop.
     */
    requestRender() {
        this.renderer.renderFrame();
    }
    setConnectionMode(connectionMode) {
        this.connectionMode = connectionMode;
        this.store.setConnectionMode(connectionMode);
    }
    /**
     * Serialize the full graph state into a portable JSON-compatible snapshot.
     *
     * Only persistent fields are captured — transient rendering state is omitted.
     * The returned object can be passed to `JSON.stringify()` for persistence.
     */
    exportGraph() {
        return serializeGraph({
            store: this.store,
            edgeStore: this.edgeStore,
            textureSources: TextureRegistry.sources.values(),
            theme: this.theme,
            connectionMode: this.connectionMode,
            bgColor: this.bgColor,
            fontColor: this.fontColor,
            camera: this.camera,
        });
    }
    /**
     * Restore the editor to a previously exported graph snapshot.
     *
     * This clears all existing state (nodes, edges, history) and rebuilds
     * from the snapshot. The operation is **not undoable** — it replaces the
     * entire editor state as a fresh baseline.
     */
    importGraph(snapshot) {
        // Restore stores (nodes, edges, handle state, textures)
        const editorState = deserializeGraph({
            snapshot,
            store: this.store,
            edgeStore: this.edgeStore,
            theme: this.theme,
            registerTexture: (params) => {
                TextureRegistry.addUploaded(params);
            },
        });
        // Apply editor-level state via setters to trigger side effects
        // (texture regeneration, renderer cache invalidation, etc.)
        this.theme = editorState.theme;
        TextureRegistry.theme = editorState.theme;
        this.store.regenerateTextures(editorState.theme);
        this.renderer.invalidateTextures();
        this.connectionMode = editorState.connectionMode;
        this.store.setConnectionMode(editorState.connectionMode);
        this.bgColor = [...editorState.bgColor];
        this.fontColor = [...editorState.fontColor];
        this.camera.setState(editorState.camera.panX, editorState.camera.panY, editorState.camera.zoom);
        // Clear selection and history (import is a fresh baseline)
        this.clearSelectionState();
        this.history.clear();
        this.syncToolbarState();
        this.markMinimapDirty();
        this.refreshMinimap();
        this.domNodeLayer?.syncAll();
    }
    /**
     * Add a custom DOM overlay component to the canvas.
     */
    addOverlay(overlay) {
        if (this.overlays.has(overlay.id)) {
            this.removeOverlay(overlay.id);
        }
        this.overlays.set(overlay.id, overlay);
        overlay.element.style.position = "absolute";
        if (!overlay.element.style.pointerEvents) {
            overlay.element.style.pointerEvents = "auto";
        }
        if (overlay.scaleWithZoom !== false) {
            overlay.element.style.left = `${overlay.worldX}px`;
            overlay.element.style.top = `${overlay.worldY}px`;
            if (this.scalingOverlayContainer) {
                this.scalingOverlayContainer.appendChild(overlay.element);
            }
        }
        else {
            overlay.element.style.left = "0px";
            overlay.element.style.top = "0px";
            if (this.fixedOverlayContainer) {
                this.fixedOverlayContainer.appendChild(overlay.element);
            }
        }
        this.updateOverlays();
    }
    /**
     * Remove a custom DOM overlay component by ID.
     */
    removeOverlay(id) {
        const overlay = this.overlays.get(id);
        if (overlay) {
            overlay.element.remove();
            this.overlays.delete(id);
        }
    }
    /**
     * Retrieve a custom DOM overlay component by ID.
     */
    getOverlay(id) {
        return this.overlays.get(id);
    }
    /**
     * Update the world position of an existing overlay component.
     */
    updateOverlayPosition(id, worldX, worldY) {
        const overlay = this.overlays.get(id);
        if (overlay) {
            overlay.worldX = worldX;
            overlay.worldY = worldY;
            if (overlay.scaleWithZoom !== false) {
                overlay.element.style.left = `${worldX}px`;
                overlay.element.style.top = `${worldY}px`;
            }
            this.updateOverlays();
        }
    }
    /**
     * Convert a world-space coordinate to screen-space pixel coordinates.
     */
    worldToScreen(worldX, worldY) {
        return this.camera.worldToScreen(worldX, worldY);
    }
    /**
     * Convert a screen-space pixel coordinate to world-space coordinates.
     */
    screenToWorld(screenX, screenY) {
        return this.camera.screenToWorld(screenX, screenY);
    }
    /**
     * Get the current camera viewport state (panX, panY, zoom).
     */
    getCameraState() {
        return {
            panX: this.camera.panX,
            panY: this.camera.panY,
            zoom: this.camera.zoom,
        };
    }
    /**
     * Imperatively animate (lerp) the camera so the given world coordinate lands
     * at a screen position — by default the center of the canvas. Optionally
     * targets a new zoom too. User pan/zoom input cancels the animation, and any
     * in-flight animation is superseded by this call.
     *
     * Resolves once the camera reaches its destination.
     */
    async panTo(worldX, worldY, options = {}) {
        const zoom = options.zoom ?? this.camera.zoom;
        const width = this.canvas.clientWidth || window.innerWidth;
        const height = this.canvas.clientHeight || window.innerHeight;
        const screenX = options.screenX ?? width / 2;
        const screenY = options.screenY ?? height / 2;
        // From screenToWorld: worldX = (screenX - panX) / zoom → panX = screenX - worldX * zoom.
        const targetPanX = screenX - worldX * zoom;
        const targetPanY = screenY - worldY * zoom;
        this.camera.animateTo(targetPanX, targetPanY, zoom);
        await new Promise((resolve) => {
            const tick = () => {
                this.requestRender();
                if (this.camera.isAnimating()) {
                    requestAnimationFrame(tick);
                }
                else {
                    resolve();
                }
            };
            tick();
        });
    }
    /**
     * Create a node of any registered type (built-in or custom) at a world
     * coordinate. Routes through the command/history system, so the action is
     * undoable and emits `history:command` (and any `before:nodeCreate` hooks
     * can block it). Returns the created node, or `null` if blocked.
     */
    async addNode(nodeType, worldX, worldY, parentId = null, label) {
        if (!this.typeRegistry.has(nodeType)) {
            throw new Error(`NodeEditor.addNode: unknown node type "${nodeType}" — register it first via typeRegistry.register()`);
        }
        return this.createNodeWithHistory(nodeType, worldX, worldY, parentId, label);
    }
    /**
     * Synchronize overlay container transforms with current camera pan and zoom.
     */
    updateOverlays() {
        const { panX, panY, zoom } = this.camera;
        if (this.scalingOverlayContainer) {
            this.scalingOverlayContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
        }
        if (this.fixedOverlayContainer) {
            this.fixedOverlayContainer.style.transform = `translate(${panX}px, ${panY}px)`;
        }
        for (const overlay of this.overlays.values()) {
            if (overlay.scaleWithZoom === false) {
                overlay.element.style.transform = `translate(${overlay.worldX * zoom}px, ${overlay.worldY * zoom}px)`;
                overlay.element.style.transformOrigin = "0 0";
            }
        }
        if (!this.cameraDirty)
            return;
        this.events.dispatch("camera:change", { panX, panY, zoom });
    }
    handleExport() {
        const snapshot = this.exportGraph();
        const jsonStr = JSON.stringify(snapshot, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `graph-giraffe-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    handleImport() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file)
                return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result;
                    const snapshot = JSON.parse(content);
                    this.importGraph(snapshot);
                }
                catch (err) {
                    console.error("Failed to parse imported graph JSON:", err);
                    alert("Invalid graph JSON file.");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
    handleGlobalTextureChange(kind, textureId) {
        let didChange = false;
        // Apply the new texture to all nodes that match the kind logic.
        // For leaf nodes: 'node-body' maps to body, 'node-head' maps to head, etc.
        const applyToNodes = (nodes) => {
            for (const node of nodes) {
                if ((isNodePrimitiveType(node.nodeType) && kind === "node-body") ||
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
                if ((isNodePrimitiveType(node.nodeType) && kind === "node-head") ||
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
        const cmd = this.history.undo(this.commandContext);
        if (!cmd)
            return;
        this.events.dispatch("history:command", { command: cmd, action: "undo" });
        this.syncToolbarState();
    }
    redo() {
        const cmd = this.history.redo(this.commandContext);
        if (!cmd)
            return;
        this.events.dispatch("history:command", { command: cmd, action: "redo" });
        this.syncToolbarState();
    }
    dpr = 1;
    handleResize(canvas) {
        const rect = canvas.getBoundingClientRect();
        this.dpr = typeof window !== "undefined" ? Math.max(1, window.devicePixelRatio || 1) : 1;
        const physicalWidth = Math.round(rect.width * this.dpr);
        const physicalHeight = Math.round(rect.height * this.dpr);
        canvas.width = physicalWidth;
        canvas.height = physicalHeight;
        this.renderer.resize(physicalWidth, physicalHeight, this.dpr);
        this.pickFBO.resize(physicalWidth, physicalHeight);
        this.refreshMinimap();
    }
    markMinimapDirty() {
        this.minimapRevision++;
    }
    refreshMinimap() {
        if (!this.minimap || !this.minimapEnabled)
            return;
        this.minimap.updateScene({
            store: this.store,
            edgeStore: this.edgeStore,
            camera: this.camera,
            canvas: this.canvas,
        }, this.minimapRevision);
    }
    handleMinimapNavigate(detail) {
        const rect = this.canvas.getBoundingClientRect();
        const next = computeCameraStateFromWorldPoint(this.camera, { width: rect.width, height: rect.height }, detail.bounds, detail.worldX, detail.worldY);
        this.camera.setState(next.panX, next.panY, next.zoom);
        this.refreshMinimap();
    }
    pushCommand(command) {
        this.history.push(command);
        this.markMinimapDirty();
        this.events.dispatch("history:command", { command, action: "do" });
        this.syncToolbarState();
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
            removeContainerOnly: (id) => this.removeContainerOnly(id),
            clearSelectionState: () => this.clearSelectionState(),
            setNodeSelected: (id, sel) => this.setNodeSelected(id, sel),
            restoreSelectionSnapshot: (s) => this.restoreSelectionSnapshot(s),
            refreshContainerChain: (id) => this.refreshContainerChain(id),
            syncPropertiesPanel: () => this.syncPropertiesPanelForSelection(),
            syncToolbarState: () => this.syncToolbarState(),
            syncHandleStates: (id) => this.syncHandleStates(id),
            applyCompositionReferenceForEdge: (e) => this.applyCompositionReferenceForEdge(e),
            clearCompositionReferenceForEdge: (e) => this.clearCompositionReferenceForEdge(e),
        };
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
        this.syncSelectionToolbar();
        this.dispatchSelectionChange();
    }
    dispatchSelectionChange() {
        this.events.dispatch("selection:change", {
            nodeIds: [...this.selectedNodeIds],
            edgeIds: [...this.selectedEdgeIds],
        });
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
        this.syncSelectionToolbar();
        this.dispatchSelectionChange();
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
        this.syncSelectionToolbar();
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
            if (!isDescendantOfSelection && !this.isInLockedGroup(nodeId)) {
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
    moveSelectionDrag(worldX, worldY, screenX, screenY) {
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
            const parentWorld = getParentFrameWorldPosition(entry.beforePlacement.parentId, this.store.allNodesMap);
            node.localX = targetX - parentWorld.x;
            node.localY = targetY - parentWorld.y;
        }
        const owningSubgraphIds = new Set();
        for (const entry of selectionDrag.entries) {
            const owningSubgraphId = this.getOwningSubgraphId(entry.nodeId);
            if (owningSubgraphId !== null) {
                owningSubgraphIds.add(owningSubgraphId);
            }
        }
        if (owningSubgraphIds.size > 0) {
            this.refreshContainerChains(owningSubgraphIds);
        }
        this.store.clearDropTargets();
        if (this.selectionRep && this.selectionRep.nodeType !== "group") {
            const hoveredContainer = this.inferSelectionDropTarget(screenX, screenY, selectionDrag);
            if (hoveredContainer) {
                hoveredContainer.isDropTarget = true;
            }
        }
        this.markMinimapDirty();
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
                    return pickedNode.nodeType === "group" ||
                        pickedNode.nodeType === "subgraph"
                        ? pickedNode
                        : null;
                }
                return pickedNode;
            }
            if (pickedNode.parentId === null)
                break;
            pickedNode = this.store.get(pickedNode.parentId);
        }
        return null;
    }
    async applySelectionDrop(selectionDrag, hoveredContainer) {
        const rootIds = selectionDrag.entries.map((entry) => entry.nodeId);
        const beforeSnapshots = this.captureNodeSnapshots(rootIds);
        const cloneSnapshots = [];
        const affectedParents = new Set();
        const cloneIds = [];
        const removedReferenceEdgeSnapshots = [];
        let didChange = false;
        if (hoveredContainer?.nodeType === "composition") {
            if (this.selectionRep && this.selectionRep.nodeType !== "group") {
                const targetOwningSubgraphId = this.getOwningSubgraphId(hoveredContainer.id);
                for (const entry of selectionDrag.entries) {
                    const node = this.store.get(entry.nodeId);
                    if (!node || !isNodePrimitiveType(node.nodeType))
                        continue;
                    const sourceOwningSubgraphId = this.getOwningSubgraphId(node.id);
                    if (sourceOwningSubgraphId !== targetOwningSubgraphId)
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
        else if (hoveredContainer?.nodeType === "subgraph") {
            // Dropping primitives onto a subgraph shell does not reparent them.
        }
        else if (hoveredContainer?.nodeType === "group") {
            if (this.selectionRep && this.selectionRep.nodeType !== "group") {
                const targetOwningSubgraphId = this.getOwningSubgraphId(hoveredContainer.id);
                for (const entry of selectionDrag.entries) {
                    const node = this.store.get(entry.nodeId);
                    if (!node)
                        continue;
                    const sourceOwningSubgraphId = this.getOwningSubgraphId(node.id);
                    if (sourceOwningSubgraphId !== targetOwningSubgraphId)
                        continue;
                    const oldParentId = node.parentId;
                    const parentChanged = oldParentId !== hoveredContainer.id;
                    if (parentChanged) {
                        const allowed = await this.events.dispatchBefore("before:nodeReparent", {
                            nodeId: node.id,
                            nodeType: node.nodeType,
                            newParentId: hoveredContainer.id,
                            newParentType: hoveredContainer.nodeType,
                        });
                        if (!allowed)
                            continue;
                        if (!this.store.setParent(node.id, hoveredContainer.id))
                            continue;
                        this.events.dispatch("node:reparent", {
                            nodeId: node.id,
                            nodeType: node.nodeType,
                            oldParentId,
                            newParentId: hoveredContainer.id,
                        });
                    }
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
                if (this.getOwningSubgraphId(node.id) !== null)
                    continue;
                const oldParentId = node.parentId;
                if (isNodePrimitiveType(node.nodeType)) {
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
        if (beforeSnapshots.length !== afterSnapshots.length ||
            beforeSnapshots.some((before, index) => {
                const after = afterSnapshots[index];
                return (!after ||
                    before.localX !== after.localX ||
                    before.localY !== after.localY ||
                    before.parentId !== after.parentId);
            })) {
            didChange = true;
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
        this.syncSelectionToolbar();
    }
    clearSelectionAndHideProperties() {
        this.clearSelectionState();
        this.controls.hideProperties();
    }
    toggleMultiSelectMode() {
        this.isMultiSelectMode = !this.isMultiSelectMode;
        this.controls.setMultiSelectActive(this.isMultiSelectMode);
    }
    isCommentMode = false;
    _commentLayer = null;
    toggleCommentMode() {
        this.isCommentMode = !this.isCommentMode;
        this.controls.setCommentModeActive(this.isCommentMode);
        this.getCommentLayer().setEnabled(this.isCommentMode);
        this.events.dispatch("comment:modeChange", { enabled: this.isCommentMode });
    }
    /**
     * Get whether comment mode is active.
     */
    getCommentMode() {
        return this.isCommentMode;
    }
    /**
     * Programmatically enable/disable comment mode.
     */
    setCommentMode(enabled) {
        if (this.isCommentMode === enabled)
            return;
        this.toggleCommentMode();
    }
    /**
     * The editor's built-in comment layer, created lazily on first use. It owns
     * no chat state — bubbles spawn from `pane:click` and lifecycle events
     * (`create`/`save`/`cancel`/`delete`/`load`) are emitted for the consumer to
     * persist. The action pane's comment tool toggles it; a consumer can also
     * `load()` bubbles back from their own state or build a custom layer with
     * `attachCommentLayer` instead.
     */
    getCommentLayer() {
        if (!this._commentLayer) {
            this._commentLayer = attachCommentLayer(this, {
                enabled: this.isCommentMode,
                canvas: this.canvas,
            });
        }
        return this._commentLayer;
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
        this.pushCommand(new UpdateLabelCommand({
            nodeId: node.id,
            previousLabel: session.previousLabel,
            nextLabel,
        }));
        this.events.dispatch("node:labelChange", {
            nodeId: node.id,
            nodeType: node.nodeType,
            oldLabel: session.previousLabel,
            newLabel: nextLabel,
        });
    }
    captureNodeSnapshot(node) {
        return captureNodeHistorySnapshot(node);
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
    captureReferencedOriginals(removedIds) {
        const removedIdSet = new Set(removedIds);
        const originalIds = new Set();
        for (const removedId of removedIdSet) {
            const node = this.store.get(removedId);
            if (!node || node.subgraphRefId == null)
                continue;
            if (removedIdSet.has(node.subgraphRefId))
                continue;
            originalIds.add(node.subgraphRefId);
        }
        const snapshots = [];
        for (const originalId of originalIds) {
            const original = this.store.get(originalId);
            if (original)
                snapshots.push(this.captureNodeSnapshot(original));
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
                snapshots.push({ ...edge });
            }
        }
        return snapshots;
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
        node.isCollapsed = snapshot.isCollapsed;
        node.childIds = [...snapshot.childIds];
        node.compositionRefId = snapshot.compositionRefId;
        node.subgraphRefId = snapshot.subgraphRefId;
        if (snapshot.subgraphRefIds) {
            node.subgraphRefIds = [...snapshot.subgraphRefIds];
        }
        node.props = cloneNodeProps(snapshot.props);
        node.handles = node.handles.map((handle) => ({
            ...handle,
            isConnected: snapshot.handleStates.find((entry) => entry.side === handle.side)
                ?.isConnected ?? false,
        }));
        this.store.forceRestoreNodePlacement(snapshot.id, snapshot.localX, snapshot.localY, snapshot.parentId);
        node.width = snapshot.width;
        node.height = snapshot.height;
        this.markMinimapDirty();
    }
    restoreNodeSnapshots(snapshots) {
        for (const snapshot of snapshots) {
            this.applyNodeSnapshot(snapshot);
        }
    }
    restoreEdgeSnapshots(snapshots) {
        for (const snapshot of snapshots) {
            const source = this.store.get(snapshot.sourceNodeId);
            const target = this.store.get(snapshot.targetNodeId);
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
                sourceCanHaveMultipleConnections: source?.nodeType === "hub",
                targetCanHaveMultipleConnections: target?.nodeType === "hub",
            });
            if (edge) {
                this.syncHandleStates(edge.sourceNodeId);
                this.syncHandleStates(edge.targetNodeId);
                this.applyCompositionReferenceForEdge(edge);
            }
        }
        this.markMinimapDirty();
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
    /** Zoom the camera to center a group node in the viewport with padding. */
    spotlightGroup(groupId) {
        const node = this.store.get(groupId);
        if (!node)
            return;
        const world = getWorldPosition(groupId, this.store.allNodesMap);
        const centerX = world.x + node.width / 2;
        const centerY = world.y + node.height / 2;
        const canvas = document.getElementById(this.canvasId);
        const margin = 0.8;
        const targetZoom = Math.min((canvas.width * margin) / node.width, (canvas.height * margin) / node.height, 2.0);
        const targetPanX = canvas.width / 2 - centerX * targetZoom;
        const targetPanY = canvas.height / 2 - centerY * targetZoom;
        this.camera.animateTo(targetPanX, targetPanY, targetZoom);
    }
    /** Check if a node is a locked group or is a descendant of one. */
    isInLockedGroup(nodeId) {
        const node = this.store.get(nodeId);
        if (!node)
            return false;
        // A locked group itself cannot be dragged
        if (node.isLocked && node.nodeType === "group")
            return true;
        // Walk ancestor chain — any locked group ancestor blocks dragging
        let currentId = node.parentId;
        while (currentId !== null) {
            const ancestor = this.store.get(currentId);
            if (!ancestor)
                break;
            if (ancestor.isLocked && ancestor.nodeType === "group")
                return true;
            currentId = ancestor.parentId;
        }
        return false;
    }
    /** Returns the nearest subgraph ancestor that owns this node, if any. */
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
    getOutermostSubgraphId(nodeId) {
        const node = this.store.get(nodeId);
        if (!node)
            return null;
        let currentId = node.parentId;
        let outermostSubgraphId = null;
        while (currentId !== null) {
            const ancestor = this.store.get(currentId);
            if (!ancestor)
                break;
            if (ancestor.nodeType === "subgraph") {
                outermostSubgraphId = ancestor.id;
            }
            currentId = ancestor.parentId;
        }
        return outermostSubgraphId;
    }
    canEnterContainer(sourceOwningSubgraphId, hoveredContainer) {
        if (this.draggingNode?.nodeType === "hub" &&
            hoveredContainer.nodeType === "group") {
            return false;
        }
        // Subgraphs are sealed units: after creation their membership is fixed,
        // so only nodes already owned by the hovered subgraph may "enter" it
        // (an intra-unit no-op). Anything external — including root-level nodes
        // or members of a sibling/nested subgraph — cannot be reparented inside.
        if (hoveredContainer.nodeType === "subgraph") {
            return sourceOwningSubgraphId === hoveredContainer.id;
        }
        return (sourceOwningSubgraphId === this.getOwningSubgraphId(hoveredContainer.id));
    }
    async deleteNodeTreeWithHistory(nodeId) {
        const node = this.store.get(nodeId);
        if (!node)
            return;
        // Notice we do NOT check before:nodeDelete here because deleteCurrentSelectionWithHistory
        // already checked it for the root selection. If this is called from outside, we should check it.
        const allowed = await this.events.dispatchBefore("before:nodeDelete", {
            nodeId: node.id,
            nodeType: node.nodeType,
        });
        if (!allowed)
            return;
        this.activeLabelEdit = null;
        const selectionBefore = this.captureSelectionSnapshot();
        const removedIds = this.store.collectRemovedIdsWithClones([nodeId]);
        const snapshots = this.captureNodeSnapshots(removedIds);
        const edgeSnapshots = this.captureEdgeSnapshotsForSelection(removedIds, []);
        const referencedOriginals = this.captureReferencedOriginals(removedIds);
        const parentId = node.parentId;
        this.removeNodeAndIncidentEdges(nodeId);
        this.clearSelectionAndHideProperties();
        if (parentId !== null) {
            this.refreshContainerChain(parentId);
        }
        this.pushCommand(new DeleteNodeCommand({
            nodeId,
            nodeSnapshots: snapshots,
            edgeSnapshots,
            selectionBefore,
            parentId,
            referencedOriginals,
        }));
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
        this.pushCommand(new DeleteEdgeCommand({
            edgeSnapshot: snapshot,
            selectionBefore,
        }));
    }
    async deleteCurrentSelectionWithHistory() {
        let nodeIds = [...this.selectedNodeIds];
        const edgeIds = [...this.selectedEdgeIds];
        if (nodeIds.length === 0 && edgeIds.length === 0) {
            return;
        }
        const filteredNodeIds = [];
        for (const nodeId of nodeIds) {
            const node = this.store.get(nodeId);
            if (!node)
                continue;
            const allowed = await this.events.dispatchBefore("before:nodeDelete", {
                nodeId: node.id,
                nodeType: node.nodeType,
            });
            if (allowed)
                filteredNodeIds.push(nodeId);
        }
        nodeIds = filteredNodeIds;
        if (nodeIds.length === 0 && edgeIds.length === 0) {
            return;
        }
        if (nodeIds.length === 1 && edgeIds.length === 0) {
            await this.deleteNodeTreeWithHistory(nodeIds[0]);
            return;
        }
        if (nodeIds.length === 0 && edgeIds.length === 1) {
            this.deleteEdgeWithHistory(edgeIds[0]);
            return;
        }
        this.activeLabelEdit = null;
        const selectionBefore = this.captureSelectionSnapshot();
        const removedIds = new Set();
        for (const nodeId of nodeIds) {
            for (const removedId of this.store.collectRemovedIdsWithClones([nodeId])) {
                removedIds.add(removedId);
            }
        }
        const snapshots = this.captureNodeSnapshots(removedIds);
        const edgeSnapshots = this.captureEdgeSnapshotsForSelection(removedIds, edgeIds);
        const referencedOriginals = this.captureReferencedOriginals(removedIds);
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
        this.pushCommand(new DeleteSelectionCommand({
            nodeSnapshots: snapshots,
            edgeSnapshots,
            selectionBefore,
            removedNodeIds: [...removedIds],
            removedEdgeIds: [...edgeIds],
            parentIds: [...parentIds],
            referencedOriginals,
        }));
    }
    async createNodeWithHistory(nodeType, worldX, worldY, parentId = null, label) {
        let parentType = null;
        if (parentId !== null) {
            parentType = this.store.get(parentId)?.nodeType ?? null;
        }
        const allowed = await this.events.dispatchBefore("before:nodeCreate", {
            nodeType,
            localX: worldX,
            localY: worldY,
            parentId,
            parentType,
        });
        if (!allowed)
            return null;
        const selectionBefore = this.captureSelectionSnapshot();
        const resolvedLabel = label ??
            (nodeType === "group"
                ? `Group ${this.store.nextNodeId}`
                : nodeType === "hub"
                    ? `Hub ${this.store.nextNodeId}`
                    : `Node ${this.store.nextNodeId}`);
        const node = this.store.add(worldX, worldY, resolvedLabel, this.theme, nodeType);
        if (parentId !== null && !this.store.setParent(node.id, parentId)) {
            this.store.remove(node.id);
            return null;
        }
        if (parentId !== null) {
            this.refreshContainerChain(parentId);
        }
        const snapshot = this.captureNodeSnapshot(node);
        this.pushCommand(new CreateNodeCommand({
            snapshot,
            parentId,
            selectionBefore,
            selectOnRedo: false,
        }));
        return node;
    }
    async handleAddNode(canvas, nodeType) {
        const screenX = Math.random() * (canvas.width - 200) + 100;
        const screenY = Math.random() * (canvas.height - 200) + 100;
        const { x, y } = this.camera.screenToWorld(screenX, screenY);
        await this.createNodeWithHistory(nodeType, x, y);
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
        this.store.updateContainerBounds(composition.id, this.theme);
        this.refreshContainerChain(targetGroup.id);
        const snapshot = this.captureNodeSnapshot(composition);
        this.clearSelectionState();
        this.setNodeSelected(composition.id, true);
        this.controls.hideProperties();
        this.pushCommand(new CreateNodeCommand({
            snapshot,
            parentId: snapshot.parentId,
            selectionBefore,
            selectOnRedo: true,
        }));
    }
    createSubgraphFromSelection() {
        const roots = this.getSelectionDragRoots();
        if (roots.length === 0)
            return;
        const selectionBefore = this.captureSelectionSnapshot();
        const anchor = roots[0];
        const anchorWorld = getWorldPosition(anchor.id, this.store.allNodesMap);
        const subgraph = this.store.add(anchorWorld.x, anchorWorld.y, `Subgraph ${this.store.nextNodeId}`, this.theme, "subgraph");
        const commonParent = roots.every((root) => root.parentId === roots[0].parentId)
            ? roots[0].parentId
            : null;
        if (commonParent !== null) {
            this.store.setParent(subgraph.id, commonParent);
        }
        const beforeSnapshots = this.captureNodeSnapshots(roots.map((root) => root.id));
        const removedEdgeSnapshots = this.removeBoundaryEdgesForRoots(roots.map((root) => root.id));
        for (const root of roots) {
            if (!this.store.setParent(root.id, subgraph.id))
                continue;
        }
        this.store.syncNodePresentation(subgraph.id);
        this.store.updateContainerBounds(subgraph.id, this.theme);
        this.refreshContainerChain(subgraph.id);
        const afterSnapshots = this.captureNodeSnapshots(roots.map((root) => root.id));
        const subgraphSnapshot = this.captureNodeSnapshot(subgraph);
        this.clearSelectionState();
        this.setNodeSelected(subgraph.id, true);
        this.syncPropertiesPanelForSelection();
        this.pushCommand(new CreateSubgraphCommand({
            subgraphSnapshot,
            childBeforeSnapshots: beforeSnapshots,
            childAfterSnapshots: afterSnapshots,
            removedEdgeSnapshots,
            selectionBefore,
        }));
    }
    toggleSubgraphCollapse(subgraphId) {
        const node = this.store.get(subgraphId);
        if (!node || node.nodeType !== "subgraph")
            return;
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
        this.events.dispatch("subgraph:collapseToggle", {
            subgraphId: node.id,
            isCollapsed: node.isCollapsed,
        });
        this.syncPropertiesPanelForSelection();
    }
    ungraphSubgraphWithHistory(subgraphId) {
        const subgraph = this.store.get(subgraphId);
        if (!subgraph || subgraph.nodeType !== "subgraph")
            return;
        const selectionBefore = this.captureSelectionSnapshot();
        const childIds = [...subgraph.childIds];
        const subgraphSnapshot = this.captureNodeSnapshot(subgraph);
        const childBeforeSnapshots = this.captureNodeSnapshots(childIds);
        const removedEdgeSnapshots = this.captureBoundaryEdgeSnapshots([
            subgraphId,
        ]);
        this.store.removeContainerOnly(subgraphId);
        for (const snapshot of removedEdgeSnapshots) {
            const removed = this.edgeStore.remove(snapshot.id);
            if (removed) {
                this.syncHandleStates(removed.sourceNodeId);
                this.syncHandleStates(removed.targetNodeId);
            }
        }
        const childAfterSnapshots = this.captureNodeSnapshots(childIds);
        this.clearSelectionState();
        this.controls.hideProperties();
        this.refreshContainerChain(subgraph.parentId);
        this.pushCommand(new UngraphCommand({
            subgraphSnapshot,
            childBeforeSnapshots,
            childAfterSnapshots,
            removedEdgeSnapshots,
            selectionBefore,
        }));
    }
    cloneSubgraphWithHistory(subgraphId) {
        const subgraph = this.store.get(subgraphId);
        if (!subgraph || subgraph.nodeType !== "subgraph")
            return;
        const selectionBefore = this.captureSelectionSnapshot();
        const parentId = subgraph.parentId;
        const world = getWorldPosition(subgraph.id, this.store.allNodesMap);
        const originalId = subgraph.subgraphRefId ?? subgraph.id;
        const original = this.store.get(originalId);
        if (!original || original.nodeType !== "subgraph")
            return;
        const clone = this.store.add(world.x + 24, world.y + 24, `${subgraph.text} Copy`, this.theme, "subgraph");
        if (parentId !== null) {
            this.store.setParent(clone.id, parentId);
        }
        clone.isCollapsed = subgraph.isCollapsed;
        clone.subgraphRefId = originalId;
        this.store.updateContainerBounds(clone.id, this.theme);
        const cloneSnapshot = this.captureNodeSnapshot(clone);
        const originalBeforeSnapshot = this.captureNodeSnapshot(original);
        original.subgraphRefIds = [
            ...(original.subgraphRefIds ?? []),
            clone.id,
        ];
        const originalAfterSnapshot = this.captureNodeSnapshot(original);
        this.clearSelectionState();
        this.setNodeSelected(clone.id, true);
        this.syncPropertiesPanelForSelection();
        this.refreshContainerChain(clone.parentId);
        this.pushCommand(new CloneSubgraphCommand({
            cloneSnapshot,
            originalBeforeSnapshot,
            originalAfterSnapshot,
            parentId,
            selectionBefore,
            selectOnRedo: true,
        }));
    }
    async handleDeleteSelected() {
        await this.deleteCurrentSelectionWithHistory();
    }
    pick(screenX, screenY) {
        this.pickFBO.bind();
        this.renderer["gl"].clearColor(1.0, 1.0, 1.0, 1.0);
        this.renderer["gl"].clear(this.renderer["gl"].COLOR_BUFFER_BIT |
            this.renderer["gl"].DEPTH_BUFFER_BIT);
        this.renderer.drawNodes(true);
        const pixelX = Math.round(screenX * this.dpr);
        const pixelY = Math.round(screenY * this.dpr);
        const pixels = this.pickFBO.readPixel(pixelX, pixelY);
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
            if (!isCandidateNodeType(node.nodeType, this.connectionMode, this.typeRegistry))
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
                    return pickedNode.nodeType === "group" ||
                        pickedNode.nodeType === "subgraph"
                        ? pickedNode
                        : null;
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
        this.syncSelectionToolbar();
    }
    getSelectionToolbarButtons(node) {
        // ─── Registry-driven path ───────────────────────────────
        if (this.typeRegistry.has(node.nodeType)) {
            const isCollapsed = Boolean(node.isCollapsed);
            const actions = this.typeRegistry.getToolbarActions(node.nodeType, isCollapsed);
            return actions
                .filter((a) => TOOLBAR_ACTION_MAP[a])
                .map((a) => {
                const [glyph, label] = TOOLBAR_ACTION_MAP[a];
                return { action: a, glyph, label };
            });
        }
        // ─── Fallback: hardcoded dispatch ───────────────────────
        if (node.nodeType === "subgraph") {
            return node.isCollapsed
                ? baseButtons([
                    ["expand", `${EXPAND}`, "Expand"],
                    ["clone", `${CLONE}`, "Clone"],
                    ["edit", `${EDIT}`, "Edit"],
                    ["delete", `${DELETE}`, "Delete"],
                ])
                : baseButtons([
                    ["collapse", `${COLLAPSE}`, "Collapse"],
                    ["ungraph", `${UNGRAPH}`, "Ungraph"],
                    ["clone", `${CLONE}`, "Clone"],
                    ["edit", `${EDIT}`, "Edit"],
                    ["delete", `${DELETE}`, "Delete"],
                ]);
        }
        if (node.nodeType === "node" ||
            node.nodeType === "composition-child" ||
            node.nodeType === "hub") {
            return baseButtons([
                ["edit", `${EDIT}`, "Edit"],
                ["delete", `${DELETE}`, "Delete"],
            ]);
        }
        if (node.nodeType === "group") {
            return baseButtons([
                ["spotlight", `${SPOTLIGHT}`, "Spotlight"],
                ["edit", `${EDIT}`, "Edit"],
                ["delete", `${DELETE}`, "Delete"],
            ]);
        }
        if (node.nodeType === "composition") {
            return baseButtons([["delete", `${DELETE}`, "Delete"]]);
        }
        return [];
    }
    syncSelectionToolbar() {
        if (!this.selectionToolbar)
            return;
        const node = this.getSingleSelectedNode();
        if (!node) {
            this.selectionToolbar.hide();
            this.selectionToolbarNodeId = null;
            this.selectionToolbarActionSignature = "";
            return;
        }
        const actions = this.getSelectionToolbarButtons(node);
        const signature = actions.map((action) => action.action).join("|");
        if (this.selectionToolbarNodeId !== node.id ||
            this.selectionToolbarActionSignature !== signature) {
            this.selectionToolbar.setActions(actions);
            this.selectionToolbarNodeId = node.id;
            this.selectionToolbarActionSignature = signature;
        }
        this.updateSelectionToolbarPosition();
        this.selectionToolbar.show();
    }
    updateSelectionToolbarPosition() {
        if (!this.selectionToolbar)
            return;
        const node = this.getSingleSelectedNode();
        if (!node)
            return;
        const world = getWorldPosition(node.id, this.store.allNodesMap);
        const anchorX = world.x + node.width - 12;
        const anchorY = node.nodeType === "subgraph"
            ? node.isCollapsed
                ? world.y + node.height / 2
                : world.y + 20
            : isContainerNodeType(node.nodeType)
                ? world.y + 20
                : world.y + NODE_LAYOUT.headerHeight / 2;
        const screen = this.camera.worldToScreen(anchorX, anchorY);
        const canvas = document.getElementById(this.canvasId);
        const rect = canvas.getBoundingClientRect();
        this.selectionToolbar.setPosition(screen.x + rect.left, screen.y + rect.top);
    }
    handleSelectionToolbarAction(action) {
        const node = this.getSingleSelectedNode();
        if (!node)
            return;
        switch (action) {
            case "delete":
                this.handleDeleteSelected();
                return;
            case "edit":
                this.beginLabelEdit(node);
                this.controls.showProperties(node);
                return;
            case "collapse":
            case "expand":
                if (node.nodeType === "subgraph") {
                    this.toggleSubgraphCollapse(node.id);
                }
                return;
            case "ungraph":
                if (node.nodeType === "subgraph") {
                    this.ungraphSubgraphWithHistory(node.id);
                }
                return;
            case "spotlight":
                if (node.nodeType !== "group")
                    return;
                this.spotlightGroup(node.id);
                return;
            case "clone":
                if (node.nodeType === "subgraph") {
                    this.cloneSubgraphWithHistory(node.id);
                }
                return;
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
        this.markMinimapDirty();
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
        this.markMinimapDirty();
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
                this.events.dispatch("edge:click", {
                    edgeId: edgeHit.id,
                    event: e,
                });
                this.hoveredHandle = null;
                this.draggingNode = null;
                this.dragSnapshot = null;
                this.syncToolbarState();
                return;
            }
            this.clearSelectionAndHideProperties();
            this.draggingNode = null;
            this.dragSnapshot = null;
            this.events.dispatch("pane:click", { event: e });
            this.hoveredHandle = null;
            this.syncToolbarState();
            this.startPan(e.clientX, e.clientY);
            return;
        }
        const { x: worldX, y: worldY } = this.camera.screenToWorld(screenX, screenY);
        const nodeWorld = getWorldPosition(node.id, this.store.allNodesMap);
        const localClickX = worldX - nodeWorld.x;
        const localClickY = worldY - nodeWorld.y;
        if (node.nodeType === "subgraph") {
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
        }
        // Subgraph clone link: clicking the link glyph navigates to the original.
        if (node.nodeType === "subgraph" && node.subgraphRefId != null && !node.isCollapsed) {
            const link = getSubgraphLinkLocal(node);
            const linkDx = localClickX - link.x;
            const linkDy = localClickY - link.y;
            if (linkDx * linkDx + linkDy * linkDy <=
                NODE_LAYOUT.subgraphLinkClickRadius * NODE_LAYOUT.subgraphLinkClickRadius) {
                this.spotlightGroup(node.subgraphRefId);
                this.hoveredHandle = null;
                this.syncToolbarState();
                return;
            }
        }
        // Group Lock toggle
        if (node.nodeType === "group") {
            const lockX = node.width / 2;
            const lockY = NODE_LAYOUT.lockBtnTopY;
            const lockDx = localClickX - lockX;
            const lockDy = localClickY - lockY;
            if (lockDx * lockDx + lockDy * lockDy <=
                NODE_LAYOUT.lockBtnClickRadius * NODE_LAYOUT.lockBtnClickRadius) {
                const beforeSnapshot = this.captureNodeSnapshot(node);
                node.isLocked = !node.isLocked;
                const afterSnapshot = this.captureNodeSnapshot(node);
                this.pushCommand(new ToggleLockCommand({
                    beforeSnapshot,
                    afterSnapshot,
                }));
                this.hoveredHandle = null;
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
                this.createNodeWithHistory("node", 0, 0, node.id).catch(console.error);
                this.hoveredHandle = null;
                this.syncToolbarState();
                return;
            }
        }
        const canDragSelection = this.isMultiSelectMode &&
            this.selectionKind === "node" &&
            this.selectedNodeIds.size > 1 &&
            this.selectedNodeIds.has(node.id) &&
            !this.isInLockedGroup(node.id) &&
            !(node.nodeType === "subgraph" && !node.isCollapsed);
        if (canDragSelection) {
            this.controls.hideProperties();
            this.draggingNode = null;
            this.dragSnapshot = null;
            this.startSelectionDrag(worldX, worldY, node);
            if (this.draggingSelection) {
                this.events.dispatch("node:dragStart", {
                    nodeIds: this.draggingSelection.entries.map((en) => en.nodeId),
                    event: e,
                });
            }
            this.hoveredHandle = null;
            this.syncToolbarState();
            return;
        }
        this.controls.hideProperties();
        this.selectNodeByClick(node.id);
        this.events.dispatch("node:click", {
            nodeId: node.id,
            nodeType: node.nodeType,
            event: e,
        });
        this.hoveredHandle = null;
        if (this.isInLockedGroup(node.id)) {
            this.draggingNode = null;
            this.dragSnapshot = null;
            this.syncToolbarState();
            return;
        }
        if (node.nodeType === "subgraph" && !node.isCollapsed) {
            this.draggingNode = null;
            this.dragSnapshot = null;
            this.syncToolbarState();
            return;
        }
        this.draggingNode = node;
        this.dragSnapshot = {
            localX: node.localX,
            localY: node.localY,
            parentId: node.parentId,
            subtreeSnapshots: node.nodeType === "subgraph" && node.isCollapsed
                ? this.captureSubtreeSnapshots(node.id)
                : undefined,
        };
        this.dragOffsetX = worldX - nodeWorld.x;
        this.dragOffsetY = worldY - nodeWorld.y;
        this.events.dispatch("node:dragStart", {
            nodeIds: [node.id],
            event: e,
        });
        this.syncToolbarState();
    }
    startPan(clientX, clientY) {
        this.isPanning = true;
        this.lastMouseX = clientX;
        this.lastMouseY = clientY;
        this.cameraDirty = true;
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
                    this.triggerZoomThrottle();
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
            this.moveSelectionDrag(worldX, worldY, screenX, screenY);
            this.events.dispatch("node:drag", {
                nodeIds: this.draggingSelection.entries.map((e) => e.nodeId),
                event: e,
            });
            return;
        }
        if (!this.draggingNode)
            return;
        const targetX = worldX - this.dragOffsetX;
        const targetY = worldY - this.dragOffsetY;
        const previousLocalX = this.draggingNode.localX;
        const previousLocalY = this.draggingNode.localY;
        if (this.draggingNode.parentId === null) {
            this.draggingNode.localX = targetX;
            this.draggingNode.localY = targetY;
        }
        else {
            const parentWorld = getParentFrameWorldPosition(this.draggingNode.parentId, this.store.allNodesMap);
            this.draggingNode.localX = targetX - parentWorld.x;
            this.draggingNode.localY = targetY - parentWorld.y;
        }
        if (this.draggingNode.nodeType === "subgraph" &&
            this.draggingNode.isCollapsed) {
            const deltaX = this.draggingNode.localX - previousLocalX;
            const deltaY = this.draggingNode.localY - previousLocalY;
            this.store.translateDescendants(this.draggingNode.id, deltaX, deltaY);
        }
        const refreshContainerId = this.draggingNode.nodeType === "subgraph"
            ? this.draggingNode.id
            : this.getOwningSubgraphId(this.draggingNode.id);
        if (refreshContainerId !== null) {
            this.refreshContainerChain(refreshContainerId);
        }
        this.store.clearDropTargets();
        if (isNodePrimitiveType(this.draggingNode.nodeType) ||
            this.draggingNode.nodeType === "composition") {
            const hoveredContainer = this.getHoveredContainer(screenX, screenY, this.draggingNode);
            if (hoveredContainer) {
                hoveredContainer.isDropTarget = true;
            }
        }
        this.markMinimapDirty();
        this.events.dispatch("node:drag", {
            nodeIds: [this.draggingNode.id],
            event: e,
        });
    }
    async handlePointerUp(e, canvas) {
        if (e.pointerType === "mouse") {
            await this.handleMouseUp(e, canvas);
            this.releasePointer(canvas, e);
            return;
        }
        this.activeTouches.delete(e.pointerId);
        if (this.gestureMode && this.activeTouches.size < 2) {
            this.gestureMode = false;
            this.pinchDistance = null;
            this.isPanning = false;
            this.cameraDirty = false;
        }
        if (this.activeTouches.size === 0) {
            await this.handleMouseUp(e, canvas);
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
    async handleMouseUp(e, canvas) {
        this.isPanning = false;
        this.cameraDirty = false;
        if (this.activeConnectionDrag) {
            const source = this.activeConnectionDrag;
            const target = this.hoveredHandle;
            if (target) {
                if (this.isValidConnection(source.sourceNodeId, source.sourceHandleSide, target.nodeId, target.handle.side)) {
                    const sourceNode = this.store.get(source.sourceNodeId);
                    const targetNode = this.store.get(target.nodeId);
                    if (!sourceNode || !targetNode)
                        return;
                    const allowed = await this.events.dispatchBefore("before:connect", {
                        sourceId: source.sourceNodeId,
                        sourceType: sourceNode.nodeType,
                        targetId: target.nodeId,
                        targetType: targetNode.nodeType,
                    });
                    if (!allowed) {
                        this.activeConnectionDrag = null;
                        this.hoveredHandle = null;
                        this.syncToolbarState();
                        return;
                    }
                    const edge = this.edgeStore.add({
                        sourceNodeId: source.sourceNodeId,
                        sourceHandleSide: source.sourceHandleSide,
                        targetNodeId: target.nodeId,
                        targetHandleSide: target.handle.side,
                        sourceCanHaveMultipleConnections: sourceNode.nodeType === "hub",
                        targetCanHaveMultipleConnections: targetNode.nodeType === "hub",
                    });
                    if (edge) {
                        this.syncHandleStates(edge.sourceNodeId);
                        this.syncHandleStates(edge.targetNodeId);
                        this.applyCompositionReferenceForEdge(edge);
                        const snapshot = { ...edge };
                        this.pushCommand(new ConnectCommand({
                            edgeSnapshot: snapshot,
                        }));
                        this.events.dispatch("connect", {
                            sourceId: source.sourceNodeId,
                            sourceType: sourceNode.nodeType,
                            targetId: target.nodeId,
                            targetType: targetNode.nodeType,
                            edgeId: edge.id,
                        });
                    }
                }
            }
            else {
                this.createHubFromConnectionDrop(source, canvas, e.clientX, e.clientY);
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
            const dropResult = await this.applySelectionDrop(selectionDrag, hoveredContainer);
            const draggedNodeIds = [];
            if (this.draggingSelection) {
                draggedNodeIds.push(...this.draggingSelection.entries.map((e) => e.nodeId));
            }
            else if (this.draggingNode) {
                draggedNodeIds.push(this.draggingNode.id);
            }
            if (draggedNodeIds.length > 0) {
                this.events.dispatch("node:dragStop", {
                    nodeIds: draggedNodeIds,
                    event: e,
                });
            }
            this.draggingSelection = null;
            this.draggingNode = null;
            this.dragSnapshot = null;
            this.selectionRep = null;
            this.store.clearDropTargets();
            if (dropResult.didChange) {
                this.pushCommand(new MoveSelectionCommand({
                    beforeSnapshots: dropResult.beforeSnapshots,
                    afterSnapshots: dropResult.afterSnapshots,
                    cloneSnapshots: dropResult.cloneSnapshots,
                    removedReferenceEdgeSnapshots: dropResult.removedReferenceEdgeSnapshots,
                    selectionBefore,
                    affectedParentIds: dropResult.affectedParentIds,
                }));
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
            const sourceId = source.id; // capture as primitive, not mutable ref
            let command = null;
            const sourceOwningSubgraphId = this.getOwningSubgraphId(source.id);
            if (isNodePrimitiveType(source.nodeType)) {
                const hoveredContainer = this.getHoveredContainer(screenX, screenY, source);
                const beforePlacement = {
                    localX: snapshot.localX,
                    localY: snapshot.localY,
                    parentId: snapshot.parentId,
                };
                let removedReferenceEdgeSnapshots = [];
                const canEnterHoveredContainer = hoveredContainer !== null &&
                    this.canEnterContainer(sourceOwningSubgraphId, hoveredContainer);
                if (hoveredContainer?.nodeType === "composition" &&
                    canEnterHoveredContainer) {
                    const clone = this.store.duplicateIntoComposition(source.id, hoveredContainer.id, this.theme);
                    this.store.restoreNodePlacement(source.id, snapshot.localX, snapshot.localY, snapshot.parentId);
                    if (clone) {
                        const cloneSnapshot = this.captureNodeSnapshot(clone);
                        this.clearSelectionState();
                        this.setNodeSelected(clone.id, true);
                        this.refreshContainerChain(hoveredContainer.id);
                        command = new DuplicateIntoCompositionCommand({
                            sourceId,
                            sourcePlacement: {
                                localX: snapshot.localX,
                                localY: snapshot.localY,
                                parentId: snapshot.parentId,
                            },
                            cloneSnapshot,
                            compositionId: hoveredContainer.id,
                            selectionBefore,
                        });
                    }
                }
                else if (hoveredContainer?.nodeType === "group" &&
                    canEnterHoveredContainer) {
                    const parentChanged = source.parentId !== hoveredContainer.id;
                    if (!parentChanged ||
                        this.store.setParent(source.id, hoveredContainer.id)) {
                        const afterPlacement = {
                            localX: source.localX,
                            localY: source.localY,
                            parentId: source.parentId,
                        };
                        this.refreshContainerChain(hoveredContainer.id);
                        const oldParentId = beforePlacement.parentId;
                        if (oldParentId !== null && oldParentId !== hoveredContainer.id) {
                            this.refreshContainerChain(oldParentId);
                        }
                        if (beforePlacement.localX !== afterPlacement.localX ||
                            beforePlacement.localY !== afterPlacement.localY ||
                            beforePlacement.parentId !== afterPlacement.parentId) {
                            command = new ReparentCommand({
                                nodeId: sourceId,
                                beforePlacement,
                                afterPlacement,
                                selectionBefore,
                                removedReferenceEdgeSnapshots,
                                extraRefreshIds: [],
                            });
                        }
                    }
                }
                else {
                    if (sourceOwningSubgraphId === null) {
                        if (this.store.setParent(source.id, null)) {
                            removedReferenceEdgeSnapshots =
                                this.removeCompositionReferenceEdgesForNode(source.id);
                            const afterPlacement = {
                                localX: source.localX,
                                localY: source.localY,
                                parentId: source.parentId,
                            };
                            const oldParentId = beforePlacement.parentId;
                            if (oldParentId !== null) {
                                this.refreshContainerChain(oldParentId);
                            }
                            if (beforePlacement.localX !== afterPlacement.localX ||
                                beforePlacement.localY !== afterPlacement.localY ||
                                beforePlacement.parentId !== afterPlacement.parentId) {
                                command = new ReparentCommand({
                                    nodeId: sourceId,
                                    beforePlacement,
                                    afterPlacement,
                                    selectionBefore,
                                    removedReferenceEdgeSnapshots,
                                    extraRefreshIds: [],
                                });
                            }
                        }
                        else {
                            this.store.restoreNodePlacement(source.id, snapshot.localX, snapshot.localY, snapshot.parentId);
                        }
                    }
                }
                if (command === null &&
                    (beforePlacement.localX !== source.localX ||
                        beforePlacement.localY !== source.localY ||
                        beforePlacement.parentId !== source.parentId)) {
                    command = new ReparentCommand({
                        nodeId: sourceId,
                        beforePlacement,
                        afterPlacement: {
                            localX: source.localX,
                            localY: source.localY,
                            parentId: source.parentId,
                        },
                        selectionBefore,
                        removedReferenceEdgeSnapshots: [],
                        extraRefreshIds: [],
                    });
                }
            }
            else if (source.nodeType === "subgraph" && source.isCollapsed) {
                const beforePlacement = {
                    localX: snapshot.localX,
                    localY: snapshot.localY,
                    parentId: snapshot.parentId,
                };
                const afterPlacement = {
                    localX: source.localX,
                    localY: source.localY,
                    parentId: source.parentId,
                };
                if (beforePlacement.localX !== afterPlacement.localX ||
                    beforePlacement.localY !== afterPlacement.localY) {
                    command = new MoveSelectionCommand({
                        beforeSnapshots: snapshot.subtreeSnapshots ??
                            this.captureSubtreeSnapshots(source.id),
                        afterSnapshots: this.captureSubtreeSnapshots(source.id),
                        cloneSnapshots: [],
                        removedReferenceEdgeSnapshots: [],
                        selectionBefore,
                        affectedParentIds: [source.id, source.parentId],
                    });
                }
            }
            else if (source.nodeType === "composition") {
                const hoveredContainer = this.getHoveredContainer(screenX, screenY, source);
                const canEnterHoveredContainer = hoveredContainer !== null &&
                    this.canEnterContainer(sourceOwningSubgraphId, hoveredContainer);
                if ((hoveredContainer?.nodeType === "group" ||
                    hoveredContainer?.nodeType === "subgraph") &&
                    canEnterHoveredContainer) {
                    const beforePlacement = {
                        localX: snapshot.localX,
                        localY: snapshot.localY,
                        parentId: snapshot.parentId,
                    };
                    if (this.store.setParent(source.id, hoveredContainer.id)) {
                        const removedReferenceEdgeSnapshots = hoveredContainer.nodeType === "subgraph"
                            ? this.removeBoundaryEdgesForRoots([source.id])
                            : [];
                        const afterPlacement = {
                            localX: source.localX,
                            localY: source.localY,
                            parentId: source.parentId,
                        };
                        this.refreshContainerChain(source.id);
                        const oldParentId = beforePlacement.parentId;
                        if (oldParentId !== null && oldParentId !== hoveredContainer.id) {
                            this.refreshContainerChain(oldParentId);
                        }
                        if (beforePlacement.localX !== afterPlacement.localX ||
                            beforePlacement.localY !== afterPlacement.localY ||
                            beforePlacement.parentId !== afterPlacement.parentId) {
                            command = new ReparentCommand({
                                nodeId: sourceId,
                                beforePlacement,
                                afterPlacement,
                                selectionBefore,
                                removedReferenceEdgeSnapshots,
                                extraRefreshIds: [sourceId],
                            });
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
            else if (source.nodeType === "group") {
                const beforePlacement = {
                    localX: snapshot.localX,
                    localY: snapshot.localY,
                    parentId: snapshot.parentId,
                };
                const hoveredContainer = this.getHoveredContainer(screenX, screenY, source);
                const canEnterHoveredContainer = hoveredContainer !== null &&
                    this.canEnterContainer(sourceOwningSubgraphId, hoveredContainer);
                if (hoveredContainer?.nodeType === "subgraph") {
                    if (canEnterHoveredContainer) {
                        if (this.store.setParent(source.id, hoveredContainer.id)) {
                            const afterPlacement = {
                                localX: source.localX,
                                localY: source.localY,
                                parentId: source.parentId,
                            };
                            this.refreshContainerChain(hoveredContainer.id);
                            const oldParentId = beforePlacement.parentId;
                            if (oldParentId !== null && oldParentId !== hoveredContainer.id) {
                                this.refreshContainerChain(oldParentId);
                            }
                            if (beforePlacement.localX !== afterPlacement.localX ||
                                beforePlacement.localY !== afterPlacement.localY ||
                                beforePlacement.parentId !== afterPlacement.parentId) {
                                command = new ReparentCommand({
                                    nodeId: sourceId,
                                    beforePlacement,
                                    afterPlacement,
                                    selectionBefore,
                                    removedReferenceEdgeSnapshots: [],
                                    extraRefreshIds: [],
                                });
                            }
                        }
                        else {
                            this.store.restoreNodePlacement(source.id, snapshot.localX, snapshot.localY, snapshot.parentId);
                        }
                    }
                }
                else {
                    const afterPlacement = {
                        localX: source.localX,
                        localY: source.localY,
                        parentId: source.parentId,
                    };
                    if (beforePlacement.localX !== afterPlacement.localX ||
                        beforePlacement.localY !== afterPlacement.localY) {
                        command = new MoveNodeCommand({
                            nodeId: sourceId,
                            beforePlacement,
                            afterPlacement,
                            selectionBefore,
                        });
                    }
                }
            }
            if (command) {
                this.pushCommand(command);
            }
        }
        if (this.draggingNode) {
            this.events.dispatch("node:dragStop", {
                nodeIds: [this.draggingNode.id],
                event: e,
            });
        }
        this.store.clearDropTargets();
        this.draggingNode = null;
        this.dragSnapshot = null;
        this.syncToolbarState();
    }
    createHubFromConnectionDrop(source, canvas, clientX, clientY) {
        const sourceNode = this.store.get(source.sourceNodeId);
        if (sourceNode?.nodeType === "composition" || sourceNode?.nodeType === "branch") {
            return false;
        }
        const { left, top } = canvas.getBoundingClientRect();
        const screenX = clientX - left;
        const screenY = clientY - top;
        const pickedId = this.pick(screenX, screenY);
        const dropTarget = pickedId === 0 ? null : this.store.get(pickedId);
        // Subgraphs are sealed units — dropping a connection on one must not
        // spawn a hub inside it (that would add a new member after creation).
        if (dropTarget) {
            return false;
        }
        const { x: worldX, y: worldY } = this.camera.screenToWorld(screenX, screenY);
        const selectionBefore = this.captureSelectionSnapshot();
        const parentId = null;
        const hub = this.store.add(worldX, worldY, `Hub ${this.store.nextNodeId}`, this.theme, "hub");
        if (parentId !== null && !this.store.setParent(hub.id, parentId)) {
            this.store.remove(hub.id);
            return false;
        }
        const edgeParams = source.sourceHandleSide === "right"
            ? {
                sourceNodeId: source.sourceNodeId,
                sourceHandleSide: source.sourceHandleSide,
                targetNodeId: hub.id,
                targetHandleSide: "left",
                sourceCanHaveMultipleConnections: sourceNode?.nodeType === "hub",
                targetCanHaveMultipleConnections: true,
            }
            : {
                sourceNodeId: hub.id,
                sourceHandleSide: "right",
                targetNodeId: source.sourceNodeId,
                targetHandleSide: source.sourceHandleSide,
                sourceCanHaveMultipleConnections: true,
                targetCanHaveMultipleConnections: sourceNode?.nodeType === "hub",
            };
        if (!this.isValidConnection(edgeParams.sourceNodeId, edgeParams.sourceHandleSide, edgeParams.targetNodeId, edgeParams.targetHandleSide)) {
            this.store.remove(hub.id);
            return false;
        }
        const edge = this.edgeStore.add(edgeParams);
        if (!edge) {
            this.store.remove(hub.id);
            return false;
        }
        this.syncHandleStates(edge.sourceNodeId);
        this.syncHandleStates(edge.targetNodeId);
        this.applyCompositionReferenceForEdge(edge);
        const hubSnapshot = this.captureNodeSnapshot(hub);
        const edgeSnapshot = { ...edge };
        this.clearSelectionState();
        this.setNodeSelected(hub.id, true);
        this.refreshContainerChain(parentId);
        this.pushCommand(new CreateHubFromConnectionDropCommand({
            hubSnapshot,
            edgeSnapshot,
            selectionBefore,
            parentId,
        }));
        this.events.dispatch("hub:created", {
            hubId: hub.id,
        });
        return true;
    }
    isValidConnection(sourceNodeId, sourceHandleSide, targetNodeId, targetHandleSide) {
        if (sourceNodeId === targetNodeId)
            return false;
        const sourceNode = this.store.get(sourceNodeId);
        const targetNode = this.store.get(targetNodeId);
        if (!sourceNode || !targetNode)
            return false;
        // ─── Registry-driven direction + multi-connect checks ───
        if (this.typeRegistry.has(sourceNode.nodeType) && this.typeRegistry.has(targetNode.nodeType)) {
            if (!this.typeRegistry.isValidConnectionSide(sourceNode.nodeType, sourceHandleSide, "source")) {
                return false;
            }
            if (!this.typeRegistry.isValidConnectionSide(targetNode.nodeType, targetHandleSide, "target")) {
                return false;
            }
            const sourceOwningSubgraphId = this.getOutermostSubgraphId(sourceNodeId);
            const targetOwningSubgraphId = this.getOutermostSubgraphId(targetNodeId);
            if (sourceOwningSubgraphId !== targetOwningSubgraphId) {
                return false;
            }
            // Composition-reference special case (business logic, not type metadata)
            if (sourceNode.nodeType === "node" &&
                targetNode.nodeType === "composition" &&
                !this.canCreateCompositionReference(sourceNodeId, targetNodeId)) {
                return false;
            }
            if (!this.typeRegistry.allowsMultiConnect(sourceNode.nodeType) &&
                this.edgeStore.hasConnection(sourceNodeId, sourceHandleSide))
                return false;
            if (!this.typeRegistry.allowsMultiConnect(targetNode.nodeType) &&
                this.edgeStore.hasConnection(targetNodeId, targetHandleSide))
                return false;
            return true;
        }
        // ─── Fallback: hardcoded checks ─────────────────────────
        if (sourceNode.nodeType === "subgraph" && sourceHandleSide !== "right") {
            return false;
        }
        if (targetNode.nodeType === "subgraph" && targetHandleSide !== "left") {
            return false;
        }
        if (sourceNode.nodeType === "hub" && sourceHandleSide !== "right") {
            return false;
        }
        if (targetNode.nodeType === "hub" && targetHandleSide !== "left") {
            return false;
        }
        const sourceOwningSubgraphId = this.getOutermostSubgraphId(sourceNodeId);
        const targetOwningSubgraphId = this.getOutermostSubgraphId(targetNodeId);
        if (sourceOwningSubgraphId !== targetOwningSubgraphId) {
            return false;
        }
        if (sourceNode.nodeType === "node" &&
            targetNode.nodeType === "composition" &&
            !this.canCreateCompositionReference(sourceNodeId, targetNodeId)) {
            return false;
        }
        if (sourceNode.nodeType !== "hub" &&
            this.edgeStore.hasConnection(sourceNodeId, sourceHandleSide))
            return false;
        if (targetNode.nodeType !== "hub" &&
            this.edgeStore.hasConnection(targetNodeId, targetHandleSide))
            return false;
        return true;
    }
    hitTestEdge(screenX, screenY) {
        const edges = this.edgeStore.allEdges().filter((edge) => edge.visible);
        for (let i = edges.length - 1; i >= 0; i--) {
            const geometry = buildEdgeRouteGeometry(edges[i], this.store, this.camera);
            if (!geometry)
                continue;
            const sourceNode = this.store.get(edges[i].sourceNodeId);
            const targetNode = this.store.get(edges[i].targetNodeId);
            if (!sourceNode ||
                !targetNode ||
                !this.store.isEffectivelyVisible(sourceNode.id) ||
                !this.store.isEffectivelyVisible(targetNode.id)) {
                continue;
            }
            if (hitTestEdgePolyline(screenX, screenY, geometry.screenPoints)) {
                return { id: edges[i].id };
            }
        }
        return null;
    }
    removeNodesAndEdges(nodeIds, edgeIds) {
        const removedNodeIds = new Set();
        for (const nodeId of nodeIds) {
            for (const removedId of this.store.collectRemovedIdsWithClones([nodeId])) {
                removedNodeIds.add(removedId);
            }
        }
        // Prune deleted clones from their surviving originals' reference tables.
        for (const removedId of removedNodeIds) {
            const node = this.store.get(removedId);
            if (!node || node.subgraphRefId == null)
                continue;
            const original = this.store.get(node.subgraphRefId);
            if (!original || removedNodeIds.has(original.id))
                continue;
            original.subgraphRefIds = (original.subgraphRefIds ?? []).filter((id) => id !== removedId);
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
        this.markMinimapDirty();
    }
    removeContainerOnly(nodeId) {
        this.store.removeContainerOnly(nodeId);
        this.markMinimapDirty();
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
    zoomThrottleTimer = null;
    ZOOM_THROTTLE_MS = 180;
    triggerZoomThrottle() {
        this.renderer.isZooming = true;
        this.cameraDirty = true;
        if (this.zoomThrottleTimer) {
            clearTimeout(this.zoomThrottleTimer);
        }
        this.zoomThrottleTimer = setTimeout(() => {
            this.cameraDirty = false;
            this.renderer.isZooming = false;
            this.zoomThrottleTimer = null;
        }, this.ZOOM_THROTTLE_MS);
    }
    handleWheel(e, canvas) {
        e.preventDefault();
        const { left, top } = canvas.getBoundingClientRect();
        this.camera.zoomAt(e.clientX - left, e.clientY - top, e.deltaY);
        this.triggerZoomThrottle();
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
            return;
        }
    }
    handleSubgraphCreation() {
        if (this.selectedNodeIds.size > 0 && this.selectedEdgeIds.size === 0) {
            this.createSubgraphFromSelection();
        }
    }
}
//# sourceMappingURL=node-editor.js.map