export interface CachedTexture {
    state: 'PENDING' | 'READY' | 'FAILED';
    texture: WebGLTexture | null;
    nativeWidth: number;
    nativeHeight: number;
    lastUsedFrame: number;
}
export declare class TextureCache {
    private gl;
    private cache;
    private uploadQueue;
    private currentFrame;
    private onTextureLoaded;
    constructor(gl: WebGL2RenderingContext, onTextureLoaded: () => void);
    getTexture(textureId: string): CachedTexture | null;
    processUploads(): void;
    dispose(): void;
    invalidateAll(): void;
}
