export type SelectionToolbarAction = "collapse" | "clone" | "delete" | "edit" | "expand" | "ungraph" | "spotlight";
export interface SelectionToolbarButtonSpec {
    action: SelectionToolbarAction;
    label: string;
    glyph: string;
}
export declare class SelectionToolbar extends HTMLElement {
    #private;
    private actions;
    private visible;
    private posX;
    private posY;
    private actionSignature;
    constructor();
    connectedCallback(): void;
    setActions(actions: SelectionToolbarButtonSpec[]): void;
    setPosition(screenX: number, screenY: number): void;
    show(): void;
    hide(): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "gg-selection-toolbar": SelectionToolbar;
    }
}
