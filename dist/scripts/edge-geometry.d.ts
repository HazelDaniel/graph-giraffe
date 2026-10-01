import { Camera } from './camera.js';
import { NodeStore } from './node-store.js';
import { EdgeData, HandleSide } from './types.js';
import type { EdgeDescriptor } from './edge-type-registry.js';
export type PrimitiveDimensionsResolver = (nodeId: number) => {
    width: number;
    height: number;
} | undefined;
export interface Point2D {
    x: number;
    y: number;
}
export interface ArrowheadGeometry {
    tip: Point2D;
    tangent: Point2D;
}
export interface EdgeRouteGeometry {
    edge: EdgeData;
    worldPoints: Point2D[];
    screenPoints: Point2D[];
    labelWorldPoint: Point2D;
    labelScreenPoint: Point2D;
    arrowhead: ArrowheadGeometry | null;
}
export declare function buildEdgeRouteGeometry(edge: EdgeData, store: NodeStore, camera: Camera, resolveDimensions?: PrimitiveDimensionsResolver, descriptor?: EdgeDescriptor): EdgeRouteGeometry | null;
export declare function buildConnectionPreviewGeometry(sourceNodeId: number, sourceHandleSide: HandleSide, screenX: number, screenY: number, store: NodeStore, camera: Camera, resolveDimensions?: PrimitiveDimensionsResolver): EdgeRouteGeometry | null;
export declare function hitTestEdgePolyline(screenX: number, screenY: number, polyline: Point2D[], thresholdPx?: number): boolean;
