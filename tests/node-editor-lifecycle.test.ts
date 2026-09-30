import { describe, expect, it, vi } from "vitest";
import { NodeEditor } from "../src/scripts/node-editor.js";

type LifecycleEditor = NodeEditor & {
  primitiveMeasurements: { dispose: () => void };
  renderer?: { stopLoop: () => void };
  resizeObserver?: { disconnect: () => void };
  selectionToolbar?: { remove: () => void } | null;
};

function makeEditor(): LifecycleEditor {
  return Object.assign(Object.create(NodeEditor.prototype), {
    primitiveMeasurements: { dispose: vi.fn() },
    renderer: { stopLoop: vi.fn() },
    resizeObserver: { disconnect: vi.fn() },
    selectionToolbar: { remove: vi.fn() },
  }) as LifecycleEditor;
}

function singletonSlot(): { value: NodeEditor | null } {
  return {
    get value() {
      return (NodeEditor as unknown as { _instance: NodeEditor | null })._instance;
    },
    set value(value: NodeEditor | null) {
      (NodeEditor as unknown as { _instance: NodeEditor | null })._instance = value;
    },
  };
}

describe("NodeEditor lifecycle", () => {
  it("dispose releases its singleton slot and owned resources exactly once", () => {
    const slot = singletonSlot();
    const editor = makeEditor();
    const toolbar = editor.selectionToolbar!;
    slot.value = editor;

    editor.dispose();
    editor.dispose();

    expect(slot.value).toBeNull();
    expect(editor.renderer!.stopLoop).toHaveBeenCalledOnce();
    expect(editor.resizeObserver!.disconnect).toHaveBeenCalledOnce();
    expect(editor.primitiveMeasurements.dispose).toHaveBeenCalledOnce();
    expect(toolbar.remove).toHaveBeenCalledOnce();
  });

  it("does not release a newer singleton when an older editor is disposed", () => {
    const slot = singletonSlot();
    const older = makeEditor();
    const current = makeEditor();
    slot.value = current;

    older.dispose();

    expect(slot.value).toBe(current);
  });

  it("supports owner-aware release for adapter compatibility", () => {
    const slot = singletonSlot();
    const current = makeEditor();
    const other = makeEditor();
    slot.value = current;

    NodeEditor.release(other);
    expect(slot.value).toBe(current);

    NodeEditor.release(current);
    expect(slot.value).toBeNull();
  });
});
