import type { EdgeHeadSkinId, EdgeHeadType, EdgeType } from "./types.js";
export interface EdgeStrokeDescriptor {
    color: string;
    width: number;
}
export interface EdgeLabelDescriptor {
    enabled: boolean;
    editable: boolean;
}
export interface EdgeDescriptor {
    type: string;
    /** Selects an existing core route. Custom tessellation is intentionally unsupported. */
    route: EdgeType;
    stroke: EdgeStrokeDescriptor;
    head: {
        type: EdgeHeadType;
        skinId: EdgeHeadSkinId;
    };
    label: EdgeLabelDescriptor;
    hitTest: {
        tolerance: number;
    };
    actions: {
        selectable: boolean;
        deletable: boolean;
    };
}
export declare class EdgeTypeRegistry {
    private descriptors;
    constructor();
    register(descriptor: EdgeDescriptor): void;
    replace(descriptor: EdgeDescriptor): void;
    get(type: string): EdgeDescriptor | undefined;
    has(type: string): boolean;
}
