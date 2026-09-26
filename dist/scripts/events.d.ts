import { Command } from "./commands";
import { NodePropValue, NodeType } from "./types";
export interface GraphBeforeEvents {
    "before:connect": {
        sourceId: number;
        sourceType: NodeType;
        targetId: number;
        targetType: NodeType;
        sourceHandleSide: import("./types").HandleSide;
        targetHandleSide: import("./types").HandleSide;
    };
    "before:nodeCreate": {
        nodeType: NodeType;
        localX: number;
        localY: number;
        parentId: number | null;
        parentType: NodeType | null;
    };
    "before:nodeDelete": {
        nodeId: number;
        nodeType: NodeType;
    };
    "before:nodeReparent": {
        nodeId: number;
        nodeType: NodeType;
        newParentId: number | null;
        newParentType: NodeType | null;
    };
}
export interface GraphEvents {
    "geometry:change": {
        nodeIds: number[];
    };
    "history:command": {
        command: Command;
        action: "do" | "undo" | "redo";
    };
    "node:propChange": {
        nodeId: number;
        nodeType: NodeType;
        label: string;
        value: NodePropValue;
    };
    "node:propValidation": {
        nodeId: number;
        nodeType: NodeType;
        label: string;
        value: NodePropValue;
        accepted: boolean;
        normalized: boolean;
        message: string;
        code?: string;
    };
    "node:labelChange": {
        nodeId: number;
        nodeType: NodeType;
        oldLabel: string;
        newLabel: string;
    };
    "node:reparent": {
        nodeId: number;
        nodeType: NodeType;
        oldParentId: number | null;
        newParentId: number | null;
    };
    "subgraph:collapseToggle": {
        subgraphId: number;
        isCollapsed: boolean;
    };
    "hub:created": {
        hubId: number;
    };
    "node:click": {
        nodeId: number;
        nodeType: NodeType;
        event: MouseEvent;
    };
    "node:dragStart": {
        nodeIds: number[];
        event: MouseEvent;
    };
    "node:drag": {
        nodeIds: number[];
        event: MouseEvent;
    };
    "node:dragStop": {
        nodeIds: number[];
        event: MouseEvent;
    };
    "edge:click": {
        edgeId: number;
        event: MouseEvent;
    };
    "connect": {
        sourceId: number;
        sourceType: NodeType;
        targetId: number;
        targetType: NodeType;
        edgeId: number;
    };
    "edge:remove": {
        edgeId: number;
        sourceId: number;
        sourceType: NodeType;
        targetId: number;
        targetType: NodeType;
    };
    "selection:change": {
        nodeIds: number[];
        edgeIds: number[];
    };
    "pane:click": {
        event: MouseEvent;
    };
    "pane:scroll": {
        event: WheelEvent;
    };
    "camera:change": {
        panX: number;
        panY: number;
        zoom: number;
    };
    "comment:modeChange": {
        enabled: boolean;
    };
    "controlled:apply": {
        nodeIds: number[];
        edgeIds: number[];
    };
}
export type SyncHandler<T> = (payload: T) => void;
export type AsyncHandler<T> = (payload: T) => Promise<boolean> | boolean;
export declare class GraphEventEmitter {
    debug: boolean | null;
    private syncHandlers;
    private asyncHandlers;
    /**
     * Listen to a standard synchronous event.
     * Returns an unsubscribe function.
     */
    on<K extends keyof GraphEvents>(event: K, handler: SyncHandler<GraphEvents[K]>): () => void;
    /**
     * Remove a synchronous event listener.
     */
    off<K extends keyof GraphEvents>(event: K, handler: SyncHandler<GraphEvents[K]>): void;
    /**
     * Dispatch a standard synchronous event.
     */
    dispatch<K extends keyof GraphEvents>(event: K, payload: GraphEvents[K]): void;
    /**
     * Listen to an async hook that can block execution.
     * Returns an unsubscribe function.
     */
    onBefore<K extends keyof GraphBeforeEvents>(event: K, handler: AsyncHandler<GraphBeforeEvents[K]>): () => void;
    /**
     * Remove an async hook listener.
     */
    offBefore<K extends keyof GraphBeforeEvents>(event: K, handler: AsyncHandler<GraphBeforeEvents[K]>): void;
    /**
     * Dispatch an async hook.
     * Returns true if all listeners resolve to true (or truthy).
     * Returns false if ANY listener returns false or throws.
     */
    dispatchBefore<K extends keyof GraphBeforeEvents>(event: K, payload: GraphBeforeEvents[K]): Promise<boolean>;
}
