import { branchDescriptor, compositionChildDescriptor, compositionDescriptor, groupDescriptor, hubDescriptor, nodeDescriptor, subgraphDescriptor, } from "./builtin-types.js";
import { DOM_VIEW_TAGS, registerDomViews } from "./dom-views.js";
/**
 * Bridge a custom-element tag name to a `DomNodeRenderer`. Each created view is
 * an element of `tag` whose `update(node, ctx)` (matching the built-in view
 * contract) is called on create and whenever node state changes. Custom skins
 * build their own renderer (e.g. mounting a React root) instead.
 */
export function createCustomElementDomRenderer(tag) {
    return {
        createView(ctx) {
            const element = document.createElement(tag);
            element.update?.(ctx.node, ctx);
            return element;
        },
        updateView(ctx) {
            const element = ctx.element;
            element.update?.(ctx.node, ctx);
        },
    };
}
/**
 * Swap a built-in (WebGL) descriptor for its bundled DOM skin, keeping the
 * type name and every rule identical — only the visual changes (`renderMode:
 * "dom"` routes it to `DomNodeLayer` while WebGL keeps picking, handles and
 * hit-testing). Because type names are unchanged, imported snapshots resolve
 * against the editor's registry and render in the editor's configured mode.
 */
export function toDomDescriptor(base) {
    return {
        ...base,
        renderMode: "dom",
        domRenderer: createCustomElementDomRenderer(DOM_VIEW_TAGS[base.type]),
        // The WebGL path never draws these, so no texture lookup is needed.
        defaultTextureIds: { body: "", head: "" },
    };
}
/** DOM descriptors replacing every built-in type with its bundled DOM skin. */
export const DOM_NODE_DESCRIPTORS = [
    toDomDescriptor(nodeDescriptor),
    toDomDescriptor(hubDescriptor),
    toDomDescriptor(branchDescriptor),
    toDomDescriptor(groupDescriptor),
    toDomDescriptor(compositionDescriptor),
    toDomDescriptor(compositionChildDescriptor),
    toDomDescriptor(subgraphDescriptor),
];
registerDomViews();
/**
 * Declaratively put the editor into DOM mode: replace every built-in type with
 * its bundled DOM skin on the given registry. Call after the editor has been
 * created with `renderMode: "dom"`.
 */
export function registerDomNodeDescriptors(registry) {
    for (const descriptor of DOM_NODE_DESCRIPTORS) {
        registry.replace(descriptor);
    }
}
//# sourceMappingURL=dom-descriptors.js.map