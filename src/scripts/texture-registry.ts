import {
  NodeTextureIds,
  NodeType,
  TextureKind,
  TextureSource,
} from './types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_TEXTURE_SOURCES: TextureSource[] = [
  createDefaultSource('gg-node-body-glass', 'Glass Body', 'node-body', '#1e293b', '#64748b'),
  createDefaultSource('gg-node-head-graphite', 'Graphite Head', 'node-head', '#0f172a', '#475569'),
  createDefaultSource('gg-group-body-grid', 'Grid Group Body', 'group-body', '#172033', '#94a3b8'),
  createDefaultSource('gg-group-head-slate', 'Slate Group Head', 'group-head', '#111827', '#64748b'),
  createDefaultSource('gg-composition-body-mint', 'Mint Composition Body', 'composition-body', '#064e3b', '#34d399'),
  createDefaultSource('gg-composition-head-mint', 'Mint Composition Head', 'composition-head', '#065f46', '#6ee7b7'),
  createDefaultSource('gg-composition-child-head-teal', 'Teal Child Head', 'composition-child-head', '#0f766e', '#5eead4'),
  createDefaultSource('gg-composition-reference-body', 'Reference Body', 'composition-reference-body', '#064e3b', '#34d399'),
  createDefaultSource('gg-composition-reference-child-head', 'Reference Child Head', 'composition-reference-child-head', '#115e59', '#99f6e4'),
];

const DEFAULT_NODE_TEXTURE_IDS: Record<NodeType, NodeTextureIds> = {
  node: {
    body: 'gg-node-body-glass',
    head: 'gg-node-head-graphite',
  },
  group: {
    body: 'gg-group-body-grid',
    head: 'gg-group-head-slate',
  },
  composition: {
    body: 'gg-composition-body-mint',
    head: 'gg-composition-head-mint',
  },
  'composition-child': {
    body: 'gg-node-body-glass',
    head: 'gg-composition-child-head-teal',
  },
};

export interface AddUploadedTextureParams {
  id?: string;
  label: string;
  kind: TextureKind;
  svgText: string;
}

/**
 * Durable texture source registry.
 *
 * It owns SVG source metadata and preview URLs, but deliberately does not
 * create WebGLTexture objects. Runtime upload/caching belongs to rendering.
 */
export class TextureRegistry {
  private sources = new Map<string, TextureSource>();
  private ownedPreviewUrls = new Set<string>();

  constructor(defaultSources: TextureSource[] = DEFAULT_TEXTURE_SOURCES) {
    for (const source of defaultSources) {
      this.registerDefault(source);
    }
  }

  all(): TextureSource[] {
    return [...this.sources.values()].map((source) => ({ ...source }));
  }

  byKind(kind: TextureKind): TextureSource[] {
    return this.all().filter((source) => source.kind === kind);
  }

  get(id: string): TextureSource | undefined {
    const source = this.sources.get(id);
    return source ? { ...source } : undefined;
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
      sourceType: 'upload',
      svgText,
      previewUrl: createSvgPreviewUrl(svgText),
    };

    if (source.previewUrl) {
      this.ownedPreviewUrls.add(source.previewUrl);
    }

    this.sources.set(source.id, source);
    return { ...source };
  }

  removeUploaded(id: string): boolean {
    const source = this.sources.get(id);
    if (!source || source.sourceType !== 'upload') return false;

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
      sourceType: 'default',
      previewUrl: source.previewUrl ?? svgToDataUrl(source.svgText),
    });
  }

  private ensureUniqueId(baseId: string): string {
    const cleanBase = baseId || 'texture';
    if (!this.sources.has(cleanBase)) return cleanBase;

    let suffix = 2;
    while (this.sources.has(`${cleanBase}-${suffix}`)) {
      suffix += 1;
    }
    return `${cleanBase}-${suffix}`;
  }
}

export function getDefaultTextureIds(nodeType: NodeType): NodeTextureIds {
  const defaults = DEFAULT_NODE_TEXTURE_IDS[nodeType];
  return { ...defaults };
}

export const textureRegistry = new TextureRegistry();

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
    sourceType: 'default',
    svgText,
    previewUrl: svgToDataUrl(svgText),
  };
}

function buildDefaultTextureSvg(fill: string, stroke: string): string {
  return `<svg xmlns="${SVG_NS}" viewBox="0 0 96 64">
  <rect x="4" y="4" width="88" height="56" rx="10" fill="${fill}"/>
  <path d="M8 48 C24 34, 36 58, 54 42 S76 28, 90 40" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
  <path d="M14 18 H82" stroke="${stroke}" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
</svg>`;
}

function sanitizeSvg(svgText: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svg = doc.documentElement;

  if (svg.nodeName.toLowerCase() === 'parsererror' || svg.nodeName.toLowerCase() !== 'svg') {
    throw new Error('Uploaded texture must be a valid SVG document');
  }

  const forbiddenElements = new Set([
    'script',
    'foreignobject',
    'iframe',
    'object',
    'embed',
    'audio',
    'video',
    'canvas',
  ]);

  for (const element of [...svg.querySelectorAll('*')]) {
    const tagName = element.tagName.toLowerCase();
    if (forbiddenElements.has(tagName)) {
      element.remove();
      continue;
    }

    for (const attr of [...element.attributes]) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (
        name.startsWith('on') ||
        value.startsWith('javascript:') ||
        value.includes('url(http:') ||
        value.includes('url(https:') ||
        value.includes('url(//')
      ) {
        element.removeAttribute(attr.name);
      }
    }
  }

  return new XMLSerializer().serializeToString(svg);
}

function createSvgPreviewUrl(svgText: string): string {
  return URL.createObjectURL(
    new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
  );
}

function svgToDataUrl(svgText: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
