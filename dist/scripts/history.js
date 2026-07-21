/**
 * Undo/redo stack for editor actions.
 *
 * Accepts {@link Command} objects (serializable, context-driven) as well as
 * legacy {@link HistoryEntry} closures for backward compatibility.
 */
export class HistoryStack {
    undoStack = [];
    redoStack = [];
    maxHistory;
    constructor(options = {}) {
        this.maxHistory = Math.max(1, options.maxHistory ?? 100);
    }
    push(command) {
        this.undoStack.push(command);
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.splice(0, this.undoStack.length - this.maxHistory);
        }
        this.redoStack = [];
    }
    get undoDepth() {
        return this.undoStack.length;
    }
    get redoDepth() {
        return this.redoStack.length;
    }
    canUndo() {
        return this.undoStack.length > 0;
    }
    canRedo() {
        return this.redoStack.length > 0;
    }
    /** Discard all undo/redo history. Used when importing a graph. */
    clear() {
        this.undoStack.length = 0;
        this.redoStack.length = 0;
    }
    undo(ctx) {
        const command = this.undoStack.pop();
        if (!command)
            return null;
        command.undo(ctx);
        this.redoStack.push(command);
        return command;
    }
    redo(ctx) {
        const command = this.redoStack.pop();
        if (!command)
            return null;
        command.redo(ctx);
        this.undoStack.push(command);
        return command;
    }
}
//# sourceMappingURL=history.js.map