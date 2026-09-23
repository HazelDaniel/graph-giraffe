import { HANDLE_LAYOUT } from './types.js';
export function getHandleScreenGeometry(worldX, worldY, node, handle, zoom, panX, panY, dimensions) {
    const originX = worldX * zoom + panX;
    const originY = worldY * zoom + panY;
    const radius = handle.style.size / 2;
    const width = dimensions?.width ?? node.width;
    const height = dimensions?.height ?? node.height;
    let centerX = originX + (width * zoom) / 2;
    let centerY = originY + (height * zoom) / 2;
    if (node.nodeType === "branch") {
        switch (handle.side) {
            case "top":
                centerX = originX + (width * zoom) / 2;
                centerY = originY + 8 * zoom - HANDLE_LAYOUT.offsetY;
                break;
            case "left":
                // Anchored on left sloped edge (~20% from left, ~55% down)
                centerX = originX + (width * zoom) * 0.20 - HANDLE_LAYOUT.offsetX;
                centerY = originY + (height * zoom) * 0.55;
                break;
            case "right":
                // Anchored on right sloped edge (~80% from left, ~55% down)
                centerX = originX + (width * zoom) * 0.80 + HANDLE_LAYOUT.offsetX;
                centerY = originY + (height * zoom) * 0.55;
                break;
            case "bottom":
                centerX = originX + (node.width * zoom) / 2;
                centerY = originY + height * zoom + HANDLE_LAYOUT.offsetY;
                break;
        }
    }
    else {
        switch (handle.side) {
            case "left":
                centerX = originX - HANDLE_LAYOUT.offsetX;
                break;
            case "right":
                centerX = originX + width * zoom + HANDLE_LAYOUT.offsetX;
                break;
            case "top":
                centerY = originY - HANDLE_LAYOUT.offsetY;
                break;
            case "bottom":
                centerY = originY + height * zoom + HANDLE_LAYOUT.offsetY;
                break;
        }
    }
    return {
        centerX,
        centerY,
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