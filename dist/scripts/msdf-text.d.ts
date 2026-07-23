import { MSDFShaderLocations } from "./types.js";
import { Camera } from "./camera.js";
declare class Matrix4 {
    elements: Float32Array;
    setIdentity(): Matrix4;
    translate(x: number, y: number, z: number): Matrix4;
    scale(x: number, y: number, z: number): Matrix4;
    setOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
}
export interface GlyphMetrics {
    id: number;
    width: number;
    height: number;
    xoffset: number;
    yoffset: number;
    xadvance: number;
    x: number;
    y: number;
}
export interface AtlasJson {
    common: {
        lineHeight: number;
        base: number;
        scaleW: number;
        scaleH: number;
    };
    chars: GlyphMetrics[];
    distanceField: {
        distanceRange: number;
    };
    info: {
        size: number;
    };
}
export declare class MsdfAtlas {
    private gl;
    texture: WebGLTexture | null;
    glyphs: Map<number, GlyphMetrics>;
    common: AtlasJson["common"] | null;
    info: AtlasJson["info"] | null;
    pxRange: number;
    constructor(gl: WebGL2RenderingContext);
    load(imageUrl: string, jsonUrl: string): Promise<void>;
    private loadImage;
}
export declare class MsdfTextRenderer {
    private gl;
    private program;
    private locations;
    private atlas;
    private vertexBuffer;
    private indexBuffer;
    private vertexData;
    private indexData;
    private vertexCount;
    private indexCount;
    private maxQuads;
    private _currentZ;
    constructor(gl: WebGL2RenderingContext, program: WebGLProgram, locations: MSDFShaderLocations, atlas: MsdfAtlas);
    beginBatch(): void;
    _setZ(z: number): void;
    addText(text: string, x: number, y: number, fontSize: number, r: number, g: number, b: number, a: number, align?: "left" | "center" | "right", baseline?: "top" | "middle" | "bottom" | "alphabetic"): void;
    flush(camera?: Camera, projMatrix?: Matrix4): void;
}
export {};
