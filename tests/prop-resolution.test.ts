import { describe, expect, it } from "vitest";
import { nodeDescriptor } from "../src/scripts/builtin-types.js";
import { WorldActionDriver } from "../src/scripts/world-action-driver.js";
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
