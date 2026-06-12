import { NodeEditor } from "./node-editor.js";

async function init(): Promise<void> {
  await document.fonts.ready;
  const vsSource = document.getElementById("v-shader")?.textContent;
  const fsSource = document.getElementById("f-shader")?.textContent;

  const BGvsSource = document.getElementById("bg-v-shader")?.textContent;
  const BGfsSource = document.getElementById("bg-f-shader")?.textContent;
  if (!vsSource || !fsSource) throw new Error("Shader source missing from DOM");
  if (!BGvsSource || !BGfsSource)
    throw new Error("Background shader source missing from DOM");
  NodeEditor.create(
    "webgl-canvas",
    "2d-text-canvas",
    "2d-bg-canvas",
    vsSource,
    fsSource,
    BGvsSource,
    BGfsSource,
    { connectionMode: "node" },
    [{kind: "node-head", id: "jkldfjsljfsdlfjlsdjlfjsl", label: "Custom Node Head", svgText: `
      <svg width="595" height="93" viewBox="0 0 595 93" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_4024_15406)">
<rect width="595" height="93" rx="9" fill="#D946EF"/>
</g>
<defs>
<filter id="filter0_i_4024_15406" x="0" y="0" width="595" height="97" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="24.5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_4024_15406"/>
</filter>
</defs>
</svg>
`}, {kind: "node-body", id: "jkfldsfsdfsdljljkl", label: "Custom Node Body", svgText: `
  <svg width="262" height="234" viewBox="0 0 262 234" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_4026_2521)">
<path d="M4.75 28.75C4.75 13.286 17.2861 0.75 32.7501 0.75H57.177C63.9909 0.75 70.5709 3.23467 75.6842 7.73843L107.5 35.7616C112.613 40.2653 119.193 42.75 126.007 42.75H228.75C244.214 42.75 256.75 55.286 256.75 70.75V196.75C256.75 212.214 244.214 224.75 228.75 224.75H32.7501C17.2861 224.75 4.75 212.214 4.75 196.75V42.75V28.75Z" fill="url(#paint0_radial_4026_2521)" shape-rendering="crispEdges"/>
<path d="M126.007 42.75H228.75C244.214 42.75 256.75 55.286 256.75 70.75V196.75C256.75 212.214 244.214 224.75 228.75 224.75H32.7501C17.2861 224.75 4.75 212.214 4.75 196.75V42.75M126.007 42.75C119.193 42.75 112.613 40.2653 107.5 35.7616L75.6842 7.73843C70.5709 3.23467 63.9909 0.75 57.177 0.75H32.7501C17.2861 0.75 4.75 13.286 4.75 28.75V42.75M126.007 42.75H4.75" stroke="#1D192B" stroke-opacity="0.16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" shape-rendering="crispEdges"/>
</g>
<defs>
<filter id="filter0_d_4026_2521" x="0" y="0" width="261.5" height="233.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.28 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4026_2521"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4026_2521" result="shape"/>
</filter>
<radialGradient id="paint0_radial_4026_2521" cx="0" cy="0" r="1" gradientTransform="matrix(-232.683 -221.365 249.035 -261.996 130.75 112.75)" gradientUnits="userSpaceOnUse">
<stop stop-color="#D946EF"/>
<stop offset="1" stop-color="#7C2889"/>
</radialGradient>
</defs>
</svg>


  `}]
  ).render();
}

document.addEventListener("DOMContentLoaded", init);
