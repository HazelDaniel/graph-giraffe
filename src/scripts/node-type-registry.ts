import type {
  ConnectionMode,
  HandleSide,
  NodeData,
  NodePropType,
  NodeShaderLocations,
} from "./types.js";
import type { MsdfTextRenderer } from "./msdf-text.js";
import type { IconBackgroundRenderer } from "./icon-background-renderer.js";
import type { TextureCache } from "./texture-cache.js";
import type { Camera } from "./camera.js";

// ─── Render Preset Configs ───────────────────────────────

export interface RoundedRectConfig {
  fillColor: [number, number, number, number];
  borderColor: [number, number, number, number];
  borderWidth: number;
  radius: number;
}

export interface RoundedTriangleConfig {
  fillColor: [number, number, number, number];
  borderColor: [number, number, number, number];
  borderWidth: number;
  radius: number;
}

export interface FlatConfig {
  color: [number, number, number, number];
}

// ─── Draw Contexts ───────────────────────────────────────

export interface RendererDrawAPI {
  setModelMatrix(x: number, y: number, w: number, h: number, z: number): void;
  getTextureCache(): TextureCache;
  getLocations(): NodeShaderLocations;
  getCamera(): Camera;
  getGL(): WebGL2RenderingContext;
}

export interface NodeDrawContext {
  gl: WebGL2RenderingContext;
  node: NodeData;
  worldX: number;
  worldY: number;
  z: number;
  renderer: RendererDrawAPI;
}

export interface NodeOverlayContext {
  node: NodeData;
  worldX: number;
  worldY: number;
  z: number;
  isCollapsed: boolean;
  textRenderer: MsdfTextRenderer;
  iconRenderer: MsdfTextRenderer;
  iconBackgroundRenderer: IconBackgroundRenderer;
  fontColor: [number, number, number];
}

// ─── Overlay Config ──────────────────────────────────────

export interface NodeOverlayConfig {
  titlePosition: "header" | "container-top" | "center";
  showTitle: boolean;
  showLockIcon: boolean;
  showAddIcon: boolean;
  showProps: boolean;
  showCompositionRef: boolean;
}

// ─── Node Type Descriptor ────────────────────────────────

export interface NodeTypeDescriptor {
  type: string;
  category: "leaf" | "container";
  zTier: number;
  defaultSize: { width: number; height: number };
  collapsedSize?: { width: number; height: number };

  handles: {
    always: boolean;
    sides: HandleSide[];
    multiConnect: boolean;
    outputSides?: HandleSide[];
    inputSides?: HandleSide[];
  };

  isConnectionCandidate: (connectionMode: ConnectionMode) => boolean;

  allowedParents: string[] | null;
  canBeRoot: boolean;

  defaultTextureIds: { body: string; head: string };
  textureKinds?: string[];

  createDefaultProps?: () => NodePropType | undefined;
  calculateHeight?: (node: NodeData) => number;

  renderMode?: "textured" | "rounded-rect" | "rounded-triangle" | "flat";
  renderConfig?: RoundedRectConfig | RoundedTriangleConfig | FlatConfig;
  rawDraw?: (ctx: NodeDrawContext) => boolean;
  drawOverlay?: (ctx: NodeOverlayContext) => void;
  overlayConfig?: NodeOverlayConfig;

  layoutChildren?: (
    container: NodeData,
    children: NodeData[],
    allNodes: Map<number, NodeData>
  ) => void;
  contributesToChildWorldPosition?: boolean;

  toolbarActions?: string[];
  collapsedToolbarActions?: string[];
  collapsible?: boolean;
  lockable?: boolean;
  usesCanvasLabel?: boolean;
}

// ─── Registry ────────────────────────────────────────────

export class NodeTypeRegistry {
  private descriptors = new Map<string, NodeTypeDescriptor>();
  private containerTypes = new Set<string>();
  private leafTypes = new Set<string>();

  register(descriptor: NodeTypeDescriptor): void {
    if (this.descriptors.has(descriptor.type)) {
      throw new Error(
        `NodeTypeRegistry: type "${descriptor.type}" is already registered`
      );
    }
    this.descriptors.set(descriptor.type, descriptor);
    if (descriptor.category === "container") {
      this.containerTypes.add(descriptor.type);
    } else {
      this.leafTypes.add(descriptor.type);
    }
  }

  get(type: string): NodeTypeDescriptor | undefined {
    return this.descriptors.get(type);
  }

  has(type: string): boolean {
    return this.descriptors.has(type);
  }

  getAll(): IterableIterator<NodeTypeDescriptor> {
    return this.descriptors.values();
  }

  isContainer(type: string): boolean {
    return this.containerTypes.has(type);
  }

  isLeaf(type: string): boolean {
    return this.leafTypes.has(type);
  }

  getZTier(type: string): number {
    return this.descriptors.get(type)?.zTier ?? 0.4;
  }

  getDefaultSize(
    type: string,
    collapsed?: boolean
  ): { width: number; height: number } {
    const desc = this.descriptors.get(type);
    if (!desc) return { width: 190, height: 150 };
    if (collapsed && desc.collapsedSize) return { ...desc.collapsedSize };
    return { ...desc.defaultSize };
  }

  canReparentTo(childType: string, parentType: string | null): boolean {
    const desc = this.descriptors.get(childType);
    if (!desc) return false;

    if (parentType === null) {
      return desc.canBeRoot;
    }

    if (!this.isContainer(parentType)) return false;

    if (desc.allowedParents === null) {
      return true;
    }

    return desc.allowedParents.includes(parentType);
  }

  isConnectionCandidate(type: string, connectionMode: ConnectionMode): boolean {
    const desc = this.descriptors.get(type);
    if (!desc) return false;
    return desc.isConnectionCandidate(connectionMode);
  }

  hasHandles(type: string, connectionMode: ConnectionMode): boolean {
    const desc = this.descriptors.get(type);
    if (!desc) return false;
    if (desc.handles.always) return true;
    return desc.isConnectionCandidate(connectionMode);
  }

  allowsMultiConnect(type: string): boolean {
    return this.descriptors.get(type)?.handles.multiConnect ?? false;
  }

  isValidConnectionSide(
    type: string,
    side: HandleSide,
    role: "source" | "target"
  ): boolean {
    const desc = this.descriptors.get(type);
    if (!desc) return true;
    if (role === "source") {
      return desc.handles.outputSides ? desc.handles.outputSides.includes(side) : true;
    }
    return desc.handles.inputSides ? desc.handles.inputSides.includes(side) : true;
  }

  getToolbarActions(type: string, isCollapsed?: boolean): string[] {
    const desc = this.descriptors.get(type);
    if (!desc) return [];
    if (isCollapsed && desc.collapsedToolbarActions) return desc.collapsedToolbarActions;
    return desc.toolbarActions ?? [];
  }

  contributesToChildWorldPosition(type: string): boolean {
    const desc = this.descriptors.get(type);
    if (!desc) return true;
    return desc.contributesToChildWorldPosition ?? true;
  }
}
