import type {
  DomNodeRenderer,
  NodeTypeDescriptor,
} from "@graph-giraffe/core";
import {
  branchDescriptor,
  compositionChildDescriptor,
  compositionDescriptor,
  groupDescriptor,
  hubDescriptor,
  nodeDescriptor,
  subgraphDescriptor,
} from "@graph-giraffe/core";
import { DOM_VIEW_TAGS, registerDomViews } from "./dom-views";

function domRendererFor(tag: string): DomNodeRenderer {
  return {
    createView(ctx) {
      const element = document.createElement(tag) as unknown as {
        update(node: unknown): void;
      };
      element.update(ctx.node);
      return element as unknown as HTMLElement;
    },
    updateView(ctx) {
      const element = ctx.element as unknown as {
        update?(node: unknown): void;
      };
      element.update?.(ctx.node);
    },
  };
}

/**
 * Swap every built-in node type for a custom DOM element rendering.
 *
 * This is a REPLACING, not additive, plugin: each descriptor keeps the built-in
 * type name (`node`, `hub`, …) and only swaps the renderer — `renderMode: "dom"`
 * routes the visual to DomNodeLayer while WebGL keeps doing picking, handles,
 * and hit-testing. Because the type names are unchanged, imported snapshots
 * resolve against the editor's current registry and therefore always render in
 * the editor's configured mode (dom here).
 */
function toDomDescriptor(base: NodeTypeDescriptor): NodeTypeDescriptor {
  return {
    ...base,
    renderMode: "dom",
    domRenderer: domRendererFor(DOM_VIEW_TAGS[base.type]),
    // The WebGL path never draws these, so no texture lookup is needed.
    defaultTextureIds: { body: "", head: "" },
  };
}

export const DOM_NODE_DESCRIPTORS: NodeTypeDescriptor[] = [
  toDomDescriptor(nodeDescriptor),
  toDomDescriptor(hubDescriptor),
  toDomDescriptor(branchDescriptor),
  toDomDescriptor(groupDescriptor),
  toDomDescriptor(compositionDescriptor),
  toDomDescriptor(compositionChildDescriptor),
  toDomDescriptor(subgraphDescriptor),
];

registerDomViews();
