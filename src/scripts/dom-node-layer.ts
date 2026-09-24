import type { GraphEventEmitter } from "./events.js";
import type { NodeData } from "./types.js";
import type { NodeStore } from "./node-store.js";
import type {
  DomNodeRenderer,
  DomNodeViewContext,
  NodeTypeRegistry,
} from "./node-type-registry.js";
import type { PrimitiveFrame } from "./primitive-geometry.js";

export interface DomNodeLayerOptions {
  store: NodeStore;
  registry: NodeTypeRegistry;
  events: GraphEventEmitter;
  /** Resolved geometry shared with the WebGL/backend projection. */
  getPrimitiveFrame: (nodeId: number) => PrimitiveFrame | undefined;
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
  interactiveObserver?: MutationObserver;
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

// CSS z-index is integral, while the core scene graph uses fractional z
// tiers and creation-order steps. Keep enough precision to preserve both,
// while offsetting the scene so subgraph tiers remain above the DOM root.
const Z_CSS_OFFSET = 1_000_000;
const Z_CSS_SCALE = 1_000_000;

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
  private selectedNodeIds = new Set<number>();

  constructor(private options: DomNodeLayerOptions) {
    const { container, events } = options;
    if (container) {
      this.root = document.createElement("div");
      this.root.id = "gg-dom-nodes";
      this.root.style.cssText =
        "position:absolute; top:0; left:0; width:0; height:0; overflow:visible; pointer-events:none;";
      container.appendChild(this.root);
      if (typeof this.root.addEventListener === "function") this.root.addEventListener("click", (event) => {
        const target = event.target as HTMLElement | null;
        const host = target?.closest?.("[data-node-id]");
        if (!host || event.defaultPrevented) return;
        const nodeId = Number(host.getAttribute("data-node-id"));
        const node = this.options.store.get(nodeId);
        if (!node) return;
        this.options.events.dispatch("node:click", {
          nodeId,
          nodeType: node.nodeType,
          event: event as MouseEvent,
        });
      });
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
    this.syncSelectedNodeIds();
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
    this.syncSelectedNodeIds();

    for (const [id, view] of this.views) {
      const node = store.get(id);
      if (!node) continue;

      const frame = this.options.getPrimitiveFrame(id);
      if (!frame) continue;
      const { worldX: x, worldY: y, width, height } = frame;

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

    const frame = this.options.getPrimitiveFrame(node.id);
    if (!frame) return;
    const { worldX: x, worldY: y } = frame;
    const placeholder = document.createElement("div");
    const ctx = this.createContext(node, x, y, placeholder);
    const element = renderer.createView(ctx) ?? placeholder;

    element.dataset.nodeId = String(node.id);
    element.dataset.nodeType = node.nodeType;
    element.style.position = "absolute";
    element.style.pointerEvents = "none";
    if (renderer.interactive) element.style.pointerEvents = "auto";
    element.style.boxSizing = "border-box";
    element.style.transformOrigin = "0 0";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${frame.width}px`;
    element.style.height = `${frame.height}px`;

    const view: DomNodeView = {
      element,
      renderer,
      node,
      snapshot: this.createSnapshot(node, x, y),
      culled: false,
    };
    this.views.set(node.id, view);
    this.syncPointerEvents(view);
    if (renderer.interactiveDescendants && typeof MutationObserver !== "undefined") {
      view.interactiveObserver = new MutationObserver(() => {
        this.syncPointerEvents(view);
      });
      view.interactiveObserver.observe(element, { childList: true, subtree: true });
    }
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
    view.interactiveObserver?.disconnect();
    view.element.remove();
    this.views.delete(nodeId);
  }

  /** Full unconditional refresh, used on lifecycle events (not per-frame). */
  private updateView(nodeId: number): void {
    const view = this.views.get(nodeId);
    const node = this.options.store.get(nodeId);
    if (!view || !node) return;

    const snapshot = view.snapshot;
    const frame = this.options.getPrimitiveFrame(node.id);
    if (!frame) return;
    const { worldX: x, worldY: y } = frame;

    snapshot.x = x;
    snapshot.y = y;
    snapshot.width = frame.width;
    snapshot.height = frame.height;
    view.element.style.left = `${x}px`;
    view.element.style.top = `${y}px`;
    view.element.style.width = `${frame.width}px`;
    view.element.style.height = `${frame.height}px`;

    this.applyZIndex(view, node);
    this.applyState(view, node);
    view.renderer.updateView?.(this.createContext(node, x, y, view.element));
  }

  private createSnapshot(node: NodeData, x: number, y: number): ViewSnapshot {
    return {
      x,
      y,
      width: this.options.getPrimitiveFrame(node.id)?.width ?? node.width,
      height: this.options.getPrimitiveFrame(node.id)?.height ?? node.height,
      zIndex: this.computeZIndex(node),
      selected: !!node.isSelected,
      locked: !!node.isLocked,
      collapsed: this.isNodeCollapsed(node),
      dropTarget: !!node.isDropTarget,
    };
  }

  /**
   * Whether the node is presented collapsed. Single source of truth on the
   * store: explicit subgraph `isCollapsed` flags OR the derived collapse of a
   * leaf dropped inside a group.
   */
  private isNodeCollapsed(node: NodeData): boolean {
    return this.options.store.isNodeCollapsed(node);
  }

  private computeZIndex(node: NodeData): string {
    const sceneZ = this.options.store.getZForNode(node.id, this.selectedNodeIds);
    return String(Math.round(Z_CSS_OFFSET + sceneZ * Z_CSS_SCALE));
  }

  private syncSelectedNodeIds(): void {
    this.selectedNodeIds.clear();
    for (const node of this.options.store.allNodesMap.values()) {
      if (node.isSelected) this.selectedNodeIds.add(node.id);
    }
  }

  private applyZIndex(view: DomNodeView, node: NodeData): void {
    const zIndex = this.computeZIndex(node);
    view.snapshot.zIndex = zIndex;
    view.element.style.zIndex = zIndex;
  }

  /**
   * Keep the primitive surface transparent to the canvas. Only explicitly
   * declared embedded controls may participate in native DOM interaction.
   */
  private syncPointerEvents(view: DomNodeView): void {
    const { element, renderer } = view;
    element.style.pointerEvents = renderer.interactive ? "auto" : "none";
    if (!renderer.interactiveDescendants) return;
    for (const control of element.querySelectorAll(renderer.interactiveDescendants)) {
      (control as HTMLElement).style.pointerEvents = "auto";
    }
  }

  private applyState(view: DomNodeView, node: NodeData): void {
    const snapshot = view.snapshot;
    snapshot.selected = !!node.isSelected;
    snapshot.locked = !!node.isLocked;
    snapshot.collapsed = this.isNodeCollapsed(node);
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

    const collapsed = this.isNodeCollapsed(node);
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
    const frame = this.options.getPrimitiveFrame(node.id);
    const children = (node.childIds ?? [])
      .map((childId) => this.options.store.get(childId))
      .filter((child): child is NodeData => Boolean(child))
      .map((child) => {
        const childFrame = this.options.getPrimitiveFrame(child.id);
        return {
          node: child,
          props: child.props,
          isCollapsed: this.isNodeCollapsed(child),
          width: childFrame?.width ?? child.width,
          height: childFrame?.height ?? child.height,
        };
      });
    return {
      node,
      props: node.props,
      children,
      element,
      worldX,
      worldY,
      width: frame?.width ?? node.width,
      height: frame?.height ?? node.height,
      isCollapsed: this.isNodeCollapsed(node),
      isSelected: !!node.isSelected,
      isLocked: !!node.isLocked,
      isDropTarget: !!node.isDropTarget,
      isMeasurement: false,
      getNode: (id) => this.options.store.get(id),
      stopGraphPropagation: (event) => event.stopPropagation(),
    };
  }
}
