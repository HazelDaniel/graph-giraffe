import { describe, expect, it } from "vitest";
import { NodeStore } from "../src/scripts/node-store.js";
import { NodeTypeRegistry } from "../src/scripts/node-type-registry.js";
import { BUILTIN_DESCRIPTORS } from "../src/scripts/builtin-types.js";
import { DEFAULT_HANDLE_STYLE } from "../src/scripts/types.js";

describe("core-owned subgraph bounds", () => {
  it("uses resolved child dimensions without replacing the core bounds algorithm", () => {
    const registry = new NodeTypeRegistry();
    for (const descriptor of BUILTIN_DESCRIPTORS) registry.register(descriptor);

    const store = new NodeStore(
      {} as WebGL2RenderingContext,
      "node",
      DEFAULT_HANDLE_STYLE,
      registry
    );
    const subgraph = store.add(0, 0, "Subgraph", "dark", "subgraph");
    const child = store.add(0, 0, "Child", "dark", "node");

    expect(store.setParent(child.id, subgraph.id)).toBe(true);
    store.setResolvedBoundsResolver((nodeId) =>
      nodeId === child.id ? { width: 400, height: 300 } : undefined
    );
    store.updateContainerBounds(subgraph.id, "dark");

    expect(subgraph.width).toBe(448);
    expect(subgraph.height).toBe(366);
    expect(subgraph.localX).toBe(-24);
    expect(subgraph.localY).toBe(-42);
  });

  it("keeps collapsed subgraphs on their core collapsed dimensions", () => {
    const registry = new NodeTypeRegistry();
    for (const descriptor of BUILTIN_DESCRIPTORS) registry.register(descriptor);

    const store = new NodeStore(
      {} as WebGL2RenderingContext,
      "node",
      DEFAULT_HANDLE_STYLE,
      registry
    );
    const subgraph = store.add(0, 0, "Subgraph", "dark", "subgraph");
    const child = store.add(0, 0, "Child", "dark", "node");
    expect(store.setParent(child.id, subgraph.id)).toBe(true);

    subgraph.isCollapsed = true;
    store.setResolvedBoundsResolver(() => ({ width: 900, height: 900 }));
    store.updateContainerBounds(subgraph.id, "dark");

    expect(subgraph.width).toBe(190);
    expect(subgraph.height).toBe(30);
  });
});
