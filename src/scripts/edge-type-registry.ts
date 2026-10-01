import type { EdgeHeadSkinId, EdgeHeadType, EdgeType } from "./types.js";

export interface EdgeStrokeDescriptor {
  color: string;
  width: number;
}

export interface EdgeLabelDescriptor {
  enabled: boolean;
  editable: boolean;
}

export interface EdgeDescriptor {
  type: string;
  /** Selects an existing core route. Custom tessellation is intentionally unsupported. */
  route: EdgeType;
  stroke: EdgeStrokeDescriptor;
  head: { type: EdgeHeadType; skinId: EdgeHeadSkinId };
  label: EdgeLabelDescriptor;
  hitTest: { tolerance: number };
  actions: { selectable: boolean; deletable: boolean };
}

const DEFAULT_STROKE: EdgeStrokeDescriptor = { color: "rgba(97, 158, 255, 0.82)", width: 1 };

export class EdgeTypeRegistry {
  private descriptors = new Map<string, EdgeDescriptor>();

  constructor() {
    for (const route of ["line", "cubic", "line-curve", "orthogonal"] as EdgeType[]) {
      this.register({
        type: route,
        route,
        stroke: { ...DEFAULT_STROKE },
        head: { type: route === "line" ? "none" : "arrow", skinId: "arrow" },
        label: { enabled: true, editable: false },
        hitTest: { tolerance: 8 },
        actions: { selectable: true, deletable: true },
      });
    }
  }

  register(descriptor: EdgeDescriptor): void {
    if (this.descriptors.has(descriptor.type)) {
      throw new Error(`EdgeTypeRegistry: type "${descriptor.type}" is already registered`);
    }
    if (!["line", "cubic", "line-curve", "orthogonal"].includes(descriptor.route)) {
      throw new Error(`EdgeTypeRegistry: unsupported route "${descriptor.route}"`);
    }
    if (descriptor.hitTest.tolerance < 0) {
      throw new Error(`EdgeTypeRegistry: hit-test tolerance cannot be negative`);
    }
    this.descriptors.set(descriptor.type, descriptor);
  }

  replace(descriptor: EdgeDescriptor): void {
    if (!this.descriptors.has(descriptor.type)) {
      throw new Error(`EdgeTypeRegistry: type "${descriptor.type}" is not registered`);
    }
    this.descriptors.delete(descriptor.type);
    this.register(descriptor);
  }

  get(type: string): EdgeDescriptor | undefined {
    return this.descriptors.get(type);
  }

  has(type: string): boolean {
    return this.descriptors.has(type);
  }
}
