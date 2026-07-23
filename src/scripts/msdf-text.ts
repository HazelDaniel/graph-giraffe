import { MSDFShaderLocations } from "./types.js";
import { Camera } from "./camera.js";
declare class Matrix4 {
  elements: Float32Array;
  setIdentity(): Matrix4;
  translate(x: number, y: number, z: number): Matrix4;
  scale(x: number, y: number, z: number): Matrix4;
  setOrtho(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
  ): Matrix4;
}

export interface GlyphMetrics {
  id: number;
  width: number;
  height: number;
  xoffset: number;
  yoffset: number;
  xadvance: number;
  x: number;
  y: number;
}

export interface AtlasJson {
  common: { lineHeight: number; base: number; scaleW: number; scaleH: number };
  chars: GlyphMetrics[];
  distanceField: { distanceRange: number };
  info: { size: number };
}

export class MsdfAtlas {
  public texture: WebGLTexture | null = null;
  public glyphs = new Map<number, GlyphMetrics>();
  public common: AtlasJson["common"] | null = null;
  public info: AtlasJson["info"] | null = null;
  public pxRange: number = 4.0;

  constructor(private gl: WebGL2RenderingContext) {}

  async load(imageUrl: string, jsonUrl: string): Promise<void> {
    const [image, json] = await Promise.all([
      this.loadImage(imageUrl),
      fetch(jsonUrl).then((r) => r.json() as Promise<AtlasJson>),
    ]);

    this.common = json.common;
    this.info = json.info;
    if (json.distanceField && json.distanceField.distanceRange) {
      this.pxRange = json.distanceField.distanceRange;
    }
    for (const char of json.chars) {
      this.glyphs.set(char.id, char);
    }

    const gl = this.gl;
    const tex = gl.createTexture()!;
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

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
}

export class MsdfTextRenderer {
  private vertexBuffer: WebGLBuffer;
  private indexBuffer: WebGLBuffer;

  // vertex: [x, y, u, v, r, g, b, a, z] = 9 floats per vertex
  private vertexData: Float32Array;
  private indexData: Uint16Array;

  private vertexCount = 0;
  private indexCount = 0;
  private maxQuads = 10000;
  private _currentZ: number = 0;

  constructor(
    private gl: WebGL2RenderingContext,
    private program: WebGLProgram,
    private locations: MSDFShaderLocations,
    private atlas: MsdfAtlas
  ) {
    this.vertexBuffer = gl.createBuffer()!;
    this.indexBuffer = gl.createBuffer()!;
    this.vertexData = new Float32Array(this.maxQuads * 4 * 9);
    this.indexData = new Uint16Array(this.maxQuads * 6);
  }

  beginBatch(): void {
    this.vertexCount = 0;
    this.indexCount = 0;
    this._currentZ = 0;
  }

  _setZ(z: number): void {
    this._currentZ = z;
  }

  addText(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    r: number,
    g: number,
    b: number,
    a: number,
    align: "left" | "center" | "right" = "left",
    baseline: "top" | "middle" | "bottom" | "alphabetic" = "alphabetic"
  ): void {
    if (!this.atlas.common || !this.atlas.info) return;

    const scale = fontSize / this.atlas.info.size;
    const { scaleW, scaleH, lineHeight, base } = this.atlas.common;

    let totalWidth = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      const glyph = this.atlas.glyphs.get(code);
      if (glyph) {
        totalWidth += glyph.xadvance * scale;
      }
    }

    let cursorX = x;
    if (align === "center") cursorX -= totalWidth / 2;
    else if (align === "right") cursorX -= totalWidth;

    let cursorY = y;
    if (baseline === "middle") cursorY -= (lineHeight / 2) * scale;
    else if (baseline === "bottom") cursorY -= lineHeight * scale;
    else if (baseline === "alphabetic") cursorY -= base * scale;

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      const glyph = this.atlas.glyphs.get(code);
      if (!glyph) continue;

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
        const stride = 9;

        // TL
        this.vertexData[vIdx * stride + 0] = x0;
        this.vertexData[vIdx * stride + 1] = y0;
        this.vertexData[vIdx * stride + 2] = u0;
        this.vertexData[vIdx * stride + 3] = v0;
        this.vertexData[vIdx * stride + 4] = r;
        this.vertexData[vIdx * stride + 5] = g;
        this.vertexData[vIdx * stride + 6] = b;
        this.vertexData[vIdx * stride + 7] = a;
        this.vertexData[vIdx * stride + 8] = this._currentZ;

        // TR
        this.vertexData[vIdx * stride + 9] = x1;
        this.vertexData[vIdx * stride + 10] = y0;
        this.vertexData[vIdx * stride + 11] = u1;
        this.vertexData[vIdx * stride + 12] = v0;
        this.vertexData[vIdx * stride + 13] = r;
        this.vertexData[vIdx * stride + 14] = g;
        this.vertexData[vIdx * stride + 15] = b;
        this.vertexData[vIdx * stride + 16] = a;
        this.vertexData[vIdx * stride + 17] = this._currentZ;

        // BR
        this.vertexData[vIdx * stride + 18] = x1;
        this.vertexData[vIdx * stride + 19] = y1;
        this.vertexData[vIdx * stride + 20] = u1;
        this.vertexData[vIdx * stride + 21] = v1;
        this.vertexData[vIdx * stride + 22] = r;
        this.vertexData[vIdx * stride + 23] = g;
        this.vertexData[vIdx * stride + 24] = b;
        this.vertexData[vIdx * stride + 25] = a;
        this.vertexData[vIdx * stride + 26] = this._currentZ;

        // BL
        this.vertexData[vIdx * stride + 27] = x0;
        this.vertexData[vIdx * stride + 28] = y1;
        this.vertexData[vIdx * stride + 29] = u0;
        this.vertexData[vIdx * stride + 30] = v1;
        this.vertexData[vIdx * stride + 31] = r;
        this.vertexData[vIdx * stride + 32] = g;
        this.vertexData[vIdx * stride + 33] = b;
        this.vertexData[vIdx * stride + 34] = a;
        this.vertexData[vIdx * stride + 35] = this._currentZ;

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

  flush(camera?: Camera, projMatrix?: Matrix4): void {
    if (this.indexCount === 0 || !this.atlas.texture) return;

    const gl = this.gl;
    gl.useProgram(this.program);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.vertexData.subarray(0, this.vertexCount * 9),
      gl.DYNAMIC_DRAW
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      this.indexData.subarray(0, this.indexCount),
      gl.DYNAMIC_DRAW
    );

    const stride = Float32Array.BYTES_PER_ELEMENT * 9;
    gl.vertexAttribPointer(
      this.locations.a_Position,
      2,
      gl.FLOAT,
      false,
      stride,
      0
    );
    gl.enableVertexAttribArray(this.locations.a_Position);

    gl.vertexAttribPointer(
      this.locations.a_TexCoord,
      2,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 2
    );
    gl.enableVertexAttribArray(this.locations.a_TexCoord);

    gl.vertexAttribPointer(
      this.locations.a_Color,
      4,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 4
    );
    gl.enableVertexAttribArray(this.locations.a_Color);

    gl.vertexAttribPointer(
      this.locations.a_Z,
      1,
      gl.FLOAT,
      false,
      stride,
      Float32Array.BYTES_PER_ELEMENT * 8
    );
    gl.enableVertexAttribArray(this.locations.a_Z);

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

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.atlas.texture);
    gl.uniform1i(this.locations.u_Atlas, 0);
    gl.uniform1f(this.locations.u_pxRange, this.atlas.pxRange || 4.0);

    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

    this.vertexCount = 0;
    this.indexCount = 0;
  }
}
