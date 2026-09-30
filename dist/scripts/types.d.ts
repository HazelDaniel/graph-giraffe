import type { NodeTypeRegistry } from "./node-type-registry.js";
export type ThemeName = "dark" | "light" | "neon";
export interface ThemeStyle {
    bgFill: string;
    borderStroke: string;
    headerFill: string;
    titleFill: string;
    bodyFill: string;
    borderWidth: number;
}
export type GeometryMeshType = "rounded-square";
export type BGGeometryMeshType = "dotted" | "grid";
export type GeometryType = "circle" | "square" | "rounded-square";
/**
 * A node type identifier. Built-in types are `"node" | "hub" | "branch" |
 * "group" | "composition" | "composition-child" | "subgraph"`, but the plugin
 * registry accepts any registered custom type name, so this is widened to
 * `string`. Use the predicate helpers (e.g. `isContainerNodeType`) to narrow.
 */
export type NodeType = "node" | "hub" | "branch" | "group" | "composition" | "composition-child" | "subgraph" | string;
export type ContainerNodeType = "group" | "composition" | "subgraph";
export type LeafNodeType = "node" | "hub" | "branch" | "composition-child";
export type CandidateNodeType = Exclude<NodeType, "composition-child">;
export type ConnectionMode = "group" | "node";
export type HandleSide = "left" | "right" | "top" | "bottom";
export type HandleShape = "circle" | "square";
export type EdgeType = "line" | "cubic" | "line-curve" | "orthogonal";
export type EdgeHeadType = "none" | "arrow";
export type EdgeHeadSkinId = "arrow" | "chevron" | "diamond" | "pill";
export type TextureKind = "node-body" | "node-head" | "group-body" | "group-head" | "composition-body" | "composition-head" | "composition-child-head" | "composition-reference-body" | "composition-reference-child-head";
export type TextureSourceType = "default" | "upload";
export interface TextureSource {
    id: string;
    label: string;
    kind: TextureKind;
    sourceType: TextureSourceType;
    svgText: string;
    previewUrl?: string;
}
export interface NodeTextureIds {
    body: string;
    head: string;
}
export interface HandleStyle {
    shape: HandleShape;
    backgroundColor: string;
    connectedBorderColor: string;
    disconnectedBorderColor: string;
    borderWidth: number;
    size: number;
}
export interface NodeHandleData {
    candidateId: number;
    side: HandleSide;
    isConnected: boolean;
    style: HandleStyle;
}
export interface EdgeData {
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
/** Framework-neutral declarative node input for controlled integrations. */
export interface ControlledNode {
    id: number;
    nodeType: string;
    /** World coordinates, matching React Flow-style controlled node positions. */
    position: {
        x: number;
        y: number;
    };
    parentId?: number | null;
    width?: number;
    height?: number;
    label?: string;
    props?: NodePropType;
    textureIds?: NodeTextureIds;
    isLocked?: boolean;
    isCollapsed?: boolean;
}
/** Framework-neutral declarative edge input for controlled integrations. */
export interface ControlledEdge {
    id: number;
    sourceNodeId: number;
    sourceHandleSide: HandleSide;
    targetNodeId: number;
    targetHandleSide: HandleSide;
    edgeType?: EdgeType;
    headType?: EdgeHeadType;
    headSkinId?: EdgeHeadSkinId;
    label?: string;
}
/** Detached renderer-neutral graph view exposed to adapters and diagnostics. */
export interface GraphProjection {
    nodes: NodeData[];
    edges: EdgeData[];
}
/** Renderer-independent scene queries used by adapters and semantic tests. */
export interface SceneQuery {
    getNodes(): NodeData[];
    getNode(id: number): NodeData | undefined;
    getEdges(): EdgeData[];
    getEdge(id: number): EdgeData | undefined;
    getGraph(): GraphProjection;
    getNodeWorldPosition(id: number): {
        x: number;
        y: number;
    } | undefined;
}
/** Coordinate and viewport operations independent of any rendering backend. */
export interface CoordinateTransform {
    worldToScreen(worldX: number, worldY: number): {
        x: number;
        y: number;
    };
    screenToWorld(screenX: number, screenY: number): {
        x: number;
        y: number;
    };
    getCameraState(): {
        panX: number;
        panY: number;
        zoom: number;
    };
    setViewport(panX: number, panY: number, zoom: number): void;
}
/** Renderer-neutral result of resolving a pointer location in the scene. */
export type InteractionTarget = {
    kind: "handle";
    nodeId: number;
    side: HandleSide;
} | {
    kind: "node";
    nodeId: number;
} | {
    kind: "edge";
    edgeId: number;
} | {
    kind: "pane";
};
export interface CustomOverlay {
    id: string;
    element: HTMLElement;
    worldX: number;
    worldY: number;
    scaleWithZoom?: boolean;
}
export interface NodeEditorConfig {
    connectionMode?: ConnectionMode;
    handleStyle?: HandleStyle;
    assetsPath?: string;
    minimap?: boolean;
    /**
     * Rendering pipeline for the whole editor — mutually exclusive by design.
     *
     * - `"webgl"` (default): every primitive is drawn in the WebGL context. No
     *   DOM node layer exists; descriptors carrying a `domRenderer` are rejected.
     * - `"dom"`: every primitive is drawn as a DOM view via `DomNodeLayer`. The
     *   renderer skips all WebGL node bodies (picking silhouettes, handles,
     *   edges and the background stay on GPU).
     *
     * The two pipelines can never coexist on a page. Because node types are
     * resolved against the registry at render time, imported snapshots always
     * adopt the editor's configured mode regardless of how they were authored.
     */
    renderMode?: "webgl" | "dom";
    minZoom?: number;
    maxZoom?: number;
}
export interface ConnectionPreviewData {
    sourceNodeId: number;
    sourceHandleSide: HandleSide;
    screenX: number;
    screenY: number;
}
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
    subgraphLinkIconSize: number;
    subgraphLinkClickRadius: number;
};
/**
 * Local position of a subgraph clone's "open original" link, centered in the
 * body area below the header. Shared by the WebGL overlay (drawGenericRoundedRect)
 * and the editor's click hit test so they stay in sync.
 */
export declare function getSubgraphLinkLocal(node: {
    width: number;
    height: number;
}): {
    x: number;
    y: number;
};
export declare const HANDLE_LAYOUT: {
    sideInset: number;
    offsetX: number;
    offsetY: number;
};
export declare const DEFAULT_HANDLE_STYLE: HandleStyle;
export declare const NODE_SIZE: {
    readonly node: {
        readonly width: 190;
        readonly height: 150;
    };
    readonly hub: {
        readonly width: 240;
        readonly height: 100;
    };
    readonly branch: {
        readonly width: 140;
        readonly height: 120;
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
        readonly width: 220;
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
export declare function isContainerNodeType(nodeType: NodeType | string, registry?: NodeTypeRegistry): nodeType is ContainerNodeType;
export declare function isLeafNodeType(nodeType: NodeType | string, registry?: NodeTypeRegistry): nodeType is LeafNodeType;
export declare function isNodePrimitiveType(nodeType: NodeType | string, registry?: NodeTypeRegistry): nodeType is "node" | "hub" | "branch";
export declare function isCandidateNodeType(nodeType: NodeType | string, connectionMode: ConnectionMode, registry?: NodeTypeRegistry): nodeType is CandidateNodeType;
export declare function getDefaultNodeSize(nodeType: NodeType | string, isCollapsed?: boolean, registry?: NodeTypeRegistry): {
    width: number;
    height: number;
};
export interface NodeShaderLocations {
    a_Position: number;
    a_TexCoord: number;
    a_Z: number;
    u_ModelMatrix: WebGLUniformLocation;
    u_ViewMatrix: WebGLUniformLocation;
    u_ProjMatrix: WebGLUniformLocation;
    u_Color: WebGLUniformLocation;
    u_UseTexture: WebGLUniformLocation;
    u_Sampler: WebGLUniformLocation;
    u_Use9Slice: WebGLUniformLocation;
    u_Dimensions: WebGLUniformLocation;
    u_TextureSize: WebGLUniformLocation;
    u_SliceMargins: WebGLUniformLocation;
    u_RenderMode: WebGLUniformLocation;
    u_BorderColor: WebGLUniformLocation;
    u_BorderWidth: WebGLUniformLocation;
    u_Radius: WebGLUniformLocation;
}
export interface MSDFShaderLocations {
    a_Position: number;
    a_TexCoord: number;
    a_Color: number;
    a_Z: number;
    u_ViewMatrix: WebGLUniformLocation;
    u_ProjMatrix: WebGLUniformLocation;
    u_Atlas: WebGLUniformLocation;
    u_pxRange: WebGLUniformLocation;
}
export interface IconBGShaderLocations {
    a_Position: number;
    a_Color: number;
    a_Shape: number;
    a_BBoxMin: number;
    a_BBoxMax: number;
    a_Z: number;
    u_ViewMatrix: WebGLUniformLocation;
    u_ProjMatrix: WebGLUniformLocation;
}
export interface BGShaderLocations {
    a_Position: number;
    u_Color: WebGLUniformLocation;
    u_UsePointMask: WebGLUniformLocation;
}
export interface NodePropPrimitive {
    label: string;
    value: NodePropValue;
    uiPrimitive: string;
    options?: string[];
}
export type NodePropValue = string | string[] | boolean;
export interface NodePropType {
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
export interface PropChangePayload {
    label: string;
    value: NodePropValue;
    uiPrimitive: string;
}
export interface NodeData {
    id: number;
    nodeType: NodeType;
    /** Referenced composition id when an ordinary node is promoted visually. */
    compositionRefId: number | null;
    /** When set on a subgraph, the id of the original subgraph this is a clone of. */
    subgraphRefId: number | null;
    /** Lookup table: ids of subgraph clones that reference this subgraph as their original. */
    subgraphRefIds?: number[];
    isDropTarget?: boolean;
    /** When true, the node cannot be dragged. On a group, children are also blocked. */
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
export interface AddUploadedTextureParams {
    id?: string;
    label: string;
    kind: TextureKind;
    svgText: string;
}
