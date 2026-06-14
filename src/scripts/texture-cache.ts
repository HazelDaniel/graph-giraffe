import { TextureSource } from './types.js';
import { TextureRegistry } from './texture-registry.js';

export interface CachedTexture {
  texture: WebGLTexture;
  nativeWidth: number;
  nativeHeight: number;
}

export class TextureCache {
  private gl: WebGL2RenderingContext;
  // key: "textureId", value: CachedTexture | Promise<CachedTexture>
  private cache = new Map<string, CachedTexture | Promise<CachedTexture>>();
  // If we want to force redraws when promises resolve
  private onTextureLoaded: () => void;

  constructor(gl: WebGL2RenderingContext, onTextureLoaded: () => void) {
    this.gl = gl;
    this.onTextureLoaded = onTextureLoaded;
  }

  getTexture(textureId: string): CachedTexture | null {
    const entry = this.cache.get(textureId);
    if (entry && !('then' in entry)) {
      return entry;
    }

    if (!entry) {
      // Start loading
      const source = TextureRegistry.get(textureId);
      if (source) {
        const promise = this.rasterize(source.svgText)
          .then((cached) => {
            this.cache.set(textureId, cached);
            this.onTextureLoaded();
            return cached;
          })
          .catch((err) => {
            console.error(`Failed to rasterize texture ${textureId}:`, err);
            this.cache.delete(textureId);
            throw err;
          });
        this.cache.set(textureId, promise);
      }
    }

    // Return null while loading
    return null;
  }

  private rasterize(svgText: string): Promise<CachedTexture> {
    return new Promise((resolve, reject) => {
      // Inject width and height to force crisp rasterization at native size
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const svg = doc.documentElement;
      
      const viewBox = svg.getAttribute('viewBox');
      let nativeWidth = 96;
      let nativeHeight = 64;
      if (viewBox) {
        const parts = viewBox.split(/[ ,]+/);
        if (parts.length >= 4) {
          nativeWidth = parseFloat(parts[2]);
          nativeHeight = parseFloat(parts[3]);
        }
      }
      
      svg.setAttribute('width', nativeWidth.toString());
      svg.setAttribute('height', nativeHeight.toString());
      const newSvgText = new XMLSerializer().serializeToString(svg);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const tex = this.gl.createTexture()!;
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        resolve({
          texture: tex,
          nativeWidth,
          nativeHeight
        });
      };
      img.onerror = reject;

      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(newSvgText)}`;
    });
  }

  dispose() {
    for (const [key, entry] of this.cache.entries()) {
      if (entry && !('then' in entry)) {
        this.gl.deleteTexture(entry.texture);
      }
    }
    this.cache.clear();
  }
}
