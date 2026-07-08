export declare interface AddUploadedTextureParams {
    id?: string;
    label: string;
    kind: TextureKind;
    svgText: string;
}

export declare type AsyncHandler<T> = (payload: T) => Promise<boolean> | boolean;

declare const bgFragmentShader = "#version 300 es\n\nprecision mediump float;\nuniform vec4 u_Color;\nuniform bool u_UsePointMask;\nout vec4 fragColor;\n\nvoid main() {\n  if (u_UsePointMask) {\n    float dist = distance(gl_PointCoord, vec2(0.5));\n    if (dist > 0.5) {\n      discard;\n    } else {\n      fragColor = u_Color;\n    }\n  } else {\n    fragColor = u_Color;\n  }\n}";

export declare type BGGeometryMeshType = "dotted" | "grid";

declare const bgVertexShader = "#version 300 es\n\nin vec4 a_Position;\nvoid main() {\n  gl_Position = a_Position;\n  gl_PointSize = 4.0;\n}";

export declare type CandidateNodeType = Exclude<NodeType, "composition-child">;

/**
 * A serializable, replayable description of an editor action.
 *
 * Unlike the old `HistoryEntry` (opaque closures), every command carries a
 * plain-data `payload` that can be inspected, serialized, and replayed.
 */
declare interface Command {
    readonly type: string;
    readonly payload: Record<string, unknown>;
    undo(ctx: CommandContext): void;
    redo(ctx: CommandContext): void;
}

/**
 * Everything a command needs to execute its undo/redo logic.
 *
 * The NodeEditor (and WorldActionDriver in tests) each build an adapter
 * object that satisfies this interface, wiring their own stores, selection
 * state, and UI controls into it.
 */
declare interface CommandContext {
    readonly store: NodeStore;
    readonly edgeStore: EdgeStore;
    readonly theme: ThemeName;
    applyNodeSnapshot(snapshot: NodeHistorySnapshot): void;
    restoreNodeSnapshots(snapshots: NodeHistorySnapshot[]): void;
    restoreEdgeSnapshots(snapshots: EdgeHistorySnapshot[]): void;
    removeNodeAndIncidentEdges(nodeId: number): void;
    removeNodesAndEdges(nodeIds: Iterable<number>, edgeIds: Iterable<number>): void;
    removeContainerOnly(nodeId: number): void;
    clearSelectionState(): void;
    setNodeSelected(nodeId: number, selected: boolean): void;
    restoreSelectionSnapshot(snapshot: SelectionSnapshot): void;
    refreshContainerChain(containerId: number | null): void;
    syncPropertiesPanel(): void;
    syncToolbarState(): void;
    syncHandleStates(nodeId: number): void;
    applyCompositionReferenceForEdge(edge: EdgeData | EdgeHistorySnapshot): void;
    clearCompositionReferenceForEdge(edge: EdgeData | EdgeHistorySnapshot): void;
}

export declare type ConnectionMode = "group" | "node";

export declare interface ConnectionPreviewData {
    sourceNodeId: number;
    sourceHandleSide: HandleSide;
    screenX: number;
    screenY: number;
}

export declare type ContainerNodeType = "group" | "composition" | "subgraph";

declare interface CreateEdgeParams {
    sourceNodeId: number;
    sourceHandleSide: HandleSide;
    targetNodeId: number;
    targetHandleSide: HandleSide;
    sourceCanHaveMultipleConnections?: boolean;
    targetCanHaveMultipleConnections?: boolean;
    edgeType?: EdgeType;
    headType?: EdgeHeadType;
    headSkinId?: EdgeHeadSkinId;
    label?: string;
    isSelected?: boolean;
    visible?: boolean;
    idOverride?: number;
}

export declare const DEFAULT_HANDLE_STYLE: HandleStyle;

export declare interface EdgeData {
    id: number;
    sourceNodeId: number;
    sourceHandleSide: HandleSide;
    targetNodeId: number;
    targetHandleSide: HandleSide;
    edgeType: EdgeType;
    headType: EdgeHeadType;
    headSkinId: EdgeHeadSkinId;
    label: string;
    isSelected: boolean;
    visible: boolean;
}

export declare type EdgeHeadSkinId = "arrow" | "chevron" | "diamond" | "pill";

export declare type EdgeHeadType = "none" | "arrow";

declare interface EdgeHistorySnapshot {
    id: number;
    sourceNodeId: number;
    sourceHandleSide: HandleSide;
    targetNodeId: number;
    targetHandleSide: HandleSide;
    edgeType: EdgeType;
    headType: EdgeHeadType;
    headSkinId: EdgeHeadSkinId;
    label: string;
    isSelected: boolean;
    visible: boolean;
}

/**
 * Canonical edge collection with adjacency indexes for fast incident-edge
 * cleanup when nodes are deleted.
 */
declare class EdgeStore {
    readonly edges: Map<number, EdgeData>;
    private adjacency;
    private _nextId;
    get nextEdgeId(): number;
    allEdges(): EdgeData[];
    get(id: number): EdgeData | undefined;
    hasConnection(nodeId: number, side: HandleSide): boolean;
    add(params: CreateEdgeParams): EdgeData | null;
    remove(id: number): EdgeData | null;
    removeEdgesForNode(nodeId: number): EdgeData[];
    removeEdgesForNodes(nodeIds: Iterable<number>): EdgeData[];
    private findEdgeByEndpoints;
    private addAdjacency;
    private removeAdjacency;
}

export declare type EdgeType = "line" | "cubic" | "line-curve" | "orthogonal";

declare const fragmentShader = "#version 300 es\n\nprecision mediump float;\nin vec2 v_TexCoord;\nuniform sampler2D u_Sampler;\nuniform bool u_UseTexture;\nuniform vec4 u_Color;\nuniform int u_RenderMode;\nuniform vec4 u_BorderColor;\nuniform float u_BorderWidth;\nuniform float u_Radius;\nout vec4 fragColor;\n\n// 9-slice scaling uniforms\nuniform bool u_Use9Slice;\nuniform vec2 u_Dimensions;\nuniform vec2 u_TextureSize;\nuniform vec4 u_SliceMargins; // x=left, y=top, z=right, w=bottom\n\nvec2 map9SliceCoord(vec2 uv, vec2 size, vec2 texSize, vec4 margins) {\n  vec2 pixelPos = uv * size;\n  float x = 0.0;\n\n  if (pixelPos.x < margins.x) {\n    x = pixelPos.x;\n  } else if (pixelPos.x > size.x - margins.z) {\n    x = texSize.x - (size.x - pixelPos.x);\n  } else {\n    float innerQuadWidth = size.x - margins.x - margins.z;\n    float innerTexWidth = texSize.x - margins.x - margins.z;\n    float ratio = (pixelPos.x - margins.x) / innerQuadWidth;\n    x = margins.x + ratio * innerTexWidth;\n  }\n\n  float y = 0.0;\n  if (pixelPos.y < margins.y) {\n    y = pixelPos.y;\n  } else if (pixelPos.y > size.y - margins.w) {\n    y = texSize.y - (size.y - pixelPos.y);\n  } else {\n    float innerQuadHeight = size.y - margins.y - margins.w;\n    float innerTexHeight = texSize.y - margins.y - margins.w;\n    float ratio = (pixelPos.y - margins.y) / innerQuadHeight;\n    y = margins.y + ratio * innerTexHeight;\n  }\n\n  return vec2(x / texSize.x, y / texSize.y);\n}\n\nfloat roundedBoxDistance(vec2 p, vec2 halfSize, float radius) {\n  vec2 q = abs(p) - halfSize + vec2(radius);\n  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;\n}\n\nvoid main() {\n  if (u_RenderMode == 1) {\n    vec2 size = max(u_Dimensions, vec2(1.0));\n    vec2 pos = v_TexCoord * size;\n    vec2 centered = pos - size * 0.5;\n    float radius = min(u_Radius, min(size.x, size.y) * 0.5);\n    float dist = roundedBoxDistance(centered, size * 0.5, radius);\n    float aa = max(fwidth(dist), 1.0);\n    float outerAlpha = 1.0 - smoothstep(0.0, aa, dist);\n    if (outerAlpha <= 0.0) discard;\n\n    float borderMix = 1.0 - smoothstep(u_BorderWidth - aa, u_BorderWidth + aa, -dist);\n    vec4 color = mix(u_Color, u_BorderColor, borderMix);\n    fragColor = vec4(color.rgb, color.a * outerAlpha);\n    return;\n  }\n\n  if (u_UseTexture) {\n    vec2 sampledUV = v_TexCoord;\n    if (u_Use9Slice && u_Dimensions.x > 0.0 && u_TextureSize.x > 0.0) {\n      sampledUV = map9SliceCoord(v_TexCoord, u_Dimensions, u_TextureSize, u_SliceMargins);\n    }\n    vec4 texColor = texture(u_Sampler, sampledUV);\n    fragColor = texColor * u_Color;\n  } else {\n    fragColor = u_Color;\n  }\n}";

export declare function generateTetureSkinOption(kind: TextureKind, label: string, index: number, id: string): TextureSource;

export declare type GeometryMeshType = "rounded-square";

export declare type GeometryType = "circle" | "square" | "rounded-square";

export declare function getCompositionReferenceTextureIds(): NodeTextureIds;

export declare function getDefaultNodeSize(nodeType: NodeType, isCollapsed?: boolean): {
    width: number;
    height: number;
};

export declare function getDefaultTextureIds(nodeType: NodeType): NodeTextureIds;

export declare interface GraphBeforeEvents {
    "before:connect": {
        sourceId: number;
        sourceType: NodeType;
        targetId: number;
        targetType: NodeType;
    };
    "before:nodeCreate": {
        nodeType: NodeType;
        localX: number;
        localY: number;
        parentId: number | null;
        parentType: NodeType | null;
    };
    "before:nodeDelete": {
        nodeId: number;
        nodeType: NodeType;
    };
    "before:nodeReparent": {
        nodeId: number;
        nodeType: NodeType;
        newParentId: number | null;
        newParentType: NodeType | null;
    };
}

export declare class GraphEventEmitter {
    debug: boolean | null;
    private syncHandlers;
    private asyncHandlers;
    /**
     * Listen to a standard synchronous event.
     * Returns an unsubscribe function.
     */
    on<K extends keyof GraphEvents>(event: K, handler: SyncHandler<GraphEvents[K]>): () => void;
    /**
     * Remove a synchronous event listener.
     */
    off<K extends keyof GraphEvents>(event: K, handler: SyncHandler<GraphEvents[K]>): void;
    /**
     * Dispatch a standard synchronous event.
     */
    dispatch<K extends keyof GraphEvents>(event: K, payload: GraphEvents[K]): void;
    /**
     * Listen to an async hook that can block execution.
     * Returns an unsubscribe function.
     */
    onBefore<K extends keyof GraphBeforeEvents>(event: K, handler: AsyncHandler<GraphBeforeEvents[K]>): () => void;
    /**
     * Remove an async hook listener.
     */
    offBefore<K extends keyof GraphBeforeEvents>(event: K, handler: AsyncHandler<GraphBeforeEvents[K]>): void;
    /**
     * Dispatch an async hook.
     * Returns true if all listeners resolve to true (or truthy).
     * Returns false if ANY listener returns false or throws.
     */
    dispatchBefore<K extends keyof GraphBeforeEvents>(event: K, payload: GraphBeforeEvents[K]): Promise<boolean>;
}

export declare interface GraphEvents {
    "history:command": {
        command: Command;
        action: "do" | "undo" | "redo";
    };
    "node:propChange": {
        nodeId: number;
        nodeType: NodeType;
        label: string;
        value: string | boolean;
    };
    "node:labelChange": {
        nodeId: number;
        nodeType: NodeType;
        oldLabel: string;
        newLabel: string;
    };
    "node:reparent": {
        nodeId: number;
        nodeType: NodeType;
        oldParentId: number | null;
        newParentId: number | null;
    };
    "subgraph:collapseToggle": {
        subgraphId: number;
        isCollapsed: boolean;
    };
    "hub:created": {
        hubId: number;
    };
    "node:click": {
        nodeId: number;
        nodeType: NodeType;
        event: MouseEvent;
    };
    "node:dragStart": {
        nodeIds: number[];
        event: MouseEvent;
    };
    "node:drag": {
        nodeIds: number[];
        event: MouseEvent;
    };
    "node:dragStop": {
        nodeIds: number[];
        event: MouseEvent;
    };
    "edge:click": {
        edgeId: number;
        event: MouseEvent;
    };
    "connect": {
        sourceId: number;
        sourceType: NodeType;
        targetId: number;
        targetType: NodeType;
        edgeId: number;
    };
    "selection:change": {
        nodeIds: number[];
        edgeIds: number[];
    };
    "pane:click": {
        event: MouseEvent;
    };
    "pane:scroll": {
        event: WheelEvent;
    };
}

export declare const HANDLE_LAYOUT: {
    sideInset: number;
    offsetX: number;
};

export declare type HandleShape = "circle" | "square";

export declare type HandleSide = "left" | "right";

export declare interface HandleStyle {
    shape: HandleShape;
    backgroundColor: string;
    connectedBorderColor: string;
    disconnectedBorderColor: string;
    borderWidth: number;
    size: number;
}

declare const iconBGFragmentShader = "#version 300 es\n\nprecision mediump float;\nin vec4 v_Color;\nin float v_Shape;\nin vec2 v_BBoxMin;\nin vec2 v_BBoxMax;\nin vec2 v_Pos;\nout vec4 fragColor;\n\nvoid main() {\n  vec4 resColor = v_Color;\n  if (v_Shape > 0.5) {\n    vec2 bboxSize = v_BBoxMax - v_BBoxMin;\n    vec2 normalized = (v_Pos - v_BBoxMin) / (bboxSize + 0.001);\n\n    if (v_Shape < 1.5) {\n      // Circle: discard if distance from center > 0.5\n      float dist = distance(normalized, vec2(0.5));\n      if (dist > 0.5) discard;\n    } else {\n      // Rounded-square: discard corners outside rounded rect\n      float r = 0.25;\n      vec2 p = abs(normalized - 0.5) * 2.0;\n      vec2 d = p - (1.0 - r);\n      if (length(max(d, 0.0)) > r) discard;\n    }\n  }\n\n  fragColor = resColor;\n}";

declare const iconBGVertexShader = "#version 300 es\n\nin vec2 a_Position;\nin vec4 a_Color;\nin float a_Shape;\nin vec2 a_BBoxMin;\nin vec2 a_BBoxMax;\nin float a_Z;\n\nuniform mat4 u_ViewMatrix;\nuniform mat4 u_ProjMatrix;\n\nout vec4 v_Color;\nout float v_Shape;\nout vec2 v_BBoxMin;\nout vec2 v_BBoxMax;\nout vec2 v_Pos;\n\nvoid main() {\n  v_Color = a_Color;\n  v_Shape = a_Shape;\n  v_BBoxMin = a_BBoxMin;\n  v_BBoxMax = a_BBoxMax;\n  v_Pos = a_Position;\n  gl_Position = u_ProjMatrix * u_ViewMatrix * vec4(a_Position, a_Z, 1.0);\n}";

export declare function isCandidateNodeType(nodeType: NodeType, connectionMode: ConnectionMode): nodeType is CandidateNodeType;

export declare function isContainerNodeType(nodeType: NodeType): nodeType is ContainerNodeType;

export declare function isLeafNodeType(nodeType: NodeType): nodeType is LeafNodeType;

export declare function isNodePrimitiveType(nodeType: NodeType): nodeType is "node" | "hub";

export declare type LeafNodeType = "node" | "hub" | "composition-child";

/**
 * 4×4 matrix class compatible with WebGL uniform uploads.
 * Column-major layout matching OpenGL/WebGL conventions.
 */
export declare class Matrix4 {
    elements: Float32Array;
    constructor(opt_src?: Matrix4);
    /** Set the identity matrix. */
    setIdentity(): Matrix4;
    /** Copy matrix. */
    set(src: Matrix4): Matrix4;
    /** Multiply the matrix from the right. */
    concat(other: Matrix4): Matrix4;
    /** Alias for concat. */
    multiply(other: Matrix4): Matrix4;
    /** Multiply the three-dimensional vector. */
    multiplyVector3(pos: Vector3): Vector3;
    /** Multiply the four-dimensional vector. */
    multiplyVector4(pos: Vector4): Vector4;
    /** Transpose the matrix. */
    transpose(): Matrix4;
    /** Calculate the inverse matrix of specified matrix, and set to this. */
    setInverseOf(other: Matrix4): Matrix4;
    /** Calculate the inverse matrix of this, and set to this. */
    invert(): Matrix4;
    /** Set the orthographic projection matrix. */
    setOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
    /** Multiply the orthographic projection matrix from the right. */
    ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
    /** Set the perspective projection matrix by fovy and aspect. */
    setPerspective(fovy: number, aspect: number, near: number, far: number): Matrix4;
    /** Multiply the perspective projection matrix from the right. */
    perspective(fovy: number, aspect: number, near: number, far: number): Matrix4;
    /** Set the matrix for scaling. */
    setScale(x: number, y: number, z: number): Matrix4;
    /** Multiply the matrix for scaling from the right. */
    scale(x: number, y: number, z: number): Matrix4;
    /** Set the matrix for translation. */
    setTranslate(x: number, y: number, z: number): Matrix4;
    /** Multiply the matrix for translation from the right. */
    translate(x: number, y: number, z: number): Matrix4;
    /** Set the matrix for rotation. Angle in degrees. */
    setRotate(angle: number, x: number, y: number, z: number): Matrix4;
    /** Multiply the matrix for rotation from the right. Angle in degrees. */
    rotate(angle: number, x: number, y: number, z: number): Matrix4;
    /** Set the viewing matrix. */
    setLookAt(eyeX: number, eyeY: number, eyeZ: number, centerX: number, centerY: number, centerZ: number, upX: number, upY: number, upZ: number): Matrix4;
    /** Multiply the viewing matrix from the right. */
    lookAt(eyeX: number, eyeY: number, eyeZ: number, centerX: number, centerY: number, centerZ: number, upX: number, upY: number, upZ: number): Matrix4;
    /** Multiply the matrix for projecting vertex to plane from the right. */
    dropShadow(plane: number[], light: number[]): Matrix4;
    /** Multiply the matrix for projecting vertex to plane from the right (parallel light). */
    dropShadowDirectionally(normX: number, normY: number, normZ: number, planeX: number, planeY: number, planeZ: number, lightX: number, lightY: number, lightZ: number): Matrix4;
    /** Set the perspective projection matrix from frustum bounds. */
    setFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
    /** Multiply the perspective projection matrix from the right. */
    frustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
}

declare const msdfFragmentShader = "#version 300 es\n\nprecision mediump float;\nin vec2 v_TexCoord;\nin vec4 v_Color;\nuniform sampler2D u_Atlas;\nout vec4 fragColor;\n\nfloat median(float r, float g, float b) {\n  return max(min(r, g), min(max(r, g), b));\n}\n\nvoid main() {\n  vec4 sampleData = texture(u_Atlas, v_TexCoord);\n  float sigDist = median(sampleData.r, sampleData.g, sampleData.b) - 0.5;\n  // The fwidth function is required for crisp edges at all scales\n  float afwidth = fwidth(sigDist);\n  float opacity = smoothstep(-afwidth, afwidth, sigDist);\n  fragColor = vec4(v_Color.rgb, v_Color.a * opacity);\n}";

declare const msdfVertexShader = "#version 300 es\n\nin vec4 a_Position;\nin vec2 a_TexCoord;\nin vec4 a_Color;\nin float a_Z;\nuniform mat4 u_ViewMatrix;\nuniform mat4 u_ProjMatrix;\nout vec2 v_TexCoord;\nout vec4 v_Color;\n\nvoid main() {\n  vec4 pos = a_Position;\n  pos.z = a_Z;\n  gl_Position = u_ProjMatrix * u_ViewMatrix * pos;\n  v_TexCoord = a_TexCoord;\n  v_Color = a_Color;\n}";

export declare const NODE_LAYOUT: {
    headerHeight: number;
    padding: number;
    closeBtnPaddingRight: number;
    closeBtnClickRadius: number;
    editBtnPaddingRight: number;
    editBtnClickRadius: number;
    plusBtnPaddingBottom: number;
    plusBtnClickRadius: number;
    spotlightBtnPaddingRight: number;
    spotlightBtnPaddingBottom: number;
    spotlightBtnClickRadius: number;
    lockBtnTopY: number;
    lockBtnClickRadius: number;
    subgraphBtnPaddingRight: number;
    subgraphBtnSpacing: number;
    subgraphBtnClickRadius: number;
};

export declare const NODE_SIZE: {
    readonly node: {
        readonly width: 190;
        readonly height: 150;
    };
    readonly hub: {
        readonly width: 240;
        readonly height: 100;
    };
    readonly nodeCollapsed: {
        readonly width: 190;
        readonly height: number;
    };
    readonly group: {
        readonly width: 220;
        readonly height: 200;
    };
    readonly composition: {
        readonly width: 140;
        readonly height: 200;
    };
    readonly compositionChild: {
        readonly width: 160;
        readonly height: number;
    };
    readonly subgraph: {
        readonly width: 220;
        readonly height: 160;
    };
    readonly subgraphCollapsed: {
        readonly width: 190;
        readonly height: number;
    };
};

export declare interface NodeData {
    id: number;
    nodeType: NodeType;
    /** Referenced composition id when an ordinary node is promoted visually. */
    compositionRefId: number | null;
    isDropTarget?: boolean;
    /** When true on a group node, neither the group nor its children can be dragged. */
    isLocked?: boolean;
    /** When true on a subgraph, descendants are hidden and the subgraph draws compactly. */
    isCollapsed?: boolean;
    /** Position relative to parent node (or world origin if parentId is null). */
    localX: number;
    localY: number;
    width: number;
    height: number;
    text: string;
    /** Stable texture source ids. Runtime WebGL textures are regenerated from these later. */
    textureIds: NodeTextureIds;
    pickColor: [number, number, number];
    isSelected: boolean;
    visible: boolean;
    /** Scene graph: id of the parent node, or null for root nodes. */
    parentId: number | null;
    /** Scene graph: ordered list of child node ids. */
    childIds: number[];
    /** Handle metadata for nodes that can participate in connections. */
    handles: NodeHandleData[];
    /** Dynamic properties that dictate node body height and overlay text. */
    props?: NodePropType;
}

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
    private handleGlobalTextureChange;
    private undo;
    private redo;
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

export declare interface NodeEditorConfig {
    connectionMode?: ConnectionMode;
    handleStyle?: HandleStyle;
}

export declare interface NodeHandleData {
    candidateId: number;
    side: HandleSide;
    isConnected: boolean;
    style: HandleStyle;
}

declare interface NodeHistorySnapshot {
    id: number;
    nodeType: NodeType;
    localX: number;
    localY: number;
    width: number;
    height: number;
    text: string;
    textureIds: NodeTextureIds;
    visible: boolean;
    isSelected: boolean;
    isDropTarget: boolean;
    isLocked: boolean;
    isCollapsed: boolean;
    parentId: number | null;
    childIds: number[];
    compositionRefId: number | null;
    props?: NodePropType;
    handleStates: Array<{
        side: HandleSide;
        isConnected: boolean;
    }>;
}

export declare interface NodePropPrimitive {
    label: string;
    value: string | boolean;
    uiPrimitive: string;
    options?: string[];
}

export declare interface NodePropType {
    groups: string[];
    booleans: {
        [groupKey: string]: NodePropPrimitive[];
    };
    texts: {
        [groupKey: string]: NodePropPrimitive[];
    };
    enums: {
        [groupKey: string]: NodePropPrimitive[];
    };
}

/**
 * Owns the canonical node list.
 * Groups, compositions, and leaf nodes are stored in separate z-order buckets
 * so the renderer can keep compositions above groups without changing layout.
 */
declare class NodeStore {
    private gl;
    /** Group nodes — drawn first (behind compositions and leaves). */
    readonly groups: Map<number, NodeData>;
    /** Leaf nodes — drawn last (in front of groups and compositions). */
    readonly nodes: Map<number, NodeData>;
    private _nextId;
    /** Per-type creation order for tiered z-ordering. */
    private _groupOrder;
    private _nextGroupOrder;
    private _compositionOrder;
    private _nextCompositionOrder;
    private _leafOrder;
    private _nextLeafOrder;
    private a11yTree;
    private connectionMode;
    private handleStyle;
    private currentTheme;
    constructor(gl: WebGL2RenderingContext, connectionMode?: ConnectionMode, handleStyle?: HandleStyle);
    getTheme(): ThemeName;
    /** The id that the next call to add() will assign. Useful for labelling. */
    get nextNodeId(): number;
    /**
     * Returns a combined Map view of all nodes (containers + leaves).
     * Used by scene-graph functions that need to traverse the full tree.
     */
    get allNodesMap(): Map<number, NodeData>;
    /** O(1) lookup across both maps. */
    get(id: number): NodeData | undefined;
    /**
     * Returns the ids that would be removed by `remove(id)`.
     *
     * Container nodes cascade to descendants. Leaf nodes may still have
     * descendants in the current tree model, but those children are promoted
     * rather than deleted.
     */
    collectRemovedIds(id: number): number[];
    /** Create a new node at world coordinates (localX, localY). */
    add(localX: number, localY: number, text: string, theme: ThemeName, nodeType?: NodeType, idOverride?: number): NodeData;
    setConnectionMode(connectionMode: ConnectionMode): void;
    setHandleStyle(handleStyle: HandleStyle): void;
    /**
     * Duplicate a normal node into a composition as a composition-child.
     * The source node remains untouched; the clone is returned so callers can
     * select or further manipulate it.
     */
    duplicateIntoComposition(sourceId: number, compositionId: number, theme: ThemeName): NodeData | null;
    /**
     * Remove a node and free its GPU texture.
     * Container nodes cascade to their descendants. Leaf nodes still keep the
     * old promotion path as a safety net for future leaf variants.
     */
    remove(id: number): void;
    /**
     * Removes a container while preserving its children in their current visual
     * positions by promoting them to the removed container's parent.
     */
    removeContainerOnly(id: number): boolean;
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
    getZForNode(nodeId: number, selectedNodeIds: Set<number>): number;
    /** Returns the currently selected node, if any. */
    getSelected(): NodeData | undefined;
    /** Deselect every node. */
    deselectAll(): void;
    /** Clear isDropTarget on every node. */
    clearDropTargets(): void;
    /** Rebuild textures for all nodes under a new theme. */
    regenerateTextures(theme: ThemeName): void;
    /** Update the label text of a node and regenerate its texture. */
    updateLabel(id: number, newLabel: string, theme: ThemeName): void;
    updateHandleConnectionState(nodeId: number, side: NodeHandleData['side'], isConnected: boolean): void;
    setCompositionReference(nodeId: number, compositionId: number, theme: ThemeName): boolean;
    clearCompositionReference(nodeId: number, theme: ThemeName): boolean;
    getCompositionReferenceNodes(compositionId: number): NodeData[];
    refreshCompositionReferences(compositionId: number, theme: ThemeName): void;
    /** Assign a new parent to a child node, preserving world position. */
    setParent(childId: number, newParentId: number | null): boolean;
    /** Restore a node to an exact local position and parent. */
    restoreNodePlacement(childId: number, localX: number, localY: number, parentId: number | null): boolean;
    /** Restore a node without re-validating the historical parent relationship. */
    forceRestoreNodePlacement(childId: number, localX: number, localY: number, parentId: number | null): boolean;
    /**
     * Translates the direct children of `rootId` by the same world delta.
     *
     * Collapsed subgraphs use this so the shell and direct children stay
     * aligned while nested descendants keep their relative offsets through
     * the normal parent chain.
     */
    translateDescendants(rootId: number, deltaX: number, deltaY: number): void;
    /**
     * All visible nodes in render order:
     * subgraphs first, then groups, compositions, and leaves.
     */
    visibleNodes(): NodeData[];
    isEffectivelyVisible(nodeId: number): boolean;
    /** Re-calculates bounds of a container node based on its children. */
    updateContainerBounds(containerId: number, theme: ThemeName): void;
    /** Compatibility wrapper for the previous group-specific API. */
    updateGroupBounds(groupId: number, theme: ThemeName): void;
    /** Ensure a node is stored in the correct map based on its nodeType. */
    private syncToMap;
    private insertNode;
    syncNodePresentation(nodeId: number): void;
    shouldCollapseNode(node: NodeData): boolean;
    private getPresentedNodeSize;
    private getCompositionReferencePreviewChildren;
    private createHandleState;
    private createNodeRecord;
    private updateSubgraphBounds;
    private calculatePropHeight;
    private createDefaultProps;
}

export declare interface NodeTextureIds {
    body: string;
    head: string;
}

export declare type NodeType = "node" | "hub" | "group" | "composition" | "composition-child" | "subgraph";

export declare interface PropChangePayload {
    label: string;
    value: string | boolean;
    uiPrimitive: string;
}

declare type SelectionKind = "node" | "edge" | null;

declare interface SelectionSnapshot {
    kind: SelectionKind;
    nodeIds: number[];
    edgeIds: number[];
}

export declare namespace shaders {
    export {
        vertexShader,
        fragmentShader,
        msdfVertexShader,
        msdfFragmentShader,
        iconBGVertexShader,
        iconBGFragmentShader,
        bgVertexShader,
        bgFragmentShader
    }
}

export declare type SyncHandler<T> = (payload: T) => void;

export declare type TextureKind = "node-body" | "node-head" | "group-body" | "group-head" | "composition-body" | "composition-head" | "composition-child-head" | "composition-reference-body" | "composition-reference-child-head";

export declare const TextureRegistry: textureRegistry;

/**
 * Durable texture source registry.
 *
 * It owns SVG source metadata and preview URLs, but deliberately does not
 * create WebGLTexture objects. Runtime upload/caching belongs to rendering.
 */
declare class textureRegistry {
    sources: Map<string, TextureSource>;
    ownedPreviewUrls: Set<string>;
    private theme_;
    private static _instance;
    static get instance(): textureRegistry;
    set theme(newTheme: ThemeName);
    private updatePreviewUrls;
    private getStrokeColorForKind;
    private getThemeColorForKind;
    getResolvedSvgText(source: TextureSource): string;
    constructor(defaultSources?: TextureSource[]);
    all(): TextureSource[];
    byKind(kind: TextureKind): TextureSource[];
    get(id: string): TextureSource | undefined;
    has(id: string): boolean;
    addUploaded(params: AddUploadedTextureParams): TextureSource;
    removeUploaded(id: string): boolean;
    dispose(): void;
    private registerDefault;
    private ensureUniqueId;
}

export declare interface TextureSource {
    id: string;
    label: string;
    kind: TextureKind;
    sourceType: TextureSourceType;
    svgText: string;
    previewUrl?: string;
}

export declare type TextureSourceType = "default" | "upload";

export declare type ThemeName = "dark" | "light" | "neon";

export declare interface ThemeStyle {
    bgFill: string;
    borderStroke: string;
    headerFill: string;
    titleFill: string;
    bodyFill: string;
    borderWidth: number;
}

/**
 * 3-component vector.
 */
export declare class Vector3 {
    elements: Float32Array;
    constructor(opt_src?: number[] | Float32Array);
    /** Normalize this vector in place. */
    normalize(): Vector3;
}

/**
 * 4-component vector.
 */
export declare class Vector4 {
    elements: Float32Array;
    constructor(opt_src?: number[] | Float32Array);
}

/**
 * Embedded GLSL shader sources for @graph-giraffe/core.
 * Extracted from the inline <script type="x-shader/..."> tags
 * so the library can be used without DOM-embedded shaders.
 */
declare const vertexShader = "#version 300 es\n\nin vec4 a_Position;\nin vec2 a_TexCoord;\nin float a_Z;\nuniform mat4 u_ModelMatrix;\nuniform mat4 u_ViewMatrix;\nuniform mat4 u_ProjMatrix;\nout vec2 v_TexCoord;\nvoid main() {\n  vec4 pos = u_ModelMatrix * a_Position;\n  pos.z = a_Z;\n  gl_Position = u_ProjMatrix * u_ViewMatrix * pos;\n  v_TexCoord = a_TexCoord;\n}";

export { }
