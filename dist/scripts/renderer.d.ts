import { NodeShaderLocations, BGShaderLocations, ConnectionPreviewData } from "./types.js";
import { BGGeometryNode, GeometryNode } from "./geometry.js";
import { Camera } from "./camera.js";
import { EdgeStore } from "./edge-store.js";
import { NodeStore } from "./node-store.js";
import { MsdfAtlas } from "./msdf-text.js";
import type { NodeTypeRegistry } from "./node-type-registry.js";
/**
 * Owns the WebGL draw loop and all rendering logic.
 * It knows nothing about input events or UI — it only reads Camera and NodeStore state.
 */
export declare class Renderer {
    private gl;
    private canvas;
    private bgCanvas;
    private program;
    private locations;
    private geometry;
    private bgGeometry;
    private store;
    private edgeStore;
    private camera;
    private bgProgram;
    private bgLocations;
    private labelCanvas;
    private getConnectionPreview;
    /** Callback so Renderer never stores bgColor itself — it belongs to the editor. */
    private getBgColor;
    private getFontColor;
    private getSelectedNodeIds;
    private onFrame;
    private msdfProgram;
    private iconBGProgram;
    private msdfAtlas;
    private iconAtlas;
    private registry?;
    private modelMatrix;
    private projMatrix;
    constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, bgCanvas: HTMLCanvasElement, program: WebGLProgram, locations: NodeShaderLocations, geometry: GeometryNode, bgGeometry: BGGeometryNode, store: NodeStore, edgeStore: EdgeStore, camera: Camera, bgProgram: WebGLProgram, bgLocations: BGShaderLocations, labelCanvas: HTMLCanvasElement, getConnectionPreview: () => ConnectionPreviewData | null, 
    /** Callback so Renderer never stores bgColor itself — it belongs to the editor. */
    getBgColor: () => [number, number, number, number], getFontColor: () => [number, number, number, number], getSelectedNodeIds: () => Set<number>, onFrame: () => void, msdfProgram: WebGLProgram, iconBGProgram: WebGLProgram, msdfAtlas: MsdfAtlas, iconAtlas: MsdfAtlas, registry?: NodeTypeRegistry | undefined);
    private textRenderer;
    private iconRenderer;
    private iconBackgroundRenderer;
    private labelCtx;
    private edgeVertexBuffer;
    private edgeHeadBuffer;
    private edgeHeadTextures;
    private edgeFrame;
    private textureCache;
    isZooming: boolean;
    private dpr;
    /** Call once after each canvas resize to update the orthographic projection. */
    resize(width: number, height: number, dpr?: number): void;
    /** Start the RAF-driven render loop. */
    startLoop(): void;
    private tick;
    invalidateTextures(): void;
    private drawFrame;
    private drawOverlay;
    private drawConnectionPreview;
    private drawEdgeLabels;
    private isRectInViewport;
    private drawGroupLabels;
    private drawHandles;
    private drawEdges;
    private drawSingleEdge;
    private buildHeadQuadVertices;
    private bindEdgeVertexBuffer;
    private parseColor;
    private drawBGFrame;
    /**
     * Draw all visible nodes.
     * @param picking — when true, each node is drawn as a flat pick-color silhouette
     *                  (blend disabled, no texture) for the off-screen pick render pass.
     */
    drawNodes(picking: boolean): void;
    /**
     * Draw all visible nodes.
     * @param picking — when true, each node is drawn as a flat pick-color silhouette
     *                  (blend disabled, no texture) for the off-screen pick render pass.
     */
    drawBG(picking: boolean): void;
    private drawNode;
    private getDrawAPI;
    private drawGenericRoundedRect;
    private drawBranchNode;
    private drawSubgraphNode;
    private drawHubNode;
    private setModelMatrix;
}
