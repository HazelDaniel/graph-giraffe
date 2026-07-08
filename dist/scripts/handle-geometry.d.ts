import { HandleShape, NodeData, NodeHandleData } from './types.js';
export interface HandleScreenGeometry {
    centerX: number;
    centerY: number;
    radius: number;
    size: number;
    shape: HandleShape;
}
export interface HandleHit {
    nodeId: number;
    handle: NodeHandleData;
    geometry: HandleScreenGeometry;
}
export declare function getHandleScreenGeometry(worldX: number, worldY: number, node: NodeData, handle: NodeHandleData, zoom: number, panX: number, panY: number): HandleScreenGeometry;
export declare function isPointInsideHandle(screenX: number, screenY: number, geometry: HandleScreenGeometry): boolean;
