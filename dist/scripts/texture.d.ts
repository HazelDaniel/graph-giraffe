import { NodeHandleData, NodeType, ThemeName, ThemeStyle } from "./types.js";
export interface CompositionReferencePreviewChild {
    text: string;
    width: number;
    height: number;
}
export declare function drawHandle(ctx: CanvasRenderingContext2D, handle: NodeHandleData, x: number, y: number): void;
export declare const NODE_THEMES: Record<ThemeName, ThemeStyle>;
export declare const G_NODE_THEMES: Record<ThemeName, ThemeStyle>;
export declare const C_NODE_THEMES: Record<ThemeName, ThemeStyle>;
export declare const CR_NODE_THEMES: Record<ThemeName, ThemeStyle>;
/**
 * Renders node UI into an off-screen 2D canvas, then uploads it as a WebGL texture.
 * The caller is responsible for deleting the returned texture when the node is destroyed.
 */
export declare function createOverlayTexture(gl: WebGL2RenderingContext, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, text: string, width: number, height: number, theme?: ThemeName, nodeType?: NodeType, isCollapsed?: boolean, compositionReferenceChildren?: CompositionReferencePreviewChild[] | null): WebGLTexture;
