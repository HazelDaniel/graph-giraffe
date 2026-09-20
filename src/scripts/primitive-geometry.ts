import type { NodeData } from "./types.js";

export interface PrimitiveMeasurement {
  width: number;
  height: number;
  revision: number;
}

export interface PrimitiveDiff {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
}

export interface PrimitiveFrame {
  id: number;
  worldX: number;
  worldY: number;
  width: number;
  height: number;
  revision: number;
  diff: PrimitiveDiff;
}

function validDimension(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Owns resolved primitive geometry independently of any renderer.
 *
 * Intrinsic measurements are intentionally injected by a later measurement
 * layer. Until one exists, declared node dimensions remain the fallback. This
 * keeps the precedence rule in one place without letting DOM or WebGL invent
 * their own geometry.
 */
export class PrimitiveGeometry {
  private measurements = new Map<number, PrimitiveMeasurement>();

  setIntrinsicMeasurement(
    id: number,
    measurement: Omit<PrimitiveMeasurement, "revision"> & { revision?: number }
  ): void {
    if (!validDimension(measurement.width) || !validDimension(measurement.height)) {
      throw new Error(`Invalid intrinsic measurement for primitive ${id}`);
    }
    this.measurements.set(id, {
      width: measurement.width,
      height: measurement.height,
      revision: measurement.revision ?? 1,
    });
  }

  clearIntrinsicMeasurement(id: number): void {
    this.measurements.delete(id);
  }

  getIntrinsicMeasurement(id: number): PrimitiveMeasurement | undefined {
    return this.measurements.get(id);
  }

  resolve(node: NodeData, worldX: number, worldY: number): PrimitiveFrame {
    const intrinsic = this.measurements.get(node.id);
    const width = intrinsic?.width ?? node.width;
    const height = intrinsic?.height ?? node.height;

    return {
      id: node.id,
      worldX,
      worldY,
      width,
      height,
      revision: intrinsic?.revision ?? 0,
      diff: {
        translateX: worldX,
        translateY: worldY,
        scaleX: width / Math.max(node.width, 1),
        scaleY: height / Math.max(node.height, 1),
      },
    };
  }
}
