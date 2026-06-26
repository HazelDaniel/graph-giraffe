import { Camera } from "./camera";
import { GeometryType, IconBGShaderLocations } from "./types";

const SHAPE_ENUM: Record<GeometryType, number> = {
  square: 0,
  circle: 1,
  "rounded-square": 2,
};

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
    // 11 floats per vertex: x, y, r, g, b, a, shape, bboxMinX, bboxMinY, bboxMaxX, bboxMaxY
    this.vertexData = new Float32Array(this.maxQuads * 4 * 11);
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
    align: "left" | "center" | "right" = "left",
    baseline: "middle" | "bottom" = "bottom",
    geometry: GeometryType = "square"
  ) {
    if (this.msdfFontSize === null) return;
    const scale = fontSize * 2 / this.msdfFontSize;

    const scaledWidth = glyphWidth * scale;
    const scaledHeight = glyphHeight * scale;
    const padding = 2.8;

    let cursorX = x;
    if (align === "center") cursorX -= scaledWidth / 2;
    else if (align === "right") cursorX -= scaledWidth;

    let cursorY = y;
    if (baseline === "middle") cursorY = cursorY - ((lineHeight * (padding / glyphHeight)) / 2) * scale;
    else if (baseline === "bottom") cursorY = cursorY - (lineHeight * (padding / glyphHeight)) * scale;
    else cursorY -= base * scale;

    const x0 = cursorX - padding;
    const y0 = cursorY - padding;
    const x1 = cursorX + scaledWidth + padding;
    const y1 = cursorY + scaledHeight + padding;

    const shapeVal = SHAPE_ENUM[geometry];
    const vIdx = this.vertexCount,
      iIdx = this.indexCount;

    const stride = 11;
    // All 4 vertices share the same bbox and shape
    const bboxData = [x0, y0, x1, y1]; // min.x, min.y, max.x, max.y

    for (let i = 0; i < 4; i++) {
      const vOffset = (vIdx + i) * stride;
      // Position: corner coordinates
      if (i === 0) { this.vertexData[vOffset + 0] = x0; this.vertexData[vOffset + 1] = y0; }
      else if (i === 1) { this.vertexData[vOffset + 0] = x1; this.vertexData[vOffset + 1] = y0; }
      else if (i === 2) { this.vertexData[vOffset + 0] = x1; this.vertexData[vOffset + 1] = y1; }
      else { this.vertexData[vOffset + 0] = x0; this.vertexData[vOffset + 1] = y1; }

      // Color (r, g, b, a)
      this.vertexData[vOffset + 2] = r;
      this.vertexData[vOffset + 3] = g;
      this.vertexData[vOffset + 4] = b;
      this.vertexData[vOffset + 5] = a;

      // Shape
      this.vertexData[vOffset + 6] = shapeVal;

      // BBox min (x0, y0)
      this.vertexData[vOffset + 7] = x0;
      this.vertexData[vOffset + 8] = y0;

      // BBox max (x1, y1)
      this.vertexData[vOffset + 9] = x1;
      this.vertexData[vOffset + 10] = y1;
    }

    this.indexData[iIdx + 0] = vIdx + 0;
    this.indexData[iIdx + 1] = vIdx + 1;
    this.indexData[iIdx + 2] = vIdx + 2;
    this.indexData[iIdx + 3] = vIdx + 0;
    this.indexData[iIdx + 4] = vIdx + 2;
    this.indexData[iIdx + 5] = vIdx + 3;

    this.vertexCount += 4;
    this.indexCount += 6;
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
      this.vertexData.subarray(0, this.vertexCount * 11),
      gl.DYNAMIC_DRAW
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      this.indexData.subarray(0, this.indexCount),
      gl.DYNAMIC_DRAW
    );

    const stride = Float32Array.BYTES_PER_ELEMENT * 11;

    // a_Position: 2 floats (x, y) at offset 0
    gl.vertexAttribPointer(
      this.locations.a_Position,
      2,
      gl.FLOAT,
      false,
      stride,
      0
    );
    gl.enableVertexAttribArray(this.locations.a_Position);

    // a_Color: 4 floats (r, g, b, a) at offset 2
    gl.vertexAttribPointer(
      this.locations.a_Color,
      4,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 2
    );
    gl.enableVertexAttribArray(this.locations.a_Color);

    // a_Shape: 1 float at offset 6
    gl.vertexAttribPointer(
      this.locations.a_Shape,
      1,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 6
    );
    gl.enableVertexAttribArray(this.locations.a_Shape);

    // a_BBoxMin: 2 floats (x0, y0) at offset 7
    gl.vertexAttribPointer(
      this.locations.a_BBoxMin,
      2,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 7
    );
    gl.enableVertexAttribArray(this.locations.a_BBoxMin);

    // a_BBoxMax: 2 floats (x1, y1) at offset 9
    gl.vertexAttribPointer(
      this.locations.a_BBoxMax,
      2,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 9
    );
    gl.enableVertexAttribArray(this.locations.a_BBoxMax);

    if (camera && projMatrix) {
      gl.uniformMatrix4fv(
        this.locations.u_ViewMatrix,
        false,
        camera.getViewMatrix().elements
      );
      gl.uniformMatrix4fv(
        this.locations.u_ProjMatrix,
        false,
        projMatrix.elements
      );
    }

    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

    this.vertexCount = 0;
    this.indexCount = 0;
  }
}
