import { describe, expect, it, vi } from "vitest";
import {
  attachCommentLayer,
  createCommentBubble,
} from "../src/scripts/overlay-primitives.js";
import type { NodeEditor } from "../src/scripts/node-editor.js";
import { NodeEditor as NodeEditorClass } from "../src/scripts/node-editor.js";
import type { CustomOverlay } from "../src/scripts/types.js";

class FakeEl {
  children: FakeEl[] = [];
  listeners = new Map<string, Array<(evt: unknown) => void>>();
  style: Record<string, string> = {};
  id = "";
  textContent = "";
  value = "";
  placeholder = "";
  rows = 1;
  tagName = "";
  private _className = "";
  private classes = new Set<string>();
  private attrs = new Map<string, string>();
  focus = vi.fn();
  blur = vi.fn();
  set className(v: string) {
    this._className = v;
    this.classes = new Set(v.split(/\s+/).filter(Boolean));
  }
  get className(): string {
    return this._className;
  }
  set innerHTML(_v: string) {}
  get innerHTML(): string {
    return "";
  }
  classList = {
    add: (c: string) => this.classes.add(c),
    remove: (c: string) => this.classes.delete(c),
    contains: (c: string) => this.classes.has(c),
  };
  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }
  getAttribute(name: string): string | null {
    return this.attrs.get(name) ?? null;
  }
  removeAttribute(name: string): void {
    this.attrs.delete(name);
  }
  appendChild(child: FakeEl): FakeEl {
    this.children.push(child);
    return child;
  }
  append(...children: FakeEl[]): void {
    this.children.push(...children);
  }
  remove(): void {}
  addEventListener(type: string, handler: (evt: unknown) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(handler);
  }
  dispatchEvent(evt: { type: string; detail?: unknown }): boolean {
    for (const handler of this.listeners.get(evt.type) ?? []) {
      handler(evt);
    }
    return true;
  }
  querySelector(sel: string): FakeEl | null {
    for (const child of this.children) {
      if (child.matchesClass(sel)) return child;
      const deep = child.querySelector(sel);
      if (deep) return deep;
    }
    return null;
  }
  matchesClass(sel: string): boolean {
    return sel.startsWith(".") && this.classes.has(sel.slice(1));
  }
  closest(_sel: string): FakeEl | null {
    return this.matchesClass(".gg-comment-input") ||
      this.matchesClass(".gg-comment-close")
      ? this
      : null;
  }
  setPointerCapture(_id: number): void {}
  releasePointerCapture(_id: number): void {}
  getBoundingClientRect(): { left: number; top: number } {
    return { left: 10, top: 20 };
  }
}

function installDom(): void {
  const canvas = new FakeEl();
  canvas.id = "webgl-canvas";
  const doc = {
    createElement: () => new FakeEl(),
    createElementNS: () => new FakeEl(),
    getElementById: (id: string) => (id === "webgl-canvas" ? canvas : null),
    head: { appendChild: () => {} },
  };
  vi.stubGlobal("document", doc);
  vi.stubGlobal(
    "CustomEvent",
    class {
      type: string;
      detail: unknown;
      constructor(type: string, opts?: { detail?: unknown }) {
        this.type = type;
        this.detail = opts?.detail;
      }
    }
  );
}

function makeEditor() {
  const added: CustomOverlay[] = [];
  const removed: string[] = [];
  const handlers: Record<string, Array<(payload: unknown) => void>> = {};
  const active: Record<string, boolean> = {};
  const canvas = new FakeEl();
  canvas.id = "webgl-canvas";
  const editor = {
    canvas,
    screenToWorld: (sx: number, sy: number) => ({ x: sx, y: sy }),
    getCameraState: () => ({ panX: 0, panY: 0, zoom: 1 }),
    addOverlay: (o: CustomOverlay) => {
      added.push(o);
    },
    removeOverlay: (id: string) => {
      removed.push(id);
    },
    updateOverlayPosition: (id: string) => {
      removed.push(`move:${id}`);
    },
    controls: {
      setCommentModeActive: (v: boolean) => {
        active.comment = v;
      },
    },
    events: {
      on: (event: string, handler: (payload: unknown) => void) => {
        if (!handlers[event]) handlers[event] = [];
        handlers[event].push(handler);
        return () => {
          handlers[event] = handlers[event].filter((h) => h !== handler);
        };
      },
      dispatch: (event: string, payload: unknown) => {
        for (const handler of handlers[event] ?? []) handler(payload);
      },
    },
  };
  return {
    editor: editor as unknown as NodeEditor,
    added,
    removed,
    handlers,
    active,
  };
}

describe("overlay primitives", () => {
  it("createCommentBubble returns a fixed-size, world-anchored overlay", () => {
    installDom();
    const overlay = createCommentBubble({ id: "c1", worldX: 100, worldY: 50 });
    expect(overlay.id).toBe("c1");
    expect(overlay.worldX).toBe(100);
    expect(overlay.worldY).toBe(50);
    expect(overlay.scaleWithZoom).toBe(false);
    expect(overlay.element).toBeDefined();
    expect(overlay.element.getAttribute("data-mode")).toBe("editing");
  });

  it("attachCommentLayer spawns a bubble on pane:click at click world coords", () => {
    installDom();
    const { editor, added, handlers } = makeEditor();
    const layer = attachCommentLayer(editor, {
      canvas: new FakeEl() as unknown as HTMLElement,
    });

    const paneClick = handlers["pane:click"]![0];
    paneClick({ event: { clientX: 60, clientY: 80 } });

    expect(added.length).toBe(1);
    const overlay = added[0];
    expect(overlay.worldX).toBe(50);
    expect(overlay.worldY).toBe(60);
    expect(overlay.id).toMatch(/^gg-comment-/);
    expect(layer.get(overlay.id)).toBe(overlay);
  });

  it("new bubbles auto-focus their composer", async () => {
    installDom();
    const { editor, added } = makeEditor();
    const layer = attachCommentLayer(editor);
    layer.add(1, 2);
    await new Promise((r) => setTimeout(r, 5));
    const input = added[0].element.querySelector(
      ".gg-comment-input"
    ) as unknown as FakeEl;
    expect(input.focus).toHaveBeenCalled();
  });

  it("blurring an empty composer emits cancel and removes the bubble", () => {
    installDom();
    const { editor, removed } = makeEditor();
    const layer = attachCommentLayer(editor);
    const cancel = vi.fn();
    layer.on("cancel", cancel);

    const id = layer.add(1, 2);
    const input = layer.get(id)!.element.querySelector(
      ".gg-comment-input"
    ) as unknown as FakeEl;
    input.value = "";
    input.dispatchEvent({ type: "blur" });

    expect(cancel).toHaveBeenCalledWith({
      id,
      author: "Guest",
      worldX: 1,
      worldY: 2,
    });
    expect(layer.get(id)).toBeUndefined();
    expect(removed).toContain(id);
  });

  it("blurring a composer with text emits save and keeps a saved bubble", () => {
    installDom();
    const { editor } = makeEditor();
    const layer = attachCommentLayer(editor);
    const save = vi.fn();
    layer.on("save", save);

    const id = layer.add(5, 6, { author: "Ada" });
    const input = layer.get(id)!.element.querySelector(
      ".gg-comment-input"
    ) as unknown as FakeEl;
    input.value = "great work!";
    input.dispatchEvent({ type: "blur" });

    expect(save).toHaveBeenCalledWith({
      id,
      author: "Ada",
      text: "great work!",
      worldX: 5,
      worldY: 6,
    });
    const bubble = layer.get(id);
    expect(bubble).toBeDefined();
    expect(bubble!.element.getAttribute("data-mode")).toBe("saved");
    expect(bubble!.element.getAttribute("data-collapsed")).toBe("true");
  });

  it("load() renders saved bubbles from consumer state and emits load", () => {
    installDom();
    const { editor, added } = makeEditor();
    const layer = attachCommentLayer(editor);
    const load = vi.fn();
    layer.on("load", load);

    layer.load([
      { id: "a", author: "Ada", text: "hello", worldX: 10, worldY: 20 },
      { id: "b", author: "Lin", text: "wip", worldX: 30, worldY: 40 },
    ]);

    expect(added.length).toBe(2);
    expect(layer.get("a")).toBeDefined();
    expect(layer.get("a")!.element.getAttribute("data-mode")).toBe("saved");
    expect(layer.get("a")!.element.getAttribute("data-collapsed")).toBe("true");
    expect(load).toHaveBeenCalledWith({ count: 2 });
  });

  it("clicking the anchor pin opens a collapsed bubble (expands + focuses)", async () => {
    installDom();
    const { editor } = makeEditor();
    const layer = attachCommentLayer(editor);
    layer.load([{ id: "a", author: "Ada", text: "hello", worldX: 10, worldY: 20 }]);
    const overlay = layer.get("a")!;
    expect(overlay.element.getAttribute("data-collapsed")).toBe("true");

    const pin = overlay.element.querySelector(
      ".gg-comment-pin"
    ) as unknown as FakeEl;
    pin.dispatchEvent({ type: "click" });

    expect(overlay.element.getAttribute("data-collapsed")).toBe("false");
    expect(overlay.element.getAttribute("data-mode")).toBe("editing");
    await new Promise((r) => setTimeout(r, 5));
    const input = overlay.element.querySelector(
      ".gg-comment-input"
    ) as unknown as FakeEl;
    expect(input.focus).toHaveBeenCalled();
  });

  it("clicking the header avatar opens the composer too", () => {
    installDom();
    const { editor } = makeEditor();
    const layer = attachCommentLayer(editor);
    layer.load([{ id: "a", author: "Ada", text: "hello", worldX: 10, worldY: 20 }]);
    const overlay = layer.get("a")!;

    const avatar = overlay.element.querySelector(
      ".gg-comment-avatar"
    ) as unknown as FakeEl;
    avatar.dispatchEvent({
      type: "click",
      stopPropagation: () => {},
    } as unknown as Event);

    expect(overlay.element.getAttribute("data-collapsed")).toBe("false");
    expect(overlay.element.getAttribute("data-mode")).toBe("editing");
  });

  it("dragging the pin does not trigger the expand-on-click", () => {
    installDom();
    const { editor } = makeEditor();
    const layer = attachCommentLayer(editor);
    layer.load([{ id: "a", author: "Ada", text: "hello", worldX: 10, worldY: 20 }]);
    const overlay = layer.get("a")!;
    const pin = overlay.element.querySelector(
      ".gg-comment-pin"
    ) as unknown as FakeEl;

    pin.dispatchEvent({
      type: "pointerdown",
      button: 0,
      target: pin,
      clientX: 0,
      clientY: 0,
      pointerId: 1,
    } as unknown as PointerEvent);
    pin.dispatchEvent({
      type: "pointermove",
      clientX: 20,
      clientY: 0,
      pointerId: 1,
    } as unknown as PointerEvent);
    pin.dispatchEvent({
      type: "pointerup",
      pointerId: 1,
    } as unknown as PointerEvent);
    expect(pin.getAttribute("data-dragged")).toBe("true");

    pin.dispatchEvent({ type: "click" });
    expect(overlay.element.getAttribute("data-collapsed")).toBe("true");
    expect(overlay.element.getAttribute("data-mode")).toBe("saved");
    expect(pin.getAttribute("data-dragged")).toBeNull();
  });

  it("setEnabled(false) stops spawning from pane clicks", () => {
    installDom();
    const { editor, added, handlers } = makeEditor();
    const layer = attachCommentLayer(editor);
    layer.setEnabled(false);
    handlers["pane:click"]![0]({ event: { clientX: 10, clientY: 10 } });
    expect(added.length).toBe(0);
  });

  it("remove(id) removes the overlay", () => {
    installDom();
    const { editor, added, removed } = makeEditor();
    const layer = attachCommentLayer(editor);
    const id = layer.add(1, 2, { id: "custom-id" });
    expect(added.length).toBe(1);

    layer.remove(id);
    expect(removed).toContain(id);
    expect(layer.get(id)).toBeUndefined();
  });

  it("dismissing a bubble emits delete", () => {
    installDom();
    const { editor } = makeEditor();
    const layer = attachCommentLayer(editor);
    const del = vi.fn();
    layer.on("delete", del);

    const id = layer.add(1, 2);
    const close = layer.get(id)!.element.querySelector(
      ".gg-comment-close"
    ) as unknown as FakeEl;
    close.dispatchEvent({
      type: "click",
      stopPropagation: () => {},
    } as unknown as Event);

    expect(del).toHaveBeenCalledWith({ id });
    expect(layer.get(id)).toBeUndefined();
  });

  it("destroy() removes all bubbles and unsubscribes pane:click", () => {
    installDom();
    const { editor, removed, handlers } = makeEditor();
    const layer = attachCommentLayer(editor);
    const idA = layer.add(0, 0);
    const idB = layer.add(10, 10);

    layer.destroy();
    expect(removed).toContain(idA);
    expect(removed).toContain(idB);
    expect(handlers["pane:click"]?.length).toBe(0);
  });
});

describe("editor built-in comment layer", () => {
  function withEditorMethods(mock: NodeEditor): NodeEditor {
    const proto = NodeEditorClass.prototype as unknown as Record<string, unknown>;
    for (const name of [
      "setCommentMode",
      "getCommentMode",
      "toggleCommentMode",
      "getCommentLayer",
    ]) {
      (mock as unknown as Record<string, unknown>)[name] = proto[name];
    }
    return mock;
  }

  it("setCommentMode(true) creates the layer, enables it, and spawns on pane:click", () => {
    installDom();
    const { editor, added, handlers, active } = makeEditor();
    withEditorMethods(editor);

    editor.setCommentMode(true);
    expect(editor.getCommentMode()).toBe(true);
    expect(active.comment).toBe(true);

    const layer = editor.getCommentLayer();
    expect(layer.enabled).toBe(true);

    handlers["pane:click"]![0]({ event: { clientX: 60, clientY: 80 } });
    expect(added.length).toBe(1);
    expect(added[0].worldX).toBe(50);
    expect(added[0].worldY).toBe(60);
  });

  it("setCommentMode(false) disables spawning but keeps the layer", () => {
    installDom();
    const { editor, added, handlers } = makeEditor();
    withEditorMethods(editor);

    editor.setCommentMode(true);
    const layer = editor.getCommentLayer();

    editor.setCommentMode(false);
    expect(editor.getCommentMode()).toBe(false);
    expect(layer.enabled).toBe(false);

    handlers["pane:click"]![0]({ event: { clientX: 10, clientY: 10 } });
    expect(added.length).toBe(0);
  });
});