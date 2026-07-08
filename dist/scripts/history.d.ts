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
export declare class HistoryStack {
    private undoStack;
    private redoStack;
    private readonly maxHistory;
    constructor(options?: HistoryStackOptions);
    push(command: Command): void;
    get undoDepth(): number;
    get redoDepth(): number;
    canUndo(): boolean;
    canRedo(): boolean;
    undo(ctx: CommandContext): Command | null;
    redo(ctx: CommandContext): Command | null;
}
