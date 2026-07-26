import type { Camera } from "../scripts/camera.js";
import type { EdgeStore } from "../scripts/edge-store.js";
import type { NodeStore } from "../scripts/node-store.js";
export interface MinimapScene {
    store: NodeStore;
    edgeStore: EdgeStore;
    camera: Camera;
    canvas: HTMLCanvasElement;
}
export interface MinimapCanvasRect {
    width: number;
    height: number;
}
export interface MinimapBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}
export interface MinimapTransform {
    scale: number;
    offsetX: number;
    offsetY: number;
}
export interface MinimapNodeFrame {
    id: number;
    nodeType: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    selected: boolean;
    radius: number;
}
export interface MinimapEdgeFrame {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    stroke: string;
}
export interface MinimapFrame {
    bounds: MinimapBounds;
    transform: MinimapTransform;
    viewport: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    nodes: MinimapNodeFrame[];
    edges: MinimapEdgeFrame[];
}
export interface MinimapGraphFrame {
    bounds: MinimapBounds;
    transform: MinimapTransform;
    nodes: MinimapNodeFrame[];
    edges: MinimapEdgeFrame[];
}
export interface MinimapCameraState {
    panX: number;
    panY: number;
    zoom: number;
}
export interface MinimapNavigateDetail {
    worldX: number;
    worldY: number;
    bounds: MinimapBounds;
}
export declare function getViewportWorldRect(camera: MinimapCameraState, canvasRect: MinimapCanvasRect): MinimapBounds;
export declare function calculateMinimapBounds(store: NodeStore, camera: MinimapCameraState, canvasRect: MinimapCanvasRect): MinimapBounds;
export declare function createMinimapTransform(bounds: MinimapBounds, canvasRect: MinimapCanvasRect, padding?: number): MinimapTransform;
export declare function projectWorldPoint(worldX: number, worldY: number, bounds: MinimapBounds, transform: MinimapTransform): {
    x: number;
    y: number;
};
export declare function projectWorldRect(worldX: number, worldY: number, width: number, height: number, bounds: MinimapBounds, transform: MinimapTransform): {
    x: number;
    y: number;
    width: number;
    height: number;
};
export declare function computeCenteredCameraState(camera: MinimapCameraState, canvasRect: MinimapCanvasRect, worldX: number, worldY: number): MinimapCameraState;
export declare function computeCameraStateFromWorldPoint(camera: MinimapCameraState, canvasRect: MinimapCanvasRect, _bounds: MinimapBounds, worldX: number, worldY: number): MinimapCameraState;
export declare function buildMinimapGraphFrame(scene: MinimapScene, canvasRect?: MinimapCanvasRect): MinimapGraphFrame;
export declare function buildMinimapFrame(scene: MinimapScene, viewportAnchor?: {
    x: number;
    y: number;
}): MinimapFrame;
declare const MinimapBase: {
    new (): HTMLElement;
    prototype: HTMLElement;
};
export declare class GGMinimap extends MinimapBase {
    #private;
    private canvas;
    private ctx;
    private enabled;
    private scene;
    private graphRevision;
    private activePointerId;
    private activePointerAnchor;
    private frameCache;
    connectedCallback(): void;
    disconnectedCallback(): void;
    setEnabled(enabled: boolean): void;
    updateScene(scene: MinimapScene, graphRevision?: number): void;
    private render;
    private syncVisibility;
    private resizeCanvas;
    private renderScene;
    private clear;
    private drawFrame;
    private handlePointerDown;
    private handlePointerMove;
    private handlePointerUp;
    private handlePointerCancel;
    private navigateFromEvent;
}
declare global {
    interface HTMLElementTagNameMap {
        "gg-minimap": GGMinimap;
    }
}
export {};
