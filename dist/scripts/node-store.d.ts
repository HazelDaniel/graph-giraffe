import { ConnectionMode, HandleStyle, NodeHandleData, NodeData, ThemeName, NodeType } from './types.js';
import type { NodeTypeRegistry } from './node-type-registry.js';
/**
 * Owns the canonical node list.
 * Groups, compositions, and leaf nodes are stored in separate z-order buckets
 * so the renderer can keep compositions above groups without changing layout.
 */
export declare class NodeStore {
    private gl;
    private registry?;
    /** Group nodes — drawn first (behind compositions and leaves). */
    readonly groups: Map<number, NodeData>;
    /** Leaf nodes — drawn last (in front of groups and compositions). */
    readonly nodes: Map<number, NodeData>;
    private _nextId;
    /** Per-type creation order for tiered z-ordering. */
    private _groupOrder;
    private _nextGroupOrder;
    private _compositionOrder;
    private _nextCompositionOrder;
    private _leafOrder;
    private _nextLeafOrder;
    private a11yTree;
    private connectionMode;
    private handleStyle;
    private currentTheme;
    constructor(gl: WebGL2RenderingContext, connectionMode?: ConnectionMode, handleStyle?: HandleStyle, registry?: NodeTypeRegistry | undefined);
    getTheme(): ThemeName;
    /** Remove all nodes and reset internal counters. Used during graph import. */
    clear(): void;
    /**
     * Ensure the internal ID counter is at least `value`.
     * Called after graph import so new nodes get IDs above the imported max.
     */
    restoreIdCounter(value: number): void;
    /** Expose the registry for renderer-adjacent views like the minimap. */
    getRegistry(): NodeTypeRegistry | undefined;
    /** The id that the next call to add() will assign. Useful for labelling. */
    get nextNodeId(): number;
    /**
     * Returns a combined Map view of all nodes (containers + leaves).
     * Used by scene-graph functions that need to traverse the full tree.
     */
    get allNodesMap(): Map<number, NodeData>;
    /** O(1) lookup across both maps. */
    get(id: number): NodeData | undefined;
    /**
     * Returns the ids that would be removed by `remove(id)`.
     *
     * Container nodes cascade to descendants. Leaf nodes may still have
     * descendants in the current tree model, but those children are promoted
     * rather than deleted.
     */
    collectRemovedIds(id: number): number[];
    /** Create a new node at world coordinates (localX, localY). */
    add(localX: number, localY: number, text: string, theme: ThemeName, nodeType?: NodeType, idOverride?: number): NodeData;
    setConnectionMode(connectionMode: ConnectionMode): void;
    setHandleStyle(handleStyle: HandleStyle): void;
    /**
     * Duplicate a normal node into a composition as a composition-child.
     * The source node remains untouched; the clone is returned so callers can
     * select or further manipulate it.
     */
    duplicateIntoComposition(sourceId: number, compositionId: number, theme: ThemeName): NodeData | null;
    /**
     * Remove a node and free its GPU texture.
     * Container nodes cascade to their descendants. Leaf nodes still keep the
     * old promotion path as a safety net for future leaf variants.
     */
    remove(id: number): void;
    /**
     * Removes a container while preserving its children in their current visual
     * positions by promoting them to the removed container's parent.
     */
    removeContainerOnly(id: number): boolean;
    /**
     * Compute the z-value for a node using tiered per-type creation order.
     *
     * Three tiers keep subgraphs behind the rest of the scene:
     *   Subgraphs     → base z = -0.05 - subgraphIdx * Z_STEP (lowest)
     *   Groups        → base z = groupIdx * Z_STEP
     *   Compositions  → base z = Z_COMP_TIER + compIdx * Z_STEP
     *   Leaves        → base z = Z_LEAF_TIER + leafIdx * Z_STEP (highest)
     *
     * Selected non-container nodes and children of selected containers
     * get Z_SELECTION_BOOST to render on top of everything.
     */
    getZForNode(nodeId: number, selectedNodeIds: Set<number>): number;
    /** Returns the currently selected node, if any. */
    getSelected(): NodeData | undefined;
    /** Deselect every node. */
    deselectAll(): void;
    /** Clear isDropTarget on every node. */
    clearDropTargets(): void;
    /** Rebuild textures for all nodes under a new theme. */
    regenerateTextures(theme: ThemeName): void;
    /** Update the label text of a node and regenerate its texture. */
    updateLabel(id: number, newLabel: string, theme: ThemeName): void;
    updateHandleConnectionState(nodeId: number, side: NodeHandleData['side'], isConnected: boolean): void;
    setCompositionReference(nodeId: number, compositionId: number, theme: ThemeName): boolean;
    clearCompositionReference(nodeId: number, theme: ThemeName): boolean;
    getCompositionReferenceNodes(compositionId: number): NodeData[];
    refreshCompositionReferences(compositionId: number, theme: ThemeName): void;
    /** Assign a new parent to a child node, preserving world position. */
    setParent(childId: number, newParentId: number | null): boolean;
    /** Restore a node to an exact local position and parent. */
    restoreNodePlacement(childId: number, localX: number, localY: number, parentId: number | null): boolean;
    /** Restore a node without re-validating the historical parent relationship. */
    forceRestoreNodePlacement(childId: number, localX: number, localY: number, parentId: number | null): boolean;
    /**
     * Translates the direct children of `rootId` by the same world delta.
     *
     * Collapsed subgraphs use this so the shell and direct children stay
     * aligned while nested descendants keep their relative offsets through
     * the normal parent chain.
     */
    translateDescendants(rootId: number, deltaX: number, deltaY: number): void;
    /**
     * All visible nodes in render order:
     * subgraphs first, then groups, compositions, and leaves.
     */
    visibleNodes(): NodeData[];
    isEffectivelyVisible(nodeId: number): boolean;
    /** Re-calculates bounds of a container node based on its children. */
    updateContainerBounds(containerId: number, theme: ThemeName): void;
    /** Compatibility wrapper for the previous group-specific API. */
    updateGroupBounds(groupId: number, theme: ThemeName): void;
    /** Ensure a node is stored in the correct map based on its nodeType. */
    private syncToMap;
    private insertNode;
    syncNodePresentation(nodeId: number): void;
    shouldCollapseNode(node: NodeData): boolean;
    private getPresentedNodeSize;
    private getCompositionReferencePreviewChildren;
    private createHandleState;
    private createNodeRecord;
    private updateSubgraphBounds;
    private calculatePropHeight;
    private createDefaultProps;
}
