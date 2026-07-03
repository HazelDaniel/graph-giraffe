import { C_NODE_THEMES, CR_NODE_THEMES, G_NODE_THEMES, NODE_THEMES } from "./texture.js";
const SVG_NS = "http://www.w3.org/2000/svg";
const NODE_HEAD_TEXTURE_SKINS = [
    ` <svg width="595" height="93" viewBox="0 0 595 93" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_4024_15406)"> <rect width="595" height="93" rx="9" fill="#D946EF"/> </g> <defs> <filter id="filter0_i_4024_15406" x="0" y="0" width="595" height="97" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"> <feFlood flood-opacity="0" result="BackgroundImageFix"/> <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/> <feGaussianBlur stdDeviation="24.5"/> <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/> <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/> <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4024_15406"/> </filter>
</defs> </svg> `,
    `
<svg width="202" height="30" viewBox="0 0 202 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_in_2_2)">
<rect width="202" height="30" rx="8" fill="#F0F0F0"/>
</g>
<defs>
<filter id="filter0_in_2_2" x="0" y="0" width="202" height="34" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.62 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_2"/>
<feTurbulence type="fractalNoise" baseFrequency="0.25 0.25" stitchTiles="stitch" numOctaves="3" result="noise" seed="1670" />
<feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
<feComponentTransfer in="alphaNoise" result="coloredNoise1">
<feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 "/>
</feComponentTransfer>
<feComposite operator="in" in2="effect1_innerShadow_2_2" in="coloredNoise1" result="noise1Clipped" />
<feFlood flood-color="rgba(0, 0, 0, 0.25)" result="color1Flood" />
<feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
<feMerge result="effect2_noise_2_2">
<feMergeNode in="effect1_innerShadow_2_2" />
<feMergeNode in="color1" />
</feMerge>
</filter>
</defs>
</svg>

`,
    `
<svg width="202" height="30" viewBox="0 0 202 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_2_3)">
<rect width="202" height="30" rx="8" fill="#F0F0F0" fill-opacity="0.2"/>
</g>
<defs>
<filter id="filter0_i_2_3" x="0" y="0" width="202" height="34" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.62 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_3"/>
</filter>
</defs>
</svg>


`,
];
const COMPOSITION_HEAD_TEXTURE_SKINS = [];
const COMPOSITION_CHILD_HEAD_TEXTURE_SKINS = [];
const COMPOSITION_REFERENCE_CHILD_HEAD_TEXTURE_SKINS = [];
const NODE_BODY_TEXTURE_SKINS = [
    `
  <svg width="262" height="234" viewBox="0 0 262 234" fill="none" xmlns="http://www.w3.org/2000/svg"> <g filter="url(#filter0_d_4026_2521)">
<path d="M4.75 28.75C4.75 13.286 17.2861 0.75 32.7501 0.75H57.177C63.9909 0.75 70.5709 3.23467 75.6842 7.73843L107.5 35.7616C112.613 40.2653 119.193 42.75 126.007 42.75H228.75C244.214 42.75 256.75 55.286 256.75 70.75V196.75C256.75 212.214 244.214 224.75 228.75 224.75H32.7501C17.2861 224.75 4.75 212.214 4.75 196.75V42.75V28.75Z" fill="url(#paint0_radial_4026_2521)" shape-rendering="crispEdges"/> <path d="M126.007 42.75H228.75C244.214 42.75 256.75 55.286 256.75 70.75V196.75C256.75 212.214 244.214 224.75 228.75 224.75H32.7501C17.2861 224.75 4.75 212.214 4.75 196.75V42.75M126.007 42.75C119.193 42.75 112.613 40.2653 107.5 35.7616L75.6842 7.73843C70.5709 3.23467 63.9909 0.75 57.177 0.75H32.7501C17.2861 0.75 4.75 13.286 4.75 28.75V42.75M126.007 42.75H4.75" stroke="var(--stroke-theme)" stroke-opacity="0.16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" shape-rendering="crispEdges"/> </g>
<defs> <filter id="filter0_d_4026_2521" x="0" y="0" width="261.5" height="233.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"> <feFlood flood-opacity="0" result="BackgroundImageFix"/> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/> <feGaussianBlur stdDeviation="2"/> <feComposite in2="hardAlpha" operator="out"/> <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.28 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4026_2521"/> <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4026_2521" result="shape"/> </filter> <radialGradient id="paint0_radial_4026_2521" cx="0" cy="0" r="1" gradientTransform="matrix(-232.683 -221.365 249.035 -261.996 130.75 112.75)" gradientUnits="userSpaceOnUse">
<stop stop-color="#D946EF"/> <stop offset="1" stop-color="#7C2889"/> </radialGradient>
</defs>
</svg>
`,
    `
<svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_in_2_12)">
<rect width="206" height="142" rx="8" fill="var(--theme)"/>
</g>
<defs>
<filter id="filter0_in_2_12" x="0" y="0" width="206" height="146" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.62 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_12"/>
<feTurbulence type="fractalNoise" baseFrequency="0.25 0.25" stitchTiles="stitch" numOctaves="3" result="noise" seed="1670" />
<feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
<feComponentTransfer in="alphaNoise" result="coloredNoise1">
<feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 "/>
</feComponentTransfer>
<feComposite operator="in" in2="effect1_innerShadow_2_12" in="coloredNoise1" result="noise1Clipped" />
<feFlood flood-color="rgba(0, 0, 0, 0.25)" result="color1Flood" />
<feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
<feMerge result="effect2_noise_2_12">
<feMergeNode in="effect1_innerShadow_2_12" />
<feMergeNode in="color1" />
</feMerge>
</filter>
</defs>
</svg>

`,
    `
<svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_2_13)">
<rect width="206" height="142" rx="8" fill="var(--theme)" fill-opacity="0.2"/>
</g>
<defs>
<filter id="filter0_i_2_13" x="0" y="0" width="206" height="146" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.62 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_13"/>
</filter>
</defs>
</svg>
`,
    `
<svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_2_14)">
<rect width="206" height="142" rx="8" fill="var(--theme)"/>
</g>
<defs>
<filter id="filter0_i_2_14" x="0" y="0" width="206" height="146" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_14"/>
</filter>
</defs>
</svg>

`,
];
const GROUP_HEAD_TEXTURE_SKINS = [
    NODE_BODY_TEXTURE_SKINS[2],
    `
<svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="206" height="142" rx="8" fill="var(--theme)" fill-opacity="0"/>
</svg>

`,
];
const GROUP_BODY_TEXTURE_SKINS = [NODE_BODY_TEXTURE_SKINS[2]];
const COMPOSITION_BODY_TEXTURE_SKINS = [];
const COMPOSITION_REFERENCE_BODY_TEXTURE_SKINS = [];
export const DEFAULT_TEXTURE_SKINS = {
    "node-head": NODE_HEAD_TEXTURE_SKINS,
    "node-body": NODE_BODY_TEXTURE_SKINS,
    "composition-head": COMPOSITION_HEAD_TEXTURE_SKINS,
    "composition-body": COMPOSITION_BODY_TEXTURE_SKINS,
    "composition-child-head": COMPOSITION_CHILD_HEAD_TEXTURE_SKINS,
    "composition-reference-child-head": COMPOSITION_REFERENCE_CHILD_HEAD_TEXTURE_SKINS,
    "group-head": GROUP_HEAD_TEXTURE_SKINS,
    "group-body": GROUP_BODY_TEXTURE_SKINS,
    "composition-reference-body": COMPOSITION_REFERENCE_BODY_TEXTURE_SKINS,
};
const DEFAULT_TEXTURE_SOURCES = [
    createDefaultSource("gg-node-body-default", "Default Node Body", "node-body", "var(--theme)", "var(--stroke-theme)"),
    createDefaultSource("gg-node-head-default", "Default Node Head", "node-head", "var(--theme)", "var(--stroke-theme)"),
    createDefaultSource("gg-group-body-default", "Default Group Body", "group-body", "var(--theme)", "var(--stroke-theme)"),
    createDefaultSource("gg-group-head-default", "Default Group Head", "group-head", "var(--theme)", "var(--stroke-theme)"),
    createDefaultSource("gg-composition-body-default", "Default Composition Body", "composition-body", "var(--theme)", "var(--stroke-theme)"),
    createDefaultSource("gg-composition-head-default", "Default Composition Head", "composition-head", "var(--theme)", "var(--stroke-theme)"),
    createDefaultSource("gg-composition-child-head-default", "Default Child Head", "composition-child-head", "var(--theme)", "var(--stroke-theme)"),
    createDefaultSource("gg-composition-reference-body", "Default Reference Body", "composition-reference-body", "var(--theme)", "var(--stroke-theme)"),
];
const TEXTURE_KIND_TO_LOOKUP = {
    "node-body": { lookupKey: "node", suffixKey: "body" },
    "node-head": { lookupKey: "node", suffixKey: "head" },
    "group-body": { lookupKey: "group", suffixKey: "body" },
    "group-head": { lookupKey: "group", suffixKey: "head" },
    "composition-body": { lookupKey: "composition", suffixKey: "body" },
    "composition-head": { lookupKey: "composition", suffixKey: "head" },
    "composition-child-head": { lookupKey: "composition-child", suffixKey: "head" },
    "composition-reference-body": { lookupKey: "composition-reference", suffixKey: "body" },
    "composition-reference-child-head": { lookupKey: "composition-reference", suffixKey: "head" },
};
const NODE_ID_TEXTURE_LOOKUP = {
    node: {
        body: "gg-node-body-default",
        head: "gg-node-head-default",
    },
    hub: {
        body: "gg-node-body-default",
        head: "gg-node-head-default",
    },
    group: {
        body: "gg-group-body-default",
        head: "gg-group-head-default",
    },
    composition: {
        body: "gg-composition-body-default",
        head: "gg-composition-head-default",
    },
    "composition-child": {
        body: "gg-node-body-default",
        head: "gg-composition-child-head-default",
    },
    subgraph: {
        body: "",
        head: "",
    },
    "composition-reference": {
        body: "gg-composition-reference-body",
        head: "gg-composition-reference-child-head",
    },
};
/**
 * Durable texture source registry.
 *
 * It owns SVG source metadata and preview URLs, but deliberately does not
 * create WebGLTexture objects. Runtime upload/caching belongs to rendering.
 */
class textureRegistry {
    sources = new Map();
    ownedPreviewUrls = new Set();
    theme_ = null;
    static _instance = null;
    static get instance() {
        if (!this._instance) {
            this._instance = new textureRegistry();
        }
        return this._instance;
    }
    set theme(newTheme) {
        if (this.theme_ === newTheme)
            return;
        this.theme_ = newTheme;
        this.updatePreviewUrls();
    }
    updatePreviewUrls() {
        for (const source of this.sources.values()) {
            if (source.sourceType === "upload") {
                if (source.previewUrl && this.ownedPreviewUrls.has(source.previewUrl)) {
                    URL.revokeObjectURL(source.previewUrl);
                    this.ownedPreviewUrls.delete(source.previewUrl);
                }
                source.previewUrl = createSvgPreviewUrl(this.getResolvedSvgText(source));
                this.ownedPreviewUrls.add(source.previewUrl);
            }
        }
        document?.dispatchEvent(new CustomEvent("gg-texture-registry-update"));
    }
    getStrokeColorForKind(kind) {
        const theme = this.theme_ || "dark";
        switch (kind) {
            case "composition-reference-body":
                return CR_NODE_THEMES[theme].borderStroke;
            case "composition-body":
                return C_NODE_THEMES[theme].borderStroke;
            case "node-body":
                return NODE_THEMES[theme].borderStroke;
            case "composition-child-head":
            case "composition-head":
            case "group-head":
            case "node-head":
            case "composition-reference-child-head":
                return "none";
            default:
                return G_NODE_THEMES[theme].borderStroke;
        }
    }
    getThemeColorForKind(kind) {
        const theme = this.theme_ || "dark";
        switch (kind) {
            case "node-head":
            case "composition-reference-child-head":
            case "composition-child-head":
                return NODE_THEMES[theme].headerFill;
            case "node-body":
                return NODE_THEMES[theme].bodyFill;
            case "composition-reference-body":
                return CR_NODE_THEMES[theme].bodyFill;
            case "group-head":
                return G_NODE_THEMES[theme].headerFill;
            case "composition-head":
                return C_NODE_THEMES[theme].headerFill;
            case "group-body":
                return G_NODE_THEMES[theme].bodyFill;
            case "composition-body":
                return C_NODE_THEMES[theme].bodyFill;
            default:
                return G_NODE_THEMES[theme].bgFill;
        }
    }
    getResolvedSvgText(source) {
        return source.svgText.replaceAll("var(--theme)", this.getThemeColorForKind(source.kind)).replaceAll("var(--stroke-theme)", this.getStrokeColorForKind(source.kind));
    }
    constructor(defaultSources = DEFAULT_TEXTURE_SOURCES) {
        for (const source of defaultSources) {
            this.registerDefault(source);
        }
        document?.addEventListener("gg-texture-select-change", (e) => {
            const customEvent = e;
            const kind = customEvent.detail.kind;
            const mapping = TEXTURE_KIND_TO_LOOKUP[kind];
            if (!mapping)
                return;
            NODE_ID_TEXTURE_LOOKUP[mapping.lookupKey] = {
                ...NODE_ID_TEXTURE_LOOKUP[mapping.lookupKey],
                [mapping.suffixKey]: customEvent.detail.value,
            };
        });
    }
    all() {
        return [...this.sources.values()].map((source) => ({ ...source }));
    }
    byKind(kind) {
        return this.all().filter((source) => source.kind === kind);
    }
    get(id) {
        const source = this.sources.get(id);
        if (!source)
            return undefined;
        return { ...source, svgText: this.getResolvedSvgText(source) };
    }
    has(id) {
        return this.sources.has(id);
    }
    addUploaded(params) {
        const svgText = sanitizeSvg(params.svgText);
        const id = this.ensureUniqueId(params.id ?? slugify(params.label));
        const source = {
            id,
            label: params.label,
            kind: params.kind,
            sourceType: "upload",
            svgText,
            previewUrl: "",
        };
        source.previewUrl = createSvgPreviewUrl(this.getResolvedSvgText(source));
        if (source.previewUrl) {
            this.ownedPreviewUrls.add(source.previewUrl);
        }
        this.sources.set(source.id, source);
        return { ...source };
    }
    removeUploaded(id) {
        const source = this.sources.get(id);
        if (!source || source.sourceType !== "upload")
            return false;
        if (source.previewUrl && this.ownedPreviewUrls.has(source.previewUrl)) {
            URL.revokeObjectURL(source.previewUrl);
            this.ownedPreviewUrls.delete(source.previewUrl);
        }
        this.sources.delete(id);
        return true;
    }
    dispose() {
        for (const previewUrl of this.ownedPreviewUrls) {
            URL.revokeObjectURL(previewUrl);
        }
        this.ownedPreviewUrls.clear();
    }
    registerDefault(source) {
        this.sources.set(source.id, {
            ...source,
            sourceType: "default",
            previewUrl: source.previewUrl ?? svgToDataUrl(source.svgText),
        });
    }
    ensureUniqueId(baseId) {
        const cleanBase = baseId || "texture";
        if (!this.sources.has(cleanBase))
            return cleanBase;
        let suffix = 2;
        while (this.sources.has(`${cleanBase}-${suffix}`)) {
            suffix += 1;
        }
        return `${cleanBase}-${suffix}`;
    }
}
export function getDefaultTextureIds(nodeType) {
    const defaults = NODE_ID_TEXTURE_LOOKUP[nodeType];
    return { ...defaults };
}
export function getCompositionReferenceTextureIds() {
    const defaults = NODE_ID_TEXTURE_LOOKUP["composition-reference"];
    return { ...defaults };
}
function createDefaultSource(id, label, kind, fill, stroke) {
    const svgText = buildDefaultTextureSvg(fill, stroke);
    return {
        id,
        label,
        kind,
        sourceType: "default",
        svgText,
        previewUrl: svgToDataUrl(svgText),
    };
}
export function generateTetureSkinOption(kind, label, index, id) {
    const skinReg = DEFAULT_TEXTURE_SKINS[kind];
    const svgText = index < skinReg.length ? skinReg[index] : skinReg[0];
    const source = {
        id,
        label,
        kind,
        sourceType: "upload",
        svgText,
        previewUrl: createSvgPreviewUrl(svgText),
    };
    if (source.previewUrl) {
        TextureRegistry.ownedPreviewUrls.add(source.previewUrl);
    }
    return { ...source };
}
function buildDefaultTextureSvg(fill, stroke) {
    return `
  <svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="${SVG_NS}">
    <rect x="0.5" y="0.5" width="205" height="141" rx="7.5" fill="${fill}"  stroke="${stroke}" stroke-width="2"/>
  </svg>
`;
}
function sanitizeSvg(svgText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const svg = doc.documentElement;
    if (svg.nodeName.toLowerCase() === "parsererror" ||
        svg.nodeName.toLowerCase() !== "svg") {
        throw new Error("Uploaded texture must be a valid SVG document");
    }
    const forbiddenElements = new Set([
        "script",
        "foreignobject",
        "iframe",
        "object",
        "embed",
        "audio",
        "video",
        "canvas",
    ]);
    for (const element of [...svg.querySelectorAll("*")]) {
        const tagName = element.tagName.toLowerCase();
        if (forbiddenElements.has(tagName)) {
            element.remove();
            continue;
        }
        for (const attr of [...element.attributes]) {
            const name = attr.name.toLowerCase();
            const value = attr.value.trim().toLowerCase();
            if (name.startsWith("on") ||
                value.startsWith("javascript:") ||
                value.includes("url(http:") ||
                value.includes("url(https:") ||
                value.includes("url(//")) {
                element.removeAttribute(attr.name);
            }
        }
    }
    return new XMLSerializer().serializeToString(svg);
}
function createSvgPreviewUrl(svgText) {
    return URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }));
}
function svgToDataUrl(svgText) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}
function slugify(label) {
    return label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
export const TextureRegistry = textureRegistry.instance;
//# sourceMappingURL=texture-registry.js.map