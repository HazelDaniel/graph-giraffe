import { describe, expect, it } from "vitest";
import { projectGraph, projectNode } from "../src/scripts/graph-projection.js";
import type { EdgeData, NodeData } from "../src/scripts/types.js";

function makeNode(): NodeData {
  return {
    id: 1,
    nodeType: "node",
    text: "source",
    localX: 10,
    localY: 20,
    width: 100,
    height: 40,
    textureIds: { body: "body", head: "head" },
    pickColor: [1, 0, 0],
    isSelected: false,
    visible: true,
    parentId: null,
    childIds: [2],
    handles: [],
    props: {
      groups: ["data"],
      booleans: { data: [{ label: "Nullable", value: false, uiPrimitive: "checkbox" }] },
      texts: { data: [{ label: "Type", value: "text", uiPrimitive: "text" }] },
      enums: {},
    },
    subgraphRefId: null,
    subgraphRefIds: [7],
    compositionRefId: null,
    isDropTarget: false,
    isLocked: false,
    isCollapsed: false,
  };
}

describe("renderer-neutral graph projections", () => {
  it("detaches nested node state from the semantic store", () => {
    const source = makeNode();
    const projection = projectNode(source);

    projection.childIds.push(99);
    projection.textureIds.body = "changed";
    projection.props!.texts.data[0].value = "number";
    projection.subgraphRefIds!.push(8);

    expect(source.childIds).toEqual([2]);
    expect(source.textureIds.body).toBe("body");
    expect(source.props!.texts.data[0].value).toBe("text");
    expect(source.subgraphRefIds).toEqual([7]);
  });

  it("projects nodes and edges without changing their order", () => {
    const first = makeNode();
    const second = { ...makeNode(), id: 2, text: "target" };
    const edge = {
      id: 4,
      sourceNodeId: 1,
      sourceHandleSide: "right",
      targetNodeId: 2,
      targetHandleSide: "left",
    } as EdgeData;

    const projection = projectGraph([first, second], [edge]);

    expect(projection.nodes.map((node) => node.id)).toEqual([1, 2]);
    expect(projection.edges).toEqual([edge]);
    expect(projection.edges[0]).not.toBe(edge);
  });
});
