import type { ConnectionMode, NodeData, NodePropType, NodeShaderLocations } from "./types.js";
import type { MsdfTextRenderer } from "./msdf-text.js";
import type { IconBackgroundRenderer } from "./icon-background-renderer.js";
import type { TextureCache } from "./texture-cache.js";
import type { Camera } from "./camera.js";
export interface RoundedRectConfig {
    fillColor: [number, number, number, number];
    borderColor: [number, number, number, number];
    borderWidth: number;
    radius: number;
}
export interface FlatConfig {
    color: [number, number, number, number];
}
export interface RendererDrawAPI {
    setModelMatrix(x: number, y: number, w: number, h: number, z: number): void;
    getTextureCache(): TextureCache;
    getLocations(): NodeShaderLocations;
    getCamera(): Camera;
    getGL(): WebGL2RenderingContext;
}
export interface NodeDrawContext {
    gl: WebGL2RenderingContext;
    node: NodeData;
    worldX: number;
    worldY: number;
    z: number;
    renderer: RendererDrawAPI;
}
export interface NodeOverlayContext {
    node: NodeData;
    worldX: number;
    worldY: number;
    z: number;
    isCollapsed: boolean;
    textRenderer: MsdfTextRenderer;
    iconRenderer: MsdfTextRenderer;
    iconBackgroundRenderer: IconBackgroundRenderer;
    fontColor: [number, number, number];
}
export interface NodeTypeDescriptor {
    type: string;
    category: "leaf" | "container";
    zTier: number;
    defaultSize: {
        width: number;
        height: number;
    };
    collapsedSize?: {
        width: number;
        height: number;
    };
    handles: {
        always: boolean;
        sides: ("left" | "right")[];
        multiConnect: boolean;
    };
    isConnectionCandidate: (connectionMode: ConnectionMode) => boolean;
    allowedParents: string[] | null;
    canBeRoot: boolean;
    defaultTextureIds: {
        body: string;
        head: string;
    };
    textureKinds?: string[];
    createDefaultProps?: () => NodePropType | undefined;
    calculateHeight?: (node: NodeData) => number;
    renderMode?: "textured" | "rounded-rect" | "flat";
    renderConfig?: RoundedRectConfig | FlatConfig;
    rawDraw?: (ctx: NodeDrawContext) => boolean;
    drawOverlay?: (ctx: NodeOverlayContext) => void;
    layoutChildren?: (container: NodeData, children: NodeData[], allNodes: Map<number, NodeData>) => void;
    contributesToChildWorldPosition?: boolean;
    toolbarActions?: string[];
    collapsible?: boolean;
    lockable?: boolean;
}
export declare class NodeTypeRegistry {
    private descriptors;
    private containerTypes;
    private leafTypes;
    register(descriptor: NodeTypeDescriptor): void;
    get(type: string): NodeTypeDescriptor | undefined;
    has(type: string): boolean;
    getAll(): IterableIterator<NodeTypeDescriptor>;
    isContainer(type: string): boolean;
    isLeaf(type: string): boolean;
    getZTier(type: string): number;
    getDefaultSize(type: string, collapsed?: boolean): {
        width: number;
        height: number;
    };
    canReparentTo(childType: string, parentType: string | null): boolean;
    isConnectionCandidate(type: string, connectionMode: ConnectionMode): boolean;
    hasHandles(type: string, connectionMode: ConnectionMode): boolean;
    allowsMultiConnect(type: string): boolean;
    contributesToChildWorldPosition(type: string): boolean;
}
