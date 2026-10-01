import { describe, expect, it } from "vitest";
import { EdgeTypeRegistry } from "../src/scripts/edge-type-registry.js";

describe("EdgeTypeRegistry", () => {
  it("provides built-in core routes without custom geometry hooks", () => {
    const registry = new EdgeTypeRegistry();
    expect(registry.get("orthogonal")?.route).toBe("orthogonal");
    expect(registry.get("line")?.head.type).toBe("none");
    expect(registry.get("cubic")?.head.type).toBe("arrow");
  });

  it("registers an application edge using an existing route", () => {
    const registry = new EdgeTypeRegistry();
    registry.register({
      type: "foreign-key",
      route: "orthogonal",
      stroke: { color: "rgba(94, 234, 212, 0.9)", width: 2 },
      head: { type: "arrow", skinId: "chevron" },
      label: { enabled: true, editable: true },
      hitTest: { tolerance: 12 },
      actions: { selectable: true, deletable: true },
    });

    expect(registry.get("foreign-key")).toMatchObject({
      route: "orthogonal",
      hitTest: { tolerance: 12 },
    });
  });

  it("rejects duplicate, unsupported, and invalid descriptors", () => {
    const registry = new EdgeTypeRegistry();
    const descriptor = registry.get("line")!;
    expect(() => registry.register(descriptor)).toThrow(/already registered/);
    expect(() => registry.register({ ...descriptor, type: "bad", route: "gpu" })).toThrow(/unsupported route/);
    expect(() => registry.register({ ...descriptor, type: "bad", hitTest: { tolerance: -1 } })).toThrow(/cannot be negative/);
  });
});
