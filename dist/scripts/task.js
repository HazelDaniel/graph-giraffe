import { NodeEditor } from "./node-editor.js";
async function init() {
    await document.fonts.ready;
    const vsSource = document.getElementById("v-shader")?.textContent;
    const fsSource = document.getElementById("f-shader")?.textContent;
    const BGvsSource = document.getElementById("bg-v-shader")?.textContent;
    const BGfsSource = document.getElementById("bg-f-shader")?.textContent;
    if (!vsSource || !fsSource)
        throw new Error("Shader source missing from DOM");
    if (!BGvsSource || !BGfsSource)
        throw new Error("Background shader source missing from DOM");
    NodeEditor.create("webgl-canvas", "2d-text-canvas", "2d-bg-canvas", vsSource, fsSource, BGvsSource, BGfsSource, { connectionMode: "node" }).render();
}
document.addEventListener("DOMContentLoaded", init);
//# sourceMappingURL=task.js.map