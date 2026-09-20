import { Matrix4 } from '../vendor/cuon-matrix.js';
import {
  NodeData,
  NodeShaderLocations,
  BGShaderLocations,
  ConnectionPreviewData,
  MSDFShaderLocations,
} from "./types.js";
import { BGGeometryNode, GeometryNode } from "./geometry.js";
import { Camera } from "./camera.js";
import { EdgeStore } from "./edge-store.js";
import {
  EdgeHeadTextureLibrary,
  EdgeHeadTextureRegion,
} from "./edge-head-textures.js";
import {
  buildConnectionPreviewGeometry,
  buildEdgeRouteGeometry,
  EdgeRouteGeometry,
} from "./edge-geometry.js";
import { NodeStore } from "./node-store.js";
import { getWorldPosition } from "./scene-graph.js";
import { drawHandle } from "./texture.js";
import { getHandleScreenGeometry } from "./handle-geometry.js";
import { TextureCache } from "./texture-cache.js";
import { NODE_LAYOUT } from "./types.js";
import { getIconBGLocations, getMSDFShaderLocations } from "./shader.js";
import { MsdfAtlas, MsdfTextRenderer } from "./msdf-text.js";
import { IconBackgroundRenderer } from "./icon-background-renderer.js";
import { dumbGlyphHeight, dumbGlyphWidth } from "./globals.js";
import type { PrimitiveFrame } from "./primitive-geometry.js";
import type {
  NodeTypeRegistry,
  NodeTypeDescriptor,
  RoundedRectConfig,
  RoundedTriangleConfig,
  NodeDrawContext,
  NodeOverlayContext,
  RendererDrawAPI,
} from "./node-type-registry.js";

/**
 * Owns the WebGL draw loop and all rendering logic.
 * It knows nothing about input events or UI — it only reads Camera and NodeStore state.
 */
export class Renderer {
  private modelMatrix: Matrix4 = new Matrix4();
  private projMatrix: Matrix4 = new Matrix4();

  constructor(
    private gl: WebGL2RenderingContext,
    private canvas: HTMLCanvasElement,
    private bgCanvas: HTMLCanvasElement,
    private program: WebGLProgram,
    private locations: NodeShaderLocations,
    private geometry: GeometryNode,
    private bgGeometry: BGGeometryNode,
    private store: NodeStore,
    private edgeStore: EdgeStore,
    private camera: Camera,
    private bgProgram: WebGLProgram,
    private bgLocations: BGShaderLocations,
    private labelCanvas: HTMLCanvasElement,
    private getConnectionPreview: () => ConnectionPreviewData | null,
    /** Callback so Renderer never stores bgColor itself — it belongs to the editor. */
    private getBgColor: () => [number, number, number, number],
    private getFontColor: () => [number, number, number, number],
    private getSelectedNodeIds: () => Set<number>,
    private getPrimitiveFrame: (nodeId: number) => PrimitiveFrame | undefined,
    private onFrame: () => void,
    private msdfProgram: WebGLProgram,
    private iconBGProgram: WebGLProgram,
    private msdfAtlas: MsdfAtlas,
    private iconAtlas: MsdfAtlas,
    private registry?: NodeTypeRegistry,
    private renderMode: "webgl" | "dom" = "webgl"
  ) {
    this.labelCtx = labelCanvas.getContext("2d");
    this.edgeVertexBuffer = gl.createBuffer();
    this.edgeHeadBuffer = gl.createBuffer();
    if (!this.edgeVertexBuffer) {
      throw new Error("Unable to allocate edge vertex buffer");
    }
    if (!this.edgeHeadBuffer) {
      throw new Error("Unable to allocate edge head buffer");
    }

    this.edgeHeadTextures = new EdgeHeadTextureLibrary(gl);
    this.textureCache = new TextureCache(gl, () => {
      // It's a continuous loop, so we don't strictly need to force a redraw,
      // but if we were using on-demand rendering we would trigger it here.
    });

    const msdfLocations = getMSDFShaderLocations(gl, msdfProgram);
    const iconBGLocations = getIconBGLocations(gl, iconBGProgram);
    this.textRenderer = new MsdfTextRenderer(
      gl,
      msdfProgram,
      msdfLocations,
      msdfAtlas
    );
    this.iconRenderer = new MsdfTextRenderer(
      gl,
      msdfProgram,
      msdfLocations,
      iconAtlas
    );
    this.iconBackgroundRenderer = new IconBackgroundRenderer(
      gl,
      iconBGProgram,
      iconBGLocations
    );
  }

  private textRenderer: MsdfTextRenderer;
  private iconRenderer: MsdfTextRenderer;
  private iconBackgroundRenderer: IconBackgroundRenderer;

  private labelCtx: CanvasRenderingContext2D | null;
  private edgeVertexBuffer: WebGLBuffer;
  private edgeHeadBuffer: WebGLBuffer;
  private edgeHeadTextures: EdgeHeadTextureLibrary;

  private frameFor(node: NodeData): PrimitiveFrame {
    return this.getPrimitiveFrame(node.id) ?? {
      id: node.id,
      worldX: getWorldPosition(node.id, this.store.allNodesMap).x,
      worldY: getWorldPosition(node.id, this.store.allNodesMap).y,
      width: node.width,
      height: node.height,
      revision: 0,
      diff: {
        translateX: node.localX,
        translateY: node.localY,
        scaleX: 1,
        scaleY: 1,
      },
    };
  }

  private resolveNodeDimensions = (nodeId: number): { width: number; height: number } | undefined => {
    const node = this.store.get(nodeId);
    if (!node) return undefined;
    const frame = this.frameFor(node);
    return { width: frame.width, height: frame.height };
  };
  private edgeFrame: EdgeRouteGeometry[] = [];
  private textureCache: TextureCache;
  public isZooming: boolean = false;
  private dpr: number = 1;

  /** Call once after each canvas resize to update the orthographic projection. */
  resize(width: number, height: number, dpr: number = 1): void {
    this.dpr = dpr;
    this.gl.viewport(0, 0, width, height);
    // Origin top-left, y-axis pointing down — matches screen and 2D canvas convention
    const cssWidth = width / dpr;
    const cssHeight = height / dpr;
    this.projMatrix.setOrtho(0, cssWidth, cssHeight, 0, -2, 2);

    this.bgCanvas.width = width;
    this.bgCanvas.height = height;
    this.labelCanvas.width = width;
    this.labelCanvas.height = height;

    if (this.labelCtx) {
      this.labelCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  /** Start the RAF-driven render loop. */
  startLoop(): void {
    requestAnimationFrame(this.tick.bind(this));
  }

  /**
   * Render a single frame on demand (background, nodes, edges, overlays, and
   * the per-frame `onFrame` callback). Continuous animation is provided by
   * `startLoop()`; event-driven consumers should call this once after any
   * meaningful change and let an idle graph cost nothing.
   */
  renderFrame(): void {
    this.drawBGFrame();
    this.drawFrame();
    this.onFrame();
  }

  private tick(): void {
    this.renderFrame();
    requestAnimationFrame(this.tick.bind(this));
  }

  invalidateTextures(): void {
    this.textureCache.invalidateAll();
  }

  private drawFrame(): void {
    this.textureCache.processUploads();
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    // Only clear depth — color is already set by drawBGFrame()
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    this.drawNodes(false);
    this.drawEdges();
    this.drawOverlay();
  }

  private drawOverlay(): void {
    if (!this.labelCtx) return;
    this.labelCtx.save();
    this.labelCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.labelCtx.clearRect(
      0,
      0,
      this.labelCanvas.width,
      this.labelCanvas.height
    );
    this.labelCtx.restore();

    this.drawConnectionPreview();
    this.drawEdgeLabels();

    for (const node of this.store.visibleNodes()) {
      this.drawHandles(node);
    }

    if (!this.isZooming && this.renderMode !== "dom") this.drawGroupLabels();
  }

  private drawConnectionPreview(): void {
    if (!this.labelCtx) return;

    const preview = this.getConnectionPreview();
    if (!preview) return;

    const route = buildConnectionPreviewGeometry(
      preview.sourceNodeId,
      preview.sourceHandleSide,
      preview.screenX,
      preview.screenY,
      this.store,
      this.camera,
      this.resolveNodeDimensions
    );
    if (!route) return;

    this.labelCtx.save();
    this.labelCtx.beginPath();
    this.labelCtx.lineWidth = 2;
    this.labelCtx.strokeStyle = "rgba(228, 228, 228, 0.95)";
    this.labelCtx.setLineDash([8, 6]);
    this.labelCtx.moveTo(route.screenPoints[0].x, route.screenPoints[0].y);
    for (let i = 1; i < route.screenPoints.length; i++) {
      this.labelCtx.lineTo(route.screenPoints[i].x, route.screenPoints[i].y);
    }
    this.labelCtx.stroke();
    this.labelCtx.restore();
  }

  private drawEdgeLabels(): void {
    if (!this.labelCtx) return;

    this.labelCtx.save();
    this.labelCtx.font = "500 12px Inter, sans-serif";
    this.labelCtx.textBaseline = "middle";
    this.labelCtx.fillStyle = "rgba(226, 232, 240, 0.95)";

    for (const route of this.edgeFrame) {
      if (!route.edge.label) continue;

      const x = route.labelScreenPoint.x;
      const y = route.labelScreenPoint.y - 12;
      const isSelected = route.edge.isSelected;

      const metrics = this.labelCtx.measureText(route.edge.label);
      const padX = 8;
      const padY = 4;
      const width = metrics.width + padX * 2;
      const height = 20;

      this.labelCtx.fillStyle = isSelected
        ? "rgba(69, 26, 3, 0.92)"
        : "rgba(15, 23, 42, 0.72)";
      this.labelCtx.beginPath();
      this.labelCtx.roundRect(x - width / 2, y - height / 2, width, height, 8);
      this.labelCtx.fill();

      this.labelCtx.fillStyle = isSelected
        ? "rgba(255, 243, 205, 0.98)"
        : "rgba(226, 232, 240, 0.95)";
      this.labelCtx.fillText(route.edge.label, x - metrics.width / 2, y);
    }

    this.labelCtx.restore();
  }

  isRectInViewport(
    worldX: number,
    worldY: number,
    width: number,
    height: number,
    extraPadding: number = 0
  ): boolean {
    const viewportMin = this.camera.screenToWorld(0, 0);
    const viewportMax = this.camera.screenToWorld(
      this.canvas.width,
      this.canvas.height
    );

    // Inflate viewport slightly for safety (e.g., thick strokes, glows, bezier curves)
    const padding = (50 + extraPadding) / this.camera.zoom;
    viewportMin.x -= padding;
    viewportMin.y -= padding;
    viewportMax.x += padding;
    viewportMax.y += padding;

    if (worldX + width < viewportMin.x) return false;
    if (worldY + height < viewportMin.y) return false;
    if (worldX > viewportMax.x) return false;
    if (worldY > viewportMax.y) return false;

    return true;
  }

  private drawGroupLabels(): void {
    if (!this.labelCtx) return;

    this.labelCtx.font = "600 14px Inter, sans-serif";
    this.labelCtx.textBaseline = "middle";

    for (const node of this.store.visibleNodes()) {
      if (this.registry) {
        const desc = this.registry.get(node.nodeType);
        if (!desc?.usesCanvasLabel) continue;
      } else {
        if (node.nodeType !== "group") continue;
      }

      const frame = this.frameFor(node);
      const { worldX: x, worldY: y, width, height } = frame;
      if (!this.isRectInViewport(x, y, width, height)) continue;

      const screenPos = this.camera.worldToScreen(node.localX, node.localY);
      this.labelCtx.fillStyle = "#f8fafc";
      this.labelCtx.fillText(node.text, screenPos.x + 15, screenPos.y + 20);
    }
  }

  private drawHandles(node: NodeData): void {
    if (!this.labelCtx || node.handles.length === 0) return;

    const frame = this.frameFor(node);
    const { worldX: x, worldY: y } = frame;
    const zoom = this.camera.zoom;
    const { panX, panY } = this.camera;

    for (const handle of node.handles) {
      const geometry = getHandleScreenGeometry(
        x,
        y,
        node,
        handle,
        zoom,
        panX,
        panY,
        { width: frame.width, height: frame.height }
      );
      drawHandle(this.labelCtx, handle, geometry.centerX, geometry.centerY);
    }
  }

  private drawEdges(): void {
    const gl = this.gl;
    const visibleEdges = this.edgeStore
      .allEdges()
      .filter((edge) => edge.visible);
    this.edgeFrame = [];

    if (visibleEdges.length === 0) return;

    const lineVertices: number[] = [];
    const headVertices: number[] = [];
    const lineDraws: Array<{ first: number; count: number; z: number }> = [];
    const headDraws: Array<{ first: number; count: number; z: number }> = [];
    let lineCursor = 0;
    let headCursor = 0;

    const selectedIds = this.getSelectedNodeIds();

    for (const edge of visibleEdges) {
      const sourceNode = this.store.get(edge.sourceNodeId);
      const targetNode = this.store.get(edge.targetNodeId);
      if (!sourceNode || !targetNode) continue;
      if (
        !this.store.isEffectivelyVisible(sourceNode.id) ||
        !this.store.isEffectivelyVisible(targetNode.id)
      ) {
        continue;
      }

      // Compute edge z as average of source and target z
      const sourceZ = this.store.getZForNode(sourceNode.id, selectedIds);
      const targetZ = this.store.getZForNode(targetNode.id, selectedIds);
      const edgeZ = (sourceZ + targetZ) / 2;

      const sPos = getWorldPosition(sourceNode.id, this.store.allNodesMap);
      const tPos = getWorldPosition(targetNode.id, this.store.allNodesMap);
      const sourceFrame = this.frameFor(sourceNode);
      const targetFrame = this.frameFor(targetNode);

      const minX = Math.min(sPos.x, tPos.x);
      const minY = Math.min(sPos.y, tPos.y);
      const maxX = Math.max(
        sPos.x + sourceFrame.width,
        tPos.x + targetFrame.width
      );
      const maxY = Math.max(
        sPos.y + sourceFrame.height,
        tPos.y + targetFrame.height
      );

      if (!this.isRectInViewport(minX, minY, maxX - minX, maxY - minY, 100))
        continue;

      const geometry = buildEdgeRouteGeometry(
        edge,
        this.store,
        this.camera,
        this.resolveNodeDimensions
      );
      if (!geometry || geometry.worldPoints.length < 2) continue;

      this.edgeFrame.push(geometry);
      if (edge.isSelected) continue;

      lineDraws.push({ first: lineCursor, count: geometry.worldPoints.length, z: edgeZ });
      lineCursor += geometry.worldPoints.length;

      for (const point of geometry.worldPoints) {
        lineVertices.push(point.x, point.y, edgeZ, 0, 0);
      }

      if (geometry.arrowhead) {
        const region = this.edgeHeadTextures.getRegion(edge.headSkinId);
        headDraws.push({ first: headCursor, count: 6, z: edgeZ });
        headCursor += 6;
        headVertices.push(
          ...this.buildHeadQuadVertices(geometry.arrowhead, region, edgeZ)
        );
      }
    }

    gl.useProgram(this.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.bindEdgeVertexBuffer(this.edgeVertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(lineVertices),
      gl.DYNAMIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    gl.uniformMatrix4fv(
      this.locations.u_ProjMatrix,
      false,
      this.projMatrix.elements
    );
    gl.uniformMatrix4fv(
      this.locations.u_ViewMatrix,
      false,
      this.camera.getViewMatrix().elements
    );
    this.modelMatrix.setIdentity();
    gl.uniformMatrix4fv(
      this.locations.u_ModelMatrix,
      false,
      this.modelMatrix.elements
    );
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);

    gl.uniform4f(this.locations.u_Color, 0.38, 0.38, 0.39, 0.72);
    let vertexOffset = 0;
    for (const draw of lineDraws) {
      gl.drawArrays(gl.LINE_STRIP, vertexOffset, draw.count);
      vertexOffset += draw.count;
    }

    if (headVertices.length > 0) {
      this.bindEdgeVertexBuffer(this.edgeHeadBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(headVertices),
        gl.DYNAMIC_DRAW
      );
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.edgeHeadTextures.texture);
      gl.uniform1i(this.locations.u_UseTexture, 1);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform1i(this.locations.u_Sampler, 0);
      gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
      let headOffset = 0;
      for (const draw of headDraws) {
        gl.drawArrays(gl.TRIANGLES, headOffset, draw.count);
        headOffset += draw.count;
      }
    }

    const selectedEdges = visibleEdges.filter((edge) => edge.isSelected);
    for (const selectedEdge of selectedEdges) {
      const selectedGeometry = buildEdgeRouteGeometry(
        selectedEdge,
        this.store,
        this.camera,
        this.resolveNodeDimensions
      );
      if (selectedGeometry) {
        this.drawSingleEdge(
          selectedGeometry,
          "rgba(245, 158, 11, 0.98)",
          "rgba(251, 191, 36, 1)"
        );
      }
    }
  }

  private drawSingleEdge(
    geometry: EdgeRouteGeometry,
    strokeColor: string,
    headColor: string
  ): void {
    const gl = this.gl;

    this.bindEdgeVertexBuffer(this.edgeVertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        geometry.worldPoints.flatMap((point) => [point.x, point.y, 0, 0, 0])
      ),
      gl.DYNAMIC_DRAW
    );

    gl.uniformMatrix4fv(
      this.locations.u_ProjMatrix,
      false,
      this.projMatrix.elements
    );
    gl.uniformMatrix4fv(
      this.locations.u_ViewMatrix,
      false,
      this.camera.getViewMatrix().elements
    );
    this.modelMatrix.setIdentity();
    gl.uniformMatrix4fv(
      this.locations.u_ModelMatrix,
      false,
      this.modelMatrix.elements
    );
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);
    gl.uniform4f(this.locations.u_Color, ...this.parseColor(strokeColor));
    gl.drawArrays(gl.LINE_STRIP, 0, geometry.worldPoints.length);

    if (geometry.arrowhead) {
      const region = this.edgeHeadTextures.getRegion(geometry.edge.headSkinId);
      const quad = this.buildHeadQuadVertices(geometry.arrowhead, region);
      this.bindEdgeVertexBuffer(this.edgeHeadBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.DYNAMIC_DRAW);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.edgeHeadTextures.texture);
      gl.uniform1i(this.locations.u_UseTexture, 1);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform1i(this.locations.u_Sampler, 0);
      gl.uniform4f(this.locations.u_Color, ...this.parseColor(headColor));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  private buildHeadQuadVertices(
    head: NonNullable<EdgeRouteGeometry["arrowhead"]>,
    region: EdgeHeadTextureRegion,
    z: number = 0
  ): number[] {
    const headLength = 18;
    const headWidth = 12;
    const halfWidth = headWidth / 2;

    const tangentX = head.tangent.x;
    const tangentY = head.tangent.y;
    const backX = -tangentX;
    const backY = -tangentY;
    const normalX = -tangentY;
    const normalY = tangentX;

    const baseX = head.tip.x + backX * headLength;
    const baseY = head.tip.y + backY * headLength;

    const topLeft = {
      x: baseX + normalX * halfWidth,
      y: baseY + normalY * halfWidth,
    };
    const bottomLeft = {
      x: baseX - normalX * halfWidth,
      y: baseY - normalY * halfWidth,
    };
    const bottomRight = {
      x: head.tip.x - normalX * halfWidth,
      y: head.tip.y - normalY * halfWidth,
    };
    const topRight = {
      x: head.tip.x + normalX * halfWidth,
      y: head.tip.y + normalY * halfWidth,
    };

    return [
      topLeft.x, topLeft.y, z, region.u0, region.v0,
      bottomLeft.x, bottomLeft.y, z, region.u0, region.v1,
      bottomRight.x, bottomRight.y, z, region.u1, region.v1,
      topLeft.x, topLeft.y, z, region.u0, region.v0,
      bottomRight.x, bottomRight.y, z, region.u1, region.v1,
      topRight.x, topRight.y, z, region.u1, region.v0,
    ];
  }

  private bindEdgeVertexBuffer(buffer: WebGLBuffer): void {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const stride = 5 * Float32Array.BYTES_PER_ELEMENT;
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
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(this.locations.a_TexCoord);
    gl.vertexAttribPointer(
      this.locations.a_Z,
      1,
      gl.FLOAT,
      false,
      stride,
      2 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(this.locations.a_Z);
  }

  private parseColor(color: string): [number, number, number, number] {
    if (color.startsWith("rgba(")) {
      const parts = color
        .slice(5, -1)
        .split(",")
        .map((part) => part.trim());
      return [
        Number(parts[0]) / 255,
        Number(parts[1]) / 255,
        Number(parts[2]) / 255,
        Number(parts[3]),
      ];
    }

    return [0.38, 0.62, 1.0, 1.0];
  }

  private drawBGFrame(): void {
    const gl = this.gl;
    // gl.viewport(0, 0, this.bgCanvas.width, this.bgCanvas.height);
    const [r, g, b, a] = this.getBgColor();
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.drawBG(false);
  }

  /**
   * Draw all visible nodes.
   * @param picking — when true, each node is drawn as a flat pick-color silhouette
   *                  (blend disabled, no texture) for the off-screen pick render pass.
   */
  drawNodes(picking: boolean): void {
    const gl = this.gl;
    gl.useProgram(this.program);

    if (picking) {
      gl.disable(gl.BLEND);
    } else {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      this.textRenderer.beginBatch();
      this.iconBackgroundRenderer.beginBatch();
      this.iconRenderer.beginBatch();
    }

    // Bind shared geometry buffers once for all nodes
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.indexBuffer);

    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
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
      2 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(this.locations.a_TexCoord);

    // a_Z is set per-node via vertexAttrib1f (constant across all vertices of a node)
    gl.disableVertexAttribArray(this.locations.a_Z);

    // Upload camera matrices (shared by all nodes this frame)
    gl.uniformMatrix4fv(
      this.locations.u_ProjMatrix,
      false,
      this.projMatrix.elements
    );
    gl.uniformMatrix4fv(
      this.locations.u_ViewMatrix,
      false,
      this.camera.getViewMatrix().elements
    );

    const selectedIds = this.getSelectedNodeIds();

    for (const node of this.store.visibleNodes()) {
      const frame = this.frameFor(node);
      const { worldX: x, worldY: y, width, height } = frame;

      // Viewport culling
      if (!this.isRectInViewport(x, y, width, height)) {
        continue;
      }

      const z = this.store.getZForNode(node.id, selectedIds);

      if (!picking) {
        // Set z for batch renderers (MSDF text, icon backgrounds, icons)
        this.textRenderer._setZ?.(z);
        this.iconBackgroundRenderer._setZ?.(z);
        this.iconRenderer._setZ?.(z);
      }

      this.drawNode(node, x, y, z, picking);
    }

    if (!picking) {
      this.iconBackgroundRenderer.msdfFontSize =
        this.iconAtlas.info?.size || null;
      this.textRenderer.flush(this.camera, this.projMatrix);
      this.iconBackgroundRenderer.flush(this.camera, this.projMatrix);
      this.iconRenderer.flush(this.camera, this.projMatrix);
    }
  }

  /**
   * Draw all visible nodes.
   * @param picking — when true, each node is drawn as a flat pick-color silhouette
   *                  (blend disabled, no texture) for the off-screen pick render pass.
   */
  drawBG(picking: boolean): void {
    const gl = this.gl;

    gl.useProgram(this.bgProgram);

    if (picking) {
      gl.disable(gl.BLEND);
    } else {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bgGeometry.vertexBuffer);
    gl.vertexAttribPointer(
      this.bgLocations.a_Position,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(this.bgLocations.a_Position);

    gl.uniform4f(this.bgLocations.u_Color, 0.05, 0.05, 0.05, 0.6); // dull gray pattern
    gl.uniform1i(
      this.bgLocations.u_UsePointMask,
      this.bgGeometry.primitiveType === gl.POINTS ? 1 : 0
    );
    gl.drawArrays(this.bgGeometry.primitiveType, 0, this.bgGeometry.length);
  }

  private drawNode(
    node: NodeData,
    worldX: number,
    worldY: number,
    z: number,
    picking: boolean
  ): void {
    const gl = this.gl;
    const frame = this.frameFor(node);
    const { width, height } = frame;

    if (picking) {
      // Flat color silhouette — the RGB encodes the node id
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform4f(
        this.locations.u_Color,
        node.pickColor[0],
        node.pickColor[1],
        node.pickColor[2],
        1.0
      );
      this.setModelMatrix(worldX, worldY, width, height, z);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

      return;
    }

    // ─── DOM mode ────────────────────────────────────────
    // In dom mode the editor owns NO WebGL node visuals: every node body,
    // title and overlay is rendered as a DOM view by DomNodeLayer. The pick
    // silhouette above is still drawn (GPU hit-testing stays authoritative),
    // as are edges, connection handles and the background. We therefore skip
    // the entire WebGL body pass for every node — regardless of descriptor —
    // so the two pipelines can never coexist on a page.
    if (this.renderMode === "dom") {
      return;
    }

    // ─── Registry-driven dispatch ───────────────────────────
    if (this.registry) {
      const desc = this.registry.get(node.nodeType);
      if (desc?.rawDraw) {
        const ctx: NodeDrawContext = {
          gl, node, worldX, worldY, width, height, z,
          renderer: this.getDrawAPI(),
        };
        if (desc.rawDraw(ctx)) return;
      }
      if (desc?.renderMode === "dom") {
        // The visual body is owned by a DOM view (see DomNodeLayer).
        // The picking pass above already drew the pick silhouette, and
        // connection handles are drawn independently by drawHandles(),
        // so GPU hit-testing, drag, and connect all keep working.
        return;
      }
      if (desc?.renderMode === "rounded-rect") {
        if (node.nodeType === "hub") {
          this.drawHubNode(node, worldX, worldY, z, picking);
          return;
        }
        this.drawGenericRoundedRect(node, worldX, worldY, z, desc);
        return;
      }
      if (desc?.renderMode === "rounded-triangle") {
        this.drawBranchNode(node, worldX, worldY, z, picking, desc);
        return;
      }
      // fall through to textured path
    } else {
      // Fallback: hardcoded dispatch for built-in rounded-rect types
      if (node.nodeType === "subgraph") {
        this.drawSubgraphNode(node, worldX, worldY, z);
        return;
      }
      if (node.nodeType === "hub") {
        this.drawHubNode(node, worldX, worldY, z, picking);
        return;
      }
      if (node.nodeType === "branch") {
        this.drawBranchNode(node, worldX, worldY, z, picking);
        return;
      }
    }

    if (node.isDropTarget) {
      this.setModelMatrix(
        worldX - 6,
        worldY - 6,
        width + 12,
        height + 12,
        z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform4f(this.locations.u_Color, 0.13, 0.86, 0.39, 0.8); // Green glow
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    } else if (node.isSelected) {
      // Selection glow: draw a slightly larger quad behind the node
      this.setModelMatrix(
        worldX - 2,
        worldY - 2,
        width + 4,
        height + 4,
        z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform4f(this.locations.u_Color, 0.23, 0.23, 0.86, 1.0);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    // Draw body
    const bodyCache = this.textureCache.getTexture(node.textureIds.body);
    if (bodyCache) {
      this.setModelMatrix(worldX, worldY, width, height, z);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, bodyCache.texture);
      gl.uniform1i(this.locations.u_UseTexture, 1);
      gl.uniform1i(this.locations.u_Use9Slice, 1);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform2f(this.locations.u_Dimensions, width, height);
      gl.uniform2f(
        this.locations.u_TextureSize,
        bodyCache.nativeWidth,
        bodyCache.nativeHeight
      );
      gl.uniform4f(this.locations.u_SliceMargins, 16.0, 16.0, 16.0, 16.0);
      gl.uniform1i(this.locations.u_Sampler, 0);
      gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    // Draw head
    let headHeight = height;
    if (this.registry) {
      const desc = this.registry.get(node.nodeType);
      headHeight = (desc?.category === "leaf") ? NODE_LAYOUT.headerHeight : height;
    } else {
      if (node.nodeType === "node" || node.nodeType === "composition-child") {
        headHeight = NODE_LAYOUT.headerHeight;
      } else if (node.nodeType === "group" || node.nodeType === "composition") {
        headHeight = height;
      }
    }
    const headCache = this.textureCache.getTexture(node.textureIds.head);
    if (headCache) {
      this.setModelMatrix(worldX, worldY, width, headHeight, z);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, headCache.texture);
      gl.uniform1i(this.locations.u_UseTexture, 1);
      gl.uniform1i(this.locations.u_Use9Slice, 1);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform2f(this.locations.u_Dimensions, width, headHeight);
      gl.uniform2f(
        this.locations.u_TextureSize,
        headCache.nativeWidth,
        headCache.nativeHeight
      );
      gl.uniform4f(this.locations.u_SliceMargins, 16.0, 16.0, 16.0, 16.0);
      gl.uniform1i(this.locations.u_Sampler, 0);
      gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    // Draw overlay via MSDF
    if (!picking) {
      const [r, g, b, _] = this.getFontColor();

      const isCollapsed = this.store.isNodeCollapsed(node);
      const headOnly = node.nodeType === "composition-child" || isCollapsed;

      const titleY =
        (node.nodeType === "group" || node.nodeType === "composition") &&
        !isCollapsed
          ? 20
          : headOnly
          ? height / 2
          : NODE_LAYOUT.headerHeight / 2;

      if (
        node.nodeType === "node" ||
        node.nodeType === "composition-child" ||
        isCollapsed
      ) {
        this.textRenderer.addText(
          node.text,
          worldX + NODE_LAYOUT.padding,
          worldY + titleY,
          14,
          r,
          g,
          b,
          1.0,
          "left",
          "middle"
        );
      }

      // Group Lock Icon
      if (node.nodeType === "group") {
        const lockX = width / 2;
        const lockY = NODE_LAYOUT.lockBtnTopY;
        const isLocked = Boolean(node.isLocked);
        this.iconBackgroundRenderer.addQuad(
          worldX + lockX,
          worldY + lockY + 1.2,
          r,
          g,
          b,
          isLocked ? 0.12 : 0.05,
          dumbGlyphWidth,
          dumbGlyphHeight,
          this.iconAtlas.common?.base || 0,
          this.iconAtlas.common?.lineHeight || 0,
          16,
          "center",
          undefined,
          "circle"
        );
        this.iconRenderer.addText(
          isLocked ? "\uF006" : "\uF007", // Placeholder — swap with lock/unlock codepoints
          worldX + lockX,
          worldY + lockY,
          16,
          r,
          g,
          b,
          1.0,
          "center",
          "middle"
        );
      }

      // Group Add (+) Icon
      if (node.nodeType === "group" && !isCollapsed) {
        const xPos = width / 2;
        const yPos = height - NODE_LAYOUT.plusBtnPaddingBottom;

        this.iconBackgroundRenderer.addQuad(
          worldX + xPos,
          worldY + yPos + 1.2,
          r,
          g,
          b,
          0.05,
          dumbGlyphWidth,
          dumbGlyphHeight,
          this.iconAtlas.common?.base || 0,
          this.iconAtlas.common?.lineHeight || 0,
          16,
          "center",
          undefined,
          "circle"
        );

        this.textRenderer.addText(
          "+",
          worldX + xPos,
          worldY + yPos,
          20,
          r,
          g,
          b,
          1.0,
          "center",
          "middle"
        );
      }

      if (!headOnly) {
        if (node.nodeType === "node" && node.compositionRefId !== null) {
          const padding = NODE_LAYOUT.padding;
          const spacing = 8;
          const titleHeight = 8;
          let yOffset = NODE_LAYOUT.headerHeight + padding;

          yOffset += titleHeight + spacing;

          const composition = this.store.get(node.compositionRefId!);
          if (composition) {
            const children = composition.childIds
              .map((id) => this.store.get(id))
              .filter(Boolean);
            if (children.length === 0) {
              this.textRenderer.addText(
                "No nodes",
                worldX + padding,
                worldY + yOffset,
                12,
                r,
                g,
                b,
                0.5,
                "left",
                "top"
              );
            } else {
              // We need to flush MSDF text first, then draw the children nodes using the main shader,
              // then we can resume queuing MSDF text. Wait, MSDF text is completely deferred to the end of the frame!
              // So we can just queue the child titles in textRenderer, and immediately draw their bodies using the main shader!
              gl.useProgram(this.program);

              for (let i = 0; i < Math.min(children.length, 5); i++) {
                const child = children[i]!;
                const childWidth = Math.min(child.width, width - 40);
                const childHeight = Math.max(
                  NODE_LAYOUT.headerHeight,
                  child.height
                );
                const x = worldX + (width - childWidth) / 2;
                const y = worldY + yOffset;

                // Draw child body
                const bodyCache = this.textureCache.getTexture(
                  child.textureIds.body
                );
                if (bodyCache) {
                  this.setModelMatrix(x, y, childWidth, childHeight, z);
                  gl.activeTexture(gl.TEXTURE0);
                  gl.bindTexture(gl.TEXTURE_2D, bodyCache.texture);
                  gl.uniform1i(this.locations.u_UseTexture, 1);
                  gl.uniform1i(this.locations.u_Use9Slice, 1);
                  gl.uniform2f(
                    this.locations.u_Dimensions,
                    childWidth,
                    childHeight
                  );
                  gl.uniform2f(
                    this.locations.u_TextureSize,
                    bodyCache.nativeWidth,
                    bodyCache.nativeHeight
                  );
                  gl.uniform4f(
                    this.locations.u_SliceMargins,
                    16.0,
                    16.0,
                    16.0,
                    16.0
                  );
                  gl.uniform1i(this.locations.u_Sampler, 0);
                  gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
                  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                }

                // Draw child head
                const headCache = this.textureCache.getTexture(
                  child.textureIds.head
                );
                if (headCache) {
                  this.setModelMatrix(
                    x,
                    y,
                    childWidth,
                    NODE_LAYOUT.headerHeight,
                    z
                  );
                  gl.activeTexture(gl.TEXTURE0);
                  gl.bindTexture(gl.TEXTURE_2D, headCache.texture);
                  gl.uniform1i(this.locations.u_UseTexture, 1);
                  gl.uniform1i(this.locations.u_Use9Slice, 1);
                  gl.uniform2f(
                    this.locations.u_Dimensions,
                    childWidth,
                    NODE_LAYOUT.headerHeight
                  );
                  gl.uniform2f(
                    this.locations.u_TextureSize,
                    headCache.nativeWidth,
                    headCache.nativeHeight
                  );
                  gl.uniform4f(
                    this.locations.u_SliceMargins,
                    16.0,
                    16.0,
                    16.0,
                    16.0
                  );
                  gl.uniform1i(this.locations.u_Sampler, 0);
                  gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
                  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                }

                this.textRenderer.addText(
                  child.text,
                  x + 12,
                  y + NODE_LAYOUT.headerHeight / 2,
                  13,
                  r,
                  g,
                  b,
                  1.0,
                  "left",
                  "middle"
                );

                yOffset += childHeight + 10;
              }
              if (children.length > 5) {
                this.textRenderer.addText(
                  `+ ${children.length - 5} more nodes`,
                  worldX + padding,
                  worldY + yOffset,
                  12,
                  r,
                  g,
                  b,
                  0.5,
                  "left",
                  "top"
                );
              }
            }
          }
        } else if (node.nodeType === "node") {
          if (node.props) {
            let cursorY = worldY + NODE_LAYOUT.headerHeight + 16;
            const xLeft = worldX + NODE_LAYOUT.padding + 4;
            const xRight = worldX + width - NODE_LAYOUT.padding - 4;

            // Draw ungrouped items (iterate maps directly — no temp arrays)
            const boolU = node.props.booleans["ungrouped"];
            const textU = node.props.texts["ungrouped"];
            const enumU = node.props.enums["ungrouped"];
            if (boolU)
              for (let i = 0; i < boolU.length; i++) {
                const p = boolU[i];
                this.textRenderer.addText(
                  p.label,
                  xLeft + 4,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  0.9,
                  "left",
                  "middle"
                );

                this.iconRenderer.addText(
                  p.value ? "" : "",
                  xRight,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  1.0,
                  "right",
                  "middle"
                );
                cursorY += 20;
              }
            if (textU)
              for (let i = 0; i < textU.length; i++) {
                const p = textU[i];
                this.textRenderer.addText(
                  p.label,
                  xLeft + 4,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  0.9,
                  "left",
                  "middle"
                );
                this.textRenderer.addText(
                  String(p.value),
                  xRight,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  1.0,
                  "right",
                  "middle"
                );
                cursorY += 20;
              }
            if (enumU)
              for (let i = 0; i < enumU.length; i++) {
                const p = enumU[i];
                this.textRenderer.addText(
                  p.label,
                  xLeft + 4,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  0.9,
                  "left",
                  "middle"
                );
                this.textRenderer.addText(
                  String(p.value),
                  xRight,
                  cursorY,
                  11,
                  r,
                  g,
                  b,
                  1.0,
                  "right",
                  "middle"
                );
                cursorY += 20;
              }

            // Draw grouped items
            const groups = node.props.groups;
            for (let gi = 0; gi < groups.length; gi++) {
              const groupName = groups[gi];
              const boolG = node.props.booleans[groupName];
              const textG = node.props.texts[groupName];
              const enumG = node.props.enums[groupName];
              const hasItems =
                (boolG && boolG.length > 0) ||
                (textG && textG.length > 0) ||
                (enumG && enumG.length > 0);

              if (hasItems) {
                // Subheading
                this.textRenderer.addText(
                  groupName.toUpperCase(),
                  xLeft,
                  cursorY,
                  10,
                  r,
                  g,
                  b,
                  0.5,
                  "left",
                  "middle"
                );
                cursorY += 20;

                const boolGCount = boolG?.length;
                if (boolG)
                  for (let i = 0; i < boolGCount; i++) {
                    const groupBottomPadding =
                      i === boolGCount - 1 && !(textG || enumG) ? 8 : 0;
                    const p = boolG[i];
                    this.textRenderer.addText(
                      p.label,
                      xLeft + 4,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1.0,
                      "left",
                      "middle"
                    );

                    this.iconRenderer.addText(
                      p.value ? "" : "",
                      xRight,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1.0,
                      "right",
                      "middle"
                    );
                    cursorY += 20 + groupBottomPadding;
                  }
                const textGCount = textG?.length;
                if (textG)
                  for (let i = 0; i < textGCount; i++) {
                    const groupBottomPadding =
                      i === textGCount - 1 && !enumG ? 8 : 0;
                    const p = textG[i];
                    this.textRenderer.addText(
                      p.label,
                      xLeft + 4,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1.0,
                      "left",
                      "middle"
                    );
                    this.textRenderer.addText(
                      String(p.value),
                      xRight,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1.0,
                      "right",
                      "middle"
                    );
                    cursorY += 20 + groupBottomPadding;
                  }
                const enumGCount = enumG?.length;
                if (enumG)
                  for (let i = 0; i < enumGCount; i++) {
                    const groupBottomPadding = i === enumGCount - 1 ? 8 : 0;
                    const p = enumG[i];
                    this.textRenderer.addText(
                      p.label,
                      xLeft + 4,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1.0,
                      "left",
                      "middle"
                    );
                    this.textRenderer.addText(
                      String(p.value),
                      xRight,
                      cursorY,
                      11,
                      r,
                      g,
                      b,
                      1.0,
                      "right",
                      "middle"
                    );
                    cursorY += 20 + groupBottomPadding;
                  }
              }
            }
          } else {
            this.textRenderer.addText(
              "Properties...",
              worldX + NODE_LAYOUT.padding,
              worldY + NODE_LAYOUT.headerHeight + NODE_LAYOUT.padding,
              12,
              r,
              g,
              b,
              1.0,
              "left",
              "top"
            );
          }
        }
      }
    }
  }

  private getDrawAPI(): RendererDrawAPI {
    return {
      setModelMatrix: (x, y, w, h, z) => this.setModelMatrix(x, y, w, h, z),
      getTextureCache: () => this.textureCache,
      getLocations: () => this.locations,
      getCamera: () => this.camera,
      getGL: () => this.gl,
    };
  }

  private drawGenericRoundedRect(
    node: NodeData,
    worldX: number,
    worldY: number,
    z: number,
    desc: NodeTypeDescriptor
  ): void {
    const gl = this.gl;
    const { width, height } = this.frameFor(node);
    const config = desc.renderConfig as RoundedRectConfig | undefined;
    const radius = config?.radius ?? 12;
    const borderWidth = config?.borderWidth ?? 1.5;
    const [fillR, fillG, fillB, fillA] = config?.fillColor ?? [0.08, 0.09, 0.1, 0.9];
    const [borderR, borderG, borderB, borderA] = config?.borderColor ?? [1.0, 1.0, 1.0, 0.9];
    const isCollapsed = this.store.isNodeCollapsed(node);

    if (node.isDropTarget || node.isSelected) {
      this.setModelMatrix(
        worldX - 3, worldY - 3,
        width + 6, height + 6, z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 1);
      gl.uniform2f(this.locations.u_Dimensions, width + 6, height + 6);
      gl.uniform4f(
        this.locations.u_Color,
        node.isDropTarget ? 0.04 : 0.08,
        node.isDropTarget ? 0.38 : 0.14,
        node.isDropTarget ? 0.16 : 0.68,
        0.09
      );
      gl.uniform4f(this.locations.u_BorderColor, 0.9, 0.95, 1.0, 0.95);
      gl.uniform1f(this.locations.u_BorderWidth, 2.0);
      gl.uniform1f(this.locations.u_Radius, isCollapsed ? 8.0 : radius);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    this.setModelMatrix(worldX, worldY, width, height, z);
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 1);
    gl.uniform2f(this.locations.u_Dimensions, width, height);
    gl.uniform4f(this.locations.u_Color, fillR, fillG, fillB, isCollapsed ? 0.9 : fillA);
    gl.uniform4f(this.locations.u_BorderColor, borderR, borderG, borderB, borderA);
    gl.uniform1f(this.locations.u_BorderWidth, isCollapsed ? borderWidth : borderWidth);
    gl.uniform1f(this.locations.u_Radius, isCollapsed ? 8.0 : radius);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);

    // Hub icon slot (built-in special case)
    if (node.nodeType === "hub") {
      const slotPadding = 10;
      const iconSlotWidth = Math.max(
        48,
        Math.min(Math.round(height * 0.62), Math.max(56, Math.round(width * 0.28)))
      );
      const iconSlotHeight = Math.max(0, height - slotPadding * 2);
      const iconCenterX = worldX + slotPadding + iconSlotWidth / 2;
      const iconCenterY = worldY + height / 2;

      this.setModelMatrix(
        worldX + slotPadding, worldY + slotPadding,
        iconSlotWidth, iconSlotHeight, z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 1);
      gl.uniform2f(this.locations.u_Dimensions, iconSlotWidth, iconSlotHeight);
      gl.uniform4f(this.locations.u_Color, 0.15, 0.16, 0.18, 0.92);
      gl.uniform4f(this.locations.u_BorderColor, 1.0, 1.0, 1.0, 0.28);
      gl.uniform1f(this.locations.u_BorderWidth, 1.0);
      gl.uniform1f(this.locations.u_Radius, 12.0);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);

      this.iconRenderer.addText(
        "",
        iconCenterX,
        iconCenterY,
        Math.min(iconSlotWidth, iconSlotHeight) * 0.55,
        1, 1, 1, 0.92,
        "center",
        "middle"
      );
    }

    // ─── Overlay via overlayConfig ──────────────────────────
    const [r, g, b, _] = this.getFontColor();
    const overlayConfig = desc.overlayConfig;

    if (overlayConfig) {
      let titleY: number;
      if (isCollapsed) {
        titleY = height / 2;
      } else if (overlayConfig.titlePosition === "container-top") {
        titleY = 20;
      } else if (overlayConfig.titlePosition === "center") {
        titleY = height / 2;
      } else {
        titleY = NODE_LAYOUT.headerHeight / 2;
      }

      // For hub, offset title past the icon slot
      let titleX = worldX + NODE_LAYOUT.padding;
      if (node.nodeType === "hub") {
        const iconSlotWidth = Math.max(
          48,
          Math.min(Math.round(height * 0.62), Math.max(56, Math.round(width * 0.28)))
        );
        titleX = worldX + iconSlotWidth + NODE_LAYOUT.padding * 1.5;
        titleY = height / 2;
      }

      if (overlayConfig.showTitle || isCollapsed) {
        this.textRenderer.addText(
          node.text,
          titleX, worldY + titleY,
          14, r, g, b, 1.0, "left", "middle"
        );
      }

      if (overlayConfig.showLockIcon) {
        const lockX = width / 2;
        const lockY = NODE_LAYOUT.lockBtnTopY;
        const isLocked = Boolean(node.isLocked);
        this.iconBackgroundRenderer.addQuad(
          worldX + lockX, worldY + lockY + 1.2,
          r, g, b, isLocked ? 0.12 : 0.05,
          dumbGlyphWidth, dumbGlyphHeight,
          this.iconAtlas.common?.base || 0,
          this.iconAtlas.common?.lineHeight || 0,
          16, "center", undefined, "circle"
        );
        this.iconRenderer.addText(
          isLocked ? "" : "",
          worldX + lockX, worldY + lockY,
          16, r, g, b, 1.0, "center", "middle"
        );
      }

      if (overlayConfig.showAddIcon && !isCollapsed) {
        const xPos = width / 2;
        const yPos = height - NODE_LAYOUT.plusBtnPaddingBottom;
        this.iconBackgroundRenderer.addQuad(
          worldX + xPos, worldY + yPos + 1.2,
          r, g, b, 0.05,
          dumbGlyphWidth, dumbGlyphHeight,
          this.iconAtlas.common?.base || 0,
          this.iconAtlas.common?.lineHeight || 0,
          16, "center", undefined, "circle"
        );
        this.textRenderer.addText(
          "+", worldX + xPos, worldY + yPos,
          20, r, g, b, 1.0, "center", "middle"
        );
      }
    }

    // Custom overlay hook
    if (desc.drawOverlay) {
      desc.drawOverlay({
        node, worldX, worldY, width, height, z, isCollapsed,
        textRenderer: this.textRenderer,
        iconRenderer: this.iconRenderer,
        iconBackgroundRenderer: this.iconBackgroundRenderer,
        fontColor: [r, g, b],
      });
    }
  }

  private drawBranchNode(
    node: NodeData,
    worldX: number,
    worldY: number,
    z: number,
    picking: boolean,
    desc?: NodeTypeDescriptor
  ): void {
    const gl = this.gl;
    const { width, height } = this.frameFor(node);
    const config = desc?.renderConfig as RoundedTriangleConfig | undefined;
    const radius = config?.radius ?? 10;
    const borderWidth = config?.borderWidth ?? 1.8;
    const [fillR, fillG, fillB, fillA] = config?.fillColor ?? [0.10, 0.11, 0.13, 0.95];
    const [borderR, borderG, borderB, borderA] = config?.borderColor ?? [0.45, 0.50, 0.58, 0.9];

    if (picking) {
      // For picking, draw a simple filled quad covering the triangle's bounding box.
      // The SDF discards fragments outside the triangle shape.
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 2);
      gl.uniform2f(this.locations.u_Dimensions, width, height);
      gl.uniform4f(
        this.locations.u_Color,
        node.pickColor[0],
        node.pickColor[1],
        node.pickColor[2],
        1.0
      );
      gl.uniform4f(this.locations.u_BorderColor, node.pickColor[0], node.pickColor[1], node.pickColor[2], 1.0);
      gl.uniform1f(this.locations.u_BorderWidth, 0.0);
      gl.uniform1f(this.locations.u_Radius, radius);
      this.setModelMatrix(worldX, worldY, width, height, z);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      return;
    }

    const [r, g, b, _] = this.getFontColor();

    // Selection / drop-target glow (rounded triangle outline)
    if (node.isDropTarget || node.isSelected) {
      this.setModelMatrix(
        worldX - 4, worldY - 4,
        width + 8, height + 8, z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 2);
      gl.uniform2f(this.locations.u_Dimensions, width + 8, height + 8);
      gl.uniform4f(
        this.locations.u_Color,
        node.isDropTarget ? 0.04 : 0.08,
        node.isDropTarget ? 0.38 : 0.14,
        node.isDropTarget ? 0.16 : 0.68,
        0.09
      );
      gl.uniform4f(this.locations.u_BorderColor, 0.9, 0.95, 1.0, 0.95);
      gl.uniform1f(this.locations.u_BorderWidth, 2.5);
      gl.uniform1f(this.locations.u_Radius, radius);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    // Body: rounded triangle
    this.setModelMatrix(worldX, worldY, width, height, z);
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 2);
    gl.uniform2f(this.locations.u_Dimensions, width, height);
    gl.uniform4f(this.locations.u_Color, fillR, fillG, fillB, fillA);
    gl.uniform4f(this.locations.u_BorderColor, borderR, borderG, borderB, borderA);
    gl.uniform1f(this.locations.u_BorderWidth, borderWidth);
    gl.uniform1f(this.locations.u_Radius, radius);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);

    // Centered icon (placeholder branch glyph)
    // Position the icon at the visual centroid of the triangle
    // For triangle pointing up, centroid is at 1/3 from the bottom
    const iconCenterX = worldX + width / 2;
    const iconCenterY = worldY + height * 0.45;
    const iconSize = Math.min(width, height) * 0.22;
    this.iconRenderer.addText(
      "",
      iconCenterX,
      iconCenterY,
      iconSize,
      1, 1, 1, 0.85,
      "center",
      "middle"
    );

    // Title centered below the icon
    const titleY = worldY + height * 0.68;
    this.textRenderer.addText(
      node.text,
      worldX + width / 2,
      titleY,
      12,
      r, g, b, 1.0,
      "center",
      "middle"
    );
  }

  private drawSubgraphNode(
    node: NodeData,
    worldX: number,
    worldY: number,
    z: number
  ): void {
    const gl = this.gl;
    const { width, height } = this.frameFor(node);
    const [r, g, b, _] = this.getFontColor();
    const collapsed = Boolean(node.isCollapsed);

    if (node.isDropTarget || node.isSelected) {
      this.setModelMatrix(
        worldX - 3,
        worldY - 3,
        width + 6,
        height + 6,
        z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 1);
      gl.uniform2f(this.locations.u_Dimensions, width + 6, height + 6);
      gl.uniform4f(
        this.locations.u_Color,
        node.isDropTarget ? 0.04 : 0.08,
        node.isDropTarget ? 0.38 : 0.14,
        node.isDropTarget ? 0.16 : 0.68,
        0.09
      );
      gl.uniform4f(this.locations.u_BorderColor, 0.9, 0.95, 1.0, 0.95);
      gl.uniform1f(this.locations.u_BorderWidth, 2.0);
      gl.uniform1f(this.locations.u_Radius, collapsed ? 8.0 : 12.0);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    this.setModelMatrix(worldX, worldY, width, height, z);
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 1);
    gl.uniform2f(this.locations.u_Dimensions, width, height);
    gl.uniform4f(this.locations.u_Color, 0.08, 0.09, 0.1, collapsed ? 0.9 : 0.22);
    gl.uniform4f(this.locations.u_BorderColor, 1.0, 1.0, 1.0, 0.9);
    gl.uniform1f(this.locations.u_BorderWidth, collapsed ? 1.5 : 2.0);
    gl.uniform1f(this.locations.u_Radius, collapsed ? 8.0 : 12.0);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);

    const titleY = collapsed ? height / 2 : 20;
    this.textRenderer.addText(
      node.text,
      worldX + NODE_LAYOUT.padding,
      worldY + titleY,
      14,
      r,
      g,
      b,
      1.0,
      "left",
      "middle"
    );

  }

  private drawHubNode(
    node: NodeData,
    worldX: number,
    worldY: number,
    z: number,
    picking: boolean
  ): void {
    const gl = this.gl;
    const { width, height } = this.frameFor(node);

    if (picking) {
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 0);
      gl.uniform4f(
        this.locations.u_Color,
        node.pickColor[0],
        node.pickColor[1],
        node.pickColor[2],
        1.0
      );
      this.setModelMatrix(worldX, worldY, width, height, z);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      return;
    }

    const [r, g, b, _] = this.getFontColor();
    const slotPadding = 10;
    const iconSlotWidth = Math.max(
      48,
      Math.min(Math.round(height * 0.62), Math.max(56, Math.round(width * 0.28)))
    );
    const iconSlotHeight = Math.max(0, height - slotPadding * 2);
    const iconCenterX = worldX + slotPadding + iconSlotWidth / 2;
    const iconCenterY = worldY + height / 2;
    const labelX = worldX + iconSlotWidth + NODE_LAYOUT.padding * 1.5;
    const titleY = height / 2;

    if (node.isDropTarget || node.isSelected) {
      this.setModelMatrix(
        worldX - 3,
        worldY - 3,
        width + 6,
        height + 6,
        z
      );
      gl.uniform1i(this.locations.u_UseTexture, 0);
      gl.uniform1i(this.locations.u_Use9Slice, 0);
      gl.uniform1i(this.locations.u_RenderMode, 1);
      gl.uniform2f(this.locations.u_Dimensions, width + 6, height + 6);
      gl.uniform4f(
        this.locations.u_Color,
        node.isDropTarget ? 0.04 : 0.08,
        node.isDropTarget ? 0.38 : 0.14,
        node.isDropTarget ? 0.16 : 0.68,
        0.09
      );
      gl.uniform4f(this.locations.u_BorderColor, 0.9, 0.95, 1.0, 0.95);
      gl.uniform1f(this.locations.u_BorderWidth, 2.0);
      gl.uniform1f(this.locations.u_Radius, 16.0);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    this.setModelMatrix(worldX, worldY, width, height, z);
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 1);
    gl.uniform2f(this.locations.u_Dimensions, width, height);
    gl.uniform4f(this.locations.u_Color, 0.08, 0.09, 0.1, 0.92);
    gl.uniform4f(this.locations.u_BorderColor, 1.0, 1.0, 1.0, 0.9);
    gl.uniform1f(this.locations.u_BorderWidth, 2.0);
    gl.uniform1f(this.locations.u_Radius, 16.0);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);

    this.setModelMatrix(
      worldX + slotPadding,
      worldY + slotPadding,
      iconSlotWidth,
      iconSlotHeight,
      z
    );
    gl.uniform1i(this.locations.u_UseTexture, 0);
    gl.uniform1i(this.locations.u_Use9Slice, 0);
    gl.uniform1i(this.locations.u_RenderMode, 1);
    gl.uniform2f(this.locations.u_Dimensions, iconSlotWidth, iconSlotHeight);
    gl.uniform4f(this.locations.u_Color, 0.15, 0.16, 0.18, 0.92);
    gl.uniform4f(this.locations.u_BorderColor, 1.0, 1.0, 1.0, 0.28);
    gl.uniform1f(this.locations.u_BorderWidth, 1.0);
    gl.uniform1f(this.locations.u_Radius, 12.0);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1i(this.locations.u_RenderMode, 0);

    this.iconRenderer.addText(
      "",
      iconCenterX,
      iconCenterY,
      Math.max(18, Math.min(28, iconSlotHeight * 0.48)),
      1.0,
      1.0,
      1.0,
      1.0,
      "center",
      "middle"
    );

    this.textRenderer.addText(
      node.text,
      labelX,
      worldY + titleY,
      14,
      r,
      g,
      b,
      1.0,
      "left",
      "middle"
    );
  }

  private setModelMatrix(x: number, y: number, w: number, h: number, z: number = 0): void {
    this.modelMatrix.setIdentity();
    this.modelMatrix.translate(x, y, z);
    this.modelMatrix.scale(w, h, 1.0);
    this.gl.uniformMatrix4fv(
      this.locations.u_ModelMatrix,
      false,
      this.modelMatrix.elements
    );
    // Also set a_Z as a constant vertex attribute
    this.gl.disableVertexAttribArray(this.locations.a_Z);
    this.gl.vertexAttrib1f(this.locations.a_Z, z);
  }
}
