import { GraphEventEmitter } from "./events.js";
import { ConnectionMode, NodeEditorConfig, AddUploadedTextureParams, CustomOverlay } from "./types.js";
import { NodeTypeRegistry } from "./node-type-registry.js";
import type { GraphSnapshot } from "./graph-serialization.js";
/**
 * NodeEditor is the single public class exposed to the entry point.
 * It owns every internal module and wires them together via callbacks.
 * No internal type leaks out of this file's public API.
 */
export declare class NodeEditor {
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
    private resizeObserver;
    private activeTouches;
    private gestureMode;
    private pinchDistance;
    private static _instance;
    static create(canvasId: string, backgroundCanvasId: string, vsSource: string, fsSource: string, bgVsSource: string, bgFsSource: string, msdfVsSource: string, msdfFsSource: string, IconBGVsSource: string, IconBGFsSource: string, options?: NodeEditorConfig, nodeTextureUploadList?: AddUploadedTextureParams[]): Promise<NodeEditor>;
    private msdfAtlas;
    private iconAtlas;
    private constructor();
    private init;
    private setupPropGroupListener;
    private syncPropertiesPanelForSelection;
    private updatePropValue;
    private validateConfig;
    private distance;
    private midpoint;
    private uploadTextureSources;
    render(): void;
    setConnectionMode(connectionMode: ConnectionMode): void;
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
    private pushCommand;
    private get commandContext();
    private captureSelectionSnapshot;
    private clearSelectionState;
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
    private selectNodeByClick;
    private selectEdgeByClick;
    private beginLabelEdit;
    private commitLabelEdit;
    private captureNodeSnapshot;
    private captureSubtreeSnapshots;
    private captureNodeSnapshots;
    private captureEdgeSnapshots;
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
    /** Check if a node is a locked group or is a descendant of one. */
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
    private hasSelection;
    private zoomThrottleTimer;
    private readonly ZOOM_THROTTLE_MS;
    private triggerZoomThrottle;
    private handleWheel;
    private handleKeyDown;
    private handleSubgraphCreation;
}
