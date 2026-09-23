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
  /** Canonical scene-graph frame used as the WebGL quad baseline. */
  baseWorldX: number;
  baseWorldY: number;
  baseWidth: number;
  baseHeight: number;
  /** Resolved frame after intrinsic measurement is applied. */
  worldX: number;
  worldY: number;
  width: number;
  height: number;
  revision: number;
  diff: PrimitiveDiff;
}

export interface ResolvedPrimitiveQuad {
  worldX: number;
  worldY: number;
  width: number;
  height: number;
}

/** Apply the cached alignment diff to the canonical WebGL quad. */
export function applyPrimitiveDiff(frame: PrimitiveFrame): ResolvedPrimitiveQuad {
  return {
    worldX: frame.baseWorldX + frame.diff.translateX,
    worldY: frame.baseWorldY + frame.diff.translateY,
    width: frame.baseWidth * frame.diff.scaleX,
    height: frame.baseHeight * frame.diff.scaleY,
  };
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
      baseWorldX: worldX,
      baseWorldY: worldY,
      baseWidth: node.width,
      baseHeight: node.height,
      worldX,
      worldY,
      width,
      height,
      revision: intrinsic?.revision ?? 0,
      diff: {
        // Top-left anchoring preserves the scene-graph position while the
        // scale correction expands/contracts the canonical quad.
        translateX: 0,
        translateY: 0,
        scaleX: width / Math.max(node.width, 1),
        scaleY: height / Math.max(node.height, 1),
      },
    };
  }
}
