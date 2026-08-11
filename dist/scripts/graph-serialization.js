/**
 * Graph Serialization — schema types and pure serialize/deserialize functions.
 *
 * No WebGL or DOM dependencies. All rendering state (pickColor, handles,
 * isSelected, visible) is transient and reconstructed on import.
 */
import { cloneNodeProps } from './history-snapshots.js';
/**
 * Capture the full graph state as a portable JSON-serializable snapshot.
 *
 * Only persistent fields are captured — transient state like `pickColor`,
 * `isSelected`, `handles`, and `visible` are omitted.
 */
export function serializeGraph(params) {
    const { store, edgeStore, textureSources, theme, connectionMode, bgColor, fontColor, camera, } = params;
    // Serialize nodes
    const nodes = [];
    for (const node of store.allNodesMap.values()) {
        nodes.push({
            id: node.id,
            nodeType: node.nodeType,
            localX: node.localX,
            localY: node.localY,
            width: node.width,
            height: node.height,
            text: node.text,
            textureIds: { body: node.textureIds.body, head: node.textureIds.head },
            parentId: node.parentId,
            childIds: [...node.childIds],
            compositionRefId: node.compositionRefId,
            subgraphRefId: node.subgraphRefId ?? undefined,
            subgraphRefIds: node.subgraphRefIds?.length
                ? [...node.subgraphRefIds]
                : undefined,
            isLocked: node.isLocked || undefined,
            isCollapsed: node.isCollapsed || undefined,
            props: cloneNodeProps(node.props),
        });
    }
    // Serialize edges
    const edges = [];
    for (const edge of edgeStore.allEdges()) {
        edges.push({
            id: edge.id,
            sourceNodeId: edge.sourceNodeId,
            sourceHandleSide: edge.sourceHandleSide,
            targetNodeId: edge.targetNodeId,
            targetHandleSide: edge.targetHandleSide,
            edgeType: edge.edgeType,
            headType: edge.headType,
            headSkinId: edge.headSkinId,
            label: edge.label,
        });
    }
    // Serialize uploaded textures only
    const textures = [];
    for (const source of textureSources) {
        if (source.sourceType === 'upload') {
            textures.push({
                id: source.id,
                label: source.label,
                kind: source.kind,
                svgText: source.svgText,
            });
        }
    }
    return {
        version: 1,
        editor: {
            theme,
            connectionMode,
            bgColor: [...bgColor],
            fontColor: [...fontColor],
            camera: { panX: camera.panX, panY: camera.panY, zoom: camera.zoom },
        },
        nodes,
        edges,
        textures,
        counters: {
            nodeId: store.nextNodeId - 1, // _nextId (internal counter)
            edgeId: edgeStore.nextEdgeId - 1, // _nextId (internal counter)
        },
    };
}
/**
 * Restore graph state from a snapshot.
 *
 * Clears existing stores, re-creates all nodes and edges, patches mutable
 * fields, and rebuilds handle connection state from edges.
 *
 * Returns the editor-level state for the caller to apply (theme, colors,
 * camera, etc.).
 */
export function deserializeGraph(params) {
    const { snapshot, store, edgeStore, theme, registerTexture } = params;
    // ── Validate ────────────────────────────────────────
    if (snapshot.version !== 1) {
        throw new Error(`Unsupported graph snapshot version: ${snapshot.version}. Expected 1.`);
    }
    // ── Clear existing state ────────────────────────────
    store.clear();
    edgeStore.clear();
    // ── Register uploaded textures ──────────────────────
    if (registerTexture) {
        for (const tex of snapshot.textures) {
            registerTexture({
                id: tex.id,
                label: tex.label,
                kind: tex.kind,
                svgText: tex.svgText,
            });
        }
    }
    // ── Topological sort: roots first, then children ────
    const sorted = topologicalSortNodes(snapshot.nodes);
    // ── Create nodes ────────────────────────────────────
    const importTheme = snapshot.editor.theme ?? theme;
    for (const sn of sorted) {
        const node = store.add(sn.localX, sn.localY, sn.text, importTheme, sn.nodeType, sn.id);
        // Patch mutable fields that add() may have set to defaults
        node.textureIds = { body: sn.textureIds.body, head: sn.textureIds.head };
        node.width = sn.width;
        node.height = sn.height;
        node.compositionRefId = sn.compositionRefId;
        node.subgraphRefId = sn.subgraphRefId ?? null;
        node.subgraphRefIds = sn.subgraphRefIds ? [...sn.subgraphRefIds] : undefined;
        node.isLocked = sn.isLocked ?? false;
        node.isCollapsed = sn.isCollapsed ?? false;
        node.props = cloneNodeProps(sn.props);
    }
    // ── Restore parent-child relationships ──────────────
    for (const sn of sorted) {
        if (sn.parentId !== null) {
            store.setParent(sn.id, sn.parentId);
            // setParent may re-calculate position/size; restore originals
            const node = store.get(sn.id);
            if (node) {
                node.localX = sn.localX;
                node.localY = sn.localY;
                node.width = sn.width;
                node.height = sn.height;
            }
        }
    }
    // ── Create edges ────────────────────────────────────
    for (const se of snapshot.edges) {
        edgeStore.add({
            sourceNodeId: se.sourceNodeId,
            sourceHandleSide: se.sourceHandleSide,
            targetNodeId: se.targetNodeId,
            targetHandleSide: se.targetHandleSide,
            edgeType: se.edgeType,
            headType: se.headType,
            headSkinId: se.headSkinId,
            label: se.label,
            // Bypass multi-connection checks — snapshot is a known-valid state
            sourceCanHaveMultipleConnections: true,
            targetCanHaveMultipleConnections: true,
            idOverride: se.id,
        });
    }
    // ── Patch handle connection state ───────────────────
    for (const se of snapshot.edges) {
        store.updateHandleConnectionState(se.sourceNodeId, se.sourceHandleSide, true);
        store.updateHandleConnectionState(se.targetNodeId, se.targetHandleSide, true);
    }
    // ── Restore ID counters ─────────────────────────────
    store.restoreIdCounter(snapshot.counters.nodeId);
    edgeStore.restoreIdCounter(snapshot.counters.edgeId);
    // ── Return editor state for caller to apply ─────────
    return {
        theme: snapshot.editor.theme,
        connectionMode: snapshot.editor.connectionMode,
        bgColor: [...snapshot.editor.bgColor],
        fontColor: [...snapshot.editor.fontColor],
        camera: { ...snapshot.editor.camera },
    };
}
// ─── Helpers ─────────────────────────────────────────────
/**
 * Sort serialized nodes so that roots come before children.
 *
 * This ensures every parent node is created before its children,
 * which is required for `setParent()` to find the parent.
 */
function topologicalSortNodes(nodes) {
    const nodeMap = new Map();
    for (const node of nodes) {
        nodeMap.set(node.id, node);
    }
    const sorted = [];
    const visited = new Set();
    function visit(node) {
        if (visited.has(node.id))
            return;
        visited.add(node.id);
        // Visit parent first if it exists in the snapshot
        if (node.parentId !== null) {
            const parent = nodeMap.get(node.parentId);
            if (parent) {
                visit(parent);
            }
        }
        sorted.push(node);
    }
    for (const node of nodes) {
        visit(node);
    }
    return sorted;
}
//# sourceMappingURL=graph-serialization.js.map