import { describe, expect, it } from "vitest";
import { nodeDescriptor } from "../src/scripts/builtin-types.js";
import { WorldActionDriver } from "../src/scripts/world-action-driver.js";
import { nodePropsEqual } from "../src/scripts/history-snapshots.js";
import { NodeTypeRegistry } from "../src/scripts/node-type-registry.js";
import type { NodePropType } from "../src/scripts/types.js";

function props(role = "ordinary"): NodePropType {
  return {
    groups: ["column"],
    booleans: {},
    texts: {
      column: [{ label: "Type", value: "number", uiPrimitive: "text" }],
    },
    enums: {
      column: [{
        label: "Role",
        value: role,
        uiPrimitive: "select",
        options: ["ordinary", "primary", "composite-primary"],
      }],
    },
  };
}

function readRole(props: NodePropType | undefined): string | undefined {
  return Object.values(props?.enums ?? {})
    .flat()
    .find((item) => item.label === "Role")?.value as string | undefined;
}

describe("descriptor prop resolution", () => {
  it("exposes variant capabilities and descriptor-owned prop migration", () => {
    const registry = new NodeTypeRegistry();
    registry.register({
      ...nodeDescriptor,
      type: "variant-node",
      migrateProps: ({ props }) => ({
        status: "accept",
        props: props ?? { groups: [], booleans: {}, texts: {}, enums: {} },
      }),
    });

    expect(registry.supportsComposition("variant-node")).toBe(true);
    expect(registry.isSelectable("variant-node")).toBe(true);
    expect(registry.isDraggable("variant-node")).toBe(true);
    expect(registry.isEditable("variant-node")).toBe(true);
    expect(registry.migrateProps({
      node: {
        ...({} as any),
        id: 1,
        nodeType: "node",
      },
      previousType: "node",
      nextType: "variant-node",
      props: props(),
      allNodes: new Map(),
      incidentEdges: [],
    }).status).toBe("accept");
  });

  it("compares array-valued prop selections structurally", () => {
    const left = props("composite-primary");
    const right = props("composite-primary");
    left.enums.column.push({
      label: "Composite On",
      value: ["tenant_id", "region_id"],
      uiPrimitive: "multi-select",
      options: ["tenant_id", "region_id"],
    });
    right.enums.column.push({
      label: "Composite On",
      value: ["tenant_id", "region_id"],
      uiPrimitive: "multi-select",
      options: ["tenant_id", "region_id"],
    });
    expect(nodePropsEqual(left, right)).toBe(true);
    (right.enums.column[1].value as string[]).reverse();
    expect(nodePropsEqual(left, right)).toBe(false);
  });

  it("normalizes dependent fields atomically and restores them through history", () => {
    const driver = new WorldActionDriver();
    driver.store.getRegistry()!.replace({
      ...nodeDescriptor,
      type: "resolvable-node",
      createDefaultProps: () => props(),
      resolveProps: ({ proposedProps }) => {
        const role = readRole(proposedProps);
        const enums = { ...proposedProps.enums };
        const column = [...(enums.column ?? [])];
        if (role === "composite-primary") {
          column.push({
            label: "Composite On",
            value: "id",
            uiPrimitive: "select",
            options: ["id", "tenant_id"],
          });
        }
        enums.column = column.filter((item) => role === "composite-primary" || item.label !== "Composite On");
        return { status: "accept", props: { ...proposedProps, enums } };
      },
    });

    const node = driver.createNode("resolvable-node", 0, 0);
    expect(node).not.toBeNull();
    expect(driver.updatePropValue(node!.id, "Role", "composite-primary")).toBe(true);
    expect(driver.store.get(node!.id)?.props?.enums.column).toHaveLength(2);

    expect(driver.undo()).toBe(true);
    expect(driver.store.get(node!.id)?.props?.enums.column).toHaveLength(1);
  });

  it("rejects a proposed shape without mutating props or history", () => {
    const driver = new WorldActionDriver();
    driver.store.getRegistry()!.replace({
      ...nodeDescriptor,
      type: "rejecting-node",
      createDefaultProps: () => props(),
      resolveProps: () => ({ status: "reject", message: "invalid role" }),
    });

    const node = driver.createNode("rejecting-node", 0, 0)!;
    const before = driver.store.get(node.id)?.props;
    expect(driver.updatePropValue(node.id, "Role", "primary")).toBe(false);
    expect(driver.store.get(node.id)?.props).toEqual(before);
    expect(driver.undo()).toBe(true); // undo the creation, not the rejected edit
  });
});
