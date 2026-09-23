import { describe, expect, it, vi } from "vitest";
import { NodeTypeRegistry } from "../src/scripts/node-type-registry.js";
import { PrimitiveGeometry } from "../src/scripts/primitive-geometry.js";
import { PrimitiveMeasurementProvider } from "../src/scripts/primitive-measurement.js";
import { groupDescriptor } from "../src/scripts/builtin-types.js";
import type { NodeData } from "../src/scripts/types.js";

class FakeElement {
  style: Record<string, string> = {};
  dataset: Record<string, string> = {};
  children: FakeElement[] = [];
  parent: FakeElement | null = null;
  offsetWidth = 0;
  offsetHeight = 0;
  getBoundingClientRect = vi.fn(() => ({ width: 0, height: 0 }));
  appendChild(child: FakeElement): FakeElement {
    child.parent = this;
    this.children.push(child);
    return child;
  }
  remove(): void {
    this.parent?.children.splice(this.parent.children.indexOf(this), 1);
    this.parent = null;
  }
}

const node = { id: 4, nodeType: "measured", width: 100, height: 80 } as NodeData;

describe("PrimitiveMeasurementProvider", () => {
  it("measures a dedicated template without calling a visible renderer", () => {
    const oldDocument = globalThis.document;
    const root = new FakeElement();
    const measured = new FakeElement();
    measured.getBoundingClientRect = vi.fn(() => ({ width: 240, height: 96 }));
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        body: root,
        createElement: () => measured,
      },
    });

    const registry = new NodeTypeRegistry();
    const visibleRenderer = vi.fn();
    const measurementContext = vi.fn();
    registry.register({
      type: "measured",
      category: "leaf",
      zTier: 0.4,
      defaultSize: { width: 100, height: 80 },
      handles: { always: true, sides: ["left", "right"], multiConnect: false },
      isConnectionCandidate: () => true,
      allowedParents: null,
      canBeRoot: true,
      defaultTextureIds: { body: "", head: "" },
      domRenderer: { createView: visibleRenderer },
      measurementTemplate: (context) => {
        measurementContext(context);
        const { element } = context;
        element.style.width = "240px";
        return element;
      },
    });

    const geometry = new PrimitiveGeometry();
    const provider = new PrimitiveMeasurementProvider(registry, geometry);
    expect(provider.isReady([node])).toBe(false);
    provider.sync([node]);

    expect(geometry.getIntrinsicMeasurement(4)).toMatchObject({
      width: 240,
      height: 96,
      revision: 1,
    });
    expect(provider.isReady([node])).toBe(true);
    expect(visibleRenderer).not.toHaveBeenCalled();
    expect(measurementContext).toHaveBeenCalledWith(
      expect.objectContaining({
        node,
        props: node.props,
        children: [],
        isCollapsed: false,
      })
    );
    provider.dispose();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: oldDocument,
    });
  });

  it("passes effective collapse into the measurement template", () => {
    const oldDocument = globalThis.document;
    const root = new FakeElement();
    const measured = new FakeElement();
    let wasCollapsed = false;
    measured.getBoundingClientRect = vi.fn(() => ({
      width: 190,
      height: wasCollapsed ? 30 : 150,
    }));
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        body: root,
        createElement: () => measured,
      },
    });

    const registry = new NodeTypeRegistry();
    registry.register({
      type: "collapsible-measured",
      category: "leaf",
      zTier: 0.4,
      defaultSize: { width: 190, height: 150 },
      collapsedSize: { width: 190, height: 30 },
      handles: { always: true, sides: ["left", "right"], multiConnect: false },
      isConnectionCandidate: () => true,
      allowedParents: null,
      canBeRoot: true,
      defaultTextureIds: { body: "", head: "" },
      measurementTemplate: ({ element, isCollapsed }) => {
        wasCollapsed = isCollapsed;
        return element;
      },
    });

    const geometry = new PrimitiveGeometry();
    const provider = new PrimitiveMeasurementProvider(
      registry,
      geometry,
      () => true
    );
    provider.sync([{ ...node, nodeType: "collapsible-measured", childIds: [] }]);

    expect(wasCollapsed).toBe(true);
    expect(geometry.getIntrinsicMeasurement(4)).toMatchObject({ height: 30 });

    provider.dispose();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: oldDocument,
    });
  });

  it("grows built-in container measurements from measured children", () => {
    const element = new FakeElement();
    const template = groupDescriptor.measurementTemplate;
    expect(template).toBeDefined();

    template!({
      node: { ...node, id: 10, nodeType: "group" } as NodeData,
      props: undefined,
      children: [1, 2, 3, 4].map((id) => ({
        node: { id, nodeType: "node", width: 190, height: 30 } as NodeData,
        props: undefined,
        isCollapsed: true,
        width: 190,
        height: 30,
      })),
      element,
      isCollapsed: false,
    });

    // 4 collapsed children exceed the 200px default:
    // 4*30 + 3*10 gap + 50 top pad + 40 bottom pad = 240px.
    expect(element.style.width).toBe("220px");
    expect(element.style.height).toBe("240px");
  });
});
