import { describe, expect, it, vi } from "vitest";
import { NodeTypeRegistry } from "../src/scripts/node-type-registry.js";
import { PrimitiveGeometry } from "../src/scripts/primitive-geometry.js";
import { PrimitiveMeasurementProvider } from "../src/scripts/primitive-measurement.js";
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
      measurementTemplate: ({ element }) => {
        element.style.width = "240px";
        return element;
      },
    });

    const geometry = new PrimitiveGeometry();
    const provider = new PrimitiveMeasurementProvider(registry, geometry);
    provider.sync([node]);

    expect(geometry.getIntrinsicMeasurement(4)).toMatchObject({
      width: 240,
      height: 96,
      revision: 1,
    });
    expect(visibleRenderer).not.toHaveBeenCalled();
    provider.dispose();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: oldDocument,
    });
  });
});
