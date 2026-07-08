import "./prop-group.js";
export declare class UIControls extends HTMLElement {
    #private;
    connectedCallback(): void;
    private render;
    getChildrenTemplate(): string;
}
declare global {
    interface HTMLElementTagNameMap {
        "gg-ui-controls": UIControls;
    }
}
