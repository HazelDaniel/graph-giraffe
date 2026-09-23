import { describe, expect, it } from "vitest";
import { PrimitiveGeometry } from "../src/scripts/primitive-geometry.js";
import type { NodeData } from "../src/scripts/types.js";

const node = {
  id: 7,
  width: 190,
  height: 150,
} as NodeData;

describe("PrimitiveGeometry", () => {
  it("uses declared dimensions until intrinsic measurement is available", () => {
    const geometry = new PrimitiveGeometry();

    expect(geometry.resolve(node, 12, 20)).toMatchObject({
      baseWorldX: 12,
      baseWorldY: 20,
      baseWidth: 190,
      baseHeight: 150,
      worldX: 12,
      worldY: 20,
      width: 190,
      height: 150,
      revision: 0,
      diff: { scaleX: 1, scaleY: 1 },
    });
  });

  it("gives intrinsic dimensions precedence and publishes an alignment diff", () => {
    const geometry = new PrimitiveGeometry();
    geometry.setIntrinsicMeasurement(7, { width: 240, height: 96, revision: 3 });

    expect(geometry.resolve(node, 12, 20)).toMatchObject({
      width: 240,
      height: 96,
      revision: 3,
      diff: {
        translateX: 0,
        translateY: 0,
        scaleX: 240 / 190,
        scaleY: 96 / 150,
      },
    });
  });

  it("rejects invalid intrinsic dimensions", () => {
    const geometry = new PrimitiveGeometry();

    expect(() => geometry.setIntrinsicMeasurement(7, { width: 0, height: 20 }))
      .toThrow("Invalid intrinsic measurement");
  });
});
