export class MsdfAtlas {
    gl;
    texture = null;
    glyphs = new Map();
    common = null;
    info = null;
    constructor(gl) {
        this.gl = gl;
    }
    async load(imageUrl, jsonUrl) {
        const [image, json] = await Promise.all([
            this.loadImage(imageUrl),
            fetch(jsonUrl).then((r) => r.json()),
        ]);
        this.common = json.common;
        this.info = json.info;
        for (const char of json.chars) {
            this.glyphs.set(char.id, char);
        }
        const gl = this.gl;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.texture = tex;
    }
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
}
export class MsdfTextRenderer {
    gl;
    program;
    locations;
    atlas;
    vertexBuffer;
    indexBuffer;
    // vertex: [x, y, u, v, r, g, b, a] = 8 floats per vertex -> 32 bytes
    vertexData;
    indexData;
    vertexCount = 0;
    indexCount = 0;
    maxQuads = 10000;
    constructor(gl, program, locations, atlas) {
        this.gl = gl;
        this.program = program;
        this.locations = locations;
        this.atlas = atlas;
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        this.vertexData = new Float32Array(this.maxQuads * 4 * 8);
        this.indexData = new Uint16Array(this.maxQuads * 6);
    }
    beginBatch() {
        this.vertexCount = 0;
        this.indexCount = 0;
    }
    addText(text, x, y, fontSize, r, g, b, a, align = 'left', baseline = 'alphabetic') {
        if (!this.atlas.common || !this.atlas.info)
            return;
        const scale = fontSize / this.atlas.info.size;
        const { scaleW, scaleH, lineHeight, base } = this.atlas.common;
        // Calculate width for alignment
        let totalWidth = 0;
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            const glyph = this.atlas.glyphs.get(code);
            if (glyph) {
                totalWidth += glyph.xadvance * scale;
            }
        }
        let cursorX = x;
        if (align === 'center')
            cursorX -= totalWidth / 2;
        else if (align === 'right')
            cursorX -= totalWidth;
        let cursorY = y;
        if (baseline === 'middle')
            cursorY -= (lineHeight / 2) * scale;
        else if (baseline === 'bottom')
            cursorY -= lineHeight * scale;
        else if (baseline === 'alphabetic')
            cursorY -= base * scale;
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            const glyph = this.atlas.glyphs.get(code);
            if (!glyph)
                continue;
            if (glyph.width > 0 && glyph.height > 0) {
                if (this.indexCount / 6 >= this.maxQuads) {
                    this.flush();
                }
                const x0 = cursorX + glyph.xoffset * scale;
                const y0 = cursorY + glyph.yoffset * scale;
                const x1 = x0 + glyph.width * scale;
                const y1 = y0 + glyph.height * scale;
                const u0 = glyph.x / scaleW;
                const v0 = glyph.y / scaleH;
                const u1 = (glyph.x + glyph.width) / scaleW;
                const v1 = (glyph.y + glyph.height) / scaleH;
                const vIdx = this.vertexCount;
                const iIdx = this.indexCount;
                // TL
                this.vertexData[vIdx * 8 + 0] = x0;
                this.vertexData[vIdx * 8 + 1] = y0;
                this.vertexData[vIdx * 8 + 2] = u0;
                this.vertexData[vIdx * 8 + 3] = v0;
                this.vertexData[vIdx * 8 + 4] = r;
                this.vertexData[vIdx * 8 + 5] = g;
                this.vertexData[vIdx * 8 + 6] = b;
                this.vertexData[vIdx * 8 + 7] = a;
                // TR
                this.vertexData[vIdx * 8 + 8] = x1;
                this.vertexData[vIdx * 8 + 9] = y0;
                this.vertexData[vIdx * 8 + 10] = u1;
                this.vertexData[vIdx * 8 + 11] = v0;
                this.vertexData[vIdx * 8 + 12] = r;
                this.vertexData[vIdx * 8 + 13] = g;
                this.vertexData[vIdx * 8 + 14] = b;
                this.vertexData[vIdx * 8 + 15] = a;
                // BR
                this.vertexData[vIdx * 8 + 16] = x1;
                this.vertexData[vIdx * 8 + 17] = y1;
                this.vertexData[vIdx * 8 + 18] = u1;
                this.vertexData[vIdx * 8 + 19] = v1;
                this.vertexData[vIdx * 8 + 20] = r;
                this.vertexData[vIdx * 8 + 21] = g;
                this.vertexData[vIdx * 8 + 22] = b;
                this.vertexData[vIdx * 8 + 23] = a;
                // BL
                this.vertexData[vIdx * 8 + 24] = x0;
                this.vertexData[vIdx * 8 + 25] = y1;
                this.vertexData[vIdx * 8 + 26] = u0;
                this.vertexData[vIdx * 8 + 27] = v1;
                this.vertexData[vIdx * 8 + 28] = r;
                this.vertexData[vIdx * 8 + 29] = g;
                this.vertexData[vIdx * 8 + 30] = b;
                this.vertexData[vIdx * 8 + 31] = a;
                this.indexData[iIdx + 0] = vIdx + 0;
                this.indexData[iIdx + 1] = vIdx + 1;
                this.indexData[iIdx + 2] = vIdx + 2;
                this.indexData[iIdx + 3] = vIdx + 0;
                this.indexData[iIdx + 4] = vIdx + 2;
                this.indexData[iIdx + 5] = vIdx + 3;
                this.vertexCount += 4;
                this.indexCount += 6;
            }
            cursorX += glyph.xadvance * scale;
        }
    }
    flush(camera, projMatrix) {
        if (this.indexCount === 0 || !this.atlas.texture)
            return;
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.subarray(0, this.vertexCount * 8), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData.subarray(0, this.indexCount), gl.DYNAMIC_DRAW);
        const stride = 32;
        gl.vertexAttribPointer(this.locations.a_Position, 2, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(this.locations.a_Position);
        gl.vertexAttribPointer(this.locations.a_TexCoord, 2, gl.FLOAT, false, stride, 8);
        gl.enableVertexAttribArray(this.locations.a_TexCoord);
        gl.vertexAttribPointer(this.locations.a_Color, 4, gl.FLOAT, false, stride, 16);
        gl.enableVertexAttribArray(this.locations.a_Color);
        if (camera && projMatrix) {
            gl.uniformMatrix4fv(this.locations.u_ProjMatrix, false, projMatrix.elements);
            gl.uniformMatrix4fv(this.locations.u_ViewMatrix, false, camera.getViewMatrix().elements);
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.atlas.texture);
        gl.uniform1i(this.locations.u_Atlas, 0);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
        this.vertexCount = 0;
        this.indexCount = 0;
    }
}
//# sourceMappingURL=msdf-text.js.map