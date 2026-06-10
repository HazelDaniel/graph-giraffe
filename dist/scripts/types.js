export const NODE_LAYOUT = {
    headerHeight: 30,
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
    node: { width: 180, height: 150 },
    group: { width: 240, height: 200 },
    composition: { width: 240, height: 200 },
    compositionChild: { width: 180, height: NODE_LAYOUT.headerHeight },
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
export function getDefaultNodeSize(nodeType) {
    switch (nodeType) {
        case 'group':
        case 'composition':
            return NODE_SIZE.group;
        case 'composition-child':
            return NODE_SIZE.compositionChild;
        case 'node':
        default:
            return NODE_SIZE.node;
    }
}
//# sourceMappingURL=types.js.map