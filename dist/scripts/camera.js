import { Matrix4 } from '../vendor/cuon-matrix.js';
/**
 * Manages all viewport camera state: pan (translation) and zoom (scale).
 * The view matrix produced here is applied per-frame as u_ViewMatrix in the shader.
 *
 * Coordinate convention: screen space has origin at top-left, y-down.
 * The orthographic projection handles the flip; the camera only deals in pixels.
 */
export class Camera {
    editor;
    panX = 0;
    panY = 0;
    zoom = 1;
    _animating = false;
    _targetPanX = 0;
    _targetPanY = 0;
    _targetZoom = 1;
    _viewMatrix = new Matrix4();
    constructor(editor) {
        this.editor = editor;
    }
    /** Translate the viewport by (dx, dy) in screen pixels. */
    pan(dx, dy) {
        this._animating = false;
        this.panX += dx;
        this.panY += dy;
    }
    /**
     * Zoom toward/away from a specific screen point so that the world position
     * under the mouse cursor stays fixed after the zoom.
     */
    zoomAt(mouseX, mouseY, deltaY) {
        this._animating = false;
        const sensitivity = 0.001;
        const factor = 1.0 - deltaY * sensitivity;
        const newZoom = Math.max(0.1, Math.min(this.zoom * factor, 5.0));
        const scaleChange = newZoom / this.zoom;
        // Adjust pan so the point under the cursor remains stationary
        this.panX = mouseX - (mouseX - this.panX) * scaleChange;
        this.panY = mouseY - (mouseY - this.panY) * scaleChange;
        this.zoom = newZoom;
    }
    /**
     * Immediately set the camera state and cancel any in-flight animation.
     */
    setState(panX, panY, zoom) {
        this._animating = false;
        this.panX = panX;
        this.panY = panY;
        this.zoom = Math.max(0.1, Math.min(zoom, 5.0));
        if (this.editor) {
            this.editor.cameraDirty = true;
        }
    }
    /**
     * Convert a screen-space coordinate to a world-space coordinate.
     * Used to correctly place nodes when adding or dragging, regardless of pan/zoom.
     */
    screenToWorld(sx, sy) {
        return {
            x: (sx - this.panX) / this.zoom,
            y: (sy - this.panY) / this.zoom,
        };
    }
    /**
     * Convert a world-space coordinate to a screen-space coordinate.
     * Used for floating DOM or Canvas overlay rendering.
     */
    worldToScreen(wx, wy) {
        return {
            x: wx * this.zoom + this.panX,
            y: wy * this.zoom + this.panY,
        };
    }
    /**
     * Smoothly animate the camera to a target pan/zoom state.
     * The animation is driven by exponential easing in getViewMatrix(),
     * which is called every frame - no extra requestAnimationFrame needed.
     * User pan/zoom input cancels the animation.
     */
    animateTo(panX, panY, zoom) {
        this._targetPanX = panX;
        this._targetPanY = panY;
        this._targetZoom = Math.max(0.1, Math.min(zoom, 5.0));
        this._animating = true;
        if (this.editor)
            this.editor.cameraDirty = true;
    }
    /**
     * Compute and return the current view matrix.
     * When animating, each frame moves 12% closer to the target,
     * creating a smooth exponential ease-out.
     */
    getViewMatrix() {
        if (this._animating) {
            const ease = 0.10;
            this.panX += (this._targetPanX - this.panX) * ease;
            this.panY += (this._targetPanY - this.panY) * ease;
            this.zoom += (this._targetZoom - this.zoom) * ease;
            if (Math.abs(this.panX - this._targetPanX) < 0.5 &&
                Math.abs(this.panY - this._targetPanY) < 0.5 &&
                Math.abs(this.zoom - this._targetZoom) < 0.001) {
                this.panX = this._targetPanX;
                this.panY = this._targetPanY;
                this.zoom = this._targetZoom;
                if (this.editor)
                    this.editor.cameraDirty = false;
                this._animating = false;
            }
        }
        this._viewMatrix.setIdentity();
        this._viewMatrix.translate(this.panX, this.panY, 0);
        this._viewMatrix.scale(this.zoom, this.zoom, 1.0);
        return this._viewMatrix;
    }
}
//# sourceMappingURL=camera.js.map