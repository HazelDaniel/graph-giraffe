import type { NodeTypeRegistry } from "./node-type-registry.js";
import type { NodeData } from "./types.js";
import { PrimitiveGeometry } from "./primitive-geometry.js";

interface MeasurementEntry {
  node: NodeData;
  element: HTMLElement;
  inputKey: string;
  revision: number;
}

function measurementInputKey(node: NodeData): string {
  return JSON.stringify({
    nodeType: node.nodeType,
    text: node.text,
    props: node.props,
    isCollapsed: node.isCollapsed,
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
    private geometry: PrimitiveGeometry
  ) {}

  sync(nodes: Iterable<NodeData>): void {
    const alive = new Set<number>();

    for (const node of nodes) {
      const template = this.registry.getMeasurementTemplate(node.nodeType);
      if (!template || typeof document === "undefined") continue;
      alive.add(node.id);

      const existing = this.entries.get(node.id);
      const inputKey = measurementInputKey(node);
      if (existing && existing.inputKey === inputKey) {
        this.measure(existing);
        continue;
      }

      if (existing) this.destroy(node.id);
      this.mount(node, template);
    }

    for (const id of [...this.entries.keys()]) {
      if (!alive.has(id)) this.destroy(id);
    }
  }

  refresh(nodeId: number): void {
    const entry = this.entries.get(nodeId);
    if (entry) this.measure(entry);
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
    template: NonNullable<ReturnType<NodeTypeRegistry["getMeasurementTemplate"]>>
  ): void {
    const host = document.createElement("div");
    host.style.cssText = "display:block; width:max-content; height:max-content;";
    const element = template({ node, element: host });
    element.dataset.ggPrimitiveMeasurementNode = String(node.id);
    element.style.pointerEvents = "none";
    this.ensureRoot().appendChild(element);

    const entry: MeasurementEntry = {
      node,
      element,
      inputKey: measurementInputKey(node),
      revision: 0,
    };
    this.entries.set(node.id, entry);
    this.resizeObserver?.observe(element);
    this.measure(entry);
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
