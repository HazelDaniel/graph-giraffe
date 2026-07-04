import { Command } from "./commands";
import { NodeType } from "./types";

export interface GraphBeforeEvents {
  "before:connect": {
    sourceId: number;
    sourceType: NodeType;
    targetId: number;
    targetType: NodeType;
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
  "history:command": {
    command: Command;
    action: "do" | "undo" | "redo";
  };
  "node:propChange": {
    nodeId: number;
    nodeType: NodeType;
    label: string;
    value: string | boolean;
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
}

export type SyncHandler<T> = (payload: T) => void;
export type AsyncHandler<T> = (payload: T) => Promise<boolean> | boolean;

export class GraphEventEmitter {
  public debug: boolean | null = null;

  private syncHandlers = new Map<keyof GraphEvents, Set<SyncHandler<any>>>();
  private asyncHandlers = new Map<keyof GraphBeforeEvents, Set<AsyncHandler<any>>>();

  /**
   * Listen to a standard synchronous event.
   * Returns an unsubscribe function.
   */
  on<K extends keyof GraphEvents>(event: K, handler: SyncHandler<GraphEvents[K]>): () => void {
    if (!this.syncHandlers.has(event)) {
      this.syncHandlers.set(event, new Set());
    }
    this.syncHandlers.get(event)!.add(handler);

    return () => this.off(event, handler);
  }

  /**
   * Remove a synchronous event listener.
   */
  off<K extends keyof GraphEvents>(event: K, handler: SyncHandler<GraphEvents[K]>): void {
    this.syncHandlers.get(event)?.delete(handler);
  }

  /**
   * Dispatch a standard synchronous event.
   */
  dispatch<K extends keyof GraphEvents>(event: K, payload: GraphEvents[K]): void {
    if (this.debug) {
      console.log(`[GraphEventEmitter] dispatch: ${event}`, payload);
    }
    const handlers = this.syncHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (e) {
          console.error(`Error in event handler for ${event}:`, e);
        }
      }
    }
  }

  /**
   * Listen to an async hook that can block execution.
   * Returns an unsubscribe function.
   */
  onBefore<K extends keyof GraphBeforeEvents>(event: K, handler: AsyncHandler<GraphBeforeEvents[K]>): () => void {
    if (!this.asyncHandlers.has(event)) {
      this.asyncHandlers.set(event, new Set());
    }
    this.asyncHandlers.get(event)!.add(handler);

    return () => this.offBefore(event, handler);
  }

  /**
   * Remove an async hook listener.
   */
  offBefore<K extends keyof GraphBeforeEvents>(event: K, handler: AsyncHandler<GraphBeforeEvents[K]>): void {
    this.asyncHandlers.get(event)?.delete(handler);
  }

  /**
   * Dispatch an async hook. 
   * Returns true if all listeners resolve to true (or truthy).
   * Returns false if ANY listener returns false or throws.
   */
  async dispatchBefore<K extends keyof GraphBeforeEvents>(event: K, payload: GraphBeforeEvents[K]): Promise<boolean> {
    if (this.debug) {
      console.log(`[GraphEventEmitter] dispatchBefore: ${event}`, payload);
    }
    const handlers = this.asyncHandlers.get(event);
    if (!handlers || handlers.size === 0) return true;

    for (const handler of handlers) {
      try {
        const allowed = await handler(payload);
        if (allowed === false) return false;
      } catch (e) {
        console.error(`Action blocked by exception in before-hook for ${event}:`, e);
        return false;
      }
    }
    return true;
  }
}
