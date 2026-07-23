import { describe, expect, it } from "vitest";
import { CustomOverlay } from "../src/scripts/types.js";

describe("CustomOverlay Interface & Registry Logic", () => {
  it("creates valid scaling overlay descriptors", () => {
    const el = document.createElement("div");
    el.id = "sticky-note-1";

    const overlay: CustomOverlay = {
      id: "note-1",
      element: el as unknown as HTMLElement,
      worldX: 150,
      worldY: 200,
      scaleWithZoom: true,
    };

    expect(overlay.id).toBe("note-1");
    expect(overlay.worldX).toBe(150);
    expect(overlay.worldY).toBe(200);
    expect(overlay.scaleWithZoom).toBe(true);
  });

  it("creates valid non-scaling overlay descriptors", () => {
    const el = document.createElement("div");
    el.id = "fixed-badge-1";

    const overlay: CustomOverlay = {
      id: "badge-1",
      element: el as unknown as HTMLElement,
      worldX: -50,
      worldY: 80,
      scaleWithZoom: false,
    };

    expect(overlay.id).toBe("badge-1");
    expect(overlay.scaleWithZoom).toBe(false);
  });

  it("handles overlay map operations (add, retrieve, update, remove)", () => {
    const overlays = new Map<string, CustomOverlay>();

    const el = document.createElement("div");
    const overlay: CustomOverlay = {
      id: "ov-1",
      element: el as unknown as HTMLElement,
      worldX: 10,
      worldY: 20,
    };

    overlays.set(overlay.id, overlay);
    expect(overlays.get("ov-1")).toBe(overlay);

    // Update position
    const item = overlays.get("ov-1");
    if (item) {
      item.worldX = 100;
      item.worldY = 200;
    }
    expect(overlays.get("ov-1")?.worldX).toBe(100);
    expect(overlays.get("ov-1")?.worldY).toBe(200);

    // Remove
    overlays.delete("ov-1");
    expect(overlays.has("ov-1")).toBe(false);
  });
});
