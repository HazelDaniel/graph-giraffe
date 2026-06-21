export interface HistoryEntry {
  undo(): void;
  redo(): void;
}

export interface HistoryStackOptions {
  maxHistory?: number;
}

/**
 * Minimal undo/redo stack for editor actions.
 *
 * The caller is responsible for applying the action before pushing it onto
 * the stack. Undo and redo simply replay the captured closures.
 */
export class HistoryStack {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private readonly maxHistory: number;

  constructor(options: HistoryStackOptions = {}) {
    this.maxHistory = Math.max(1, options.maxHistory ?? 100);
  }

  push(entry: HistoryEntry): void {
    this.undoStack.push(entry);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.splice(0, this.undoStack.length - this.maxHistory);
    }
    this.redoStack = [];
  }

  get undoDepth(): number {
    return this.undoStack.length;
  }

  get redoDepth(): number {
    return this.redoStack.length;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  undo(): boolean {
    const entry = this.undoStack.pop();
    if (!entry) return false;

    entry.undo();
    this.redoStack.push(entry);
    return true;
  }

  redo(): boolean {
    const entry = this.redoStack.pop();
    if (!entry) return false;

    entry.redo();
    this.undoStack.push(entry);
    return true;
  }
}
