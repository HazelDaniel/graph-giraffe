import { type CreateEdgeParams } from "./edge-store.js";
import { GraphEventEmitter } from "./events.js";
import { ConnectionMode, EdgeData, NodeEditorConfig, NodeData, AddUploadedTextureParams, CustomOverlay, ControlledNode, ControlledEdge, CoordinateTransform, GraphProjection, SceneQuery } from "./types.js";
import { NodeTypeRegistry } from "./node-type-registry.js";
import { type CommentLayerController } from "./overlay-primitives.js";
import type { GraphSnapshot } from "./graph-serialization.js";
/**
 * NodeEditor is the single public class exposed to the entry point.
 * It owns every internal module and wires them together via callbacks.
 * No internal type leaks out of this file's public API.
 */
export declare class NodeEditor implements SceneQuery, CoordinateTransform {
    private canvasId;
    private backgroundCanvasId;
    private vsSource;
    private fsSource;
    private bgVsSource;
    private bgFsSource;
    private msdfVsSource;
    private msdfFsSource;
    private IconBGVsSource;
    private IconBGFsSource;
    private nodeTextureUploadList;
    readonly events: GraphEventEmitter;
    readonly typeRegistry: NodeTypeRegistry;
    cameraDirty: boolean;
    get debug(): boolean | null;
    set debug(value: boolean | null);
    private camera;
    private store;
    private edgeStore;
    private pickFBO;
    private renderer;
    private controls;
    private history;
    private bgColor;
    private fontColor;
    private theme;
    private draggingNode;
    private dragSnapshot;
    private dragOffsetX;
    private dragOffsetY;
    private isPanning;
    private lastMouseX;
    private lastMouseY;
    private connectionMode;
    /**
     * The editor-wide rendering pipeline. `"webgl"` (default) draws every
     * primitive on the GPU; `"dom"` renders every node as a DOM view and is set
     * via `NodeEditorConfig.renderMode`. The two pipelines are mutually
     * exclusive — the DOM layer only exists in dom mode and the renderer skips
     * WebGL node bodies in dom mode.
     */
    readonly renderMode: "webgl" | "dom";
    private activeConnectionDrag;
    private hoveredHandle;
    private assetsPath;
    private selectedNodeIds;
    private selectedEdgeIds;
    private selectionKind;
    private isMultiSelectMode;
    private activeLabelEdit;
    private selectionRep;
    private draggingSelection;
    private selectionToolbar;
    private selectionToolbarNodeId;
    private selectionToolbarActionSignature;
    private overlays;
    private scalingOverlayContainer;
    private fixedOverlayContainer;
    private domNodeLayer;
    private primitiveGeometry;
    private primitiveMeasurements;
    private primitiveRenderReady;
    private resizeObserver;
    private activeTouches;
    private gestureMode;
    private pinchDistance;
    private minimap;
    private minimapEnabled;
    private minimapRevision;
    private canvas;
    private backgroundCanvas;
    private static _instance;
    private disposed;
    static create(canvasId: string, backgroundCanvasId: string, vsSource: string, fsSource: string, bgVsSource: string, bgFsSource: string, msdfVsSource: string, msdfFsSource: string, IconBGVsSource: string, IconBGFsSource: string, options?: NodeEditorConfig, nodeTextureUploadList?: AddUploadedTextureParams[]): Promise<NodeEditor>;
    /**
     * Release the singleton slot for legacy adapter integrations. New callers
     * should dispose the editor instance; instance disposal is owner-aware and
     * releases only its own singleton slot.
     */
    static release(owner?: NodeEditor): void;
    /**
     * Release renderer-owned resources and the singleton slot. This operation is
     * idempotent so framework adapters can safely call it from async cancellation
     * and unmount cleanup paths.
     */
    dispose(): void;
    private msdfAtlas;
    private iconAtlas;
    private constructor();
    private init;
    private syncPrimitiveMeasurements;
    private handlePrimitiveMeasurementChange;
    private getPrimitiveFrame;
    private setupPropGroupListener;
    private syncPropertiesPanelForSelection;
    private updatePropValue;
    private resolveProps;
    private dispatchPropValidation;
    private applyPropEdit;
    private validateConfig;
    private distance;
    private midpoint;
    private uploadTextureSources;
    render(): void;
    /**
     * Draw a single frame on demand instead of starting the continuous 60fps
     * loop. Coalesce calls on the caller's side (e.g. subscribe to
     * `history:command`, `camera:change`, `selection:change`, `node:drag`, and
     * interaction events, then render once per frame). An editor rendered this
     * way costs ~0% CPU while idle. Does not affect editors that use the
     * default continuous `render()` loop.
     */
    requestRender(): void;
    setConnectionMode(connectionMode: ConnectionMode): void;
    /** Configure the runtime zoom range used by wheel, pinch, restore, and animation. */
    setZoomRange(minZoom: number, maxZoom: number): void;
    getZoomRange(): {
        minZoom: number;
        maxZoom: number;
    };
    /** Return a detached copy of the current graph projection. */
    getNodes(): NodeData[];
    /** Return a detached copy of the current edge projection. */
    getEdges(): EdgeData[];
    /** Return one detached node projection without cloning the complete graph. */
    getNode(id: number): NodeData | undefined;
    /** Return one detached edge projection without cloning the complete graph. */
    getEdge(id: number): EdgeData | undefined;
    getNodeCount(): number;
    getEdgeCount(): number;
    /** Return one detached, renderer-neutral view of the complete graph. */
    getGraph(): GraphProjection;
    /**
     * Apply a host-owned graph projection without creating history entries.
     * Adapters use this to implement controlled React/Vue/Svelte integrations.
     */
    applyControlledGraph(nodes: ControlledNode[], edges: ControlledEdge[]): void;
    /** Apply a compatible controlled projection without replacing the graph. */
    private applyControlledGraphIncrementally;
    /**
     * Serialize the full graph state into a portable JSON-compatible snapshot.
     *
     * Only persistent fields are captured — transient rendering state is omitted.
     * The returned object can be passed to `JSON.stringify()` for persistence.
     */
    exportGraph(): GraphSnapshot;
    /**
     * Restore the editor to a previously exported graph snapshot.
     *
     * This clears all existing state (nodes, edges, history) and rebuilds
     * from the snapshot. The operation is **not undoable** — it replaces the
     * entire editor state as a fresh baseline.
     */
    importGraph(snapshot: GraphSnapshot): void;
    /**
     * Add a custom DOM overlay component to the canvas.
     */
    addOverlay(overlay: CustomOverlay): void;
    /**
     * Remove a custom DOM overlay component by ID.
     */
    removeOverlay(id: string): void;
    /**
     * Retrieve a custom DOM overlay component by ID.
     */
    getOverlay(id: string): CustomOverlay | undefined;
    /**
     * Update the world position of an existing overlay component.
     */
    updateOverlayPosition(id: string, worldX: number, worldY: number): void;
    /**
     * Convert a world-space coordinate to screen-space pixel coordinates.
     */
    worldToScreen(worldX: number, worldY: number): {
        x: number;
        y: number;
    };
    /**
     * Convert a screen-space pixel coordinate to world-space coordinates.
     */
    screenToWorld(screenX: number, screenY: number): {
        x: number;
        y: number;
    };
    /**
     * Get the current camera viewport state (panX, panY, zoom).
     */
    getCameraState(): {
        panX: number;
        panY: number;
        zoom: number;
    };
    /** Set the viewport immediately, respecting the configured zoom range. */
    setViewport(panX: number, panY: number, zoom: number): void;
    /** Resolve a node's world-space position through the scene graph. */
    getNodeWorldPosition(id: number): {
        x: number;
        y: number;
    } | undefined;
    /**
     * Imperatively animate (lerp) the camera so the given world coordinate lands
     * at a screen position — by default the center of the canvas. Optionally
     * targets a new zoom too. User pan/zoom input cancels the animation, and any
     * in-flight animation is superseded by this call.
     *
     * Resolves once the camera reaches its destination.
     */
    panTo(worldX: number, worldY: number, options?: {
        zoom?: number;
        screenX?: number;
        screenY?: number;
    }): Promise<void>;
    /**
     * Create a node of any registered type (built-in or custom) at a world
     * coordinate. Routes through the command/history system, so the action is
     * undoable and emits `history:command` (and any `before:nodeCreate` hooks
     * can block it). Returns the created node, or `null` if blocked.
     */
    addNode(nodeType: string, worldX: number, worldY: number, parentId?: number | null, label?: string): Promise<NodeData | null>;
    /**
     * Create an edge through the public command path.
     *
     * Adapters must use this instead of reaching into EdgeStore. Connection
     * validation, before-hooks, composition semantics, handle state, history,
     * and the public connect event all remain owned by the editor.
     */
    addEdge(params: CreateEdgeParams): Promise<EdgeData | null>;
    /** Remove a node tree through the public command path. */
    removeNode(nodeId: number): Promise<void>;
    /** Remove an edge through the public command path. */
    removeEdge(edgeId: number): EdgeData | null;
    /**
     * Synchronize overlay container transforms with current camera pan and zoom.
     */
    private updateOverlays;
    private handleExport;
    private handleImport;
    private handleGlobalTextureChange;
    private undo;
    private redo;
    private dpr;
    private handleResize;
    private markMinimapDirty;
    private refreshMinimap;
    private handleMinimapNavigate;
    private pushCommand;
    private get commandContext();
    private captureSelectionSnapshot;
    private clearSelectionState;
    private dispatchSelectionChange;
    private syncSelectionKind;
    private setNodeSelected;
    private setEdgeSelected;
    private selectOnlyNode;
    private selectOnlyEdge;
    private captureNodePlacement;
    private collectSubtreeIds;
    private pickIgnoringNodeIds;
    private getSelectionDragRoots;
    private startSelectionDrag;
    private moveSelectionDrag;
    private inferSelectionDropTarget;
    private applySelectionDrop;
    private getSingleSelectedNode;
    private getSelectedGroupTarget;
    private restoreSelectionSnapshot;
    private clearSelectionAndHideProperties;
    private toggleMultiSelectMode;
    private isCommentMode;
    private _commentLayer;
    private toggleCommentMode;
    /**
     * Get whether comment mode is active.
     */
    getCommentMode(): boolean;
    /**
     * Programmatically enable/disable comment mode.
     */
    setCommentMode(enabled: boolean): void;
    /**
     * The editor's built-in comment layer, created lazily on first use. It owns
     * no chat state — bubbles spawn from `pane:click` and lifecycle events
     * (`create`/`save`/`cancel`/`delete`/`load`) are emitted for the consumer to
     * persist. The action pane's comment tool toggles it; a consumer can also
     * `load()` bubbles back from their own state or build a custom layer with
     * `attachCommentLayer` instead.
     */
    getCommentLayer(): CommentLayerController;
    private selectNodeByClick;
    private selectEdgeByClick;
    private beginLabelEdit;
    private commitLabelEdit;
    private captureNodeSnapshot;
    private captureSubtreeSnapshots;
    private captureNodeSnapshots;
    private captureEdgeSnapshots;
    private captureReferencedOriginals;
    private captureEdgeSnapshotsForSelection;
    private captureBoundaryEdgeSnapshots;
    private removeBoundaryEdgesForRoots;
    private applyNodeSnapshot;
    private restoreNodeSnapshots;
    private restoreEdgeSnapshots;
    private isCompositionReferenceEdge;
    private canCreateCompositionReference;
    private applyCompositionReferenceForEdge;
    private clearCompositionReferenceForEdge;
    private refreshCompositionReferenceNodes;
    private removeCompositionReferenceEdgesForNode;
    /** Zoom the camera to center a group node in the viewport with padding. */
    private spotlightGroup;
    /** Check if a node is locked (any type) or is a descendant of a locked group. */
    private isInLockedGroup;
    /** Returns the nearest subgraph ancestor that owns this node, if any. */
    private getOwningSubgraphId;
    private getOutermostSubgraphId;
    private canEnterContainer;
    private deleteNodeTreeWithHistory;
    private deleteEdgeWithHistory;
    private deleteCurrentSelectionWithHistory;
    private createNodeWithHistory;
    private handleAddNode;
    private handleAddComposition;
    private createSubgraphFromSelection;
    private toggleSubgraphCollapse;
    private ungraphSubgraphWithHistory;
    private cloneSubgraphWithHistory;
    private handleDeleteSelected;
    private pick;
    private hitTestHandle;
    private getHoveredContainer;
    private syncToolbarState;
    private getSelectionToolbarButtons;
    private syncSelectionToolbar;
    private updateSelectionToolbarPosition;
    private handleSelectionToolbarAction;
    private refreshContainerChain;
    private refreshContainerChains;
    private handlePointerDown;
    private handleMouseDown;
    private startPan;
    private handlePointerMove;
    private handleMouseMove;
    private handlePointerUp;
    private handlePointerCancel;
    private capturePointer;
    private releasePointer;
    private handleMouseUp;
    private createHubFromConnectionDrop;
    private isValidConnection;
    private hitTestEdge;
    private removeNodesAndEdges;
    private removeContainerOnly;
    private removeNodeAndIncidentEdges;
    private syncHandleStates;
    private applyConnectionState;
    private applyConnectionStateForEdge;
    private hasSelection;
    private zoomThrottleTimer;
    private readonly ZOOM_THROTTLE_MS;
    private triggerZoomThrottle;
    private handleWheel;
    private handleKeyDown;
    private handleSubgraphCreation;
}
