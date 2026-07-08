export declare class LoadingScreen extends HTMLElement {
    private done;
    static readonly observedAttributes: readonly ["hidden"];
    private activePromiseIndex;
    private promises;
    constructor();
    set promise(newPromise: Promise<any>);
    connectedCallback(): void;
    render(): void;
    toggleHidden(hidden?: boolean): void;
    stop(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "gg-loading-screen": LoadingScreen;
    }
}
