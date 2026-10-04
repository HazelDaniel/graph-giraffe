import type { Camera } from "../scripts/camera.js";
import type { EdgeStore } from "../scripts/edge-store.js";
import type { NodeStore } from "../scripts/node-store.js";
import { getWorldPosition } from "../scripts/scene-graph.js";
import {
  isContainerNodeType,
  type NodeData,
} from "../scripts/types.js";
import type { NodeTypeRegistry } from "../scripts/node-type-registry.js";

export interface MinimapScene {
  store: NodeStore;
  edgeStore: EdgeStore;
  camera: Camera;
  canvas: HTMLCanvasElement;
}

export interface MinimapCanvasRect {
  width: number;
  height: number;
}

export interface MinimapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface MinimapTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface MinimapNodeFrame {
  id: number;
  nodeType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  selected: boolean;
  radius: number;
}

export interface MinimapEdgeFrame {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  stroke: string;
}

export interface MinimapFrame {
  bounds: MinimapBounds;
  transform: MinimapTransform;
  viewport: { x: number; y: number; width: number; height: number };
  nodes: MinimapNodeFrame[];
  edges: MinimapEdgeFrame[];
}

export interface MinimapGraphFrame {
  bounds: MinimapBounds;
  transform: MinimapTransform;
  nodes: MinimapNodeFrame[];
  edges: MinimapEdgeFrame[];
}

export interface MinimapCameraState {
  panX: number;
  panY: number;
  zoom: number;
}

export interface MinimapNavigateDetail {
  worldX: number;
  worldY: number;
  bounds: MinimapBounds;
}

interface NodePaint {
  fill: string;
  stroke: string;
}

const MINIMAP_PADDING = 12;

const BUILTIN_PALETTE: Record<string, NodePaint> = {
  node: {
    fill: "rgba(96, 165, 250, 0.78)",
    stroke: "rgba(191, 219, 254, 0.95)",
  },
  hub: {
    fill: "rgba(167, 139, 250, 0.78)",
    stroke: "rgba(221, 214, 254, 0.95)",
  },
  branch: {
    fill: "rgba(251, 146, 60, 0.78)",
    stroke: "rgba(255, 237, 213, 0.95)",
  },
  group: {
    fill: "rgba(34, 197, 94, 0.46)",
    stroke: "rgba(134, 239, 172, 0.88)",
  },
  composition: {
    fill: "rgba(245, 158, 11, 0.52)",
    stroke: "rgba(253, 230, 138, 0.92)",
  },
  "composition-child": {
    fill: "rgba(148, 163, 184, 0.7)",
    stroke: "rgba(226, 232, 240, 0.95)",
  },
  subgraph: {
    fill: "rgba(20, 184, 166, 0.36)",
    stroke: "rgba(153, 246, 228, 0.92)",
  },
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getNodePaint(nodeType: string): NodePaint {
  const builtin = BUILTIN_PALETTE[nodeType];
  if (builtin) return builtin;

  const hue = hashString(nodeType) % 360;
  return {
    fill: `hsla(${hue}, 72%, 62%, 0.72)`,
    stroke: `hsla(${hue}, 78%, 82%, 0.95)`,
  };
}

function getNodeRadius(node: NodeData, registry?: NodeTypeRegistry): number {
  const desc = registry?.get(node.nodeType);
  if (desc?.category === "container" || isContainerNodeType(node.nodeType, registry)) {
    return node.nodeType === "subgraph" ? 12 : 10;
  }
  return node.height <= 40 ? 6 : 8;
}

function ensurePositiveBounds(bounds: MinimapBounds): MinimapBounds {
  const width = Math.max(1, bounds.width);
  const height = Math.max(1, bounds.height);
  return {
    ...bounds,
    width,
    height,
  };
}

export function getViewportWorldRect(
  camera: MinimapCameraState,
  canvasRect: MinimapCanvasRect
): MinimapBounds {
  const width = Math.max(1, canvasRect.width);
  const height = Math.max(1, canvasRect.height);
  const left = (0 - camera.panX) / camera.zoom;
  const top = (0 - camera.panY) / camera.zoom;
  const right = (width - camera.panX) / camera.zoom;
  const bottom = (height - camera.panY) / camera.zoom;

  return {
    minX: Math.min(left, right),
    minY: Math.min(top, bottom),
    maxX: Math.max(left, right),
    maxY: Math.max(top, bottom),
    width: Math.abs(right - left),
    height: Math.abs(bottom - top),
  };
}

export function calculateMinimapBounds(
  store: NodeStore,
  camera: MinimapCameraState,
  canvasRect: MinimapCanvasRect
): MinimapBounds {
  const registry = store.getRegistry();
  const allNodesMap = store.allNodesMap;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let sawNode = false;

  for (const node of allNodesMap.values()) {
    if (!node.visible || !store.isEffectivelyVisible(node.id)) continue;

    const world = getWorldPosition(node.id, allNodesMap, registry);
    minX = Math.min(minX, world.x);
    minY = Math.min(minY, world.y);
    maxX = Math.max(maxX, world.x + node.width);
    maxY = Math.max(maxY, world.y + node.height);
    sawNode = true;
  }

  if (!sawNode) {
    return getViewportWorldRect(camera, canvasRect);
  }

  return ensurePositiveBounds({
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  });
}

export function createMinimapTransform(
  bounds: MinimapBounds,
  canvasRect: MinimapCanvasRect,
  padding: number = MINIMAP_PADDING
): MinimapTransform {
  const safeBounds = ensurePositiveBounds(bounds);
  const width = Math.max(1, canvasRect.width);
  const height = Math.max(1, canvasRect.height);
  const contentWidth = Math.max(1, width - padding * 2);
  const contentHeight = Math.max(1, height - padding * 2);
  const scale = Math.min(
    contentWidth / safeBounds.width,
    contentHeight / safeBounds.height
  );
  const renderedWidth = safeBounds.width * scale;
  const renderedHeight = safeBounds.height * scale;
  return {
    scale,
    offsetX: padding + (contentWidth - renderedWidth) / 2,
    offsetY: padding + (contentHeight - renderedHeight) / 2,
  };
}

export function projectWorldPoint(
  worldX: number,
  worldY: number,
  bounds: MinimapBounds,
  transform: MinimapTransform
): { x: number; y: number } {
  return {
    x: transform.offsetX + (worldX - bounds.minX) * transform.scale,
    y: transform.offsetY + (worldY - bounds.minY) * transform.scale,
  };
}

export function projectWorldRect(
  worldX: number,
  worldY: number,
  width: number,
  height: number,
  bounds: MinimapBounds,
  transform: MinimapTransform
): { x: number; y: number; width: number; height: number } {
  const topLeft = projectWorldPoint(worldX, worldY, bounds, transform);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: Math.max(2, width * transform.scale),
    height: Math.max(2, height * transform.scale),
  };
}

export function computeCenteredCameraState(
  camera: MinimapCameraState,
  canvasRect: MinimapCanvasRect,
  worldX: number,
  worldY: number
): MinimapCameraState {
  const width = Math.max(1, canvasRect.width);
  const height = Math.max(1, canvasRect.height);
  return {
    panX: width / 2 - worldX * camera.zoom,
    panY: height / 2 - worldY * camera.zoom,
    zoom: camera.zoom,
  };
}

export function computeCameraStateFromWorldPoint(
  camera: MinimapCameraState,
  canvasRect: MinimapCanvasRect,
  _bounds: MinimapBounds,
  worldX: number,
  worldY: number
): MinimapCameraState {
  return {
    panX: Math.max(1, canvasRect.width) / 2 - worldX * camera.zoom,
    panY: Math.max(1, canvasRect.height) / 2 - worldY * camera.zoom,
    zoom: camera.zoom,
  };
}

export function buildMinimapGraphFrame(
  scene: MinimapScene,
  canvasRect: MinimapCanvasRect = scene.canvas.getBoundingClientRect()
): MinimapGraphFrame {
  const allNodesMap = scene.store.allNodesMap;
  const bounds = calculateMinimapBounds(scene.store, scene.camera, {
    width: canvasRect.width,
    height: canvasRect.height,
  });
  const transform = createMinimapTransform(bounds, {
    width: canvasRect.width,
    height: canvasRect.height,
  });
  const registry = scene.store.getRegistry();

  const nodes: MinimapNodeFrame[] = [];
  for (const node of allNodesMap.values()) {
    if (!node.visible || !scene.store.isEffectivelyVisible(node.id)) continue;

    const world = getWorldPosition(node.id, allNodesMap, registry);
    const paint = getNodePaint(node.nodeType);
    const rect = projectWorldRect(
      world.x,
      world.y,
      node.width,
      node.height,
      bounds,
      transform
    );
    nodes.push({
      id: node.id,
      nodeType: node.nodeType,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      fill: paint.fill,
      stroke: paint.stroke,
      selected: node.isSelected,
      radius: getNodeRadius(node, registry),
    });
  }

  const visibleIds = new Set(nodes.map((node) => node.id));
  const edges: MinimapEdgeFrame[] = [];
  for (const edge of scene.edgeStore.allEdges()) {
    const source = scene.store.get(edge.sourceNodeId);
    const target = scene.store.get(edge.targetNodeId);
    if (!source || !target) continue;
    if (!visibleIds.has(source.id) || !visibleIds.has(target.id)) continue;

    const sourceWorld = getWorldPosition(
      source.id,
      allNodesMap,
      registry
    );
    const targetWorld = getWorldPosition(
      target.id,
      allNodesMap,
      registry
    );
    const sourceCenter = projectWorldPoint(
      sourceWorld.x + source.width / 2,
      sourceWorld.y + source.height / 2,
      bounds,
      transform
    );
    const targetCenter = projectWorldPoint(
      targetWorld.x + target.width / 2,
      targetWorld.y + target.height / 2,
      bounds,
      transform
    );

    edges.push({
      sourceX: sourceCenter.x,
      sourceY: sourceCenter.y,
      targetX: targetCenter.x,
      targetY: targetCenter.y,
      stroke: "rgba(148, 163, 184, 0.38)",
    });
  }

  return {
    bounds,
    transform,
    nodes,
    edges,
  };
}

export function buildMinimapFrame(
  scene: MinimapScene,
  viewportAnchor?: { x: number; y: number }
): MinimapFrame {
  const canvasRect = scene.canvas.getBoundingClientRect();
  const graphFrame = buildMinimapGraphFrame(scene);
  const viewport = getViewportWorldRect(scene.camera, {
    width: canvasRect.width,
    height: canvasRect.height,
  });
  const viewportWidth = (viewport.maxX - viewport.minX) * graphFrame.transform.scale;
  const viewportHeight = (viewport.maxY - viewport.minY) * graphFrame.transform.scale;
  const viewportCenter = viewportAnchor
    ? viewportAnchor
    : projectWorldPoint(
        (viewport.minX + viewport.maxX) / 2,
        (viewport.minY + viewport.maxY) / 2,
        graphFrame.bounds,
        graphFrame.transform
      );

  return {
    ...graphFrame,
    viewport: {
      x: viewportCenter.x - viewportWidth / 2,
      y: viewportCenter.y - viewportHeight / 2,
      width: viewportWidth,
      height: viewportHeight,
    },
  };
}

class MinimapFrameCache {
  private cachedRevision: number = -1;
  private cachedWidth: number = -1;
  private cachedHeight: number = -1;
  private cachedFrame: MinimapGraphFrame | null = null;

  get(
    scene: MinimapScene,
    revision: number,
    canvasRect: MinimapCanvasRect = scene.canvas.getBoundingClientRect()
  ): MinimapGraphFrame {
    const width = canvasRect.width;
    const height = canvasRect.height;

    if (
      this.cachedFrame &&
      this.cachedRevision === revision &&
      this.cachedWidth === width &&
      this.cachedHeight === height
    ) {
      return this.cachedFrame;
    }

    this.cachedRevision = revision;
    this.cachedWidth = width;
    this.cachedHeight = height;
    this.cachedFrame = buildMinimapGraphFrame(scene, canvasRect);
    return this.cachedFrame;
  }
}

const STYLE_TEMPLATE = `
  :host {
    position: absolute;
    top: 4.85rem;
    left: 2rem;
    z-index: 9;
    display: block;
    width: clamp(180px, 15vw, 260px);
    height: clamp(120px, 18vh, 180px);
    pointer-events: auto;
    touch-action: none;
    user-select: none;
  }

  :host([hidden]) {
    display: none;
  }

  .root {
    width: 100%;
    height: 100%;
    padding: 0.55rem;
    border-radius: 0.6rem;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: rgba(1, 1, 1, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.12);
    // box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28);
    overflow: hidden;
    border: 2px solid var(--text-muted);
    box-sizing: border-box;
  }

  .label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    // margin-bottom: 0.4rem;
    font: 600 0.64rem/1.1 Inter, sans-serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(226, 232, 240, 0.78);
    height: 1.6rem;
    position: relative;
  }
  .label>span {
    display: flex;
    position: absolute;
    top: 4px;
    left: 4px;
    height: 100%;
    width: 100%;
    align-items: inherit;
    justify-content: flex-start;
  }
  .label svg {
    height: 60%;
  }

  canvas {
    width: 100%;
    height: calc(100% - 1.1rem);
    display: block;
    border-radius: 0.75rem;
    // background: rgba(3, 3, 3, 1);
  }
`;

const MinimapBase =
  typeof HTMLElement !== "undefined"
    ? HTMLElement
    : ((class {}) as unknown as typeof HTMLElement);

export class GGMinimap extends MinimapBase {
  #shadow = this.attachShadow({ mode: "open" });

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private enabled = true;
  private scene: MinimapScene | null = null;
  private graphRevision = 0;
  private activePointerId: number | null = null;
  private activePointerAnchor: { x: number; y: number } | null = null;
  private frameCache = new MinimapFrameCache();

  connectedCallback(): void {
    this.render();
    this.canvas = this.#shadow.querySelector("canvas");
    this.ctx = this.canvas?.getContext("2d") ?? null;

    if (this.canvas) {
      this.canvas.addEventListener("pointerdown", this.handlePointerDown);
      this.canvas.addEventListener("pointermove", this.handlePointerMove);
      this.canvas.addEventListener("pointerup", this.handlePointerUp);
      this.canvas.addEventListener("pointercancel", this.handlePointerCancel);
      this.canvas.addEventListener("pointerleave", this.handlePointerCancel);
    }

    this.syncVisibility();
    this.renderScene();
  }

  disconnectedCallback(): void {
    if (this.canvas) {
      this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
      this.canvas.removeEventListener("pointermove", this.handlePointerMove);
      this.canvas.removeEventListener("pointerup", this.handlePointerUp);
      this.canvas.removeEventListener("pointercancel", this.handlePointerCancel);
      this.canvas.removeEventListener("pointerleave", this.handlePointerCancel);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.syncVisibility();
    if (this.enabled) {
      this.renderScene();
    }
  }

  updateScene(scene: MinimapScene, graphRevision: number = 0): void {
    this.scene = scene;
    this.graphRevision = graphRevision;
    this.renderScene();
  }

  private render(): void {
    this.#shadow.innerHTML = `
      <style>${STYLE_TEMPLATE}</style>
      <div class="root" part="root" aria-label="Minimap overview">
        <div class="label">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2.43627 5.14686C2 5.64345 2 6.49488 2 8.19773V17.591C2 18.797 2 19.4 2.3146 19.854C2.62919 20.3079 3.17921 20.4986 4.27924 20.88L5.57343 21.3286C6.27436 21.5717 6.81371 21.7586 7.26633 21.879C7.5616 21.9576 7.83333 21.7258 7.83333 21.4203V6.2701C7.83333 6.02118 7.64964 5.81111 7.40837 5.74991C7.01914 5.65118 6.55127 5.48897 5.91002 5.26666C4.35676 4.72817 3.58014 4.45893 2.98922 4.73235C2.77941 4.82942 2.59116 4.97054 2.43627 5.14686Z" fill="currentColor"></path> <path d="M12.6204 3.48096L11.0844 4.54596C10.5287 4.93124 10.1215 5.2136 9.77375 5.41491C9.60895 5.51032 9.5 5.68291 9.5 5.87334V20.9203C9.5 21.2909 9.88398 21.5222 10.1962 21.3225C10.5312 21.1082 10.9149 20.8422 11.3796 20.5199L12.9156 19.4549C13.4712 19.0697 13.8785 18.7873 14.2262 18.586C14.3911 18.4906 14.5 18.318 14.5 18.1276V3.08063C14.5 2.71004 14.116 2.47866 13.8038 2.67836C13.4688 2.89271 13.0851 3.15874 12.6204 3.48096Z" fill="currentColor"></path> <path d="M19.7208 3.12093L18.4266 2.67226C17.7256 2.42923 17.1863 2.24228 16.7337 2.12187C16.4384 2.04333 16.1667 2.2751 16.1667 2.58064V17.7308C16.1667 17.9797 16.3504 18.1898 16.5916 18.251C16.9809 18.3497 17.4488 18.5119 18.09 18.7342C19.6432 19.2727 20.4199 19.542 21.0108 19.2686C21.2206 19.1715 21.4088 19.0304 21.5637 18.854C22 18.3575 22 17.506 22 15.8032V6.40988C22 5.2039 22 4.60091 21.6854 4.14695C21.3708 3.69298 20.8208 3.5023 19.7208 3.12093Z" fill="currentColor"></path> </g></svg>
        </div>
        <canvas id="minimap-canvas"></canvas>
      </div>
    `;
  }

  private syncVisibility(): void {
    this.toggleAttribute("hidden", !this.enabled);
  }

  private resizeCanvas(): { width: number; height: number } {
    if (!this.canvas) return { width: 0, height: 0 };

    const rect = this.canvas.getBoundingClientRect();
    const dpr =
      typeof window !== "undefined"
        ? Math.max(1, window.devicePixelRatio || 1)
        : 1;
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;

    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    return { width: rect.width, height: rect.height };
  }

  private renderScene(): void {
    if (!this.enabled || !this.canvas || !this.ctx || !this.scene) return;

    const canvasRect = this.resizeCanvas();
    if (canvasRect.width <= 0 || canvasRect.height <= 0) return;

    const graphFrame = this.frameCache.get(
      this.scene,
      this.graphRevision,
      canvasRect
    );
    const viewportWorld = getViewportWorldRect(this.scene.camera, {
      width: canvasRect.width,
      height: canvasRect.height,
    });
    const viewportWidth =
      (viewportWorld.maxX - viewportWorld.minX) * graphFrame.transform.scale;
    const viewportHeight =
      (viewportWorld.maxY - viewportWorld.minY) * graphFrame.transform.scale;
    const viewportCenter = this.activePointerAnchor
      ? this.activePointerAnchor
      : projectWorldPoint(
          (viewportWorld.minX + viewportWorld.maxX) / 2,
          (viewportWorld.minY + viewportWorld.maxY) / 2,
          graphFrame.bounds,
          graphFrame.transform
        );
    const ctx = this.ctx;
    this.clear(ctx, canvasRect.width, canvasRect.height);
    this.drawFrame(
      ctx,
      graphFrame,
      {
        x: viewportCenter.x,
        y: viewportCenter.y,
        width: viewportWidth,
        height: viewportHeight,
      },
      canvasRect.width,
      canvasRect.height
    );
  }

  private clear(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas?.width ?? width, this.canvas?.height ?? height);
    ctx.restore();
    ctx.fillStyle = "rgba(10, 10, 10, 0.2)";
    ctx.fillRect(0, 0, width, height);
  }

  private drawFrame(
    ctx: CanvasRenderingContext2D,
    frame: MinimapGraphFrame,
    viewport: { x: number; y: number; width: number; height: number },
    width: number,
    height: number
  ): void {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Background grid hint.
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    const step = 24;
    for (let x = 0; x <= width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (const edge of frame.edges) {
      ctx.beginPath();
      ctx.strokeStyle = edge.stroke;
      ctx.lineWidth = 1;
      ctx.moveTo(edge.sourceX, edge.sourceY);
      ctx.lineTo(edge.targetX, edge.targetY);
      ctx.stroke();
    }

    for (const node of frame.nodes) {
      const selected = Boolean(this.scene?.store.get(node.id)?.isSelected);
      ctx.beginPath();
      ctx.fillStyle = node.fill;
      ctx.strokeStyle = selected ? "rgba(255, 255, 255, 0.95)" : node.stroke;
      ctx.lineWidth = selected ? 2 : 1;
      ctx.roundRect(node.x, node.y, node.width, node.height, node.radius);
      ctx.fill();
      ctx.stroke();
    }

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    const paddingX = 40;
    const paddingY = 40;
    ctx.roundRect(viewport.x - (paddingX / 2), viewport.y - (paddingY / 2), paddingX, paddingY, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  private handlePointerDown = (event: PointerEvent): void => {
    if (!this.enabled || !this.scene || event.button !== 0) return;
    event.preventDefault();
    this.activePointerId = event.pointerId;
    this.canvas?.setPointerCapture?.(event.pointerId);
    this.navigateFromEvent(event);
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.enabled || !this.scene) return;
    if (this.activePointerId !== event.pointerId) return;
    event.preventDefault();
    this.navigateFromEvent(event);
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (this.activePointerId !== event.pointerId) return;
    this.activePointerId = null;
    this.activePointerAnchor = null;
    this.canvas?.releasePointerCapture?.(event.pointerId);
    this.renderScene();
  };

  private handlePointerCancel = (event: PointerEvent): void => {
    if (this.activePointerId !== event.pointerId) return;
    this.activePointerId = null;
    this.activePointerAnchor = null;
    this.canvas?.releasePointerCapture?.(event.pointerId);
    this.renderScene();
  };

  private navigateFromEvent(event: PointerEvent): void {
    if (!this.canvas || !this.scene) return;

    const rect = this.canvas.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    if (
      localX < 0 ||
      localY < 0 ||
      localX > rect.width ||
      localY > rect.height
    ) {
      return;
    }
    this.activePointerAnchor = { x: localX, y: localY };
    const graphFrame = this.frameCache.get(
      this.scene,
      this.graphRevision,
      { width: rect.width, height: rect.height }
    );
    const worldX =
      graphFrame.bounds.minX + (localX - graphFrame.transform.offsetX) / graphFrame.transform.scale;
    const worldY =
      graphFrame.bounds.minY + (localY - graphFrame.transform.offsetY) / graphFrame.transform.scale;

    this.dispatchEvent(
      new CustomEvent<MinimapNavigateDetail>("gg-minimap-navigate", {
        detail: { worldX, worldY, bounds: graphFrame.bounds },
        bubbles: true,
        composed: true,
      })
    );
  }
}

if (typeof customElements !== "undefined" && !customElements.get("gg-minimap")) {
  if (!customElements.get("gg-minimap")) customElements.define("gg-minimap", GGMinimap);
}

declare global {
  interface HTMLElementTagNameMap {
    "gg-minimap": GGMinimap;
  }
}
