/**
 * Canonical edge collection with adjacency indexes for fast incident-edge
 * cleanup when nodes are deleted.
 */
export class EdgeStore {
    edges = new Map();
    adjacency = new Map();
    _nextId = 0;
    get nextEdgeId() {
        return this._nextId + 1;
    }
    allEdges() {
        return [...this.edges.values()];
    }
    get(id) {
        return this.edges.get(id);
    }
    hasConnection(nodeId, side) {
        const sideMap = this.adjacency.get(nodeId);
        if (!sideMap)
            return false;
        const edgeIds = sideMap.get(side);
        return Boolean(edgeIds && edgeIds.size > 0);
    }
    add(params) {
        const { sourceNodeId, sourceHandleSide, targetNodeId, targetHandleSide, sourceCanHaveMultipleConnections = false, targetCanHaveMultipleConnections = false, edgeType = 'orthogonal', headType = 'arrow', headSkinId = 'arrow', label = '', isSelected = false, visible = true, idOverride, } = params;
        if (sourceNodeId === targetNodeId)
            return null;
        if (!sourceCanHaveMultipleConnections && this.hasConnection(sourceNodeId, sourceHandleSide))
            return null;
        if (!targetCanHaveMultipleConnections && this.hasConnection(targetNodeId, targetHandleSide))
            return null;
        const existing = this.findEdgeByEndpoints(sourceNodeId, sourceHandleSide, targetNodeId, targetHandleSide);
        if (existing)
            return existing;
        const id = idOverride ?? ++this._nextId;
        this._nextId = Math.max(this._nextId, id);
        const edge = {
            id,
            sourceNodeId,
            sourceHandleSide,
            targetNodeId,
            targetHandleSide,
            edgeType,
            headType,
            headSkinId,
            label,
            isSelected,
            visible,
        };
        this.edges.set(id, edge);
        this.addAdjacency(id, sourceNodeId, sourceHandleSide);
        this.addAdjacency(id, targetNodeId, targetHandleSide);
        return edge;
    }
    remove(id) {
        const edge = this.edges.get(id);
        if (!edge)
            return null;
        this.removeAdjacency(id, edge.sourceNodeId, edge.sourceHandleSide);
        this.removeAdjacency(id, edge.targetNodeId, edge.targetHandleSide);
        this.edges.delete(id);
        return edge;
    }
    removeEdgesForNode(nodeId) {
        const sideMap = this.adjacency.get(nodeId);
        if (!sideMap)
            return [];
        const edgeIds = new Set();
        for (const ids of sideMap.values()) {
            for (const edgeId of ids) {
                edgeIds.add(edgeId);
            }
        }
        const removed = [];
        for (const edgeId of edgeIds) {
            const edge = this.remove(edgeId);
            if (edge)
                removed.push(edge);
        }
        return removed;
    }
    removeEdgesForNodes(nodeIds) {
        const edgeIds = new Set();
        for (const nodeId of nodeIds) {
            const sideMap = this.adjacency.get(nodeId);
            if (!sideMap)
                continue;
            for (const ids of sideMap.values()) {
                for (const edgeId of ids) {
                    edgeIds.add(edgeId);
                }
            }
        }
        const removed = [];
        for (const edgeId of edgeIds) {
            const edge = this.remove(edgeId);
            if (edge)
                removed.push(edge);
        }
        return removed;
    }
    findEdgeByEndpoints(sourceNodeId, sourceHandleSide, targetNodeId, targetHandleSide) {
        for (const edge of this.edges.values()) {
            if (edge.sourceNodeId === sourceNodeId &&
                edge.sourceHandleSide === sourceHandleSide &&
                edge.targetNodeId === targetNodeId &&
                edge.targetHandleSide === targetHandleSide) {
                return edge;
            }
        }
        return undefined;
    }
    addAdjacency(edgeId, nodeId, side) {
        let sideMap = this.adjacency.get(nodeId);
        if (!sideMap) {
            sideMap = new Map();
            this.adjacency.set(nodeId, sideMap);
        }
        let edgeIds = sideMap.get(side);
        if (!edgeIds) {
            edgeIds = new Set();
            sideMap.set(side, edgeIds);
        }
        edgeIds.add(edgeId);
    }
    removeAdjacency(edgeId, nodeId, side) {
        const sideMap = this.adjacency.get(nodeId);
        if (!sideMap)
            return;
        const edgeIds = sideMap.get(side);
        if (!edgeIds)
            return;
        edgeIds.delete(edgeId);
        if (edgeIds.size === 0) {
            sideMap.delete(side);
        }
        if (sideMap.size === 0) {
            this.adjacency.delete(nodeId);
        }
    }
}
//# sourceMappingURL=edge-store.js.map