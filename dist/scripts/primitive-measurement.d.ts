import type { NodeTypeRegistry } from "./node-type-registry.js";
import type { NodeData } from "./types.js";
import { PrimitiveGeometry } from "./primitive-geometry.js";
/**
 * Maintains measurement-only shadow templates for registered primitives.
 * Visible DOM renderers are never called by this class.
 */
export declare class PrimitiveMeasurementProvider {
    private registry;
    private geometry;
    private isCollapsed;
    private onMeasurementChange?;
    private root;
    private entries;
    private resizeObserver;
    constructor(registry: NodeTypeRegistry, geometry: PrimitiveGeometry, isCollapsed?: (node: NodeData) => boolean, onMeasurementChange?: ((nodeId: number) => void) | undefined);
    setCollapseResolver(isCollapsed: (node: NodeData) => boolean): void;
    sync(nodes: Iterable<NodeData>): void;
    refresh(nodeId: number): void;
    isReady(nodes: Iterable<NodeData>): boolean;
    dispose(): void;
    private ensureRoot;
    private mount;
    private getChildren;
    private measure;
    private destroy;
}
