import {
  NodeEditor,
  shaders,
  Shell,
  attachCommentLayer,
  type CommentLayerController,
} from "@graph-giraffe/core";

async function boot(): Promise<void> {
  const host = document.getElementById("editor");
  if (!host) throw new Error("editor host not found");

  // Inject the same editor shell the core ships (canvases, overlay layers,
  // sidebar, action pane, minimap, history pane).
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

  // Event-driven rendering: draw one frame only when something changed.
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

  // The overlay primitive: a comment layer that spawns Figma-style bubbles
  // wherever the user clicks empty canvas space.
  const comments: CommentLayerController = attachCommentLayer(editor, {
    author: "Guest",
    enabled: false,
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

  wireToolbar(comments);

  (globalThis as unknown as { __ggEditor?: NodeEditor }).__ggEditor = editor;

  // Drop a couple of example bubbles so the primitive is visible on load.
  comments.add(-80, -260, { initialText: "Can we tune the routing here?", author: "Alex" });
  comments.add(240, -160, { initialText: "Remember to re-skin this in dom mode.", author: "Sam" });

  editor.requestRender();
}

function wireToolbar(comments: CommentLayerController): void {
  const toggle = document.getElementById("demo-comment-toggle");
  const clear = document.getElementById("demo-clear-comments");
  const reset = document.getElementById("demo-reset");

  toggle?.addEventListener("click", () => {
    comments.setEnabled(!comments.enabled);
    toggle.setAttribute("aria-pressed", String(comments.enabled));
    toggle.classList.toggle("active", comments.enabled);
  });

  clear?.addEventListener("click", () => comments.clear());

  reset?.addEventListener("click", () => location.reload());
}

void boot();
