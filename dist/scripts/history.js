/**
 * Minimal undo/redo stack for editor actions.
 *
 * The caller is responsible for applying the action before pushing it onto
 * the stack. Undo and redo simply replay the captured closures.
 */
export class HistoryStack {
    undoStack = [];
    redoStack = [];
    push(entry) {
        this.undoStack.push(entry);
        this.redoStack = [];
    }
    canUndo() {
        return this.undoStack.length > 0;
    }
    canRedo() {
        return this.redoStack.length > 0;
    }
    undo() {
        const entry = this.undoStack.pop();
        if (!entry)
            return false;
        entry.undo();
        this.redoStack.push(entry);
        return true;
    }
    redo() {
        const entry = this.redoStack.pop();
        if (!entry)
            return false;
        entry.redo();
        this.undoStack.push(entry);
        return true;
    }
}
//# sourceMappingURL=history.js.map