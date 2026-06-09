/**
 * Manages an off-screen WebGL Framebuffer Object used for color-picking.
 * The FBO holds a color texture (for reading encoded node IDs) and a
 * depth renderbuffer. It must be resized whenever the canvas is resized.
 */
export class CustomFBO {
    gl;
    fbo;
    width;
    height;
    name = "CustomFBO";
    constructor(gl, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.allocate(width, height);
    }
    allocate(width, height) {
        throw new Error(`[${this.name}]: you must implement allocate function`);
    }
    bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.gl.viewport(0, 0, this.width, this.height);
    }
    unbind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    resize(width, height) {
        throw new Error(`[${this.name}]: you must implement resize function`);
    }
    destroy() {
        throw new Error(`[${this.name}]: you must implement destroy function`);
    }
}
//# sourceMappingURL=fbo.js.map