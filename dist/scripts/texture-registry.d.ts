import { AddUploadedTextureParams, NodeTextureIds, NodeType, TextureKind, TextureSource, ThemeName } from "./types.js";
export declare const DEFAULT_TEXTURE_SKINS: Record<TextureKind, string[]>;
/**
 * Durable texture source registry.
 *
 * It owns SVG source metadata and preview URLs, but deliberately does not
 * create WebGLTexture objects. Runtime upload/caching belongs to rendering.
 */
declare class textureRegistry {
    sources: Map<string, TextureSource>;
    ownedPreviewUrls: Set<string>;
    private theme_;
    private static _instance;
    static get instance(): textureRegistry;
    set theme(newTheme: ThemeName);
    private updatePreviewUrls;
    private getStrokeColorForKind;
    private getThemeColorForKind;
    getResolvedSvgText(source: TextureSource): string;
    constructor(defaultSources?: TextureSource[]);
    all(): TextureSource[];
    byKind(kind: TextureKind): TextureSource[];
    get(id: string): TextureSource | undefined;
    has(id: string): boolean;
    addUploaded(params: AddUploadedTextureParams): TextureSource;
    removeUploaded(id: string): boolean;
    dispose(): void;
    private registerDefault;
    private ensureUniqueId;
}
export declare function getDefaultTextureIds(nodeType: NodeType): NodeTextureIds;
export declare function getCompositionReferenceTextureIds(): NodeTextureIds;
export declare function generateTetureSkinOption(kind: TextureKind, label: string, index: number, id: string): TextureSource;
export declare const TextureRegistry: textureRegistry;
export {};
