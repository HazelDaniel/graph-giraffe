/** Apply the cached alignment diff to the canonical WebGL quad. */
export function applyPrimitiveDiff(frame) {
    return {
        worldX: frame.baseWorldX + frame.diff.translateX,
        worldY: frame.baseWorldY + frame.diff.translateY,
        width: frame.baseWidth * frame.diff.scaleX,
        height: frame.baseHeight * frame.diff.scaleY,
    };
}
function validDimension(value) {
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
    measurements = new Map();
    setIntrinsicMeasurement(id, measurement) {
        if (!validDimension(measurement.width) || !validDimension(measurement.height)) {
            throw new Error(`Invalid intrinsic measurement for primitive ${id}`);
        }
        this.measurements.set(id, {
            width: measurement.width,
            height: measurement.height,
            revision: measurement.revision ?? 1,
        });
    }
    clearIntrinsicMeasurement(id) {
        this.measurements.delete(id);
    }
    getIntrinsicMeasurement(id) {
        return this.measurements.get(id);
    }
    resolve(node, worldX, worldY) {
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
//# sourceMappingURL=primitive-geometry.js.map