import { describe, expect, it } from "vitest";
import { WorldActionDriver } from "../src/scripts/world-action-driver.js";
import {
  buildMinimapGraphFrame,
  buildMinimapFrame,
  computeCenteredCameraState,
  computeCameraStateFromWorldPoint,
} from "../src/components/minimap.js";

function createDriver(): WorldActionDriver {
  return new WorldActionDriver({
    sideEffects: {
      showProperties: () => {},
      hideProperties: () => {},
      refreshContainerChain: () => {},
      setCompositionReference: () => {},
      clearCompositionReference: () => {},
    },
  });
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  return {
    getBoundingClientRect: () => ({ width, height }),
  } as unknown as HTMLCanvasElement;
}

describe("minimap helpers", () => {
  it("projects visible nodes, edges, and viewport state into minimap space", () => {
    const driver = createDriver();
    const a = driver.createNode("node", 0, 0)!;
    const b = driver.createNode("node", 320, 120)!;
    driver.connect(a.id, "right", b.id, "left");

    const frame = buildMinimapFrame({
      store: driver.store,
      edgeStore: driver.edgeStore,
      camera: { panX: 40, panY: 20, zoom: 1.5 },
      canvas: createCanvas(800, 600),
    });

    expect(frame.nodes).toHaveLength(2);
    expect(frame.edges).toHaveLength(1);
    expect(frame.bounds.width).toBeGreaterThan(0);
    expect(frame.bounds.height).toBeGreaterThan(0);
    expect(frame.viewport.width).toBeGreaterThan(0);
    expect(frame.viewport.height).toBeGreaterThan(0);
    expect(frame.nodes.every((node) => node.x >= 0 && node.y >= 0)).toBe(true);
  });

  it("anchors the viewport indicator to the scrub pointer", () => {
    const driver = createDriver();
    driver.createNode("node", 0, 0)!;
    driver.createNode("node", 300, 200)!;

    const frame = buildMinimapFrame({
      store: driver.store,
      edgeStore: driver.edgeStore,
      camera: { panX: -150, panY: -100, zoom: 1 },
      canvas: createCanvas(600, 400),
    }, { x: 42, y: 33 });

    const viewportCenterX = frame.viewport.x + frame.viewport.width / 2;
    const viewportCenterY = frame.viewport.y + frame.viewport.height / 2;

    expect(viewportCenterX).toBe(42);
    expect(viewportCenterY).toBe(33);
  });

  it("projects node geometry into the minimap canvas dimensions", () => {
    const driver = createDriver();
    driver.createNode("node", 0, 0)!;
    driver.createNode("hub", 1200, 900)!;

    const frame = buildMinimapGraphFrame(
      {
        store: driver.store,
        edgeStore: driver.edgeStore,
        camera: { panX: 0, panY: 0, zoom: 1 },
        canvas: createCanvas(1920, 1080),
      },
      { width: 240, height: 160 }
    );

    expect(frame.nodes).toHaveLength(2);
    expect(
      frame.nodes.every(
        (node) =>
          node.x >= 0 &&
          node.y >= 0 &&
          node.x + node.width <= 240 &&
          node.y + node.height <= 160
      )
    ).toBe(true);
  });

  it("omits descendants of collapsed subgraphs", () => {
    const driver = createDriver();
    const subgraph = driver.createNode("subgraph", 0, 0)!;
    const child = driver.createNode("node", 24, 32, subgraph.id)!;
    expect(driver.toggleSubgraphCollapse(subgraph.id)).toBe(true);

    const frame = buildMinimapFrame({
      store: driver.store,
      edgeStore: driver.edgeStore,
      camera: { panX: 0, panY: 0, zoom: 1 },
      canvas: createCanvas(640, 480),
    });

    expect(frame.nodes.some((node) => node.id === subgraph.id)).toBe(true);
    expect(frame.nodes.some((node) => node.id === child.id)).toBe(false);
  });

  it("reduces minimap scale as the world bounds widen", () => {
    const compact = createDriver();
    compact.createNode("node", 0, 0)!;
    compact.createNode("node", 100, 100)!;

    const spread = createDriver();
    spread.createNode("node", 0, 0)!;
    spread.createNode("node", 1000, 1000)!;

    const compactFrame = buildMinimapFrame({
      store: compact.store,
      edgeStore: compact.edgeStore,
      camera: { panX: 0, panY: 0, zoom: 1 },
      canvas: createCanvas(640, 480),
    });
    const spreadFrame = buildMinimapFrame({
      store: spread.store,
      edgeStore: spread.edgeStore,
      camera: { panX: 0, panY: 0, zoom: 1 },
      canvas: createCanvas(640, 480),
    });

    expect(spreadFrame.transform.scale).toBeLessThan(
      compactFrame.transform.scale
    );
  });

  it("keeps minimap scrubbing responsive across the canvas", () => {
    const left = computeCameraStateFromWorldPoint(
      { panX: 0, panY: 0, zoom: 1 },
      { width: 200, height: 100 },
      {
        minX: 0,
        minY: 0,
        maxX: 500,
        maxY: 400,
        width: 500,
        height: 400,
      },
      -100,
      -100
    );

    const right = computeCameraStateFromWorldPoint(
      { panX: 0, panY: 0, zoom: 1 },
      { width: 200, height: 100 },
      {
        minX: 0,
        minY: 0,
        maxX: 500,
        maxY: 400,
        width: 500,
        height: 400,
      },
      600,
      450
    );

    expect(left.panX).toBe(200);
    expect(left.panY).toBe(150);
    expect(left.zoom).toBe(1);
    expect(right.panX).toBe(-500);
    expect(right.panY).toBe(-400);
  });

  it("recenters the camera on a world point without changing zoom", () => {
    const next = computeCenteredCameraState(
      { panX: 100, panY: -50, zoom: 2 },
      { width: 800, height: 600 },
      120,
      80
    );

    expect(next.zoom).toBe(2);
    expect(next.panX).toBe(160);
    expect(next.panY).toBe(140);
  });
});
