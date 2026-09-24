import { describe, expect, it } from "vitest";
import { NodeStore } from "../src/scripts/node-store.js";
import { NodeTypeRegistry } from "../src/scripts/node-type-registry.js";
import { BUILTIN_DESCRIPTORS, groupDescriptor } from "../src/scripts/builtin-types.js";
import { DEFAULT_HANDLE_STYLE } from "../src/scripts/types.js";

describe("core-owned subgraph bounds", () => {
  it("passes measured child bounds to custom container layouts", () => {
    const registry = new NodeTypeRegistry();
    for (const descriptor of BUILTIN_DESCRIPTORS) registry.register(descriptor);
    registry.replace({
      ...groupDescriptor,
      layoutChildren(container, children, _allNodes, resolvedBounds, options) {
        let y = 34;
        let height = 34 + 32;
        const width = 320;
        for (const child of children) {
          const bounds = resolvedBounds?.get(child.id) ?? {
            width: child.width,
            height: child.height,
          };
          if (options?.positionChildren !== false) {
            child.localX = (width - bounds.width) / 2;
            child.localY = y;
          }
          y += bounds.height + 3;
          height += bounds.height;
        }
        height += Math.max(0, children.length - 1) * 3;
        container.width = width;
        container.height = height;
      },
    });

    const store = new NodeStore(
      {} as WebGL2RenderingContext,
      "node",
      DEFAULT_HANDLE_STYLE,
      registry
    );
    const group = store.add(0, 0, "Table", "dark", "group");
    const children = Array.from({ length: 47 }, (_, index) =>
      store.add(0, 0, `Column ${index}`, "dark", "node")
    );
    for (const child of children) expect(store.setParent(child.id, group.id)).toBe(true);

    store.setResolvedBoundsResolver((nodeId) =>
      nodeId === group.id ? undefined : { width: 280, height: 30 }
    );
    store.updateContainerBounds(group.id, "dark");

    expect(group.width).toBe(320);
    expect(group.height).toBe(1614);
    children.forEach((child, index) => {
      expect(child.localX).toBe(20);
      expect(child.localY).toBe(34 + index * 33);
    });
    expect((children.at(-1)?.localY ?? 0) + 30 + 32).toBe(group.height);

    children[0]!.localX = 777;
    children[0]!.localY = 888;
    store.updateContainerBounds(group.id, "dark", { positionChildren: false });
    expect(children[0]!.localX).toBe(777);
    expect(children[0]!.localY).toBe(888);
  });

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
