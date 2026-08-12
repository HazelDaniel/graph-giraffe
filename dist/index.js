/**
 * @graph-giraffe/core — Public API barrel
 *
 * This is the single entry point for the npm package.
 * Only intentionally public types and classes are exported here.
 */
// ─── Components / Custom Elements ────────────────────────
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
// ─── Core ────────────────────────────────────────────────
export { NodeEditor } from './scripts/node-editor.js';
// ─── Node Type Registry ─────────────────────────────────
export { NodeTypeRegistry } from './scripts/node-type-registry.js';
export { DomNodeLayer } from './scripts/dom-node-layer.js';
// ─── Bundled DOM skins (renderMode: "dom") ───────────────
export { registerDomViews, DOM_VIEW_TAGS, } from './scripts/dom-views.js';
export { createCustomElementDomRenderer, toDomDescriptor, DOM_NODE_DESCRIPTORS, registerDomNodeDescriptors, } from './scripts/dom-descriptors.js';
export { BUILTIN_DESCRIPTORS, nodeDescriptor, hubDescriptor, branchDescriptor, groupDescriptor, compositionDescriptor, compositionChildDescriptor, subgraphDescriptor, } from './scripts/builtin-types.js';
export { NODE_LAYOUT, NODE_SIZE, HANDLE_LAYOUT, DEFAULT_HANDLE_STYLE, isContainerNodeType, isLeafNodeType, isNodePrimitiveType, isCandidateNodeType, getDefaultNodeSize, } from './scripts/types.js';
export { GraphEventEmitter } from './scripts/events.js';
// ─── Texture Utilities ───────────────────────────────────
export { TextureRegistry, generateTetureSkinOption, getDefaultTextureIds, getCompositionReferenceTextureIds, } from './scripts/texture-registry.js';
// ─── Shaders (embedded GLSL sources) ────────────────────
export * as shaders from './shaders.js';
// ─── Vendor (re-exported for consumers) ─────────────────
export { Matrix4, Vector3, Vector4 } from './vendor/cuon-matrix.js';
export { default as Shell } from "./shell.js";
// ─── Graph Serialization ────────────────────────────────
export { serializeGraph, deserializeGraph } from './scripts/graph-serialization.js';
//# sourceMappingURL=index.js.map