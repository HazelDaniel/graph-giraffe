export class IconBackgroundRenderer {
    gl;
    program;
    locations;
    vertexBuffer;
    indexBuffer;
    vertexData;
    indexData;
    vertexCount = 0;
    indexCount = 0;
    msdfFontSize = null;
    maxQuads = 1000;
    constructor(gl, program, locations) {
        this.gl = gl;
        this.program = program;
        this.locations = locations;
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        this.vertexData = new Float32Array(this.maxQuads * 4 * 6);
        this.indexData = new Uint16Array(this.maxQuads * 6);
    }
    beginBatch() {
        this.vertexCount = 0;
        this.indexCount = 0;
    }
    addQuad(x, y, r, g, b, a, glyphWidth, glyphHeight, base, lineHeight, fontSize = 16, align = "left", baseline = "middle") {
        const QUAD_PADDING = 1.2;
        glyphWidth += QUAD_PADDING * 2;
        glyphHeight += QUAD_PADDING * 2;
        if (this.msdfFontSize === null)
            return;
        let scale = fontSize / this.msdfFontSize;
        // scale = 2;
        const dummyGlyphOffsetX = 1.5;
        const dummyGlyphOffsetY = 1.5;
        let cursorX = x;
        if (align === "center")
            cursorX -= glyphWidth / 2;
        else if (align === "right")
            cursorX -= glyphWidth;
        let cursorY = y;
        if (baseline === "middle")
            cursorY -= (lineHeight / 1.5) * scale;
        else if (baseline === "bottom")
            cursorY -= lineHeight * scale;
        else
            cursorY -= base * scale;
        let x0 = cursorX + dummyGlyphOffsetX * scale;
        let y0 = cursorY + dummyGlyphOffsetY * scale;
        let x1 = cursorX + glyphWidth * 3 * scale;
        let y1 = cursorY + glyphWidth * 3 * scale;
        const vIdx = this.vertexCount, iIdx = this.indexCount;
        this.vertexData[vIdx * 6 + 0] = x0;
        this.vertexData[vIdx * 6 + 1] = y0;
        // color-info
        this.vertexData[vIdx * 6 + 2] = r;
        this.vertexData[vIdx * 6 + 3] = g;
        this.vertexData[vIdx * 6 + 4] = b;
        this.vertexData[vIdx * 6 + 5] = a;
        this.vertexData[vIdx * 6 + 6] = x1;
        this.vertexData[vIdx * 6 + 7] = y0;
        // color-info
        this.vertexData[vIdx * 6 + 8] = r;
        this.vertexData[vIdx * 6 + 9] = g;
        this.vertexData[vIdx * 6 + 10] = b;
        this.vertexData[vIdx * 6 + 11] = a;
        this.vertexData[vIdx * 6 + 12] = x1;
        this.vertexData[vIdx * 6 + 13] = y1;
        // color-info
        this.vertexData[vIdx * 6 + 14] = r;
        this.vertexData[vIdx * 6 + 15] = g;
        this.vertexData[vIdx * 6 + 16] = b;
        this.vertexData[vIdx * 6 + 17] = a;
        this.vertexData[vIdx * 6 + 18] = x0;
        this.vertexData[vIdx * 6 + 19] = y1;
        // color-info
        this.vertexData[vIdx * 6 + 20] = r;
        this.vertexData[vIdx * 6 + 21] = g;
        this.vertexData[vIdx * 6 + 22] = b;
        this.vertexData[vIdx * 6 + 23] = a;
        this.indexData[iIdx + 0] = vIdx + 0;
        this.indexData[iIdx + 1] = vIdx + 1;
        this.indexData[iIdx + 2] = vIdx + 2;
        this.indexData[iIdx + 3] = vIdx + 0;
        this.indexData[iIdx + 4] = vIdx + 2;
        this.indexData[iIdx + 5] = vIdx + 3;
        this.vertexCount += 4;
        this.indexCount += 6;
        // console.log(this.vertexData, this.indexData);
    }
    flush(camera, projMatrix) {
        if (this.indexCount === 0)
            return;
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.subarray(0, this.vertexCount * 6), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData.subarray(0, this.indexCount), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.locations.a_Position, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, 0);
        gl.enableVertexAttribArray(this.locations.a_Position);
        gl.vertexAttribPointer(this.locations.a_Color, 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, Float32Array.BYTES_PER_ELEMENT * 2);
        gl.enableVertexAttribArray(this.locations.a_Color);
        if (camera && projMatrix) {
            gl.uniformMatrix4fv(this.locations.u_ProjMatrix, false, projMatrix.elements);
            gl.uniformMatrix4fv(this.locations.u_ViewMatrix, false, camera.getViewMatrix().elements);
        }
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
        this.vertexCount = 0;
        this.indexCount = 0;
    }
}
//# sourceMappingURL=icon-background-renderer.js.map