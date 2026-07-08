import { BGGeometryMeshType, GeometryMeshType } from "./types.js";
/**
 * Owns the WebGL vertex and index buffers for a given mesh shape.
 * Currently supports 'rounded-square' (a unit quad from (0,0) to (1,1)).
 */
export declare class GeometryNode {
    private gl;
    vertexBuffer: WebGLBuffer | null;
    indexBuffer: WebGLBuffer | null;
    constructor(gl: WebGL2RenderingContext, meshType: GeometryMeshType);
    private generateSquareMesh;
}
/**
 * Owns the WebGL vertex and index buffers for a given mesh shape.
 * Currently supports 'dotted' (a dotted bg pattern).
 */
export declare class BGGeometryNode {
    private gl;
    private readonly canvas;
    vertexBuffer: WebGLBuffer | null;
    length: number;
    primitiveType: number;
    constructor(gl: WebGL2RenderingContext, meshType: BGGeometryMeshType, canvas: HTMLCanvasElement);
    private generateDotMesh;
    private generateGridMesh;
}
