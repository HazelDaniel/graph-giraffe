import type { DomNodeRenderer, NodeTypeDescriptor, NodeTypeRegistry } from "./node-type-registry.js";
/**
 * Bridge a custom-element tag name to a `DomNodeRenderer`. Each created view is
 * an element of `tag` whose `update(node, ctx)` (matching the built-in view
 * contract) is called on create and whenever node state changes. Custom skins
 * build their own renderer (e.g. mounting a React root) instead.
 */
export declare function createCustomElementDomRenderer(tag: string): DomNodeRenderer;
/**
 * Swap a built-in (WebGL) descriptor for its bundled DOM skin, keeping the
 * type name and every rule identical — only the visual changes (`renderMode:
 * "dom"` routes it to `DomNodeLayer` while WebGL keeps picking, handles and
 * hit-testing). Because type names are unchanged, imported snapshots resolve
 * against the editor's registry and render in the editor's configured mode.
 */
export declare function toDomDescriptor(base: NodeTypeDescriptor): NodeTypeDescriptor;
/** DOM descriptors replacing every built-in type with its bundled DOM skin. */
export declare const DOM_NODE_DESCRIPTORS: NodeTypeDescriptor[];
/**
 * Declaratively put the editor into DOM mode: replace every built-in type with
 * its bundled DOM skin on the given registry. Call after the editor has been
 * created with `renderMode: "dom"`.
 */
export declare function registerDomNodeDescriptors(registry: NodeTypeRegistry): void;
