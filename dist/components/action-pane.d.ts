export declare class ActionPane extends HTMLElement {
    #private;
    connectedCallback(): void;
    private setupListeners;
    private render;
    getChildrenTemplate(): string;
}
declare global {
    interface HTMLElementTagNameMap {
        "gg-action-pane": ActionPane;
    }
}
