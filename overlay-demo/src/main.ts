import {
  NodeEditor,
  shaders,
  Shell,
  attachCommentLayer,
  type CommentLayerController,
  type CommentRecord,
} from "@graph-giraffe/core";

/**
 * The demo's own chat state — the library deliberately holds none. The
 * comment layer only emits events; persistence lives here, and `load()`
 * renders bubbles back from it.
 */
const savedComments: CommentRecord[] = [
  {
    id: "saved-1",
    author: "Ada",
    text: "Can we tune the routing here?",
    worldX: -80,
    worldY: -260,
    createdAt: Date.now(),
  },
  {
    id: "saved-2",
    author: "Sam",
    text: "Remember to re-skin this in dom mode.",
    worldX: 240,
    worldY: -160,
    createdAt: Date.now(),
  },
];

async function boot(): Promise<void> {
  const host = document.getElementById("editor");
  if (!host) throw new Error("editor host not found");

  host.innerHTML = Shell;

  const editor = await NodeEditor.create(
    "webgl-canvas",
    "2d-bg-canvas",
    shaders.vertexShader,
    shaders.fragmentShader,
    shaders.bgVertexShader,
    shaders.bgFragmentShader,
    shaders.msdfVertexShader,
    shaders.msdfFragmentShader,
    shaders.iconBGVertexShader,
    shaders.iconBGFragmentShader,
    {
      connectionMode: "node",
      minimap: true,
      assetsPath: "/assets",
    }
  );

  let dirty = false;
  let scheduled = false;
  const scheduleRender = (): void => {
    dirty = true;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (!dirty) return;
      dirty = false;
      editor.requestRender();
    });
  };

  for (const event of [
    "history:command",
    "selection:change",
    "node:drag",
    "node:dragStart",
    "node:dragStop",
    "connect",
    "subgraph:collapseToggle",
    "node:reparent",
    "node:labelChange",
    "node:propChange",
  ] as const) {
    editor.events.on(event, scheduleRender);
  }

  const canvas = document.getElementById("webgl-canvas")!;
  for (const type of ["pointerdown", "pointermove", "pointerup", "wheel"]) {
    canvas.addEventListener(type, scheduleRender, { passive: true });
  }

  new ResizeObserver(scheduleRender).observe(host);
  window.addEventListener("resize", scheduleRender);

  const comments: CommentLayerController = attachCommentLayer(editor, {
    author: "Guest",
    enabled: false,
  });

  const log = document.getElementById("demo-log")!;
  const logEvent = (type: string, detail: string): void => {
    const row = document.createElement("div");
    row.className = `log-${type}`;
    row.textContent = `${type.padEnd(6, " ")} ${detail}`;
    log.prepend(row);
    while (log.childElementCount > 10) log.lastElementChild?.remove();
  };

  comments.on("create", (p) =>
    logEvent("create", `@(${p.worldX.toFixed(0)}, ${p.worldY.toFixed(0)})`)
  );
  comments.on("save", (p) =>
    logEvent("save", `"${p.text.slice(0, 40)}" @(${p.worldX.toFixed(0)}, ${p.worldY.toFixed(0)})`)
  );
  comments.on("cancel", (p) => logEvent("cancel", `draft @(${p.worldX.toFixed(0)}, ${p.worldY.toFixed(0)})`));
  comments.on("delete", (p) => logEvent("delete", `bubble ${p.id}`));
  comments.on("load", (p) => logEvent("load", `${p.count} bubbles restored`));

  // Keep the comment layer in sync with the action pane's Comment button.
  editor.events.on("comment:modeChange", ({ enabled }) => {
    comments.setEnabled(enabled);
    syncToggle(enabled);
  });

  const sample = [
    ["node", -420, -60, "Compute"],
    ["hub", -120, -80, "Bus"],
    ["branch", 140, -20, "Route"],
    ["group", -420, 220, "Cluster"],
    ["subgraph", 320, 200, "Nested"],
  ] as const;

  for (const [type, x, y, label] of sample) {
    await editor.addNode(type, x, y, null, label);
  }

  wireToolbar(editor, comments, logEvent);

  // Show restored bubbles immediately so the primitive is visible on load.
  comments.load(savedComments);

  (globalThis as unknown as { __ggEditor?: NodeEditor }).__ggEditor = editor;

  editor.requestRender();
}

function syncToggle(enabled: boolean): void {
  const toggle = document.getElementById("demo-comment-toggle");
  toggle?.setAttribute("aria-pressed", String(enabled));
  toggle?.classList.toggle("active", enabled);
}

function wireToolbar(
  editor: NodeEditor,
  comments: CommentLayerController,
  logEvent: (type: string, detail: string) => void
): void {
  const toggle = document.getElementById("demo-comment-toggle");
  const loadBtn = document.getElementById("demo-load-comments");
  const panBtn = document.getElementById("demo-pan-comment");
  const clear = document.getElementById("demo-clear-comments");
  const reset = document.getElementById("demo-reset");

  toggle?.addEventListener("click", () => {
    // Route through the editor so the action-pane button stays in sync too.
    editor.setCommentMode(!editor.getCommentMode());
  });

  loadBtn?.addEventListener("click", () => comments.load(savedComments));

  panBtn?.addEventListener("click", () => {
    const target = savedComments[0];
    logEvent("pan", `to (${target.worldX}, ${target.worldY})`);
    void editor.panTo(target.worldX, target.worldY, { zoom: 1.4 });
  });

  clear?.addEventListener("click", () => comments.clear());

  reset?.addEventListener("click", () => location.reload());
}

void boot();
