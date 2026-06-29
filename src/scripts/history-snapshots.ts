import {
  EdgeData,
  EdgeHeadSkinId,
  EdgeHeadType,
  EdgeType,
  HandleSide,
  NodeData,
  NodePropPrimitive,
  NodePropType,
  NodeTextureIds,
  NodeType,
} from "./types.js";

export interface NodeHistorySnapshot {
  id: number;
  nodeType: NodeType;
  localX: number;
  localY: number;
  width: number;
  height: number;
  text: string;
  textureIds: NodeTextureIds;
  visible: boolean;
  isSelected: boolean;
  isDropTarget: boolean;
  isLocked: boolean;
  parentId: number | null;
  childIds: number[];
  compositionRefId: number | null;
  props?: NodePropType;
  handleStates: Array<{
    side: HandleSide;
    isConnected: boolean;
  }>;
}

export interface EdgeHistorySnapshot {
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

function clonePrimitiveList(
  entries: NodePropPrimitive[] | undefined
): NodePropPrimitive[] {
  return entries?.map((entry) => ({ ...entry })) ?? [];
}

function clonePrimitiveGroups(
  groups: NodePropType["booleans"]
): NodePropType["booleans"] {
  const cloned: NodePropType["booleans"] = {};
  for (const [group, entries] of Object.entries(groups)) {
    cloned[group] = clonePrimitiveList(entries);
  }
  return cloned;
}

export function cloneNodeProps(props: NodePropType | undefined): NodePropType | undefined {
  if (!props) return undefined;

  return {
    groups: [...props.groups],
    booleans: clonePrimitiveGroups(props.booleans),
    texts: clonePrimitiveGroups(props.texts),
    enums: clonePrimitiveGroups(props.enums),
  };
}

export function captureNodeHistorySnapshot(node: NodeData): NodeHistorySnapshot {
  return {
    id: node.id,
    nodeType: node.nodeType,
    localX: node.localX,
    localY: node.localY,
    width: node.width,
    height: node.height,
    text: node.text,
    textureIds: { ...node.textureIds },
    visible: node.visible,
    isSelected: node.isSelected,
    isDropTarget: Boolean(node.isDropTarget),
    isLocked: Boolean(node.isLocked),
    parentId: node.parentId,
    childIds: [...node.childIds],
    compositionRefId: node.compositionRefId,
    props: cloneNodeProps(node.props),
    handleStates: node.handles.map((handle) => ({
      side: handle.side,
      isConnected: handle.isConnected,
    })),
  };
}

export function captureEdgeHistorySnapshot(edge: EdgeData): EdgeHistorySnapshot {
  return { ...edge };
}

export type SelectionKind = "node" | "edge" | null;

export interface SelectionSnapshot {
  kind: SelectionKind;
  nodeIds: number[];
  edgeIds: number[];
}

export interface NodePlacementSnapshot {
  localX: number;
  localY: number;
  parentId: number | null;
}
