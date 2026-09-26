function clonePrimitiveList(entries) {
    return entries?.map((entry) => ({
        ...entry,
        value: Array.isArray(entry.value) ? [...entry.value] : entry.value,
        options: entry.options ? [...entry.options] : undefined,
    })) ?? [];
}
function clonePrimitiveGroups(groups) {
    const cloned = {};
    for (const [group, entries] of Object.entries(groups)) {
        cloned[group] = clonePrimitiveList(entries);
    }
    return cloned;
}
export function nodePropValueEqual(left, right) {
    if (Array.isArray(left) || Array.isArray(right)) {
        if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length)
            return false;
        return left.every((value, index) => value === right[index]);
    }
    return left === right;
}
function stringArrayEqual(left, right) {
    const a = left ?? [];
    const b = right ?? [];
    return a.length === b.length && a.every((value, index) => value === b[index]);
}
function propListEqual(left, right) {
    const a = left ?? [];
    const b = right ?? [];
    if (a.length !== b.length)
        return false;
    return a.every((item, index) => {
        const other = b[index];
        return !!other &&
            item.label === other.label &&
            item.uiPrimitive === other.uiPrimitive &&
            nodePropValueEqual(item.value, other.value) &&
            stringArrayEqual(item.options, other.options);
    });
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
export function nodePropsEqual(left, right) {
    if (left === right)
        return true;
    if (!left || !right || !stringArrayEqual(left.groups, right.groups))
        return false;
    for (const key of new Set([...Object.keys(left.booleans), ...Object.keys(right.booleans)])) {
        if (!propListEqual(left.booleans[key], right.booleans[key]))
            return false;
    }
    for (const key of new Set([...Object.keys(left.texts), ...Object.keys(right.texts)])) {
        if (!propListEqual(left.texts[key], right.texts[key]))
            return false;
    }
    for (const key of new Set([...Object.keys(left.enums), ...Object.keys(right.enums)])) {
        if (!propListEqual(left.enums[key], right.enums[key]))
            return false;
    }
    return true;
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
/**
 * Orders node snapshots so every parent is restored before its children.
 *
 * Snapshot arrays are built from Set-insertion order, which is input-order
 * dependent (e.g. deleteSelection may list a child before its parent). When a
 * child is restored before its parent exists, applyNodeSnapshot cannot
 * re-attach it (forceRestoreNodePlacement bails on a missing parent) and the
 * child ends up orphaned. Parents-first ordering makes undo/redo deterministic
 * regardless of capture order.
 */
export function orderSnapshotsParentsFirst(snapshots) {
    const byId = new Map();
    for (const snapshot of snapshots) {
        byId.set(snapshot.id, snapshot);
    }
    const ordered = [];
    const emitted = new Set();
    const visit = (snapshot) => {
        if (emitted.has(snapshot.id))
            return;
        emitted.add(snapshot.id);
        if (snapshot.parentId !== null) {
            const parent = byId.get(snapshot.parentId);
            if (parent)
                visit(parent);
        }
        ordered.push(snapshot);
    };
    for (const snapshot of snapshots) {
        visit(snapshot);
    }
    return ordered;
}
//# sourceMappingURL=history-snapshots.js.map