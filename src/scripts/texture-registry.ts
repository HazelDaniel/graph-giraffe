import { G_NODE_THEMES, NODE_THEMES } from "./texture.js";
import {
  AddUploadedTextureParams,
  NodeTextureIds,
  NodeType,
  TextureKind,
  TextureSource,
  ThemeName,
} from "./types.js";

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

const COMPOSITION_HEAD_TEXTURE_SKINS: string[] = [];
const COMPOSITION_CHILD_HEAD_TEXTURE_SKINS: string[] = [];
const COMPOSITION_REFERENCE_CHILD_HEAD_TEXTURE_SKINS: string[] = [];

const NODE_BODY_TEXTURE_SKINS = [
  `
  <svg width="262" height="234" viewBox="0 0 262 234" fill="none" xmlns="http://www.w3.org/2000/svg"> <g filter="url(#filter0_d_4026_2521)">
<path d="M4.75 28.75C4.75 13.286 17.2861 0.75 32.7501 0.75H57.177C63.9909 0.75 70.5709 3.23467 75.6842 7.73843L107.5 35.7616C112.613 40.2653 119.193 42.75 126.007 42.75H228.75C244.214 42.75 256.75 55.286 256.75 70.75V196.75C256.75 212.214 244.214 224.75 228.75 224.75H32.7501C17.2861 224.75 4.75 212.214 4.75 196.75V42.75V28.75Z" fill="url(#paint0_radial_4026_2521)" shape-rendering="crispEdges"/> <path d="M126.007 42.75H228.75C244.214 42.75 256.75 55.286 256.75 70.75V196.75C256.75 212.214 244.214 224.75 228.75 224.75H32.7501C17.2861 224.75 4.75 212.214 4.75 196.75V42.75M126.007 42.75C119.193 42.75 112.613 40.2653 107.5 35.7616L75.6842 7.73843C70.5709 3.23467 63.9909 0.75 57.177 0.75H32.7501C17.2861 0.75 4.75 13.286 4.75 28.75V42.75M126.007 42.75H4.75" stroke="#1D192B" stroke-opacity="0.16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" shape-rendering="crispEdges"/> </g>
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

const GROUP_HEAD_TEXTURE_SKINS: string[] = [
  NODE_BODY_TEXTURE_SKINS[2],
  `
<svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="206" height="142" rx="8" fill="var(--theme)" fill-opacity="0"/>
</svg>

`,
];

const GROUP_BODY_TEXTURE_SKINS: string[] = [NODE_BODY_TEXTURE_SKINS[2]];

const COMPOSITION_BODY_TEXTURE_SKINS: string[] = [];
const COMPOSITION_REFERENCE_BODY_TEXTURE_SKINS: string[] = [];

export const DEFAULT_TEXTURE_SKINS: Record<TextureKind, string[]> = {
  "node-head": NODE_HEAD_TEXTURE_SKINS,
  "node-body": NODE_BODY_TEXTURE_SKINS,
  "composition-head": COMPOSITION_HEAD_TEXTURE_SKINS,
  "composition-body": COMPOSITION_BODY_TEXTURE_SKINS,
  "composition-child-head": COMPOSITION_CHILD_HEAD_TEXTURE_SKINS,
  "composition-reference-child-head":
    COMPOSITION_REFERENCE_CHILD_HEAD_TEXTURE_SKINS,
  "group-head": GROUP_HEAD_TEXTURE_SKINS,
  "group-body": GROUP_BODY_TEXTURE_SKINS,
  "composition-reference-body": COMPOSITION_REFERENCE_BODY_TEXTURE_SKINS,
};

const DEFAULT_TEXTURE_SOURCES: TextureSource[] = [
  createDefaultSource(
    "gg-node-body-glass",
    "Default Body",
    "node-body",
    "var(--theme)",
    "var(--theme)"
  ),
  createDefaultSource(
    "gg-node-head-graphite",
    "Default Head",
    "node-head",
    "var(--theme)",
    "var(--theme)"
  ),
  createDefaultSource(
    "gg-group-body-grid",
    "Grid Group Body",
    "group-body",
    "var(--theme)",
    "var(--theme)"
  ),
  createDefaultSource(
    "gg-group-head-slate",
    "Slate Group Head",
    "group-head",
    "var(--theme)",
    "var(--theme)"
  ),
  createDefaultSource(
    "gg-composition-body-mint",
    "Mint Composition Body",
    "composition-body",
    "#064e3b",
    "#34d399"
  ),
  createDefaultSource(
    "gg-composition-head-mint",
    "Mint Composition Head",
    "composition-head",
    "#065f46",
    "#6ee7b7"
  ),
  createDefaultSource(
    "gg-composition-child-head-teal",
    "Teal Child Head",
    "composition-child-head",
    "#0f766e",
    "#5eead4"
  ),
  createDefaultSource(
    "gg-composition-reference-body",
    "Reference Body",
    "composition-reference-body",
    "#064e3b",
    "#34d399"
  ),
];

type TextureLookupKeys = NodeType | "composition-reference";

const NODE_ID_TEXTURE_LOOKUP: Record<TextureLookupKeys, NodeTextureIds> = {
  node: {
    body: "gg-node-body-glass",
    head: "gg-node-head-graphite",
  },
  group: {
    body: "gg-group-body-grid",
    head: "gg-group-head-slate",
  },
  composition: {
    body: "gg-composition-body-mint",
    head: "gg-composition-head-mint",
  },
  "composition-child": {
    body: "gg-node-body-glass",
    head: "gg-composition-child-head-teal",
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
  public sources = new Map<string, TextureSource>();
  public ownedPreviewUrls = new Set<string>();
  private theme_: ThemeName | null = null;

  private static _instance: textureRegistry | null = null;

  static get instance(): textureRegistry {
    if (!this._instance) {
      this._instance = new textureRegistry();
    }
    return this._instance;
  }

  set theme(newTheme: ThemeName) {
    if (this.theme_ === newTheme) return;
    this.theme_ = newTheme;
    this.updatePreviewUrls();
  }

  private updatePreviewUrls(): void {
    for (const source of this.sources.values()) {
      if (source.sourceType === "upload") {
        if (source.previewUrl && this.ownedPreviewUrls.has(source.previewUrl)) {
          URL.revokeObjectURL(source.previewUrl);
          this.ownedPreviewUrls.delete(source.previewUrl);
        }
        source.previewUrl = createSvgPreviewUrl(
          this.getResolvedSvgText(source)
        );
        this.ownedPreviewUrls.add(source.previewUrl);
      }
    }
    document?.dispatchEvent(new CustomEvent("gg-texture-registry-update"));
  }

  private getThemeColorForKind(kind: TextureKind): string {
    const theme = this.theme_ || "dark";
    switch (kind) {
      case "node-head":
      case "composition-reference-child-head":
      case "composition-child-head":
        return NODE_THEMES[theme].headerFill;
      case "node-body":
      case "composition-reference-body":
        return NODE_THEMES[theme].bodyFill;
      case "group-head":
      case "composition-head":
        return G_NODE_THEMES[theme].headerFill;
      case "group-body":
      case "composition-body":
        return G_NODE_THEMES[theme].bodyFill;
      default:
        return G_NODE_THEMES[theme].bgFill;
    }
  }

  getResolvedSvgText(source: TextureSource): string {
    return source.svgText.replaceAll(
      "var(--theme)",
      this.getThemeColorForKind(source.kind)
    );
  }

  constructor(defaultSources: TextureSource[] = DEFAULT_TEXTURE_SOURCES) {
    for (const source of defaultSources) {
      this.registerDefault(source);
    }

    document?.addEventListener("gg-texture-select-change", (e: Event) => {
      const customEvent: CustomEvent<TextureSource & { value: string }> =
        e as CustomEvent<TextureSource & { value: string }>;
      const kind = customEvent.detail.kind;
      const prefixKey = kind.substring(0, kind.lastIndexOf("-"));
      const suffixKey = kind.substring(prefixKey.length + 1, kind.length);
      const lookupKey = prefixKey as TextureLookupKeys;
      NODE_ID_TEXTURE_LOOKUP[lookupKey] = {
        ...NODE_ID_TEXTURE_LOOKUP[lookupKey],
        [suffixKey]: customEvent.detail.value,
      };
    });
  }

  all(): TextureSource[] {
    return [...this.sources.values()].map((source) => ({ ...source }));
  }

  byKind(kind: TextureKind): TextureSource[] {
    return this.all().filter((source) => source.kind === kind);
  }

  get(id: string): TextureSource | undefined {
    const source = this.sources.get(id);
    if (!source) return undefined;

    return { ...source, svgText: this.getResolvedSvgText(source) };
  }

  has(id: string): boolean {
    return this.sources.has(id);
  }

  addUploaded(params: AddUploadedTextureParams): TextureSource {
    const svgText = sanitizeSvg(params.svgText);
    const id = this.ensureUniqueId(params.id ?? slugify(params.label));

    const source: TextureSource = {
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

  removeUploaded(id: string): boolean {
    const source = this.sources.get(id);
    if (!source || source.sourceType !== "upload") return false;

    if (source.previewUrl && this.ownedPreviewUrls.has(source.previewUrl)) {
      URL.revokeObjectURL(source.previewUrl);
      this.ownedPreviewUrls.delete(source.previewUrl);
    }

    this.sources.delete(id);
    return true;
  }

  dispose(): void {
    for (const previewUrl of this.ownedPreviewUrls) {
      URL.revokeObjectURL(previewUrl);
    }
    this.ownedPreviewUrls.clear();
  }

  private registerDefault(source: TextureSource): void {
    this.sources.set(source.id, {
      ...source,
      sourceType: "default",
      previewUrl: source.previewUrl ?? svgToDataUrl(source.svgText),
    });
  }

  private ensureUniqueId(baseId: string): string {
    const cleanBase = baseId || "texture";
    if (!this.sources.has(cleanBase)) return cleanBase;

    let suffix = 2;
    while (this.sources.has(`${cleanBase}-${suffix}`)) {
      suffix += 1;
    }
    return `${cleanBase}-${suffix}`;
  }
}

export function getDefaultTextureIds(nodeType: NodeType): NodeTextureIds {
  const defaults = NODE_ID_TEXTURE_LOOKUP[nodeType];
  return { ...defaults };
}

export function getCompositionReferenceTextureIds(): NodeTextureIds {
  const defaults = NODE_ID_TEXTURE_LOOKUP["composition-reference"];
  return { ...defaults };
}

function createDefaultSource(
  id: string,
  label: string,
  kind: TextureKind,
  fill: string,
  stroke: string
): TextureSource {
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

export function generateTetureSkinOption(
  kind: TextureKind,
  label: string,
  index: number,
  id: string
): TextureSource {
  const skinReg = DEFAULT_TEXTURE_SKINS[kind];
  const svgText = index < skinReg.length ? skinReg[index] : skinReg[0];
  const source: TextureSource = {
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

function buildDefaultTextureSvg(fill: string, stroke: string): string {
  return `
  <svg width="206" height="142" viewBox="0 0 206 142" fill="none" xmlns="${SVG_NS}">
    <rect x="0.5" y="0.5" width="205" height="141" rx="7.5" fill="${fill}"  stroke="${stroke}" stroke-width="2"/>
  </svg>
`;
}

function sanitizeSvg(svgText: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svg = doc.documentElement;

  if (
    svg.nodeName.toLowerCase() === "parsererror" ||
    svg.nodeName.toLowerCase() !== "svg"
  ) {
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
      if (
        name.startsWith("on") ||
        value.startsWith("javascript:") ||
        value.includes("url(http:") ||
        value.includes("url(https:") ||
        value.includes("url(//")
      ) {
        element.removeAttribute(attr.name);
      }
    }
  }

  return new XMLSerializer().serializeToString(svg);
}

function createSvgPreviewUrl(svgText: string): string {
  return URL.createObjectURL(
    new Blob([svgText], { type: "image/svg+xml;charset=utf-8" })
  );
}

function svgToDataUrl(svgText: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const TextureRegistry = textureRegistry.instance;
