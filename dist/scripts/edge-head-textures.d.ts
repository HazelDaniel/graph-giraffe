import { EdgeHeadSkinId } from './types.js';
export interface EdgeHeadTextureRegion {
    u0: number;
    v0: number;
    u1: number;
    v1: number;
}
export declare class EdgeHeadTextureLibrary {
    private gl;
    readonly texture: WebGLTexture;
    private regions;
    constructor(gl: WebGL2RenderingContext);
    getRegion(skinId: EdgeHeadSkinId): EdgeHeadTextureRegion;
    private buildRegion;
}
