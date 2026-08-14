import { describe, expect, it, vi } from "vitest";
import { Camera } from "../src/scripts/camera.js";
import { NodeEditor } from "../src/scripts/node-editor.js";
import type { FrameRequestCallback } from "../src/scripts/types.js";

describe("panTo", () => {
  it("lerps the camera so a world coordinate lands at the screen target", async () => {
    vi.stubGlobal(
      "requestAnimationFrame",
      (cb: FrameRequestCallback): number => {
        cb(0);
        return 0;
      }
    );

    const camera = new Camera();
    const canvas = { clientWidth: 1000, clientHeight: 600 };
    const mock = {
      canvas,
      camera,
      requestRender: vi.fn(() => {
        camera.getViewMatrix();
      }),
    };

    await NodeEditor.prototype.panTo.call(
      mock as unknown as NodeEditor,
      100,
      50,
      { zoom: 2 }
    );

    // panX = screenX - worldX * zoom = 500 - 100*2 = 300
    expect(camera.panX).toBe(300);
    // panY = screenY - worldY * zoom = 300 - 50*2 = 200
    expect(camera.panY).toBe(200);
    expect(camera.zoom).toBe(2);
    expect(camera.isAnimating()).toBe(false);
    expect(mock.requestRender).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("honors custom screen targets", async () => {
    vi.stubGlobal(
      "requestAnimationFrame",
      (cb: FrameRequestCallback): number => {
        cb(0);
        return 0;
      }
    );

    const camera = new Camera();
    const mock = {
      canvas: { clientWidth: 1000, clientHeight: 600 },
      camera,
      requestRender: vi.fn(() => {
        camera.getViewMatrix();
      }),
    };

    await NodeEditor.prototype.panTo.call(
      mock as unknown as NodeEditor,
      0,
      0,
      { zoom: 1, screenX: 200, screenY: 150 }
    );

    expect(camera.panX).toBe(200);
    expect(camera.panY).toBe(150);

    vi.unstubAllGlobals();
  });
});