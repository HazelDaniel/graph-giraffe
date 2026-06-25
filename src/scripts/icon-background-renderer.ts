import { Camera } from "./camera";
import { IconBGShaderLocations } from "./types";

export class IconBackgroundRenderer {
  private vertexBuffer: WebGLBuffer;
  private indexBuffer: WebGLBuffer;

  private vertexData: Float32Array;
  private indexData: Uint16Array;

  private vertexCount = 0;
  private indexCount = 0;
  public msdfFontSize: number | null = null;
  private maxQuads: number = 1000;

  constructor(
    private gl: WebGL2RenderingContext,
    private program: WebGLProgram,
    private locations: IconBGShaderLocations
  ) {
    this.vertexBuffer = gl.createBuffer()!;
    this.indexBuffer = gl.createBuffer()!;
    this.vertexData = new Float32Array(this.maxQuads * 4 * 6);
    this.indexData = new Uint16Array(this.maxQuads * 6);
  }

  beginBatch(): void {
    this.vertexCount = 0;
    this.indexCount = 0;
  }

  addQuad(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a: number,
    glyphWidth: number,
    glyphHeight: number,
    base: number,
    lineHeight: number,
    fontSize: number = 16,
    align: "left" | "center" | "right" = "center",
    baseline: "middle" | "bottom" = "middle"
  ) {
    const QUAD_PADDING = 1;
    glyphWidth += QUAD_PADDING * 2;
    glyphHeight += QUAD_PADDING * 2;

    if (this.msdfFontSize === null) return;
    let scale = fontSize / this.msdfFontSize;
    scale = 2;
    const dummyGlyphOffsetX = 1.5;
    const dummyGlyphOffsetY = 1.5;
    let cursorX = x;

    if (align === "center") cursorX -= glyphWidth / 2;
    else if (align === "right") cursorX -= glyphWidth;

    let cursorY = y;
    if (baseline === "middle") cursorY -= (lineHeight / 2) * scale;
    else if (baseline === "bottom") cursorY -= lineHeight * scale;
    else cursorY -= base * scale;

    let x0 = cursorX + QUAD_PADDING + dummyGlyphOffsetX * scale;
    let y0 = cursorY + QUAD_PADDING + dummyGlyphOffsetY * scale;
    let x1 = cursorX + QUAD_PADDING + glyphWidth * scale;
    let y1 = cursorY + QUAD_PADDING + glyphHeight * scale;

    const vIdx = this.vertexCount,
      iIdx = this.indexCount;

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

  flush(camera?: Camera, projMatrix?: Matrix4): void {
    if (this.indexCount === 0) return;

    const gl = this.gl;
    gl.useProgram(this.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.vertexData.subarray(0, this.vertexCount * 6),
      gl.DYNAMIC_DRAW
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      this.indexData.subarray(0, this.indexCount),
      gl.DYNAMIC_DRAW
    );

    gl.vertexAttribPointer(
      this.locations.a_Position,
      2,
      gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 6,
      0
    );
    gl.enableVertexAttribArray(this.locations.a_Position);

    gl.vertexAttribPointer(
      this.locations.a_Color,
      4,
      gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 6,
      Float32Array.BYTES_PER_ELEMENT * 2
    );
    gl.enableVertexAttribArray(this.locations.a_Color);

    if (camera && projMatrix) {
      gl.uniformMatrix4fv(
        this.locations.u_ProjMatrix,
        false,
        projMatrix.elements
      );
      gl.uniformMatrix4fv(
        this.locations.u_ViewMatrix,
        false,
        camera.getViewMatrix().elements
      );
    }

    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

    this.vertexCount = 0;
    this.indexCount = 0;
  }
}
