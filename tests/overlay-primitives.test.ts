import { describe, expect, it, vi } from "vitest";
import {
  attachCommentLayer,
  createCommentBubble,
} from "../src/scripts/overlay-primitives.js";
import type { NodeEditor } from "../src/scripts/node-editor.js";
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
  setAttribute(_name: string, _value: string): void {}
  getAttribute(_name: string): string | null {
    return null;
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
  const editor = {
    screenToWorld: (sx: number, sy: number) => ({ x: (sx - 0) / 1, y: (sy - 0) / 1 }),
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
    events: {
      on: (event: string, handler: (payload: unknown) => void) => {
        if (!handlers[event]) handlers[event] = [];
        handlers[event].push(handler);
        return () => {
          handlers[event] = handlers[event].filter((h) => h !== handler);
        };
      },
    },
  };
  return { editor: editor as unknown as NodeEditor, added, removed, handlers };
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
  });

  it("attachCommentLayer spawns a bubble on pane:click at click world coords", () => {
    installDom();
    const { editor, added, handlers } = makeEditor();
    const layer = attachCommentLayer(editor, { canvas: new FakeEl() as unknown as HTMLElement });

    const paneClick = handlers["pane:click"]![0];
    paneClick({ event: { clientX: 60, clientY: 80 } });

    expect(added.length).toBe(1);
    const overlay = added[0];
    // client (60,80) - canvas rect (10,20) => (50,60); screenToWorld identity.
    expect(overlay.worldX).toBe(50);
    expect(overlay.worldY).toBe(60);
    expect(overlay.id).toMatch(/^gg-comment-/);
    expect(layer.get(overlay.id)).toBe(overlay);
  });

  it("setEnabled(false) stops spawning from pane clicks", () => {
    installDom();
    const { editor, added, handlers } = makeEditor();
    const layer = attachCommentLayer(editor);
    layer.setEnabled(false);
    handlers["pane:click"]![0]({ event: { clientX: 10, clientY: 10 } });
    expect(added.length).toBe(0);
  });

  it("remove(id) removes the overlay and fires onRemove", () => {
    installDom();
    const { editor, added, removed } = makeEditor();
    const onRemove = vi.fn();
    const layer = attachCommentLayer(editor, { onRemove });
    const id = layer.add(1, 2, { id: "custom-id" });
    expect(added.length).toBe(1);

    layer.remove(id);
    expect(removed).toContain(id);
    expect(onRemove).toHaveBeenCalledWith(id);
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
