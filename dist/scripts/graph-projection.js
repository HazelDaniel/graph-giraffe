import { cloneNodeProps } from "./history-snapshots.js";
/** Create a detached renderer-neutral node projection. */
export function projectNode(node) {
    return {
        ...node,
        textureIds: { ...node.textureIds },
        childIds: [...node.childIds],
        handles: node.handles.map((handle) => ({
            ...handle,
            style: { ...handle.style },
        })),
        props: cloneNodeProps(node.props),
        subgraphRefIds: node.subgraphRefIds ? [...node.subgraphRefIds] : undefined,
    };
}
/** Create a detached renderer-neutral edge projection. */
export function projectEdge(edge) {
    return { ...edge };
}
/** Project the semantic graph without exposing store or renderer objects. */
export function projectGraph(nodes, edges) {
    return {
        nodes: [...nodes].map(projectNode),
        edges: [...edges].map(projectEdge),
    };
}
//# sourceMappingURL=graph-projection.js.map