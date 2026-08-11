function clonePrimitiveList(entries) {
    return entries?.map((entry) => ({ ...entry })) ?? [];
}
function clonePrimitiveGroups(groups) {
    const cloned = {};
    for (const [group, entries] of Object.entries(groups)) {
        cloned[group] = clonePrimitiveList(entries);
    }
    return cloned;
}
export function cloneNodeProps(props) {
    if (!props)
        return undefined;
    return {
        groups: [...props.groups],
        booleans: clonePrimitiveGroups(props.booleans),
        texts: clonePrimitiveGroups(props.texts),
        enums: clonePrimitiveGroups(props.enums),
    };
}
export function captureNodeHistorySnapshot(node) {
    return {
        id: node.id,
        nodeType: node.nodeType,
        localX: node.localX,
        localY: node.localY,
        width: node.width,
        height: node.height,
        text: node.text,
        textureIds: { ...node.textureIds },
        visible: node.visible,
        isSelected: node.isSelected,
        isDropTarget: Boolean(node.isDropTarget),
        isLocked: Boolean(node.isLocked),
        isCollapsed: Boolean(node.isCollapsed),
        parentId: node.parentId,
        childIds: [...node.childIds],
        compositionRefId: node.compositionRefId,
        subgraphRefId: node.subgraphRefId,
        subgraphRefIds: node.subgraphRefIds ? [...node.subgraphRefIds] : undefined,
        props: cloneNodeProps(node.props),
        handleStates: node.handles.map((handle) => ({
            side: handle.side,
            isConnected: handle.isConnected,
        })),
    };
}
export function captureEdgeHistorySnapshot(edge) {
    return { ...edge };
}
//# sourceMappingURL=history-snapshots.js.map