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

  for (const [type, x, y, label] of sample) {
    await editor.addNode(type, x, y, null, label);
  }

  // Start the render loop — without it nothing composites and the DOM layer's
  // per-frame sync (camera transform, selection reflection) never updates.
  editor.render();

  (globalThis as unknown as { __ggEditor?: NodeEditor }).__ggEditor = editor;

  wireToolbar(editor);
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
