import { describe, expect, it, vi } from "vitest";
import { NodeEditor } from "../src/scripts/node-editor.js";

type TestEditor = NodeEditor & {
  hitTestHandle: ReturnType<typeof vi.fn>;
  pick: ReturnType<typeof vi.fn>;
  hitTestEdge: ReturnType<typeof vi.fn>;
  store: { get: ReturnType<typeof vi.fn> };
};

function makeEditor(): TestEditor {
  const editor = Object.create(NodeEditor.prototype) as TestEditor;
  editor.hitTestHandle = vi.fn(() => null);
  editor.pick = vi.fn(() => 0);
  editor.hitTestEdge = vi.fn(() => null);
  editor.store = { get: vi.fn(() => undefined) };
  return editor;
}

describe("renderer-neutral interaction targets", () => {
  it("classifies handles before nodes", () => {
    const editor = makeEditor();
    editor.hitTestHandle.mockReturnValue({
      nodeId: 7,
      handle: { side: "right" },
    });

    expect(editor.resolveInteractionTarget(10, 20)).toEqual({
      kind: "handle",
      nodeId: 7,
      side: "right",
    });
    expect(editor.pick).not.toHaveBeenCalled();
  });

  it("classifies nodes, edges, and the empty pane without mutation", () => {
    const editor = makeEditor();
    editor.pick.mockReturnValueOnce(3);
    editor.store.get.mockReturnValueOnce({ id: 3 });
    expect(editor.resolveInteractionTarget(1, 2)).toEqual({ kind: "node", nodeId: 3 });

    editor.pick.mockReturnValueOnce(0);
    editor.hitTestEdge.mockReturnValueOnce({ id: 9 });
    expect(editor.resolveInteractionTarget(1, 2)).toEqual({ kind: "edge", edgeId: 9 });

    editor.pick.mockReturnValueOnce(0);
    editor.hitTestEdge.mockReturnValueOnce(null);
    expect(editor.resolveInteractionTarget(1, 2)).toEqual({ kind: "pane" });
  });
});
