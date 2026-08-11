import { getWorldPosition } from "./scene-graph.js";
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
    options;
    views = new Map();
    root = null;
    unsubscribers = [];
    constructor(options) {
        this.options = options;
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
        this.unsubscribers.push(events.on("history:command", () => this.reconcile()), events.on("subgraph:collapseToggle", () => this.reconcile()));
    }
    /**
     * Attach a viewport-culling predicate (late-bound because the renderer is
     * created after the layer). Views whose world rect is rejected are dropped
     * from per-frame diffing until they scroll back into view.
     */
    setCull(cull) {
        this.options.cull = cull;
    }
    /**
     * Reconcile the view map against the store: create missing views, destroy
     * orphaned ones, and refresh geometry + state of everything else.
     */
    reconcile() {
        const { store, registry } = this.options;
        const alive = new Set();
        for (const node of store.allNodesMap.values()) {
            if (!registry.isDomRendered(node.nodeType))
                continue;
            if (!store.isEffectivelyVisible(node.id))
                continue;
            alive.add(node.id);
            this.ensureView(node);
        }
        for (const id of [...this.views.keys()]) {
            if (!alive.has(id))
                this.destroyView(id);
        }
    }
    /**
     * Diff every mounted view against its last-known snapshot and only touch
     * the element when a slot changed. Call this from the renderer's per-frame
     * callback so DOM views mirror the WebGL "shadow" at frame granularity.
     */
    syncFrame() {
        if (this.views.size === 0)
            return;
        const { store, cull } = this.options;
        for (const [id, view] of this.views) {
            const node = store.get(id);
            if (!node)
                continue;
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
            if (this.syncState(view, node))
                changed = true;
            if (changed) {
                view.renderer.updateView?.(this.createContext(node, x, y, view.element));
            }
        }
    }
    /** Destroy every view and rebuild from the store (used after graph import). */
    syncAll() {
        for (const id of [...this.views.keys()])
            this.destroyView(id);
        this.reconcile();
    }
    dispose() {
        for (const unsubscribe of this.unsubscribers)
            unsubscribe();
        this.unsubscribers = [];
        for (const id of [...this.views.keys()])
            this.destroyView(id);
        this.root?.remove();
        this.root = null;
    }
    ensureView(node) {
        const existing = this.views.get(node.id);
        if (existing) {
            this.updateView(node.id);
            return;
        }
        const renderer = this.options.registry.getDomRenderer(node.nodeType);
        if (!renderer)
            return;
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
        const view = {
            element,
            renderer,
            node,
            snapshot: this.createSnapshot(node, x, y),
            culled: false,
        };
        this.views.set(node.id, view);
        this.applyZIndex(view, node);
        this.applyState(view, node);
        if (this.root)
            this.root.appendChild(element);
        this.updateView(node.id);
    }
    destroyView(nodeId) {
        const view = this.views.get(nodeId);
        if (!view)
            return;
        const node = this.options.store.get(nodeId) ?? view.node;
        if (view.renderer.destroyView) {
            view.renderer.destroyView(this.createContext(node, 0, 0, view.element));
        }
        view.element.remove();
        this.views.delete(nodeId);
    }
    /** Full unconditional refresh, used on lifecycle events (not per-frame). */
    updateView(nodeId) {
        const view = this.views.get(nodeId);
        const node = this.options.store.get(nodeId);
        if (!view || !node)
            return;
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
    createSnapshot(node, x, y) {
        return {
            x,
            y,
            width: node.width,
            height: node.height,
            zIndex: this.computeZIndex(node),
            selected: !!node.isSelected,
            locked: !!node.isLocked,
            collapsed: this.isNodeCollapsed(node),
            dropTarget: !!node.isDropTarget,
        };
    }
    /**
     * Whether the node is presented collapsed. Subgraphs collapse via their
     * `isCollapsed` flag; leaf types additionally collapse *derived* from being
     * dropped into a group (mirrors the WebGL renderer, which calls
     * `store.shouldCollapseNode()` per frame).
     */
    isNodeCollapsed(node) {
        return !!node.isCollapsed || this.options.store.shouldCollapseNode(node);
    }
    computeZIndex(node) {
        const zTier = this.options.registry.getZTier(node.nodeType);
        let base;
        if (zTier < 0.1)
            base = Z_GROUP;
        else if (zTier < 0.3)
            base = Z_COMPOSITION;
        else
            base = Z_LEAF;
        base += node.id;
        if (node.isSelected)
            base += Z_SELECTED_BOOST;
        return String(base);
    }
    applyZIndex(view, node) {
        const zIndex = this.computeZIndex(node);
        view.snapshot.zIndex = zIndex;
        view.element.style.zIndex = zIndex;
    }
    applyState(view, node) {
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
    syncState(view, node) {
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
    createContext(node, worldX, worldY, element) {
        return {
            node,
            element,
            worldX,
            worldY,
            width: node.width,
            height: node.height,
            isCollapsed: this.isNodeCollapsed(node),
            isSelected: !!node.isSelected,
            isLocked: !!node.isLocked,
            isDropTarget: !!node.isDropTarget,
        };
    }
}
//# sourceMappingURL=dom-node-layer.js.map