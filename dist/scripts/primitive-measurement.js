function measurementInputKey(node, isCollapsed, children = []) {
    return JSON.stringify({
        nodeType: node.nodeType,
        text: node.text,
        width: node.width,
        height: node.height,
        props: node.props,
        isCollapsed,
        children: children.map((child) => ({
            id: child.node.id,
            nodeType: child.node.nodeType,
            props: child.props,
            isCollapsed: child.isCollapsed,
            width: child.width,
            height: child.height,
        })),
    });
}
function readDimension(element, axis) {
    const rect = element.getBoundingClientRect?.();
    const rectValue = rect?.[axis];
    if (Number.isFinite(rectValue) && rectValue > 0)
        return rectValue;
    const offsetValue = axis === "width" ? element.offsetWidth : element.offsetHeight;
    return Number.isFinite(offsetValue) && offsetValue > 0 ? offsetValue : 0;
}
/**
 * Maintains measurement-only shadow templates for registered primitives.
 * Visible DOM renderers are never called by this class.
 */
export class PrimitiveMeasurementProvider {
    registry;
    geometry;
    isCollapsed;
    root = null;
    entries = new Map();
    resizeObserver = null;
    constructor(registry, geometry, isCollapsed = (node) => Boolean(node.isCollapsed)) {
        this.registry = registry;
        this.geometry = geometry;
        this.isCollapsed = isCollapsed;
    }
    setCollapseResolver(isCollapsed) {
        this.isCollapsed = isCollapsed;
    }
    sync(nodes) {
        const allNodes = [...nodes];
        const nodesById = new Map(allNodes.map((node) => [node.id, node]));
        const depths = new Map();
        let maxDepth = 0;
        const depthOf = (node) => {
            const cached = depths.get(node.id);
            if (cached !== undefined)
                return cached;
            const path = [];
            const visiting = new Set();
            let current = node;
            let baseDepth = -1;
            while (current) {
                const knownDepth = depths.get(current.id);
                if (knownDepth !== undefined) {
                    baseDepth = knownDepth;
                    break;
                }
                if (visiting.has(current.id))
                    break;
                visiting.add(current.id);
                path.push(current);
                current = current.parentId === null
                    ? undefined
                    : nodesById.get(current.parentId);
            }
            for (let index = path.length - 1; index >= 0; index -= 1) {
                baseDepth += 1;
                depths.set(path[index].id, baseDepth);
            }
            return depths.get(node.id) ?? 0;
        };
        // Resolve descendants first so growable container templates receive the
        // latest child measurements during the same synchronization pass. Depth
        // buckets preserve that dependency order without an O(n log n) sort.
        const nodesByDepth = new Map();
        for (const node of allNodes) {
            const depth = depthOf(node);
            maxDepth = Math.max(maxDepth, depth);
            const bucket = nodesByDepth.get(depth) ?? [];
            bucket.push(node);
            nodesByDepth.set(depth, bucket);
        }
        const alive = new Set();
        for (let depth = maxDepth; depth >= 0; depth -= 1) {
            for (const node of nodesByDepth.get(depth) ?? []) {
                const template = this.registry.getMeasurementTemplate(node.nodeType);
                if (!template || typeof document === "undefined")
                    continue;
                alive.add(node.id);
                const existing = this.entries.get(node.id);
                const isCollapsed = this.isCollapsed(node);
                const children = this.getChildren(node, nodesById);
                const inputKey = measurementInputKey(node, isCollapsed, children);
                if (existing && existing.inputKey === inputKey) {
                    this.measure(existing);
                    continue;
                }
                if (existing)
                    this.destroy(node.id);
                this.mount(node, template, isCollapsed, children);
            }
        }
        for (const id of [...this.entries.keys()]) {
            if (!alive.has(id))
                this.destroy(id);
        }
    }
    refresh(nodeId) {
        const entry = this.entries.get(nodeId);
        if (entry)
            this.measure(entry);
    }
    isReady(nodes) {
        for (const node of nodes) {
            if (!this.registry.getMeasurementTemplate(node.nodeType))
                continue;
            const measurement = this.geometry.getIntrinsicMeasurement(node.id);
            if (!measurement || measurement.width <= 0 || measurement.height <= 0) {
                return false;
            }
        }
        return true;
    }
    dispose() {
        for (const id of [...this.entries.keys()])
            this.destroy(id);
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.root?.remove();
        this.root = null;
    }
    ensureRoot() {
        if (this.root)
            return this.root;
        this.root = document.createElement("div");
        this.root.dataset.ggPrimitiveMeasurement = "true";
        this.root.style.cssText =
            "position:fixed; left:-100000px; top:-100000px; width:max-content; height:max-content; visibility:hidden; pointer-events:none; contain:layout style paint;";
        document.body?.appendChild(this.root);
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver((entries) => {
                for (const observation of entries) {
                    const match = [...this.entries.values()].find((entry) => entry.element === observation.target);
                    if (match)
                        this.measure(match);
                }
            });
        }
        return this.root;
    }
    mount(node, template, isCollapsed, children) {
        const host = document.createElement("div");
        host.style.cssText = "display:block; width:max-content; height:max-content;";
        const element = template({
            node,
            props: node.props,
            children,
            element: host,
            isCollapsed,
        });
        element.dataset.ggPrimitiveMeasurementNode = String(node.id);
        element.style.pointerEvents = "none";
        this.ensureRoot().appendChild(element);
        const entry = {
            node,
            element,
            inputKey: measurementInputKey(node, isCollapsed, children),
            revision: 0,
        };
        this.entries.set(node.id, entry);
        this.resizeObserver?.observe(element);
        this.measure(entry);
    }
    getChildren(node, nodesById) {
        return (node.childIds ?? [])
            .map((childId) => nodesById.get(childId))
            .filter((child) => Boolean(child))
            .map((child) => {
            const childCollapsed = this.isCollapsed(child);
            const intrinsic = this.geometry.getIntrinsicMeasurement(child.id);
            return {
                node: child,
                props: child.props,
                isCollapsed: childCollapsed,
                width: intrinsic?.width ?? child.width,
                height: intrinsic?.height ?? child.height,
            };
        });
    }
    measure(entry) {
        const width = readDimension(entry.element, "width");
        const height = readDimension(entry.element, "height");
        if (width <= 0 || height <= 0)
            return;
        entry.revision += 1;
        this.geometry.setIntrinsicMeasurement(entry.node.id, {
            width,
            height,
            revision: entry.revision,
        });
    }
    destroy(nodeId) {
        const entry = this.entries.get(nodeId);
        if (!entry)
            return;
        this.resizeObserver?.unobserve(entry.element);
        entry.element.remove();
        this.entries.delete(nodeId);
        this.geometry.clearIntrinsicMeasurement(nodeId);
    }
}
//# sourceMappingURL=primitive-measurement.js.map