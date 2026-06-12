import { textureRegistry } from './texture-registry.js';
export class TextureService {
    gl;
    cache = new Map();
    activePromises = new Map();
    constructor(gl) {
        this.gl = gl;
    }
    /**
     * Retrieves a WebGLTexture for the given source ID and target dimensions.
     */
    async getTexture(textureId, width, height) {
        const source = textureRegistry.get(textureId);
        if (!source)
            throw new Error(`Texture source not found: ${textureId}`);
        const isPattern = source.kind === 'group-body' ||
            source.kind === 'composition-body' ||
            source.kind === 'composition-reference-body';
        const key = `${textureId}_${width}x${height}_${isPattern}`;
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        if (this.activePromises.has(key)) {
            return this.activePromises.get(key);
        }
        const promise = this.loadTexture(source.previewUrl ?? '', width, height, isPattern).then((tex) => {
            this.cache.set(key, tex);
            this.activePromises.delete(key);
            return tex;
        }).catch(err => {
            this.activePromises.delete(key);
            throw err;
        });
        this.activePromises.set(key, promise);
        return promise;
    }
    async loadTexture(url, width, height, isPattern) {
        if (!url)
            throw new Error('Missing texture URL');
        const img = await this.loadImage(url);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (isPattern) {
            // Create a pattern using the image's intrinsic size
            const pattern = ctx.createPattern(img, 'repeat');
            if (pattern) {
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, width, height);
            }
            else {
                ctx.drawImage(img, 0, 0, width, height);
            }
        }
        else {
            ctx.drawImage(img, 0, 0, width, height);
        }
        const gl = this.gl;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return tex;
    }
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
    dispose() {
        const gl = this.gl;
        for (const tex of this.cache.values()) {
            gl.deleteTexture(tex);
        }
        this.cache.clear();
    }
}
//# sourceMappingURL=texture-service.js.map