import { describe, expect, it, beforeAll } from "vitest";
import { NodeTypeRegistry } from "../src/scripts/node-type-registry.js";
import { nodeDescriptor } from "../src/scripts/builtin-types.js";
import { NodeStore } from "../src/scripts/node-store.js";
import { DEFAULT_HANDLE_STYLE } from "../src/scripts/types.js";
import { GraphEventEmitter } from "../src/scripts/events.js";
import { DomNodeLayer } from "../src/scripts/dom-node-layer.js";

class FakeElement {
  style: Record<string, string> = {};
  dataset: Record<string, string> = {};
  attributes: Record<string, string> = {};
  children: FakeElement[] = [];
  parent: FakeElement | null = null;
  id = "";
  tagName: string;
  textContent = "";

  constructor(tag: string) {
    this.tagName = tag.toUpperCase();
  }

  appendChild(child: FakeElement): FakeElement {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  remove(): void {
    if (!this.parent) return;
    const index = this.parent.children.indexOf(this);
    if (index >= 0) this.parent.children.splice(index, 1);
    this.parent = null;
  }

  toggleAttribute(name: string, force?: boolean): boolean {
    if (force) this.attributes[name] = "";
    else delete this.attributes[name];
    return name in this.attributes;
  }
}

beforeAll(() => {
  const base = globalThis.document as unknown as Record<string, unknown>;
  Object.defineProperty(globalThis, "document", {
    value: {
      ...base,
      createElement: (tag: string) => new FakeElement(tag),
    },
    configurable: true,
  });
});

function buildHarness(domType = "dom-test") {
  const registry = new NodeTypeRegistry();
  const events = new GraphEventEmitter();

  const createdViews: FakeElement[] = [];
  const updateCalls: number[] = [];
  const destroyed: number[] = [];

  const domDescriptor = {
    ...nodeDescriptor,
    type: domType,
    renderMode: "dom" as const,
    defaultTextureIds: { body: "", head: "" },
    domRenderer: {
      createView: () => {
        const el = new FakeElement("gg-dom-test");
        createdViews.push(el);
        return el as unknown as HTMLElement;
      },
      updateView: (ctx: { node: { id: number } }) => {
        updateCalls.push(ctx.node.id);
      },
      destroyView: (ctx: { node: { id: number } }) => {
        destroyed.push(ctx.node.id);
      },
    },
  };

  registry.register(
    domDescriptor as Parameters<NodeTypeRegistry["register"]>[0]
  );

  const store = new NodeStore(
    {} as WebGL2RenderingContext,
    "node",
    DEFAULT_HANDLE_STYLE,
    registry
  );

  const container = new FakeElement("div");
  const layer = new DomNodeLayer({
    store,
    registry,
    events,
    container: container as unknown as HTMLElement,
  });

  return { registry, events, store, layer, container, createdViews, updateCalls, destroyed };
}

describe("DomNodeLayer", () => {
  it("creates views only for DOM-rendered types on initial sync", () => {
    const h = buildHarness();
    const domNode = h.store.add(100, 200, "DOM", "dark", "dom-test");
    h.store.add(10, 20, "WebGL", "dark", "node");

    h.layer.syncAll();

    expect(h.createdViews).toHaveLength(1);
    const view = h.createdViews[0];
    expect(view.style.left).toBe("100px");
    expect(view.style.top).toBe("200px");
    expect(view.style.width).toBe(`${domNode.width}px`);
    expect(view.style.height).toBe(`${domNode.height}px`);
    expect(view.style.pointerEvents).toBe("none");
    expect(view.dataset.nodeId).toBe(String(domNode.id));
    expect(view.dataset.nodeType).toBe("dom-test");
  });

  it("reconciles on history:command — new nodes get views, removed nodes lose them", () => {
    const h = buildHarness();

    const node1 = h.store.add(0, 0, "one", "dark", "dom-test");
    h.events.dispatch("history:command", { command: {} as never, action: "do" });
    expect(h.createdViews).toHaveLength(1);

    const node2 = h.store.add(50, 0, "two", "dark", "dom-test");
    h.events.dispatch("history:command", { command: {} as never, action: "do" });
    expect(h.createdViews).toHaveLength(2);

    h.store.remove(node2.id);
    h.events.dispatch("history:command", { command: {} as never, action: "undo" });
    expect(h.destroyed).toContain(node2.id);
    expect(h.createdViews[1].parent).toBeNull();
    expect(node1).toBeDefined();
  });

  it("hides views for nodes that are not effectively visible", () => {
    const h = buildHarness();
    const hidden = h.store.add(0, 0, "hidden", "dark", "dom-test");
    const shown = h.store.add(0, 40, "shown", "dark", "dom-test");
    hidden.visible = false;

    h.layer.syncAll();

    expect(h.createdViews).toHaveLength(1);
    expect(h.createdViews[0].dataset.nodeId).toBe(String(shown.id));
  });

  it("calls updateView for existing views during reconcile", () => {
    const h = buildHarness();
    const node = h.store.add(0, 0, "a", "dark", "dom-test");
    h.layer.syncAll();

    const callsBefore = h.updateCalls.length;
    node.text = "renamed";
    h.layer.reconcile();

    expect(h.updateCalls.length).toBeGreaterThan(callsBefore);
    expect(node.text).toBe("renamed");
  });

  it("reflects selection state via syncFrame without events", () => {
    const h = buildHarness();
    const node = h.store.add(0, 0, "sel", "dark", "dom-test");
    h.layer.syncAll();

    const view = h.createdViews[0];
    expect(view.attributes["data-selected"]).toBeUndefined();

    node.isSelected = true;
    h.layer.syncFrame();
    expect(view.attributes["data-selected"]).toBe("");

    node.isSelected = false;
    h.layer.syncFrame();
    expect(view.attributes["data-selected"]).toBeUndefined();
  });

  it("syncFrame updates geometry when a node moves and calls updateView", () => {
    const h = buildHarness();
    const node = h.store.add(0, 0, "moving", "dark", "dom-test");
    h.layer.syncAll();

    const view = h.createdViews[0];
    const callsBefore = h.updateCalls.length;
    expect(view.style.left).toBe("0px");
    expect(view.style.top).toBe("0px");

    node.localX = 150;
    node.localY = 220;
    h.layer.syncFrame();

    expect(view.style.left).toBe("150px");
    expect(view.style.top).toBe("220px");
    expect(h.updateCalls).toHaveLength(callsBefore + 1);
  });

  it("syncFrame applies width/height changes from the store", () => {
    const h = buildHarness();
    const node = h.store.add(0, 0, "resize", "dark", "dom-test");
    h.layer.syncAll();

    const view = h.createdViews[0];
    const originalWidth = node.width;

    node.width = originalWidth + 40;
    h.layer.syncFrame();

    expect(view.style.width).toBe(`${originalWidth + 40}px`);
  });

  it("syncFrame is a no-op when nothing changed", () => {
    const h = buildHarness();
    h.store.add(0, 0, "stable", "dark", "dom-test");
    h.store.add(0, 40, "stable2", "dark", "dom-test");
    h.layer.syncAll();

    const callsAfterMount = h.updateCalls.length;
    h.layer.syncFrame();
    h.layer.syncFrame();

    expect(h.updateCalls).toHaveLength(callsAfterMount);
  });

  it("syncFrame flips lock/collapse attrs when node state changes", () => {
    const h = buildHarness();
    const node = h.store.add(0, 0, "state", "dark", "dom-test");
    h.layer.syncAll();

    const view = h.createdViews[0];
    node.isLocked = true;
    node.isCollapsed = true;
    h.layer.syncFrame();

    expect(view.attributes["data-locked"]).toBe("");
    expect(view.attributes["data-collapsed"]).toBe("");
  });

  it("syncFrame no-ops safely when there are no DOM views", () => {
    const h = buildHarness();
    h.layer.syncAll();
    expect(() => h.layer.syncFrame()).not.toThrow();
  });

  it("culls views outside the viewport and hides them", () => {
    const h = buildHarness();
    const node = h.store.add(1000, 1000, "far", "dark", "dom-test");
    h.layer.syncAll();

    const visible = { minX: 0, minY: 0, maxX: 800, maxY: 400 };
    h.layer.setCull((x, y, w, hgt) =>
      x < visible.maxX && y < visible.maxY && x + w > visible.minX && y + hgt > visible.minY
    );
    h.layer.syncFrame();

    const view = h.createdViews[0];
    expect(view.style.display).toBe("none");
    expect(node).toBeDefined();
  });

  it("stops diffing culled views until they re-enter the viewport", () => {
    const h = buildHarness();
    const node = h.store.add(2000, 2000, "away", "dark", "dom-test");
    h.layer.syncAll();

    const box = { minX: 0, minY: 0, maxX: 800, maxY: 400 };
    h.layer.setCull((x, y, w, hgt) =>
      x < box.maxX && y < box.maxY && x + w > box.minX && y + hgt > box.minY
    );
    h.layer.syncFrame();

    const callsBefore = h.updateCalls.length;
    node.localX = 3000;
    h.layer.syncFrame();
    expect(h.updateCalls).toHaveLength(callsBefore);
  });

  it("restores and refreshes a view that re-enters the viewport", () => {
    const h = buildHarness();
    const node = h.store.add(2000, 2000, "returning", "dark", "dom-test");
    h.layer.syncAll();

    let inside = false;
    h.layer.setCull(() => inside);
    h.layer.syncFrame();

    const view = h.createdViews[0];
    expect(view.style.display).toBe("none");

    const callsBefore = h.updateCalls.length;
    inside = true;
    node.localX = 50;
    node.localY = 60;
    h.layer.syncFrame();

    expect(view.style.display).toBe("");
    expect(view.style.left).toBe("50px");
    expect(view.style.top).toBe("60px");
    expect(h.updateCalls.length).toBeGreaterThan(callsBefore);
  });

  it("does not cull when no cull predicate is attached", () => {
    const h = buildHarness();
    h.store.add(5000, 5000, "unlimited", "dark", "dom-test");
    h.layer.syncAll();

    const view = h.createdViews[0];
    h.layer.syncFrame();
    expect(view.style.display).toBeUndefined();
    expect(view.style.left).toBe("5000px");
  });
});