export const NODE_LAYOUT = {
    headerHeight: 30,
    padding: 10,
    closeBtnPaddingRight: 20,
    closeBtnClickRadius: 15,
    editBtnPaddingRight: 45,
    editBtnClickRadius: 15,
    plusBtnPaddingBottom: 20,
    plusBtnClickRadius: 12,
};
export const HANDLE_LAYOUT = {
    sideInset: 8,
    offsetX: -2,
};
export const DEFAULT_HANDLE_STYLE = {
    shape: 'circle',
    backgroundColor: 'rgba(148, 163, 184, 0.95)',
    connectedBorderColor: 'rgba(34, 197, 94, 1)',
    disconnectedBorderColor: 'rgba(148, 163, 184, 0.85)',
    borderWidth: 2,
    size: 12,
};
export const NODE_SIZE = {
    node: { width: 190, height: 150 },
    nodeCollapsed: { width: 190, height: NODE_LAYOUT.headerHeight },
    group: { width: 220, height: 200 },
    composition: { width: 140, height: 200 },
    compositionChild: { width: 160, height: NODE_LAYOUT.headerHeight },
};
export function isContainerNodeType(nodeType) {
    return nodeType === 'group' || nodeType === 'composition';
}
export function isLeafNodeType(nodeType) {
    return nodeType === 'node' || nodeType === 'composition-child';
}
export function isCandidateNodeType(nodeType, connectionMode) {
    if (connectionMode === 'group') {
        return nodeType === 'group';
    }
    return nodeType === 'node' || nodeType === 'composition';
}
export function getDefaultNodeSize(nodeType, isCollapsed = false) {
    switch (nodeType) {
        case 'group':
        case 'composition':
            return NODE_SIZE.group;
        case 'composition-child':
            return NODE_SIZE.compositionChild;
        case 'node':
            return isCollapsed ? NODE_SIZE.nodeCollapsed : NODE_SIZE.node;
        default:
            return NODE_SIZE.node;
    }
}
//# sourceMappingURL=types.js.map