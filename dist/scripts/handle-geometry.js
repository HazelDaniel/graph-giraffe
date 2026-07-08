import { HANDLE_LAYOUT } from './types.js';
export function getHandleScreenGeometry(worldX, worldY, node, handle, zoom, panX, panY) {
    const originX = worldX * zoom + panX;
    const originY = worldY * zoom + panY;
    const radius = handle.style.size / 2;
    return {
        centerX: handle.side === 'left'
            ? originX - HANDLE_LAYOUT.offsetX
            : originX + node.width * zoom + HANDLE_LAYOUT.offsetX,
        centerY: originY + (node.height * zoom) / 2,
        radius,
        size: handle.style.size,
        shape: handle.style.shape,
    };
}
export function isPointInsideHandle(screenX, screenY, geometry) {
    if (geometry.shape === 'circle') {
        const dx = screenX - geometry.centerX;
        const dy = screenY - geometry.centerY;
        return dx * dx + dy * dy <= geometry.radius * geometry.radius;
    }
    const halfSize = geometry.size / 2;
    return (Math.abs(screenX - geometry.centerX) <= halfSize &&
        Math.abs(screenY - geometry.centerY) <= halfSize);
}
//# sourceMappingURL=handle-geometry.js.map