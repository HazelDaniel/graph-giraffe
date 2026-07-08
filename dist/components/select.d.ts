export interface SelectOption {
    value: string;
    label: string;
    disabled: boolean;
}
export interface CustomChangeDetail {
    /** The value of the chosen option */
    value: string;
    /** The visible text of the chosen option */
    label: string;
    /** The `name` attribute on the host element */
    name: string;
}
declare global {
    interface HTMLElementEventMap {
        "gg-select-change": CustomEvent<CustomChangeDetail>;
    }
}
export declare class CustomSelect extends HTMLElement {
    static readonly observedAttributes: readonly ["placeholder", "value", "disabled", "name"];
    private triggerEl;
    private triggerLabelEl;
    private dropdownEl;
    private isOpen;
    private activeIdx;
    private slotObserver;
    private onDocClick;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: (typeof CustomSelect.observedAttributes)[number], oldVal: string | null, newVal: string | null): void;
    get value(): string;
    set value(v: string);
    get name(): string;
    get placeholder(): string;
    get disabled(): boolean;
    private render;
    private cacheRefs;
    private bindEvents;
    private syncFromSlot;
    private selectByIdx;
    private refreshOptionStates;
    private updateTriggerLabel;
    private toggleDropdown;
    private openDropdown;
    private closeDropdown;
    private onTriggerKeydown;
    private onDropdownKeydown;
    private setActive;
    private clearActive;
    private moveActive;
    private dropdownItems;
    private getOptions;
    private escAttr;
}
declare global {
    interface HTMLElementTagNameMap {
        "gg-select": CustomSelect;
    }
}
