import { CustomFBO } from "./fbo.js";
/**
 * Manages an off-screen WebGL Framebuffer Object used for color-picking.
 * The FBO holds a color texture (for reading encoded node IDs) and a
 * depth renderbuffer. It must be resized whenever the canvas is resized.
 */
export declare class PickFBO extends CustomFBO {
    protected gl: WebGL2RenderingContext;
    protected fbo: WebGLFramebuffer;
    private texture;
    private renderBuffer;
    constructor(gl: WebGL2RenderingContext, width: number, height: number);
    protected allocate(width: number, height: number): void;
    bind(): void;
    unbind(): void;
    /**
     * Read one pixel from the pick texture at canvas coordinates (x, y).
     * Note: WebGL's origin is bottom-left, so y is flipped.
     * Must be called while the FBO is bound.
     */
    readPixel(x: number, y: number): Uint8Array;
    resize(width: number, height: number): void;
    destroy(): void;
}
