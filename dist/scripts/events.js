export class GraphEventEmitter {
    debug = null;
    syncHandlers = new Map();
    asyncHandlers = new Map();
    /**
     * Listen to a standard synchronous event.
     * Returns an unsubscribe function.
     */
    on(event, handler) {
        if (!this.syncHandlers.has(event)) {
            this.syncHandlers.set(event, new Set());
        }
        this.syncHandlers.get(event).add(handler);
        return () => this.off(event, handler);
    }
    /**
     * Remove a synchronous event listener.
     */
    off(event, handler) {
        this.syncHandlers.get(event)?.delete(handler);
    }
    /**
     * Dispatch a standard synchronous event.
     */
    dispatch(event, payload) {
        if (this.debug) {
            console.log(`[GraphEventEmitter] dispatch: ${event}`, payload);
        }
        const handlers = this.syncHandlers.get(event);
        if (handlers) {
            for (const handler of handlers) {
                try {
                    handler(payload);
                }
                catch (e) {
                    console.error(`Error in event handler for ${event}:`, e);
                }
            }
        }
    }
    /**
     * Listen to an async hook that can block execution.
     * Returns an unsubscribe function.
     */
    onBefore(event, handler) {
        if (!this.asyncHandlers.has(event)) {
            this.asyncHandlers.set(event, new Set());
        }
        this.asyncHandlers.get(event).add(handler);
        return () => this.offBefore(event, handler);
    }
    /**
     * Remove an async hook listener.
     */
    offBefore(event, handler) {
        this.asyncHandlers.get(event)?.delete(handler);
    }
    /**
     * Dispatch an async hook.
     * Returns true if all listeners resolve to true (or truthy).
     * Returns false if ANY listener returns false or throws.
     */
    async dispatchBefore(event, payload) {
        if (this.debug) {
            console.log(`[GraphEventEmitter] dispatchBefore: ${event}`, payload);
        }
        const handlers = this.asyncHandlers.get(event);
        if (!handlers || handlers.size === 0)
            return true;
        for (const handler of handlers) {
            try {
                const allowed = await handler(payload);
                if (allowed === false)
                    return false;
            }
            catch (e) {
                console.error(`Action blocked by exception in before-hook for ${event}:`, e);
                return false;
            }
        }
        return true;
    }
}
//# sourceMappingURL=events.js.map