import type {
  NodeTypeRegistry,
  PrimitiveMeasurementChild,
} from "./node-type-registry.js";
import type { NodeData } from "./types.js";
import { PrimitiveGeometry } from "./primitive-geometry.js";

interface MeasurementEntry {
  node: NodeData;
  element: HTMLElement;
  inputKey: string;
  revision: number;
}

function measurementInputKey(
  node: NodeData,
  isCollapsed: boolean,
  children: readonly PrimitiveMeasurementChild[] = []
): string {
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

function readDimension(element: HTMLElement, axis: "width" | "height"): number {
  const rect = element.getBoundingClientRect?.();
  const rectValue = rect?.[axis];
  if (Number.isFinite(rectValue) && rectValue > 0) return rectValue;

  const offsetValue = axis === "width" ? element.offsetWidth : element.offsetHeight;
  return Number.isFinite(offsetValue) && offsetValue > 0 ? offsetValue : 0;
}

/**
 * Maintains measurement-only shadow templates for registered primitives.
 * Visible DOM renderers are never called by this class.
 */
export class PrimitiveMeasurementProvider {
  private root: HTMLElement | null = null;
  private entries = new Map<number, MeasurementEntry>();
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private registry: NodeTypeRegistry,
    private geometry: PrimitiveGeometry,
    private isCollapsed: (node: NodeData) => boolean = (node) => Boolean(node.isCollapsed)
  ) {}

  setCollapseResolver(isCollapsed: (node: NodeData) => boolean): void {
    this.isCollapsed = isCollapsed;
  }

  sync(nodes: Iterable<NodeData>): void {
    const allNodes = [...nodes];
    const nodesById = new Map(allNodes.map((node) => [node.id, node]));
    const depths = new Map<number, number>();
    let maxDepth = 0;
    const depthOf = (node: NodeData): number => {
      const cached = depths.get(node.id);
      if (cached !== undefined) return cached;

      const path: NodeData[] = [];
      const visiting = new Set<number>();
      let current: NodeData | undefined = node;
      let baseDepth = -1;
      while (current) {
        const knownDepth = depths.get(current.id);
        if (knownDepth !== undefined) {
          baseDepth = knownDepth;
          break;
        }
        if (visiting.has(current.id)) break;
        visiting.add(current.id);
        path.push(current);
        current = current.parentId === null
          ? undefined
          : nodesById.get(current.parentId);
      }

      for (let index = path.length - 1; index >= 0; index -= 1) {
        baseDepth += 1;
        depths.set(path[index]!.id, baseDepth);
      }
      return depths.get(node.id) ?? 0;
    };

    // Resolve descendants first so growable container templates receive the
    // latest child measurements during the same synchronization pass. Depth
    // buckets preserve that dependency order without an O(n log n) sort.
    const nodesByDepth = new Map<number, NodeData[]>();
    for (const node of allNodes) {
      const depth = depthOf(node);
      maxDepth = Math.max(maxDepth, depth);
      const bucket = nodesByDepth.get(depth) ?? [];
      bucket.push(node);
      nodesByDepth.set(depth, bucket);
    }
    const alive = new Set<number>();

    for (let depth = maxDepth; depth >= 0; depth -= 1) {
      for (const node of nodesByDepth.get(depth) ?? []) {
        const template = this.registry.getMeasurementTemplate(node.nodeType);
        if (!template || typeof document === "undefined") continue;
        alive.add(node.id);

        const existing = this.entries.get(node.id);
        const isCollapsed = this.isCollapsed(node);
        const children = this.getChildren(node, nodesById);
        const inputKey = measurementInputKey(node, isCollapsed, children);
        if (existing && existing.inputKey === inputKey) {
          this.measure(existing);
          continue;
        }

        if (existing) this.destroy(node.id);
        this.mount(node, template, isCollapsed, children);
      }
    }

    for (const id of [...this.entries.keys()]) {
      if (!alive.has(id)) this.destroy(id);
    }
  }

  refresh(nodeId: number): void {
    const entry = this.entries.get(nodeId);
    if (entry) this.measure(entry);
  }

  isReady(nodes: Iterable<NodeData>): boolean {
    for (const node of nodes) {
      if (!this.registry.getMeasurementTemplate(node.nodeType)) continue;
      const measurement = this.geometry.getIntrinsicMeasurement(node.id);
      if (!measurement || measurement.width <= 0 || measurement.height <= 0) {
        return false;
      }
    }
    return true;
  }

  dispose(): void {
    for (const id of [...this.entries.keys()]) this.destroy(id);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.root?.remove();
    this.root = null;
  }

  private ensureRoot(): HTMLElement {
    if (this.root) return this.root;
    this.root = document.createElement("div");
    this.root.dataset.ggPrimitiveMeasurement = "true";
    this.root.style.cssText =
      "position:fixed; left:-100000px; top:-100000px; width:max-content; height:max-content; visibility:hidden; pointer-events:none; contain:layout style paint;";
    document.body?.appendChild(this.root);

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const observation of entries) {
          const match = [...this.entries.values()].find(
            (entry) => entry.element === observation.target
          );
          if (match) this.measure(match);
        }
      });
    }
    return this.root;
  }

  private mount(
    node: NodeData,
    template: NonNullable<ReturnType<NodeTypeRegistry["getMeasurementTemplate"]>>,
    isCollapsed: boolean,
    children: readonly PrimitiveMeasurementChild[]
  ): void {
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

    const entry: MeasurementEntry = {
      node,
      element,
      inputKey: measurementInputKey(node, isCollapsed, children),
      revision: 0,
    };
    this.entries.set(node.id, entry);
    this.resizeObserver?.observe(element);
    this.measure(entry);
  }

  private getChildren(
    node: NodeData,
    nodesById: ReadonlyMap<number, NodeData>
  ): PrimitiveMeasurementChild[] {
    return (node.childIds ?? [])
      .map((childId) => nodesById.get(childId))
      .filter((child): child is NodeData => Boolean(child))
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

  private measure(entry: MeasurementEntry): void {
    const width = readDimension(entry.element, "width");
    const height = readDimension(entry.element, "height");
    if (width <= 0 || height <= 0) return;

    entry.revision += 1;
    this.geometry.setIntrinsicMeasurement(entry.node.id, {
      width,
      height,
      revision: entry.revision,
    });
  }

  private destroy(nodeId: number): void {
    const entry = this.entries.get(nodeId);
    if (!entry) return;
    this.resizeObserver?.unobserve(entry.element);
    entry.element.remove();
    this.entries.delete(nodeId);
    this.geometry.clearIntrinsicMeasurement(nodeId);
  }
}
