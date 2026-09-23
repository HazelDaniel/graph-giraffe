import { describe, expect, it } from "vitest";
import { Camera } from "../src/scripts/camera.js";

describe("Camera zoom range", () => {
  it("clamps direct state, wheel zoom, and animation targets", () => {
    const camera = new Camera();
    camera.setZoomRange(1, 2);

    camera.setState(0, 0, 0.25);
    expect(camera.zoom).toBe(1);

    camera.zoomAt(0, 0, -10000);
    expect(camera.zoom).toBe(2);

    camera.animateTo(0, 0, 0.1);
    camera.getViewMatrix();
    expect(camera.zoom).toBeGreaterThanOrEqual(1);
    expect(camera.maxZoom).toBe(2);
  });

  it("rejects invalid ranges", () => {
    const camera = new Camera();
    expect(() => camera.setZoomRange(0, 2)).toThrow();
    expect(() => camera.setZoomRange(2, 1)).toThrow();
  });
});
