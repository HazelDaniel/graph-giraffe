import { TextureKind, TextureSourceType } from '../scripts/types.js';
export interface TextureSelectChangeDetail {
    value: string;
    label: string;
    name: string;
    kind: TextureKind;
    sourceType: TextureSourceType;
    previewUrl: string;
}
declare global {
    interface HTMLElementEventMap {
        'gg-texture-select-change': CustomEvent<TextureSelectChangeDetail>;
    }
}
export declare class TextureSelect extends HTMLElement {
    static readonly observedAttributes: readonly ["placeholder", "value", "disabled", "name", "kind"];
    private triggerEl;
    private triggerPreviewEl;
    private triggerLabelEl;
    private dropdownEl;
    private isOpen;
    private activeIdx;
    private onDocClick;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: (typeof TextureSelect.observedAttributes)[number], oldVal: string | null, newVal: string | null): void;
    get value(): string;
    set value(value: string);
    get name(): string;
    get kind(): TextureKind | '';
    get placeholder(): string;
    get disabled(): boolean;
    refresh(): void;
    private render;
    private cacheRefs;
    private bindEvents;
    private syncOptions;
    private selectByIdx;
    private updateTrigger;
    private refreshOptionStates;
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
    private escHtml;
}
declare global {
    interface HTMLElementTagNameMap {
        'gg-texture-select': TextureSelect;
    }
}
