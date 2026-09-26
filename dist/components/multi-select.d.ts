export interface MultiSelectChangeDetail {
    values: string[];
    labels: string[];
    name: string;
}
declare global {
    interface HTMLElementEventMap {
        "gg-multi-select-change": CustomEvent<MultiSelectChangeDetail>;
    }
    interface HTMLElementTagNameMap {
        "gg-multi-select": MultiSelect;
    }
}
export declare class MultiSelect extends HTMLElement {
    static readonly observedAttributes: readonly ["disabled", "name"];
    private triggerEl;
    private triggerLabelEl;
    private dropdownEl;
    private valuesState;
    private activeIdx;
    private isOpen;
    private slotObserver;
    private onDocClick;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    get values(): string[];
    set values(values: string[]);
    get name(): string;
    private render;
    private bindEvents;
    private getOptions;
    private syncFromSlot;
    private toggleValue;
    private updateTriggerLabel;
    private toggleDropdown;
    private openDropdown;
    private closeDropdown;
    private escape;
}
