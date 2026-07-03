export type ThemeName = "dark" | "light" | "neon";
export interface ThemeStyle {
  bgFill: string;
  borderStroke: string;
  headerFill: string;
  titleFill: string;
  bodyFill: string;
  borderWidth: number;
}

export type GeometryMeshType = "rounded-square";
export type BGGeometryMeshType = "dotted" | "grid";
export type GeometryType = "circle" | "square" | "rounded-square";
export type NodeType = "node" | "hub" | "group" | "composition" | "composition-child" | "subgraph";
export type ContainerNodeType = "group" | "composition" | "subgraph";
export type LeafNodeType = "node" | "hub" | "composition-child";
export type CandidateNodeType = Exclude<NodeType, "composition-child">;
export type ConnectionMode = "group" | "node";
export type HandleSide = "left" | "right";
export type HandleShape = "circle" | "square";
export type EdgeType = "line" | "cubic" | "line-curve" | "orthogonal";
export type EdgeHeadType = "none" | "arrow";
export type EdgeHeadSkinId = "arrow" | "chevron" | "diamond" | "pill";
export type TextureKind =
  | "node-body"
  | "node-head"
  | "group-body"
  | "group-head"
  | "composition-body"
  | "composition-head"
  | "composition-child-head"
  | "composition-reference-body"
  | "composition-reference-child-head";
export type TextureSourceType = "default" | "upload";

export interface TextureSource {
  id: string;
  label: string;
  kind: TextureKind;
  sourceType: TextureSourceType;
  svgText: string;
  previewUrl?: string;
}

export interface NodeTextureIds {
  body: string;
  head: string;
}

export interface HandleStyle {
  shape: HandleShape;
  backgroundColor: string;
  connectedBorderColor: string;
  disconnectedBorderColor: string;
  borderWidth: number;
  size: number;
}

export interface NodeHandleData {
  candidateId: number;
  side: HandleSide;
  isConnected: boolean;
  style: HandleStyle;
}

export interface EdgeData {
  id: number;
  sourceNodeId: number;
  sourceHandleSide: HandleSide;
  targetNodeId: number;
  targetHandleSide: HandleSide;
  edgeType: EdgeType;
  headType: EdgeHeadType;
  headSkinId: EdgeHeadSkinId;
  label: string;
  isSelected: boolean;
  visible: boolean;
}

export interface NodeEditorConfig {
  connectionMode?: ConnectionMode;
  handleStyle?: HandleStyle;
}

export interface ConnectionPreviewData {
  sourceNodeId: number;
  sourceHandleSide: HandleSide;
  screenX: number;
  screenY: number;
}

export const NODE_LAYOUT = {
  headerHeight: 30,
  padding: 10,
  closeBtnPaddingRight: 20,
  closeBtnClickRadius: 15,
  editBtnPaddingRight: 45,
  editBtnClickRadius: 15,
  plusBtnPaddingBottom: 20,
  plusBtnClickRadius: 12,
  spotlightBtnPaddingRight: 20,
  spotlightBtnPaddingBottom: 20,
  spotlightBtnClickRadius: 12,
  lockBtnTopY: 20,     // matches group header titleY
  lockBtnClickRadius: 12,
  subgraphBtnPaddingRight: 18,
  subgraphBtnSpacing: 24,
  subgraphBtnClickRadius: 12,
};

export const HANDLE_LAYOUT = {
  sideInset: 8,
  offsetX: -2,
};

export const DEFAULT_HANDLE_STYLE: HandleStyle = {
  shape: "circle",
  backgroundColor: "rgba(33, 36, 39, 0.95)",
  connectedBorderColor: "#2C9F92",
  disconnectedBorderColor: "rgba(148, 163, 184, 0.85)",
  borderWidth: 2,
  size: 12,
};

export const NODE_SIZE = {
  node: { width: 190, height: 150 },
  hub: { width: 240, height: 100 },
  nodeCollapsed: { width: 190, height: NODE_LAYOUT.headerHeight },
  group: { width: 220, height: 200 },
  composition: { width: 140, height: 200 },
  compositionChild: { width: 160, height: NODE_LAYOUT.headerHeight },
  subgraph: { width: 220, height: 160 },
  subgraphCollapsed: { width: 190, height: NODE_LAYOUT.headerHeight },
} as const;

export function isContainerNodeType(
  nodeType: NodeType
): nodeType is ContainerNodeType {
  return nodeType === "group" || nodeType === "composition" || nodeType === "subgraph";
}

export function isLeafNodeType(nodeType: NodeType): nodeType is LeafNodeType {
  return nodeType === "node" || nodeType === "hub" || nodeType === "composition-child";
}

export function isNodePrimitiveType(nodeType: NodeType): nodeType is "node" | "hub" {
  return nodeType === "node" || nodeType === "hub";
}

export function isCandidateNodeType(
  nodeType: NodeType,
  connectionMode: ConnectionMode
): nodeType is CandidateNodeType {
  if (connectionMode === "group") {
    return nodeType === "group";
  }

  return isNodePrimitiveType(nodeType) || nodeType === "composition" || nodeType === "subgraph";
}

export function getDefaultNodeSize(
  nodeType: NodeType,
  isCollapsed: boolean = false
): { width: number; height: number } {
  switch (nodeType) {
    case "group":
    case "composition":
      return NODE_SIZE.group;
    case "subgraph":
      return isCollapsed ? NODE_SIZE.subgraphCollapsed : NODE_SIZE.subgraph;
    case "composition-child":
      return NODE_SIZE.compositionChild;
    case "hub":
      return NODE_SIZE.hub;
    case "node":
      return isCollapsed ? NODE_SIZE.nodeCollapsed : NODE_SIZE.node;
    default:
      return NODE_SIZE.node;
  }
}

export interface NodeShaderLocations {
  a_Position: number;
  a_TexCoord: number;
  a_Z: number;
  u_ModelMatrix: WebGLUniformLocation;
  u_ViewMatrix: WebGLUniformLocation;
  u_ProjMatrix: WebGLUniformLocation;
  u_Color: WebGLUniformLocation;
  u_UseTexture: WebGLUniformLocation;
  u_Sampler: WebGLUniformLocation;
  u_Use9Slice: WebGLUniformLocation;
  u_Dimensions: WebGLUniformLocation;
  u_TextureSize: WebGLUniformLocation;
  u_SliceMargins: WebGLUniformLocation;
  u_RenderMode: WebGLUniformLocation;
  u_BorderColor: WebGLUniformLocation;
  u_BorderWidth: WebGLUniformLocation;
  u_Radius: WebGLUniformLocation;
}

export interface MSDFShaderLocations {
  a_Position: number;
  a_TexCoord: number;
  a_Color: number;
  a_Z: number;
  u_ViewMatrix: WebGLUniformLocation;
  u_ProjMatrix: WebGLUniformLocation;
  u_Atlas: WebGLUniformLocation;
}

export interface IconBGShaderLocations {
  a_Position: number;
  a_Color: number;
  a_Shape: number;
  a_BBoxMin: number;
  a_BBoxMax: number;
  a_Z: number;
  u_ViewMatrix: WebGLUniformLocation;
  u_ProjMatrix: WebGLUniformLocation;
}

export interface BGShaderLocations {
  a_Position: number;
  u_Color: WebGLUniformLocation;
  u_UsePointMask: WebGLUniformLocation;
}

export interface NodePropPrimitive {
  label: string;
  value: string | boolean;
  uiPrimitive: string;
  options?: string[];
}

export interface NodePropType {
  groups: string[];
  booleans: {
    [groupKey: string]: NodePropPrimitive[];
  };
  texts: {
    [groupKey: string]: NodePropPrimitive[];
  };
  enums: {
    [groupKey: string]: NodePropPrimitive[];
  };
}

export interface PropChangePayload {
  label: string;
  value: string | boolean;
  uiPrimitive: string;
}

export interface NodeData {
  id: number;
  nodeType: NodeType;
  /** Referenced composition id when an ordinary node is promoted visually. */
  compositionRefId: number | null;
  isDropTarget?: boolean;
  /** When true on a group node, neither the group nor its children can be dragged. */
  isLocked?: boolean;
  /** When true on a subgraph, descendants are hidden and the subgraph draws compactly. */
  isCollapsed?: boolean;
  /** Position relative to parent node (or world origin if parentId is null). */
  localX: number;
  localY: number;
  width: number;
  height: number;
  text: string;
  /** Stable texture source ids. Runtime WebGL textures are regenerated from these later. */
  textureIds: NodeTextureIds;
  pickColor: [number, number, number];
  isSelected: boolean;
  visible: boolean;
  /** Scene graph: id of the parent node, or null for root nodes. */
  parentId: number | null;
  /** Scene graph: ordered list of child node ids. */
  childIds: number[];
  /** Handle metadata for nodes that can participate in connections. */
  handles: NodeHandleData[];
  /** Dynamic properties that dictate node body height and overlay text. */
  props?: NodePropType;
}

export interface AddUploadedTextureParams {
  id?: string;
  label: string;
  kind: TextureKind;
  svgText: string;
}
