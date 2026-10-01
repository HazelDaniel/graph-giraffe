import { getHandleScreenGeometry } from './handle-geometry.js';
import { getWorldPosition } from './scene-graph.js';
const MIN_SAMPLE_COUNT = 48;
const MAX_SAMPLE_COUNT = 72;
const SAMPLE_DISTANCE_STEP = 42;
export function buildEdgeRouteGeometry(edge, store, camera, resolveDimensions, descriptor) {
    const sourceNode = store.get(edge.sourceNodeId);
    const targetNode = store.get(edge.targetNodeId);
    if (!sourceNode || !targetNode)
        return null;
    const sourceHandle = sourceNode.handles.find((handle) => handle.side === edge.sourceHandleSide);
    const targetHandle = targetNode.handles.find((handle) => handle.side === edge.targetHandleSide);
    if (!sourceHandle || !targetHandle)
        return null;
    const sourceWorld = getHandleWorldPoint(sourceNode.id, sourceHandle, store, camera, resolveDimensions);
    const targetWorld = getHandleWorldPoint(targetNode.id, targetHandle, store, camera, resolveDimensions);
    const route = buildCubicRoute(sourceWorld, edge.sourceHandleSide, targetWorld, edge.targetHandleSide, descriptor?.route ?? edge.edgeType);
    const screenPoints = route.worldPoints.map((point) => camera.worldToScreen(point.x, point.y));
    const labelWorldPoint = getPolylineMidpoint(route.worldPoints);
    const labelScreenPoint = camera.worldToScreen(labelWorldPoint.x, labelWorldPoint.y);
    return {
        edge,
        worldPoints: route.worldPoints,
        screenPoints,
        labelWorldPoint,
        labelScreenPoint,
        arrowhead: (descriptor?.head.type ?? edge.headType) === 'arrow' ? route.arrowhead : null,
    };
}
export function buildConnectionPreviewGeometry(sourceNodeId, sourceHandleSide, screenX, screenY, store, camera, resolveDimensions) {
    const sourceNode = store.get(sourceNodeId);
    if (!sourceNode)
        return null;
    const sourceHandle = sourceNode.handles.find((handle) => handle.side === sourceHandleSide);
    if (!sourceHandle)
        return null;
    const sourceWorld = getHandleWorldPoint(sourceNode.id, sourceHandle, store, camera, resolveDimensions);
    const targetWorld = camera.screenToWorld(screenX, screenY);
    const oppositeSide = getOppositeSide(sourceHandleSide);
    const route = buildOrthogonalRoute(sourceWorld, sourceHandleSide, targetWorld, oppositeSide);
    const screenPoints = route.worldPoints.map((point) => camera.worldToScreen(point.x, point.y));
    const labelWorldPoint = getPolylineMidpoint(route.worldPoints);
    const labelScreenPoint = camera.worldToScreen(labelWorldPoint.x, labelWorldPoint.y);
    return {
        edge: {
            id: -1,
            sourceNodeId,
            sourceHandleSide,
            targetNodeId: -1,
            targetHandleSide: oppositeSide,
            edgeType: 'orthogonal',
            headType: 'none',
            headSkinId: 'arrow',
            label: '',
            isSelected: false,
            visible: true,
        },
        worldPoints: route.worldPoints,
        screenPoints,
        labelWorldPoint,
        labelScreenPoint,
        arrowhead: null,
    };
}
export function hitTestEdgePolyline(screenX, screenY, polyline, thresholdPx = 8) {
    if (polyline.length < 2)
        return false;
    const thresholdSq = thresholdPx * thresholdPx;
    for (let i = 0; i < polyline.length - 1; i++) {
        if (distancePointToSegmentSquared(screenX, screenY, polyline[i], polyline[i + 1]) <= thresholdSq) {
            return true;
        }
    }
    return false;
}
function buildCubicRoute(sourceWorld, sourceSide, targetWorld, targetSide, edgeType) {
    if (edgeType === 'line') {
        return {
            worldPoints: [sourceWorld, targetWorld],
            arrowhead: buildEdgeHeadGeometry(sourceWorld, targetWorld),
        };
    }
    if (edgeType === 'orthogonal') {
        return buildOrthogonalRoute(sourceWorld, sourceSide, targetWorld, targetSide);
    }
    const sourceVec = sideVector(sourceSide);
    const targetVec = sideVector(targetSide);
    const dx = targetWorld.x - sourceWorld.x;
    const dy = targetWorld.y - sourceWorld.y;
    const distance = Math.hypot(dx, dy);
    const bend = clamp(distance * (edgeType === 'line-curve' ? 0.24 : 0.34), 64, 260);
    const control1 = {
        x: sourceWorld.x + sourceVec.x * bend + (sourceVec.x === 0 ? clamp(dx * 0.12, -80, 80) : 0),
        y: sourceWorld.y + sourceVec.y * bend + (sourceVec.y === 0 ? clamp(dy * 0.12, -80, 80) : 0),
    };
    const control2 = {
        x: targetWorld.x + targetVec.x * bend - (targetVec.x === 0 ? clamp(dx * 0.12, -80, 80) : 0),
        y: targetWorld.y + targetVec.y * bend - (targetVec.y === 0 ? clamp(dy * 0.12, -80, 80) : 0),
    };
    const sampleCount = clamp(Math.ceil(distance / SAMPLE_DISTANCE_STEP) + 8, MIN_SAMPLE_COUNT, MAX_SAMPLE_COUNT);
    const worldPoints = [];
    for (let i = 0; i <= sampleCount; i++) {
        const t = i / sampleCount;
        worldPoints.push(sampleCubic(sourceWorld, control1, control2, targetWorld, t));
    }
    return {
        worldPoints,
        arrowhead: buildEdgeHeadGeometry(targetWorld, targetWorld, derivativeAtEnd(control2, targetWorld)),
    };
}
function buildEdgeHeadGeometry(tip, previousPoint, tangentOverride) {
    const tangent = normalize(tangentOverride ?? {
        x: tip.x - previousPoint.x,
        y: tip.y - previousPoint.y,
    });
    if (tangent.x === 0 && tangent.y === 0)
        return null;
    return {
        tip,
        tangent,
    };
}
function derivativeAtEnd(control2, end) {
    return {
        x: 3 * (end.x - control2.x),
        y: 3 * (end.y - control2.y),
    };
}
function getHandleWorldPoint(nodeId, handle, store, camera, resolveDimensions) {
    const node = store.get(nodeId);
    if (!node)
        return { x: 0, y: 0 };
    const { x, y } = getWorldPosition(node.id, store.allNodesMap);
    const geometry = getHandleScreenGeometry(x, y, node, handle, camera.zoom, camera.panX, camera.panY, resolveDimensions?.(node.id));
    return camera.screenToWorld(geometry.centerX, geometry.centerY);
}
function getPolylineMidpoint(points) {
    if (points.length === 0)
        return { x: 0, y: 0 };
    if (points.length === 1)
        return points[0];
    let total = 0;
    const lengths = [0];
    for (let i = 0; i < points.length - 1; i++) {
        total += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
        lengths.push(total);
    }
    const halfway = total / 2;
    for (let i = 0; i < lengths.length - 1; i++) {
        if (lengths[i + 1] < halfway)
            continue;
        const segmentLength = lengths[i + 1] - lengths[i];
        const ratio = segmentLength === 0 ? 0 : (halfway - lengths[i]) / segmentLength;
        return {
            x: lerp(points[i].x, points[i + 1].x, ratio),
            y: lerp(points[i].y, points[i + 1].y, ratio),
        };
    }
    return points[points.length - 1];
}
function sampleCubic(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    return {
        x: uuu * p0.x +
            3 * uu * t * p1.x +
            3 * u * tt * p2.x +
            ttt * p3.x,
        y: uuu * p0.y +
            3 * uu * t * p1.y +
            3 * u * tt * p2.y +
            ttt * p3.y,
    };
}
function getOppositeSide(side) {
    switch (side) {
        case 'left': return 'right';
        case 'right': return 'left';
        case 'top': return 'bottom';
        case 'bottom': return 'top';
    }
}
function sideVector(side) {
    switch (side) {
        case 'left': return { x: -1, y: 0 };
        case 'right': return { x: 1, y: 0 };
        case 'top': return { x: 0, y: -1 };
        case 'bottom': return { x: 0, y: 1 };
    }
}
function sideDirection(side) {
    return side === 'left' || side === 'top' ? -1 : 1;
}
function buildOrthogonalRoute(sourceWorld, sourceSide, targetWorld, targetSide) {
    const padding = 32;
    const v1 = sideVector(sourceSide);
    const v2 = sideVector(targetSide);
    const p1 = { x: sourceWorld.x + v1.x * padding, y: sourceWorld.y + v1.y * padding };
    const p2 = { x: targetWorld.x + v2.x * padding, y: targetWorld.y + v2.y * padding };
    const points = [sourceWorld];
    const sourceIsHoriz = sourceSide === 'left' || sourceSide === 'right';
    const targetIsHoriz = targetSide === 'left' || targetSide === 'right';
    if (sourceIsHoriz && targetIsHoriz) {
        if (v1.x !== v2.x) {
            if ((p2.x - p1.x) * v1.x >= 0) {
                const midX = (p1.x + p2.x) / 2;
                points.push({ x: midX, y: p1.y }, { x: midX, y: p2.y });
            }
            else {
                const midY = (p1.y + p2.y) / 2;
                points.push(p1, { x: p1.x, y: midY }, { x: p2.x, y: midY }, p2);
            }
        }
        else {
            const outX = v1.x === 1 ? Math.max(p1.x, p2.x) : Math.min(p1.x, p2.x);
            points.push({ x: outX, y: p1.y }, { x: outX, y: p2.y });
        }
    }
    else if (!sourceIsHoriz && !targetIsHoriz) {
        if (v1.y !== v2.y) {
            if ((p2.y - p1.y) * v1.y >= 0) {
                const midY = (p1.y + p2.y) / 2;
                points.push({ x: p1.x, y: midY }, { x: p2.x, y: midY });
            }
            else {
                const midX = (p1.x + p2.x) / 2;
                points.push(p1, { x: midX, y: p1.y }, { x: midX, y: p2.y }, p2);
            }
        }
        else {
            const outY = v1.y === 1 ? Math.max(p1.y, p2.y) : Math.min(p1.y, p2.y);
            points.push({ x: p1.x, y: outY }, { x: p2.x, y: outY });
        }
    }
    else if (sourceIsHoriz && !targetIsHoriz) {
        // Source moves horizontally, target moves vertically (e.g. -> top handle)
        if ((p2.x - p1.x) * v1.x >= 0 && (p1.y - p2.y) * v2.y >= 0) {
            points.push({ x: p2.x, y: p1.y });
        }
        else {
            points.push(p1, { x: p2.x, y: p1.y }, p2);
        }
    }
    else {
        // Source moves vertically, target moves horizontally (e.g. top handle -> )
        if ((p2.y - p1.y) * v1.y >= 0 && (p1.x - p2.x) * v2.x >= 0) {
            points.push({ x: p1.x, y: p2.y });
        }
        else {
            points.push(p1, { x: p1.x, y: p2.y }, p2);
        }
    }
    points.push(targetWorld);
    const worldPoints = filletPolyline(points, 16);
    return {
        worldPoints,
        arrowhead: buildEdgeHeadGeometry(targetWorld, worldPoints[worldPoints.length - 2]),
    };
}
function filletPolyline(points, radius) {
    if (points.length <= 2)
        return points;
    const result = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
        // to calculate segment lengths accurately, we must use the original sharp points.
        const origPrev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        const distPrev = Math.hypot(curr.x - origPrev.x, curr.y - origPrev.y);
        const distNext = Math.hypot(next.x - curr.x, next.y - curr.y);
        const r = Math.min(radius, distPrev / 2, distNext / 2);
        if (r < 1) {
            result.push(curr);
            continue;
        }
        const startP = {
            x: curr.x + ((origPrev.x - curr.x) / distPrev) * r,
            y: curr.y + ((origPrev.y - curr.y) / distPrev) * r,
        };
        const endP = {
            x: curr.x + ((next.x - curr.x) / distNext) * r,
            y: curr.y + ((next.y - curr.y) / distNext) * r,
        };
        // Draw straight line from prev rounded end to start of this corner
        if (result.length > 0 && (result[result.length - 1].x !== startP.x || result[result.length - 1].y !== startP.y)) {
            result.push(startP);
        }
        const samples = 6;
        for (let j = 1; j <= samples; j++) {
            const t = j / samples;
            const u = 1 - t;
            result.push({
                x: u * u * startP.x + 2 * u * t * curr.x + t * t * endP.x,
                y: u * u * startP.y + 2 * u * t * curr.y + t * t * endP.y,
            });
        }
    }
    result.push(points[points.length - 1]);
    return result;
}
function distancePointToSegmentSquared(px, py, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0)
        return (px - a.x) * (px - a.x) + (py - a.y) * (py - a.y);
    let t = ((px - a.x) * dx + (py - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = a.x + t * dx;
    const projY = a.y + t * dy;
    const distX = px - projX;
    const distY = py - projY;
    return distX * distX + distY * distY;
}
function normalize(point) {
    const length = Math.hypot(point.x, point.y);
    if (length === 0)
        return { x: 0, y: 0 };
    return { x: point.x / length, y: point.y / length };
}
function lerp(a, b, t) {
    return a + (b - a) * t;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
//# sourceMappingURL=edge-geometry.js.map