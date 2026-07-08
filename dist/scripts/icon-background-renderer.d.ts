import { Matrix4 } from '../vendor/cuon-matrix.js';
import { Camera } from "./camera";
import { GeometryType, IconBGShaderLocations } from "./types";
export declare class IconBackgroundRenderer {
    private gl;
    private program;
    private locations;
    private vertexBuffer;
    private indexBuffer;
    private vertexData;
    private indexData;
    private vertexCount;
    private indexCount;
    msdfFontSize: number | null;
    private maxQuads;
    private _currentZ;
    constructor(gl: WebGL2RenderingContext, program: WebGLProgram, locations: IconBGShaderLocations);
    beginBatch(): void;
    _setZ(z: number): void;
    addQuad(x: number, y: number, r: number, g: number, b: number, a: number, glyphWidth: number, glyphHeight: number, base: number, lineHeight: number, fontSize?: number, align?: "left" | "center" | "right", baseline?: "middle" | "bottom", geometry?: GeometryType, z?: number): void;
    flush(camera?: Camera, projMatrix?: Matrix4): void;
}
