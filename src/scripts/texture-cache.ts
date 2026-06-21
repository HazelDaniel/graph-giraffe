import { TextureSource } from "./types.js";
import { TextureRegistry } from "./texture-registry.js";

export interface CachedTexture {
  state: 'PENDING' | 'READY' | 'FAILED';
  texture: WebGLTexture | null;
  nativeWidth: number;
  nativeHeight: number;
  lastUsedFrame: number;
}

export class TextureCache {
  private gl: WebGL2RenderingContext;
  private cache = new Map<string, CachedTexture>();
  private uploadQueue: { id: string; image: HTMLImageElement }[] = [];
  
  private currentFrame: number = 0;
  
  // If we want to force redraws when promises resolve
  private onTextureLoaded: () => void;

  constructor(gl: WebGL2RenderingContext, onTextureLoaded: () => void) {
    this.gl = gl;
    this.onTextureLoaded = onTextureLoaded;
  }

  getTexture(textureId: string): CachedTexture | null {
    let entry = this.cache.get(textureId);
    
    if (!entry) {
      entry = {
        state: 'PENDING',
        texture: null,
        nativeWidth: 0,
        nativeHeight: 0,
        lastUsedFrame: this.currentFrame,
      };
      this.cache.set(textureId, entry);

      // Start loading
      const source = TextureRegistry.get(textureId);
      if (source) {
        // Parse SVG to extract dimensions and inject width/height
        const parser = new DOMParser();
        const doc = parser.parseFromString(source.svgText, "image/svg+xml");
        const svg = doc.documentElement;

        const viewBox = svg.getAttribute("viewBox");
        let nativeWidth = 96;
        let nativeHeight = 64;
        if (viewBox) {
          const parts = viewBox.split(/[ ,]+/);
          if (parts.length >= 4) {
            nativeWidth = parseFloat(parts[2]);
            nativeHeight = parseFloat(parts[3]);
          }
        }

        // High quality rasterization: scale 2x native
        const scale = 2;
        const width = nativeWidth * scale;
        const height = nativeHeight * scale;

        svg.setAttribute("width", width.toString());
        svg.setAttribute("height", height.toString());
        // We want the SVG to stretch to fill the offscreen canvas exactly
        svg.setAttribute("preserveAspectRatio", "none");
        
        const modifiedSvgText = new XMLSerializer().serializeToString(svg);

        // Instead of worker + createImageBitmap (which can fail on SVG blobs in some browsers),
        // we use standard Image() loading and queue it for budgeted WebGL upload.
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          this.uploadQueue.push({ id: textureId, image: img });
          // Call drawFrame to trigger upload processing
          this.onTextureLoaded();
        };
        img.onerror = (err) => {
          console.error(`Failed to rasterize texture ${textureId}:`, err);
          const failedEntry = this.cache.get(textureId);
          if (failedEntry) failedEntry.state = 'FAILED';
        };

        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(modifiedSvgText)}`;
      } else {
        entry.state = 'FAILED';
      }
    }

    entry.lastUsedFrame = this.currentFrame;

    if (entry.state === 'READY') {
      return entry;
    }

    // Return null while loading
    return null;
  }
  
  processUploads(): void {
    this.currentFrame++;
    
    // Process up to 2 WebGL uploads per frame
    const MAX_UPLOADS = 2;
    let uploadsDone = 0;
    
    while (this.uploadQueue.length > 0 && uploadsDone < MAX_UPLOADS) {
      const { id, image } = this.uploadQueue.shift()!;
      const entry = this.cache.get(id);
      if (entry && entry.state === 'PENDING') {
        const tex = this.gl.createTexture()!;
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.pixelStorei(this.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this.gl.NONE);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          0,
          this.gl.RGBA,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          image
        );
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        
        entry.texture = tex;
        entry.nativeWidth = image.width;
        entry.nativeHeight = image.height;
        entry.state = 'READY';
        
        uploadsDone++;
        this.onTextureLoaded();
      }
    }
    
    // LRU Eviction: delete textures not used in the last 600 frames (approx 10 seconds of active rendering)
    for (const [key, entry] of this.cache.entries()) {
      if (entry.state === 'READY' && (this.currentFrame - entry.lastUsedFrame > 600)) {
        if (entry.texture) {
          this.gl.deleteTexture(entry.texture);
        }
        this.cache.delete(key);
      }
    }
  }

  dispose() {
    this.uploadQueue = [];
    
    for (const entry of this.cache.values()) {
      if (entry.texture) {
        this.gl.deleteTexture(entry.texture);
      }
    }
    this.cache.clear();
  }
  invalidateAll(): void {
    for (const entry of this.cache.values()) {
      if (entry.texture) {
        this.gl.deleteTexture(entry.texture);
      }
    }
    this.cache.clear();
    this.uploadQueue = [];
    // Trigger redraw to reload missing textures
    this.onTextureLoaded();
  }
}
