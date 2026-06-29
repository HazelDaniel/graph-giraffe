import { Command, CommandContext } from "./commands.js";

/**
 * @deprecated Use {@link Command} instead.
 * Kept for backward compatibility during migration.
 */
export interface HistoryEntry {
  undo(): void;
  redo(): void;
}

export interface HistoryStackOptions {
  maxHistory?: number;
}

/**
 * Undo/redo stack for editor actions.
 *
 * Accepts {@link Command} objects (serializable, context-driven) as well as
 * legacy {@link HistoryEntry} closures for backward compatibility.
 */
export class HistoryStack {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private readonly maxHistory: number;

  constructor(options: HistoryStackOptions = {}) {
    this.maxHistory = Math.max(1, options.maxHistory ?? 100);
  }

  push(command: Command): void {
    this.undoStack.push(command);
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

  undo(ctx: CommandContext): boolean {
    const command = this.undoStack.pop();
    if (!command) return false;

    command.undo(ctx);
    this.redoStack.push(command);
    return true;
  }

  redo(ctx: CommandContext): boolean {
    const command = this.redoStack.pop();
    if (!command) return false;

    command.redo(ctx);
    this.undoStack.push(command);
    return true;
  }
}
