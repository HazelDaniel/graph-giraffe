export declare class HistoryPane extends HTMLElement {
    #private;
    connectedCallback(): void;
    private render;
    getChildrenTemplate(): string;
}
declare global {
    interface HTMLElementTagNameMap {
        "gg-history-pane": HistoryPane;
    }
}
