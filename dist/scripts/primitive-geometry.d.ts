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
export declare function applyPrimitiveDiff(frame: PrimitiveFrame): ResolvedPrimitiveQuad;
/**
 * Owns resolved primitive geometry independently of any renderer.
 *
 * Intrinsic measurements are intentionally injected by a later measurement
 * layer. Until one exists, declared node dimensions remain the fallback. This
 * keeps the precedence rule in one place without letting DOM or WebGL invent
 * their own geometry.
 */
export declare class PrimitiveGeometry {
    private measurements;
    setIntrinsicMeasurement(id: number, measurement: Omit<PrimitiveMeasurement, "revision"> & {
        revision?: number;
    }): void;
    clearIntrinsicMeasurement(id: number): void;
    getIntrinsicMeasurement(id: number): PrimitiveMeasurement | undefined;
    resolve(node: NodeData, worldX: number, worldY: number): PrimitiveFrame;
}
