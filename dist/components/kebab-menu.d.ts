export type KebabMenuAction = "import" | "export";
export declare class KebabMenu extends HTMLElement {
    #private;
    private isOpen;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private setupEventListeners;
    private handleOutsideClick;
    toggle(): void;
    open(): void;
    close(): void;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        "gg-kebab-menu": KebabMenu;
    }
}
