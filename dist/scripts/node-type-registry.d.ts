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
export interface DomNodeViewContext {
    node: NodeData;
    element: HTMLElement;
    worldX: number;
    worldY: number;
    width: number;
    height: number;
    isCollapsed: boolean;
    isSelected: boolean;
    isLocked: boolean;
    isDropTarget: boolean;
    /**
     * Resolve any node by id (used to show cross-references such as a subgraph
     * clone's original label). Undefined when the layer has no store access.
     */
    getNode?: (id: number) => NodeData | undefined;
}
/**
 * Declarative DOM rendering hook for a node type.
 *
 * When a descriptor sets `renderMode: "dom"`, the editor instantiates a DOM
 * view per node via `createView`, keeps it in sync via `updateView`, and
 * tears it down via `destroyView`. The view is purely presentational:
 * hit-testing, dragging, handles and connection routing keep flowing through
 * the WebGL pipeline (GPU picking stays authoritative), so views must leave
 * pointer events alone (`pointer-events: none` is applied by the layer).
 */
export interface DomNodeRenderer {
    createView(ctx: DomNodeViewContext): HTMLElement;
    updateView?(ctx: DomNodeViewContext): void;
    destroyView?(ctx: DomNodeViewContext): void;
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
    renderMode?: "textured" | "rounded-rect" | "rounded-triangle" | "flat" | "dom";
    renderConfig?: RoundedRectConfig | RoundedTriangleConfig | FlatConfig;
    rawDraw?: (ctx: NodeDrawContext) => boolean;
    drawOverlay?: (ctx: NodeOverlayContext) => void;
    overlayConfig?: NodeOverlayConfig;
    /** DOM rendering hook — required when `renderMode` is `"dom"`. */
    domRenderer?: DomNodeRenderer;
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
    private renderMode;
    /**
     * Bind the registry to an editor-wide rendering mode. Once set, `register`
     * and `replace` enforce "replacing, not additive": in `"dom"` mode every
     * registered type must be DOM-backed, and in `"webgl"` mode a DOM descriptor
     * is rejected. This is what keeps the two pipelines from coexisting.
     */
    setRenderMode(renderMode: "webgl" | "dom"): void;
    private assertMode;
    register(descriptor: NodeTypeDescriptor): void;
    /**
     * Replace an already-registered descriptor (or add a new one). DOM plugins
     * use this to swap a built-in WebGL type for a DOM-backed descriptor under
     * the SAME type name, so snapshots stay portable across rendering modes.
     */
    replace(descriptor: NodeTypeDescriptor): void;
    private put;
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
    /** Whether a type's visual body is rendered as a DOM element (renderMode "dom"). */
    isDomRendered(type: string): boolean;
    getDomRenderer(type: string): DomNodeRenderer | undefined;
}
