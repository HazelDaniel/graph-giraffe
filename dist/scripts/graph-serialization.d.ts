/**
 * Graph Serialization — schema types and pure serialize/deserialize functions.
 *
 * No WebGL or DOM dependencies. All rendering state (pickColor, handles,
 * isSelected, visible) is transient and reconstructed on import.
 */
import type { NodeStore } from './node-store.js';
import type { EdgeStore } from './edge-store.js';
import type { ThemeName, ConnectionMode, HandleSide, EdgeType, EdgeHeadType, EdgeHeadSkinId, TextureKind, TextureSource, NodePropType } from './types.js';
export interface GraphSnapshot {
    version: 1;
    editor: {
        theme: ThemeName;
        connectionMode: ConnectionMode;
        bgColor: [number, number, number, number];
        fontColor: [number, number, number, number];
        camera: {
            panX: number;
            panY: number;
            zoom: number;
        };
    };
    nodes: SerializedNode[];
    edges: SerializedEdge[];
    textures: SerializedTexture[];
    counters: {
        nodeId: number;
        edgeId: number;
    };
}
export interface SerializedNode {
    id: number;
    nodeType: string;
    localX: number;
    localY: number;
    width: number;
    height: number;
    text: string;
    textureIds: {
        body: string;
        head: string;
    };
    parentId: number | null;
    childIds: number[];
    compositionRefId: number | null;
    isLocked?: boolean;
    isCollapsed?: boolean;
    props?: NodePropType;
}
export interface SerializedEdge {
    id: number;
    sourceNodeId: number;
    sourceHandleSide: HandleSide;
    targetNodeId: number;
    targetHandleSide: HandleSide;
    edgeType: EdgeType;
    headType: EdgeHeadType;
    headSkinId: EdgeHeadSkinId;
    label: string;
}
export interface SerializedTexture {
    id: string;
    label: string;
    kind: TextureKind;
    svgText: string;
}
export interface SerializeGraphParams {
    store: NodeStore;
    edgeStore: EdgeStore;
    textureSources: Iterable<TextureSource>;
    theme: ThemeName;
    connectionMode: ConnectionMode;
    bgColor: [number, number, number, number];
    fontColor: [number, number, number, number];
    camera: {
        panX: number;
        panY: number;
        zoom: number;
    };
}
/**
 * Capture the full graph state as a portable JSON-serializable snapshot.
 *
 * Only persistent fields are captured — transient state like `pickColor`,
 * `isSelected`, `handles`, and `visible` are omitted.
 */
export declare function serializeGraph(params: SerializeGraphParams): GraphSnapshot;
export interface DeserializeGraphParams {
    snapshot: GraphSnapshot;
    store: NodeStore;
    edgeStore: EdgeStore;
    theme: ThemeName;
    registerTexture?: (params: {
        id: string;
        label: string;
        kind: TextureKind;
        svgText: string;
    }) => void;
}
export interface DeserializedEditorState {
    theme: ThemeName;
    connectionMode: ConnectionMode;
    bgColor: [number, number, number, number];
    fontColor: [number, number, number, number];
    camera: {
        panX: number;
        panY: number;
        zoom: number;
    };
}
/**
 * Restore graph state from a snapshot.
 *
 * Clears existing stores, re-creates all nodes and edges, patches mutable
 * fields, and rebuilds handle connection state from edges.
 *
 * Returns the editor-level state for the caller to apply (theme, colors,
 * camera, etc.).
 */
export declare function deserializeGraph(params: DeserializeGraphParams): DeserializedEditorState;
