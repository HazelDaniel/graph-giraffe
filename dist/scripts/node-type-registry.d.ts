import type { ConnectionMode, HandleSide, NodeData, NodePropType, NodeShaderLocations } from "./types.js";
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
export interface RoundedTriangleConfig {
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
export interface NodeOverlayConfig {
    titlePosition: "header" | "container-top" | "center";
    showTitle: boolean;
    showLockIcon: boolean;
    showAddIcon: boolean;
    showProps: boolean;
    showCompositionRef: boolean;
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
        sides: HandleSide[];
        multiConnect: boolean;
        outputSides?: HandleSide[];
        inputSides?: HandleSide[];
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
    renderMode?: "textured" | "rounded-rect" | "rounded-triangle" | "flat";
    renderConfig?: RoundedRectConfig | RoundedTriangleConfig | FlatConfig;
    rawDraw?: (ctx: NodeDrawContext) => boolean;
    drawOverlay?: (ctx: NodeOverlayContext) => void;
    overlayConfig?: NodeOverlayConfig;
    layoutChildren?: (container: NodeData, children: NodeData[], allNodes: Map<number, NodeData>) => void;
    contributesToChildWorldPosition?: boolean;
    toolbarActions?: string[];
    collapsedToolbarActions?: string[];
    collapsible?: boolean;
    lockable?: boolean;
    usesCanvasLabel?: boolean;
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
    isValidConnectionSide(type: string, side: HandleSide, role: "source" | "target"): boolean;
    getToolbarActions(type: string, isCollapsed?: boolean): string[];
    contributesToChildWorldPosition(type: string): boolean;
}
