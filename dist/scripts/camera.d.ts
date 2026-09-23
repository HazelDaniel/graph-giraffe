import { Matrix4 } from '../vendor/cuon-matrix.js';
import { NodeEditor } from './node-editor.js';
/**
 * Manages all viewport camera state: pan (translation) and zoom (scale).
 * The view matrix produced here is applied per-frame as u_ViewMatrix in the shader.
 *
 * Coordinate convention: screen space has origin at top-left, y-down.
 * The orthographic projection handles the flip; the camera only deals in pixels.
 */
export declare class Camera {
    private readonly editor?;
    panX: number;
    panY: number;
    zoom: number;
    private _minZoom;
    private _maxZoom;
    private _animating;
    private _targetPanX;
    private _targetPanY;
    private _targetZoom;
    private _viewMatrix;
    constructor(editor?: NodeEditor | undefined);
    get minZoom(): number;
    get maxZoom(): number;
    setZoomRange(minZoom: number, maxZoom: number): void;
    private clampZoom;
    /** Translate the viewport by (dx, dy) in screen pixels. */
    pan(dx: number, dy: number): void;
    /**
     * Zoom toward/away from a specific screen point so that the world position
     * under the mouse cursor stays fixed after the zoom.
     */
    zoomAt(mouseX: number, mouseY: number, deltaY: number): void;
    /**
     * Whether a camera animation is currently in flight.
     */
    isAnimating(): boolean;
    /**
     * Immediately set the camera state and cancel any in-flight animation.
     */
    setState(panX: number, panY: number, zoom: number): void;
    /**
     * Convert a screen-space coordinate to a world-space coordinate.
     * Used to correctly place nodes when adding or dragging, regardless of pan/zoom.
     */
    screenToWorld(sx: number, sy: number): {
        x: number;
        y: number;
    };
    /**
     * Convert a world-space coordinate to a screen-space coordinate.
     * Used for floating DOM or Canvas overlay rendering.
     */
    worldToScreen(wx: number, wy: number): {
        x: number;
        y: number;
    };
    /**
     * Smoothly animate the camera to a target pan/zoom state.
     * The animation is driven by exponential easing in getViewMatrix(),
     * which is called every frame - no extra requestAnimationFrame needed.
     * User pan/zoom input cancels the animation.
     */
    animateTo(panX: number, panY: number, zoom: number): void;
    /**
     * Compute and return the current view matrix.
     * When animating, each frame moves 12% closer to the target,
     * creating a smooth exponential ease-out.
     */
    getViewMatrix(): Matrix4;
}
