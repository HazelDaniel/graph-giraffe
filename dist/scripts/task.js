import { NodeEditor } from "./node-editor.js";
import { generateTetureSkinOption } from "./texture-registry.js";
import "../components/prop-group.js";
import "../components/selection-toolbar.js";
async function init() {
    await document.fonts.ready;
    //ts-ignore
    const vsSource = document.getElementById("v-shader")?.textContent;
    const fsSource = document.getElementById("f-shader")?.textContent;
    const BGvsSource = document.getElementById("bg-v-shader")?.textContent;
    const BGfsSource = document.getElementById("bg-f-shader")?.textContent;
    const msdfVsSource = document.getElementById("msdf-v-shader")?.textContent;
    const msdfFsSource = document.getElementById("msdf-f-shader")?.textContent;
    const iconBGVsSource = document.getElementById("icon-bg-v-shader")?.textContent;
    const iconBGFsSource = document.getElementById("icon-bg-f-shader")?.textContent;
    if (!vsSource || !fsSource)
        throw new Error("Shader source missing from DOM");
    if (!BGvsSource || !BGfsSource)
        throw new Error("Background shader source missing from DOM");
    if (!msdfVsSource || !msdfFsSource)
        throw new Error("MSDF shader source missing from DOM");
    if (!iconBGVsSource || !iconBGFsSource)
        throw new Error("Icon background shader source missing from DOM");
    const editor = await NodeEditor.create("webgl-canvas", "2d-bg-canvas", vsSource, fsSource, BGvsSource, BGfsSource, msdfVsSource, msdfFsSource, iconBGVsSource, iconBGFsSource, { connectionMode: "node", renderMode: "dom" }, 
    //prettier-ignore
    [
        generateTetureSkinOption("node-head", "Custom Node Head", 0, "jkldfjsljfsdlfjlsdjlfjsl"),
        generateTetureSkinOption("node-head", "Node Head Marble", 1, "jkldfjslllsljfsdlfjlsdjlfjsl"),
        generateTetureSkinOption("node-head", "Node Head Glassy", 2, "jkldfjslllsljfsdlfjlsdjlfjslfsljklsd"),
        generateTetureSkinOption("node-body", "Custom Node Body", 0, "jkldfkldfdfjsljfsdlfjlsdjlfjsl"),
        generateTetureSkinOption("node-body", "Node Body Marble", 1, "jklcfkldfdfjsljfsdlfjlsdjlfjsl"),
        generateTetureSkinOption("node-body", "Node Body Glassy", 2, "jklbfkldfdfjsljfsdlfjlsdjlfjsl"),
        generateTetureSkinOption("node-body", "Node Body Solid", 3, "jklafkldfdfjsljfsdlfjlsdjlfjsl"),
        generateTetureSkinOption("group-body", "Group Body Glassy", 0, "jklajkffkldfdfjsljfjklfdsdlfjlsdjlfjsl"),
        generateTetureSkinOption("group-head", "Group Head Glassy", 0, "jklajkffkldfdfjsljfjklfdsdlfjlsiifjsl"),
        generateTetureSkinOption("group-head", "Group Head Blank", 1, "jklajjlfldfkffkldfdfjsljfjklfdsdlfjlsiifjsl"),
    ]);
    editor.debug = true;
    editor.render();
}
document.addEventListener("DOMContentLoaded", init);
//# sourceMappingURL=task.js.map