export const NODE_LAYOUT = {
    headerHeight: 30,
    padding: 10,
    closeBtnPaddingRight: 20,
    closeBtnClickRadius: 15,
    editBtnPaddingRight: 45,
    editBtnClickRadius: 15,
    plusBtnPaddingBottom: 20,
    plusBtnClickRadius: 12,
    spotlightBtnPaddingRight: 20,
    spotlightBtnPaddingBottom: 20,
    spotlightBtnClickRadius: 12,
    lockBtnTopY: 20, // matches group header titleY
    lockBtnClickRadius: 12,
    subgraphBtnPaddingRight: 18,
    subgraphBtnSpacing: 24,
    subgraphBtnClickRadius: 12,
    subgraphLinkIconSize: 16,
    subgraphLinkClickRadius: 12,
};
/**
 * Local position of a subgraph clone's "open original" link, centered in the
 * body area below the header. Shared by the WebGL overlay (drawGenericRoundedRect)
 * and the editor's click hit test so they stay in sync.
 */
export function getSubgraphLinkLocal(node) {
    return {
        x: node.width / 2,
        y: NODE_LAYOUT.headerHeight + (node.height - NODE_LAYOUT.headerHeight) / 2,
    };
}
export const HANDLE_LAYOUT = {
    sideInset: 8,
    offsetX: -2,
    offsetY: -2,
};
export const DEFAULT_HANDLE_STYLE = {
    shape: "circle",
    backgroundColor: "rgba(33, 36, 39, 0.95)",
    connectedBorderColor: "#2C9F92",
    disconnectedBorderColor: "rgba(148, 163, 184, 0.85)",
    borderWidth: 2,
    size: 12,
};
export const NODE_SIZE = {
    node: { width: 190, height: 150 },
    hub: { width: 240, height: 100 },
    branch: { width: 140, height: 120 },
    nodeCollapsed: { width: 190, height: NODE_LAYOUT.headerHeight },
    group: { width: 220, height: 200 },
    composition: { width: 140, height: 200 },
    compositionChild: { width: 160, height: NODE_LAYOUT.headerHeight },
    subgraph: { width: 220, height: 160 },
    subgraphCollapsed: { width: 190, height: NODE_LAYOUT.headerHeight },
};
export function isContainerNodeType(nodeType, registry) {
    if (registry)
        return registry.isContainer(nodeType);
    return nodeType === "group" || nodeType === "composition" || nodeType === "subgraph";
}
export function isLeafNodeType(nodeType, registry) {
    if (registry)
        return registry.isLeaf(nodeType);
    return nodeType === "node" || nodeType === "hub" || nodeType === "branch" || nodeType === "composition-child";
}
export function isNodePrimitiveType(nodeType, registry) {
    if (registry) {
        const desc = registry.get(nodeType);
        return desc ? desc.category === "leaf" && desc.handles.always : false;
    }
    return nodeType === "node" || nodeType === "hub" || nodeType === "branch";
}
export function isCandidateNodeType(nodeType, connectionMode, registry) {
    if (registry)
        return registry.isConnectionCandidate(nodeType, connectionMode);
    if (connectionMode === "group") {
        return nodeType === "group";
    }
    return isNodePrimitiveType(nodeType) || nodeType === "composition" || nodeType === "subgraph";
}
export function getDefaultNodeSize(nodeType, isCollapsed = false, registry) {
    if (registry)
        return registry.getDefaultSize(nodeType, isCollapsed);
    switch (nodeType) {
        case "group":
        case "composition":
            return NODE_SIZE.group;
        case "subgraph":
            return isCollapsed ? NODE_SIZE.subgraphCollapsed : NODE_SIZE.subgraph;
        case "composition-child":
            return NODE_SIZE.compositionChild;
        case "hub":
            return NODE_SIZE.hub;
        case "branch":
            return NODE_SIZE.branch;
        case "node":
            return isCollapsed ? NODE_SIZE.nodeCollapsed : NODE_SIZE.node;
        default:
            return NODE_SIZE.node;
    }
}
//# sourceMappingURL=types.js.map