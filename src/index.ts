/**
 * @graph-giraffe/core — Public API barrel
 *
 * This is the single entry point for the npm package.
 * Only intentionally public types and classes are exported here.
 */

// ─── Core ────────────────────────────────────────────────

export { NodeEditor } from './scripts/node-editor.js';

// ─── Types ───────────────────────────────────────────────

export type {
  NodeEditorConfig,
  NodeData,
  EdgeData,
  NodeType,
  ContainerNodeType,
  LeafNodeType,
  CandidateNodeType,
  EdgeType,
  EdgeHeadType,
  EdgeHeadSkinId,
  HandleSide,
  HandleShape,
  HandleStyle,
  NodeHandleData,
  ConnectionMode,
  ThemeName,
  ThemeStyle,
  TextureKind,
  TextureSource,
  TextureSourceType,
  NodeTextureIds,
  AddUploadedTextureParams,
  NodePropType,
  NodePropPrimitive,
  PropChangePayload,
  ConnectionPreviewData,
  GeometryType,
  GeometryMeshType,
  BGGeometryMeshType,
} from './scripts/types.js';

export {
  NODE_LAYOUT,
  NODE_SIZE,
  HANDLE_LAYOUT,
  DEFAULT_HANDLE_STYLE,
  isContainerNodeType,
  isLeafNodeType,
  isNodePrimitiveType,
  isCandidateNodeType,
  getDefaultNodeSize,
} from './scripts/types.js';

// ─── Events ──────────────────────────────────────────────

export type {
  GraphEvents,
  GraphBeforeEvents,
  SyncHandler,
  AsyncHandler,
} from './scripts/events.js';

export { GraphEventEmitter } from './scripts/events.js';

// ─── Texture Utilities ───────────────────────────────────

export {
  TextureRegistry,
  generateTetureSkinOption,
  getDefaultTextureIds,
  getCompositionReferenceTextureIds,
} from './scripts/texture-registry.js';

// ─── Shaders (embedded GLSL sources) ────────────────────

export * as shaders from './shaders.js';

// ─── Vendor (re-exported for consumers) ─────────────────

export { Matrix4, Vector3, Vector4 } from './vendor/cuon-matrix.js';
