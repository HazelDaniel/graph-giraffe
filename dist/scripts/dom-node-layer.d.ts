import type { GraphEventEmitter } from "./events.js";
import type { NodeStore } from "./node-store.js";
import type { NodeTypeRegistry } from "./node-type-registry.js";
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
/**
 * Owns the DOM views for every node whose type is rendered with
 * `renderMode: "dom"`. The layer is purely presentational and follows the
 * renderer's "shadow" of each node: it reconciles structure on lifecycle
 * events (`history:command`, `subgraph:collapseToggle`) and resolves every
 * transform/state change by diffing against the authoritative store at frame
 * time via `syncFrame()` — no per-event position updates.
 */
export declare class DomNodeLayer {
    private options;
    private views;
    private root;
    private unsubscribers;
    constructor(options: DomNodeLayerOptions);
    /**
     * Attach a viewport-culling predicate (late-bound because the renderer is
     * created after the layer). Views whose world rect is rejected are dropped
     * from per-frame diffing until they scroll back into view.
     */
    setCull(cull: (worldX: number, worldY: number, width: number, height: number) => boolean): void;
    /**
     * Reconcile the view map against the store: create missing views, destroy
     * orphaned ones, and refresh geometry + state of everything else.
     */
    reconcile(): void;
    /**
     * Diff every mounted view against its last-known snapshot and only touch
     * the element when a slot changed. Call this from the renderer's per-frame
     * callback so DOM views mirror the WebGL "shadow" at frame granularity.
     */
    syncFrame(): void;
    /** Destroy every view and rebuild from the store (used after graph import). */
    syncAll(): void;
    dispose(): void;
    private ensureView;
    private destroyView;
    /** Full unconditional refresh, used on lifecycle events (not per-frame). */
    private updateView;
    private createSnapshot;
    /**
     * Whether the node is presented collapsed. Single source of truth on the
     * store: explicit subgraph `isCollapsed` flags OR the derived collapse of a
     * leaf dropped inside a group.
     */
    private isNodeCollapsed;
    private computeZIndex;
    private applyZIndex;
    private applyState;
    /** Diff-based state sync; returns true when any slot changed. */
    private syncState;
    private createContext;
}
