import {
  NodeEditor,
  shaders,
  Shell,
} from "@graph-giraffe/core";
import { DOM_NODE_DESCRIPTORS } from "./dom-types";

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
    { connectionMode: "node", minimap: true, assetsPath: "/assets" }
  );


  // Register all 7 DOM node types against the live editor registry.
  for (const descriptor of DOM_NODE_DESCRIPTORS) {
    editor.typeRegistry.register(descriptor);
  }

  // Sample graph: one of each DOM node type, loosely connected by hand so the
  // editor's WebGL handles stay interactive (drag to connect).
  const sample = [
    ["dom-node", -420, -60, "Compute"],
    ["dom-hub", -120, -80, "Bus"],
    ["dom-branch", 140, -20, "Route"],
    ["dom-group", -420, 220, "Cluster"],
    ["dom-composition", 60, 260, "Template"],
    ["dom-child", 60, 180, "Slot A"],
    ["dom-subgraph", 320, 200, "Nested"],
  ] as const;

  // Event-driven rendering: instead of `editor.render()`'s perpetual 60fps
  // loop, draw one frame only when something actually changed, so an idle
  // graph costs ~0% CPU. All change signals funnel into a single coalesced
  // rAF — bursts of signals (one per drag tick) collapse into one draw.
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

  // Semantic changes: structural edits, undo/redo, selection, motion.
  // NB: `camera:change` is deliberately NOT listed — canvas pan/zoom already
  // schedules via the coarse pointer/wheel hooks below, and the minimap via
  // `gg-minimap-navigate`. The editor only clears its `cameraDirty` flag on
  // throttled/animated paths, so listening to it would feed a render loop
  // after a sticky camera change (e.g. minimap setState).
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

  // Coarse interaction hooks for canvas state that emits no editor event:
  // panning, connection preview, hovered-handle highlight, box selection.
  const canvas = document.getElementById("webgl-canvas")!;
  for (const type of ["pointerdown", "pointermove", "pointerup", "wheel"]) {
    canvas.addEventListener(type, scheduleRender, { passive: true });
  }

  // The minimap navigates the camera from its own canvas (gg-minimap-navigate,
  // bubbles/composed from the minimap element), so no main-canvas event fires.
  // The editor only surfaces that as camera:change once a frame actually
  // renders, so route the navigate event straight into the scheduler.
  document.addEventListener("gg-minimap-navigate", scheduleRender);

  // Canvas size changes must repaint (the pick FBO and canvases are resized).
  new ResizeObserver(scheduleRender).observe(host);
  window.addEventListener("resize", scheduleRender);

  for (const [type, x, y, label] of sample) {
    await editor.addNode(type, x, y, null, label);
  }

  wireToolbar(editor);

  (globalThis as unknown as { __ggEditor?: NodeEditor }).__ggEditor = editor;

  // First frame — guarantees the canvas + DOM views paint even if no event
  // fired during setup.
  editor.requestRender();
}

function wireToolbar(editor: NodeEditor): void {
  const toolbar = document.getElementById("demo-toolbar");
  if (!toolbar) return;

  toolbar.addEventListener("click", async (event) => {
    const target = (event.target as HTMLElement).closest("button");
    if (!target) return;

    if (target.id === "demo-reset") {
      location.reload();
      return;
    }

    const type = target.dataset.type;
    if (!type) return;

    const viewport = editor.getCameraState();
    // Stagger new nodes slightly so they don't overlap.
    const count = toolbar.querySelectorAll("button").length;
    const jitter = (Math.random() - 0.5) * 180;
    const x = (500 - viewport.panX - jitter - count * 20) / viewport.zoom;
    const y = (60 - viewport.panY) / viewport.zoom;
    await editor.addNode(type, x, y);
  });
}

void boot();
