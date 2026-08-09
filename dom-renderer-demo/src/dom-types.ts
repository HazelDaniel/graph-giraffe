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
 * Re-create every built-in node type as a custom DOM element.
 *
 * Each descriptor is derived from its built-in counterpart (inheriting
 * handles, connection rules, parent rules, toolbar actions, z-tier) and only
 * swaps the renderer: `renderMode: "dom"` routes the visual to DomNodeLayer
 * while WebGL keeps doing picking, handles, and hit-testing.
 */
function toDomDescriptor(
  base: NodeTypeDescriptor,
  type: string
): NodeTypeDescriptor {
  return {
    ...base,
    type,
    renderMode: "dom",
    domRenderer: domRendererFor(DOM_VIEW_TAGS[type]),
    // The WebGL path never draws these, so no texture lookup is needed.
    defaultTextureIds: { body: "", head: "" },
  };
}

export const DOM_NODE_DESCRIPTORS: NodeTypeDescriptor[] = [
  toDomDescriptor(nodeDescriptor, "dom-node"),
  toDomDescriptor(hubDescriptor, "dom-hub"),
  toDomDescriptor(branchDescriptor, "dom-branch"),
  toDomDescriptor(groupDescriptor, "dom-group"),
  toDomDescriptor(compositionDescriptor, "dom-composition"),
  toDomDescriptor(compositionChildDescriptor, "dom-child"),
  toDomDescriptor(subgraphDescriptor, "dom-subgraph"),
];

registerDomViews();
