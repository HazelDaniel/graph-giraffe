/**
 * @graph-giraffe/core — Public API barrel
 *
 * This is the single entry point for the npm package.
 * Only intentionally public types and classes are exported here.
 */
export * from './components/action-pane.js';
export * from './components/history-pane.js';
export * from './components/kebab-menu.js';
export * from './components/loading-screen.js';
export * from './components/minimap.js';
export * from './components/prop-group.js';
export * from './components/select.js';
export * from './components/selection-toolbar.js';
export * from './components/texture-select.js';
export * from './components/ui-controls.js';
export { NodeEditor } from './scripts/node-editor.js';
export { NodeTypeRegistry } from './scripts/node-type-registry.js';
export type { NodeTypeDescriptor, NodeOverlayConfig, RoundedRectConfig, FlatConfig, NodeDrawContext, NodeOverlayContext, RendererDrawAPI, } from './scripts/node-type-registry.js';
export { BUILTIN_DESCRIPTORS, nodeDescriptor, hubDescriptor, groupDescriptor, compositionDescriptor, compositionChildDescriptor, subgraphDescriptor, } from './scripts/builtin-types.js';
export type { NodeEditorConfig, NodeData, EdgeData, NodeType, ContainerNodeType, LeafNodeType, CandidateNodeType, EdgeType, EdgeHeadType, EdgeHeadSkinId, HandleSide, HandleShape, HandleStyle, NodeHandleData, ConnectionMode, ThemeName, ThemeStyle, TextureKind, TextureSource, TextureSourceType, NodeTextureIds, AddUploadedTextureParams, NodePropType, NodePropPrimitive, PropChangePayload, ConnectionPreviewData, CustomOverlay, GeometryType, GeometryMeshType, BGGeometryMeshType, } from './scripts/types.js';
export { NODE_LAYOUT, NODE_SIZE, HANDLE_LAYOUT, DEFAULT_HANDLE_STYLE, isContainerNodeType, isLeafNodeType, isNodePrimitiveType, isCandidateNodeType, getDefaultNodeSize, } from './scripts/types.js';
export type { GraphEvents, GraphBeforeEvents, SyncHandler, AsyncHandler, } from './scripts/events.js';
export { GraphEventEmitter } from './scripts/events.js';
export { TextureRegistry, generateTetureSkinOption, getDefaultTextureIds, getCompositionReferenceTextureIds, } from './scripts/texture-registry.js';
export * as shaders from './shaders.js';
export { Matrix4, Vector3, Vector4 } from './vendor/cuon-matrix.js';
export { default as Shell } from "./shell.js";
export { serializeGraph, deserializeGraph } from './scripts/graph-serialization.js';
export type { GraphSnapshot, SerializedNode, SerializedEdge, SerializedTexture, SerializeGraphParams, DeserializeGraphParams, DeserializedEditorState, } from './scripts/graph-serialization.js';
