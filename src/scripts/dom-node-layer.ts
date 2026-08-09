import type { GraphEventEmitter } from "./events.js";
import type { NodeData } from "./types.js";
import type { NodeStore } from "./node-store.js";
import type {
  DomNodeRenderer,
  DomNodeViewContext,
  NodeTypeRegistry,
} from "./node-type-registry.js";
import { getWorldPosition } from "./scene-graph.js";

export interface DomNodeLayerOptions {
  store: NodeStore;
  registry: NodeTypeRegistry;
  events: GraphEventEmitter;
  /**
   * World-space anchor container. The layer nests its own root inside it so
   * every view inherits the container's camera transform (translate+scale),
   * which matches `worldToScreen()` exactly. All views keep `pointer-events:
   * none` so the WebGL canvas remains authoritative for hit-testing.
   */
  container: HTMLElement | null;
  /**
   * Optional viewport-culling predicate (typically the renderer's
   * `isRectInViewport`). When provided, views whose world rect falls outside
   * the camera viewport are hidden (`display:none`) instead of being updated
   * every frame, so DOM cost tracks the visible graph — not the whole graph.
   * Can be set late via `setCull()` once the renderer exists.
   */
  cull?: (worldX: number, worldY: number, width: number, height: number) => boolean;
}

interface DomNodeView {
  element: HTMLElement;
  renderer: DomNodeRenderer;
  /** Last-known node reference, retained so `destroyView` can clean up even
   *  after the node has been removed from the store. */
  node: NodeData;
  /** Last-known presentation state, compared against per frame so views are
   *  only touched when something actually changed. */
  snapshot: ViewSnapshot;
  /** Whether the view is currently hidden by viewport culling. */
  culled: boolean;
}

interface ViewSnapshot {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: string;
  selected: boolean;
  locked: boolean;
  collapsed: boolean;
  dropTarget: boolean;
}

// z-index buckets mirror the WebGL z-tier stacking (groups behind leaves).
const Z_GROUP = 1_000_000;
const Z_COMPOSITION = 2_000_000;
const Z_LEAF = 3_000_000;
const Z_SELECTED_BOOST = 100_000_000;

/**
 * Owns the DOM views for every node whose type is rendered with
 * `renderMode: "dom"`. The layer is purely presentational and follows the
 * renderer's "shadow" of each node: it reconciles structure on lifecycle
 * events (`history:command`, `subgraph:collapseToggle`) and resolves every
 * transform/state change by diffing against the authoritative store at frame
 * time via `syncFrame()` — no per-event position updates.
 */
export class DomNodeLayer {
  private views = new Map<number, DomNodeView>();
  private root: HTMLElement | null = null;
  private unsubscribers: Array<() => void> = [];

  constructor(private options: DomNodeLayerOptions) {
    const { container, events } = options;
    if (container) {
      this.root = document.createElement("div");
      this.root.id = "gg-dom-nodes";
      this.root.style.cssText =
        "position:absolute; top:0; left:0; width:0; height:0; overflow:visible; pointer-events:none;";
      container.appendChild(this.root);
    }
    // Lifecycle mutations only go through commands, so `history:command` is
    // the single observation point for create/delete/label/prop/reparent.
    // Runtime visibility toggles (subgraph collapse) are a lifecycle change
    // too — collapsed members must mount/unmount. Motion + transient state
    // (position, selection, resize) are intentionally left to `syncFrame()`
    // so DOM views track the WebGL "shadow" reps at frame granularity.
    this.unsubscribers.push(
      events.on("history:command", () => this.reconcile()),
      events.on("subgraph:collapseToggle", () => this.reconcile())
    );
  }

  /**
   * Attach a viewport-culling predicate (late-bound because the renderer is
   * created after the layer). Views whose world rect is rejected are dropped
   * from per-frame diffing until they scroll back into view.
   */
  setCull(
    cull: (worldX: number, worldY: number, width: number, height: number) => boolean
  ): void {
    this.options.cull = cull;
  }

  /**
   * Reconcile the view map against the store: create missing views, destroy
   * orphaned ones, and refresh geometry + state of everything else.
   */
  reconcile(): void {
    const { store, registry } = this.options;
    const alive = new Set<number>();

    for (const node of store.allNodesMap.values()) {
      if (!registry.isDomRendered(node.nodeType)) continue;
      if (!store.isEffectivelyVisible(node.id)) continue;
      alive.add(node.id);
      this.ensureView(node);
    }

    for (const id of [...this.views.keys()]) {
      if (!alive.has(id)) this.destroyView(id);
    }
  }

  /**
   * Diff every mounted view against its last-known snapshot and only touch
   * the element when a slot changed. Call this from the renderer's per-frame
   * callback so DOM views mirror the WebGL "shadow" at frame granularity.
   */
  syncFrame(): void {
    if (this.views.size === 0) return;
    const { store, cull } = this.options;

    for (const [id, view] of this.views) {
      const node = store.get(id);
      if (!node) continue;

      const { x, y } = getWorldPosition(id, store.allNodesMap);
      const width = node.width;
      const height = node.height;

      // Viewport culling: views fully outside the camera viewport are already
      // skipped by the WebGL draw pass, so skip their DOM diff too. Kept
      // mounted (just hidden) so scrolling back into view is cheap and avoids
      // layout churn, mirroring the renderer's culling window (incl. padding).
      if (cull && !cull(x, y, width, height)) {
        if (!view.culled) {
          view.culled = true;
          view.element.style.display = "none";
        }
        continue;
      }

      const snapshot = view.snapshot;

      let changed = false;

      if (view.culled) {
        view.culled = false;
        view.element.style.display = "";
        // Full refresh so the freshly-reshown view matches current state.
        this.updateView(id);
        continue;
      }

      if (x !== snapshot.x || y !== snapshot.y ||
          width !== snapshot.width || height !== snapshot.height) {
        snapshot.x = x;
        snapshot.y = y;
        snapshot.width = width;
        snapshot.height = height;
        view.element.style.left = `${x}px`;
        view.element.style.top = `${y}px`;
        view.element.style.width = `${width}px`;
        view.element.style.height = `${height}px`;
        changed = true;
      }

      const zIndex = this.computeZIndex(node);
      if (snapshot.zIndex !== zIndex) {
        snapshot.zIndex = zIndex;
        view.element.style.zIndex = zIndex;
      }

      if (this.syncState(view, node)) changed = true;

      if (changed) {
        view.renderer.updateView?.(
          this.createContext(node, x, y, view.element)
        );
      }
    }
  }

  /** Destroy every view and rebuild from the store (used after graph import). */
  syncAll(): void {
    for (const id of [...this.views.keys()]) this.destroyView(id);
    this.reconcile();
  }

  dispose(): void {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.unsubscribers = [];
    for (const id of [...this.views.keys()]) this.destroyView(id);
    this.root?.remove();
    this.root = null;
  }

  private ensureView(node: NodeData): void {
    const existing = this.views.get(node.id);
    if (existing) {
      this.updateView(node.id);
      return;
    }

    const renderer = this.options.registry.getDomRenderer(node.nodeType);
    if (!renderer) return;

    const { x, y } = getWorldPosition(node.id, this.options.store.allNodesMap);
    const placeholder = document.createElement("div");
    const ctx = this.createContext(node, x, y, placeholder);
    const element = renderer.createView(ctx) ?? placeholder;

    element.dataset.nodeId = String(node.id);
    element.dataset.nodeType = node.nodeType;
    element.style.position = "absolute";
    element.style.pointerEvents = "none";
    element.style.boxSizing = "border-box";
    element.style.transformOrigin = "0 0";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${node.width}px`;
    element.style.height = `${node.height}px`;

    const view: DomNodeView = {
      element,
      renderer,
      node,
      snapshot: this.createSnapshot(node, x, y),
      culled: false,
    };
    this.views.set(node.id, view);
    this.applyZIndex(view, node);
    this.applyState(view, node);
    if (this.root) this.root.appendChild(element);
    this.updateView(node.id);
  }

  private destroyView(nodeId: number): void {
    const view = this.views.get(nodeId);
    if (!view) return;
    const node = this.options.store.get(nodeId) ?? view.node;
    if (view.renderer.destroyView) {
      view.renderer.destroyView(this.createContext(node, 0, 0, view.element));
    }
    view.element.remove();
    this.views.delete(nodeId);
  }

  /** Full unconditional refresh, used on lifecycle events (not per-frame). */
  private updateView(nodeId: number): void {
    const view = this.views.get(nodeId);
    const node = this.options.store.get(nodeId);
    if (!view || !node) return;

    const snapshot = view.snapshot;
    const { x, y } = getWorldPosition(node.id, this.options.store.allNodesMap);

    snapshot.x = x;
    snapshot.y = y;
    snapshot.width = node.width;
    snapshot.height = node.height;
    view.element.style.left = `${x}px`;
    view.element.style.top = `${y}px`;
    view.element.style.width = `${node.width}px`;
    view.element.style.height = `${node.height}px`;

    this.applyZIndex(view, node);
    this.applyState(view, node);
    view.renderer.updateView?.(this.createContext(node, x, y, view.element));
  }

  private createSnapshot(node: NodeData, x: number, y: number): ViewSnapshot {
    return {
      x,
      y,
      width: node.width,
      height: node.height,
      zIndex: this.computeZIndex(node),
      selected: !!node.isSelected,
      locked: !!node.isLocked,
      collapsed: !!node.isCollapsed,
      dropTarget: !!node.isDropTarget,
    };
  }

  private computeZIndex(node: NodeData): string {
    const zTier = this.options.registry.getZTier(node.nodeType);
    let base: number;
    if (zTier < 0.1) base = Z_GROUP;
    else if (zTier < 0.3) base = Z_COMPOSITION;
    else base = Z_LEAF;
    base += node.id;

    if (node.isSelected) base += Z_SELECTED_BOOST;
    return String(base);
  }

  private applyZIndex(view: DomNodeView, node: NodeData): void {
    const zIndex = this.computeZIndex(node);
    view.snapshot.zIndex = zIndex;
    view.element.style.zIndex = zIndex;
  }

  private applyState(view: DomNodeView, node: NodeData): void {
    const snapshot = view.snapshot;
    snapshot.selected = !!node.isSelected;
    snapshot.locked = !!node.isLocked;
    snapshot.collapsed = !!node.isCollapsed;
    snapshot.dropTarget = !!node.isDropTarget;
    view.element.toggleAttribute("data-selected", snapshot.selected);
    view.element.toggleAttribute("data-locked", snapshot.locked);
    view.element.toggleAttribute("data-collapsed", snapshot.collapsed);
    view.element.toggleAttribute("data-drop-target", snapshot.dropTarget);
  }

  /** Diff-based state sync; returns true when any slot changed. */
  private syncState(view: DomNodeView, node: NodeData): boolean {
    const snapshot = view.snapshot;
    let changed = false;

    const selected = !!node.isSelected;
    if (snapshot.selected !== selected) {
      snapshot.selected = selected;
      view.element.toggleAttribute("data-selected", selected);
      changed = true;
    }

    const locked = !!node.isLocked;
    if (snapshot.locked !== locked) {
      snapshot.locked = locked;
      view.element.toggleAttribute("data-locked", locked);
      changed = true;
    }

    const collapsed = !!node.isCollapsed;
    if (snapshot.collapsed !== collapsed) {
      snapshot.collapsed = collapsed;
      view.element.toggleAttribute("data-collapsed", collapsed);
      changed = true;
    }

    const dropTarget = !!node.isDropTarget;
    if (snapshot.dropTarget !== dropTarget) {
      snapshot.dropTarget = dropTarget;
      view.element.toggleAttribute("data-drop-target", dropTarget);
      changed = true;
    }

    return changed;
  }

  private createContext(
    node: NodeData,
    worldX: number,
    worldY: number,
    element: HTMLElement
  ): DomNodeViewContext {
    return {
      node,
      element,
      worldX,
      worldY,
      width: node.width,
      height: node.height,
      isCollapsed: !!node.isCollapsed,
      isSelected: !!node.isSelected,
      isLocked: !!node.isLocked,
      isDropTarget: !!node.isDropTarget,
    };
  }
}