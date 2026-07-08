/**
 * Manages an off-screen WebGL Framebuffer Object used for color-picking.
 * The FBO holds a color texture (for reading encoded node IDs) and a
 * depth renderbuffer. It must be resized whenever the canvas is resized.
 */
export declare class CustomFBO {
    protected gl: WebGL2RenderingContext;
    protected fbo: WebGLFramebuffer;
    protected width: number;
    protected height: number;
    private name;
    constructor(gl: WebGL2RenderingContext, width: number, height: number);
    protected allocate(width: number, height: number): void;
    bind(): void;
    unbind(): void;
    resize(width: number, height: number): void;
    protected destroy(): void;
}
