import { NodeShaderLocations, BGShaderLocations, MSDFShaderLocations, IconBGShaderLocations } from "./types.js";
/**
 * Compiles vertex and fragment shaders, links them into a program, and returns it.
 * Throws a descriptive Error on any compilation or linking failure.
 */
export declare function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram;
/**
 * Queries and validates all attribute and uniform locations for the program.
 * Throws if any location is invalid.
 */
export declare function getShaderLocations(gl: WebGL2RenderingContext, program: WebGLProgram): NodeShaderLocations;
export declare function getBGShaderLocations(gl: WebGL2RenderingContext, program: WebGLProgram): BGShaderLocations;
export declare function getMSDFShaderLocations(gl: WebGL2RenderingContext, program: WebGLProgram): MSDFShaderLocations;
export declare function getIconBGLocations(gl: WebGL2RenderingContext, program: WebGLProgram): IconBGShaderLocations;
