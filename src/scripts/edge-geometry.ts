import { Camera } from './camera.js';
import { getHandleScreenGeometry } from './handle-geometry.js';
import { NodeStore } from './node-store.js';
import { getWorldPosition } from './scene-graph.js';
import { EdgeData, HandleSide, NodeHandleData } from './types.js';

export type PrimitiveDimensionsResolver = (
  nodeId: number
) => { width: number; height: number } | undefined;

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

const MIN_SAMPLE_COUNT = 48;
const MAX_SAMPLE_COUNT = 72;
const SAMPLE_DISTANCE_STEP = 42;

export function buildEdgeRouteGeometry(
  edge: EdgeData,
  store: NodeStore,
  camera: Camera,
  resolveDimensions?: PrimitiveDimensionsResolver
): EdgeRouteGeometry | null {
  const sourceNode = store.get(edge.sourceNodeId);
  const targetNode = store.get(edge.targetNodeId);
  if (!sourceNode || !targetNode) return null;

  const sourceHandle = sourceNode.handles.find(
    (handle) => handle.side === edge.sourceHandleSide
  );
  const targetHandle = targetNode.handles.find(
    (handle) => handle.side === edge.targetHandleSide
  );
  if (!sourceHandle || !targetHandle) return null;

  const sourceWorld = getHandleWorldPoint(sourceNode.id, sourceHandle, store, camera, resolveDimensions);
  const targetWorld = getHandleWorldPoint(targetNode.id, targetHandle, store, camera, resolveDimensions);

  const route = buildCubicRoute(
    sourceWorld,
    edge.sourceHandleSide,
    targetWorld,
    edge.targetHandleSide,
    'orthogonal'
  );
  const screenPoints = route.worldPoints.map((point) => camera.worldToScreen(point.x, point.y));
  const labelWorldPoint = getPolylineMidpoint(route.worldPoints);
  const labelScreenPoint = camera.worldToScreen(labelWorldPoint.x, labelWorldPoint.y);

  return {
    edge,
    worldPoints: route.worldPoints,
    screenPoints,
    labelWorldPoint,
    labelScreenPoint,
    arrowhead: edge.headType === 'arrow' ? route.arrowhead : null,
  };
}

export function buildConnectionPreviewGeometry(
  sourceNodeId: number,
  sourceHandleSide: HandleSide,
  screenX: number,
  screenY: number,
  store: NodeStore,
  camera: Camera,
  resolveDimensions?: PrimitiveDimensionsResolver
): EdgeRouteGeometry | null {
  const sourceNode = store.get(sourceNodeId);
  if (!sourceNode) return null;

  const sourceHandle = sourceNode.handles.find((handle) => handle.side === sourceHandleSide);
  if (!sourceHandle) return null;

  const sourceWorld = getHandleWorldPoint(sourceNode.id, sourceHandle, store, camera, resolveDimensions);
  const targetWorld = camera.screenToWorld(screenX, screenY);
  const oppositeSide: HandleSide = getOppositeSide(sourceHandleSide);
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

export function hitTestEdgePolyline(
  screenX: number,
  screenY: number,
  polyline: Point2D[],
  thresholdPx = 8
): boolean {
  if (polyline.length < 2) return false;

  const thresholdSq = thresholdPx * thresholdPx;
  for (let i = 0; i < polyline.length - 1; i++) {
    if (distancePointToSegmentSquared(screenX, screenY, polyline[i], polyline[i + 1]) <= thresholdSq) {
      return true;
    }
  }

  return false;
}

function buildCubicRoute(
  sourceWorld: Point2D,
  sourceSide: HandleSide,
  targetWorld: Point2D,
  targetSide: HandleSide,
  edgeType: EdgeData['edgeType']
): { worldPoints: Point2D[]; arrowhead: ArrowheadGeometry | null } {
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

  const control1: Point2D = {
    x: sourceWorld.x + sourceVec.x * bend + (sourceVec.x === 0 ? clamp(dx * 0.12, -80, 80) : 0),
    y: sourceWorld.y + sourceVec.y * bend + (sourceVec.y === 0 ? clamp(dy * 0.12, -80, 80) : 0),
  };

  const control2: Point2D = {
    x: targetWorld.x + targetVec.x * bend - (targetVec.x === 0 ? clamp(dx * 0.12, -80, 80) : 0),
    y: targetWorld.y + targetVec.y * bend - (targetVec.y === 0 ? clamp(dy * 0.12, -80, 80) : 0),
  };

  const sampleCount = clamp(
    Math.ceil(distance / SAMPLE_DISTANCE_STEP) + 8,
    MIN_SAMPLE_COUNT,
    MAX_SAMPLE_COUNT
  );

  const worldPoints: Point2D[] = [];
  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    worldPoints.push(sampleCubic(sourceWorld, control1, control2, targetWorld, t));
  }

  return {
    worldPoints,
    arrowhead: buildEdgeHeadGeometry(
      targetWorld,
      targetWorld,
      derivativeAtEnd(control2, targetWorld)
    ),
  };
}

function buildEdgeHeadGeometry(
  tip: Point2D,
  previousPoint: Point2D,
  tangentOverride?: Point2D
): ArrowheadGeometry | null {
  const tangent = normalize(
    tangentOverride ?? {
      x: tip.x - previousPoint.x,
      y: tip.y - previousPoint.y,
    }
  );

  if (tangent.x === 0 && tangent.y === 0) return null;

  return {
    tip,
    tangent,
  };
}

function derivativeAtEnd(control2: Point2D, end: Point2D): Point2D {
  return {
    x: 3 * (end.x - control2.x),
    y: 3 * (end.y - control2.y),
  };
}

function getHandleWorldPoint(
  nodeId: number,
  handle: NodeHandleData,
  store: NodeStore,
  camera: Camera,
  resolveDimensions?: PrimitiveDimensionsResolver
): Point2D {
  const node = store.get(nodeId);
  if (!node) return { x: 0, y: 0 };

  const { x, y } = getWorldPosition(node.id, store.allNodesMap);
  const geometry = getHandleScreenGeometry(
    x,
    y,
    node,
    handle,
    camera.zoom,
    camera.panX,
    camera.panY,
    resolveDimensions?.(node.id)
  );
  return camera.screenToWorld(geometry.centerX, geometry.centerY);
}

function getPolylineMidpoint(points: Point2D[]): Point2D {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  let total = 0;
  const lengths: number[] = [0];
  for (let i = 0; i < points.length - 1; i++) {
    total += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    lengths.push(total);
  }

  const halfway = total / 2;
  for (let i = 0; i < lengths.length - 1; i++) {
    if (lengths[i + 1] < halfway) continue;
    const segmentLength = lengths[i + 1] - lengths[i];
    const ratio = segmentLength === 0 ? 0 : (halfway - lengths[i]) / segmentLength;
    return {
      x: lerp(points[i].x, points[i + 1].x, ratio),
      y: lerp(points[i].y, points[i + 1].y, ratio),
    };
  }

  return points[points.length - 1];
}

function sampleCubic(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number
): Point2D {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x:
      uuu * p0.x +
      3 * uu * t * p1.x +
      3 * u * tt * p2.x +
      ttt * p3.x,
    y:
      uuu * p0.y +
      3 * uu * t * p1.y +
      3 * u * tt * p2.y +
      ttt * p3.y,
  };
}

function getOppositeSide(side: HandleSide): HandleSide {
  switch (side) {
    case 'left': return 'right';
    case 'right': return 'left';
    case 'top': return 'bottom';
    case 'bottom': return 'top';
  }
}

function sideVector(side: HandleSide): { x: number; y: number } {
  switch (side) {
    case 'left': return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
    case 'top': return { x: 0, y: -1 };
    case 'bottom': return { x: 0, y: 1 };
  }
}

function sideDirection(side: HandleSide): number {
  return side === 'left' || side === 'top' ? -1 : 1;
}

function buildOrthogonalRoute(
  sourceWorld: Point2D,
  sourceSide: HandleSide,
  targetWorld: Point2D,
  targetSide: HandleSide
): { worldPoints: Point2D[]; arrowhead: ArrowheadGeometry | null } {
  const padding = 32;
  const v1 = sideVector(sourceSide);
  const v2 = sideVector(targetSide);

  const p1 = { x: sourceWorld.x + v1.x * padding, y: sourceWorld.y + v1.y * padding };
  const p2 = { x: targetWorld.x + v2.x * padding, y: targetWorld.y + v2.y * padding };

  const points: Point2D[] = [sourceWorld];

  const sourceIsHoriz = sourceSide === 'left' || sourceSide === 'right';
  const targetIsHoriz = targetSide === 'left' || targetSide === 'right';

  if (sourceIsHoriz && targetIsHoriz) {
    if (v1.x !== v2.x) {
      if ((p2.x - p1.x) * v1.x >= 0) {
        const midX = (p1.x + p2.x) / 2;
        points.push({ x: midX, y: p1.y }, { x: midX, y: p2.y });
      } else {
        const midY = (p1.y + p2.y) / 2;
        points.push(p1, { x: p1.x, y: midY }, { x: p2.x, y: midY }, p2);
      }
    } else {
      const outX = v1.x === 1 ? Math.max(p1.x, p2.x) : Math.min(p1.x, p2.x);
      points.push({ x: outX, y: p1.y }, { x: outX, y: p2.y });
    }
  } else if (!sourceIsHoriz && !targetIsHoriz) {
    if (v1.y !== v2.y) {
      if ((p2.y - p1.y) * v1.y >= 0) {
        const midY = (p1.y + p2.y) / 2;
        points.push({ x: p1.x, y: midY }, { x: p2.x, y: midY });
      } else {
        const midX = (p1.x + p2.x) / 2;
        points.push(p1, { x: midX, y: p1.y }, { x: midX, y: p2.y }, p2);
      }
    } else {
      const outY = v1.y === 1 ? Math.max(p1.y, p2.y) : Math.min(p1.y, p2.y);
      points.push({ x: p1.x, y: outY }, { x: p2.x, y: outY });
    }
  } else if (sourceIsHoriz && !targetIsHoriz) {
    // Source moves horizontally, target moves vertically (e.g. -> top handle)
    if ((p2.x - p1.x) * v1.x >= 0 && (p1.y - p2.y) * v2.y >= 0) {
      points.push({ x: p2.x, y: p1.y });
    } else {
      points.push(p1, { x: p2.x, y: p1.y }, p2);
    }
  } else {
    // Source moves vertically, target moves horizontally (e.g. top handle -> )
    if ((p2.y - p1.y) * v1.y >= 0 && (p1.x - p2.x) * v2.x >= 0) {
      points.push({ x: p1.x, y: p2.y });
    } else {
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

function filletPolyline(points: Point2D[], radius: number): Point2D[] {
  if (points.length <= 2) return points;

  const result: Point2D[] = [points[0]];

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

function distancePointToSegmentSquared(
  px: number,
  py: number,
  a: Point2D,
  b: Point2D
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return (px - a.x) * (px - a.x) + (py - a.y) * (py - a.y);

  let t = ((px - a.x) * dx + (py - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  const distX = px - projX;
  const distY = py - projY;
  return distX * distX + distY * distY;
}

function normalize(point: Point2D): Point2D {
  const length = Math.hypot(point.x, point.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: point.x / length, y: point.y / length };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
