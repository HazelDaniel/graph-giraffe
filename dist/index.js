/**
 * @graph-giraffe/core — Public API barrel
 *
 * This is the single entry point for the npm package.
 * Only intentionally public types and classes are exported here.
 */
// ─── Components / Custom Elements ────────────────────────
import './components/action-pane.js';
import './components/history-pane.js';
import './components/loading-screen.js';
import './components/prop-group.js';
import './components/select.js';
import './components/selection-toolbar.js';
import './components/texture-select.js';
import './components/ui-controls.js';
// ─── Core ────────────────────────────────────────────────
export { NodeEditor } from './scripts/node-editor.js';
export { NODE_LAYOUT, NODE_SIZE, HANDLE_LAYOUT, DEFAULT_HANDLE_STYLE, isContainerNodeType, isLeafNodeType, isNodePrimitiveType, isCandidateNodeType, getDefaultNodeSize, } from './scripts/types.js';
export { GraphEventEmitter } from './scripts/events.js';
// ─── Texture Utilities ───────────────────────────────────
export { TextureRegistry, generateTetureSkinOption, getDefaultTextureIds, getCompositionReferenceTextureIds, } from './scripts/texture-registry.js';
// ─── Shaders (embedded GLSL sources) ────────────────────
export * as shaders from './shaders.js';
// ─── Vendor (re-exported for consumers) ─────────────────
export { Matrix4, Vector3, Vector4 } from './vendor/cuon-matrix.js';
export { default as Shell } from "./shell.js";
//# sourceMappingURL=index.js.map