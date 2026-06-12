import { TextureRegistry } from '../scripts/texture-registry.js';
import { TextureKind, TextureSource, TextureSourceType } from '../scripts/types.js';

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

const STYLES = /* css */ `
  *, *::before, *::after { box-sizing: border-box; }

  :host {
    display: inline-block;
    width: 100%;
    min-width: 220px;
    position: relative;
    font-family: inherit;
    --ts-radius: 8px;
    --ts-border: rgba(77, 77, 77, 0.25);
    --ts-border-focus: rgba(75, 75, 75, 0.15);
    --ts-focus-ring: rgba(92, 92, 95, 0.22);
    --ts-text: rgb(235, 235, 235);
    --ts-muted: #9ca3af;
    --ts-surface: var(--material-surface);
    --ts-hover-bg: rgba(36, 37, 39, 0.36);
    --ts-selected-bg: #ecfeff;
    --ts-selected-text: #0f766e;
    --ts-accent: #0d9488;
    --ts-shadow: 0 8px 24px -4px rgba(0,0,0,.12), 0 3px 8px -2px rgba(0,0,0,.07);
  }

  :host([disabled]) { opacity: .45; pointer-events: none; }

  .trigger {
    width: 100%;
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) 16px;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    background: var(--ts-surface);
    border: 1.5px solid var(--ts-border);
    border-radius: var(--ts-radius);
    color: var(--ts-text);
    cursor: pointer;
    user-select: none;
    transition: border-color .15s, box-shadow .15s;
  }

  .trigger:hover { border-color: #9ca3af; }

  .trigger:focus-visible,
  .trigger[aria-expanded="true"] {
    outline: none;
    border-color: var(--ts-border-focus);
    box-shadow: 0 0 0 3px var(--ts-focus-ring);
  }

  .preview {
    width: 36px;
    height: 28px;
    border-radius: 6px;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .preview.is-empty {
    display: grid;
    place-items: center;
    color: var(--ts-muted);
    font-size: 12px;
  }

  .trigger-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
  }

  .trigger-label.is-placeholder {
    color: var(--ts-muted);
    font-weight: 400;
  }

  .chevron {
    width: 16px;
    height: 16px;
    color: #6b7280;
    transition: transform .2s ease;
  }

  .trigger[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  .dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    max-height: 300px;
    overflow-y: auto;
    padding: 5px;
    margin: 0;
    list-style: none;
    background: var(--ts-surface);
    border: 2px solid transparent;
    outline: 1.5px solid rgba(109, 109, 109, 0.76);
    border-radius: var(--ts-radius);
    box-shadow: var(--ts-shadow);
    backdrop-filter: blur(8px);
    transform-origin: top center;
    animation: pop-in .13s ease both;
  }

  .dropdown[hidden] { display: none; }

  @keyframes pop-in {
    from { opacity: 0; transform: scaleY(.94) translateY(-4px); }
    to { opacity: 1; transform: scaleY(1) translateY(0); }
  }

  .option {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) 14px;
    align-items: center;
    gap: 10px;
    padding: 6px 9px;
    border-radius: 5px;
    color: var(--ts-text);
    cursor: pointer;
    transition: background .1s linear;
  }

  .option:hover,
  .option[data-active] { background: var(--ts-accent); }

  .option[aria-selected="true"] {
    background: var(--ts-selected-bg);
    color: var(--ts-selected-text);
    font-weight: 600;
  }

  .option-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .option-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.82rem;
  }

  .option-meta {
    color: var(--ts-muted);
    font-size: 0.68rem;
    text-transform: capitalize;
  }

  .option[aria-selected="true"] .option-meta {
    color: rgba(15, 118, 110, 0.72);
  }

  .check {
    width: 14px;
    height: 14px;
    color: currentColor;
    visibility: hidden;
  }

  .option[aria-selected="true"] .check { visibility: visible; }

  .empty {
    padding: 10px;
    color: var(--ts-muted);
    font-size: 0.8rem;
  }

  .dropdown::-webkit-scrollbar { width: 5px; }
  .dropdown::-webkit-scrollbar-track { background: transparent; }
  .dropdown::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
`;

const CHEVRON_SVG = /* html */ `
  <svg class="chevron" viewBox="0 0 16 16" fill="none"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.75"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

const CHECK_SVG = /* html */ `
  <svg class="check" viewBox="0 0 14 14" fill="none"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2.5 7l3.5 3.5 5.5-7" stroke="currentColor" stroke-width="1.75"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

export class TextureSelect extends HTMLElement {
  static readonly observedAttributes = [
    'placeholder',
    'value',
    'disabled',
    'name',
    'kind',
  ] as const;

  private triggerEl!: HTMLButtonElement;
  private triggerPreviewEl!: HTMLElement;
  private triggerLabelEl!: HTMLSpanElement;
  private dropdownEl!: HTMLUListElement;
  private isOpen = false;
  private activeIdx = -1;
  private onDocClick!: (e: MouseEvent) => void;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.cacheRefs();
    this.bindEvents();
    this.syncOptions();
  }

  disconnectedCallback(): void {
    document.removeEventListener('click', this.onDocClick, true);
  }

  attributeChangedCallback(
    name: (typeof TextureSelect.observedAttributes)[number],
    oldVal: string | null,
    newVal: string | null
  ): void {
    if (oldVal === newVal || !this.triggerEl) return;

    switch (name) {
      case 'kind':
        this.syncOptions();
        break;
      case 'placeholder':
        this.updateTrigger();
        break;
      case 'value':
        this.refreshOptionStates();
        this.updateTrigger();
        break;
      case 'disabled':
        this.triggerEl.disabled = this.disabled;
        break;
    }
  }

  get value(): string {
    return this.getAttribute('value') ?? '';
  }
  set value(value: string) {
    this.setAttribute('value', value);
  }

  get name(): string {
    return this.getAttribute('name') ?? '';
  }

  get kind(): TextureKind | '' {
    return (this.getAttribute('kind') ?? '') as TextureKind | '';
  }

  get placeholder(): string {
    return this.getAttribute('placeholder') ?? 'Select texture';
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  refresh(): void {
    this.syncOptions();
  }

  private render(): void {
    this.shadowRoot!.innerHTML = /* html */ `
      <style>${STYLES}</style>
      <button
        class="trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="false"
        ${this.disabled ? 'disabled' : ''}
      >
        <span class="preview is-empty" aria-hidden="true">-</span>
        <span class="trigger-label is-placeholder">${this.escHtml(this.placeholder)}</span>
        ${CHEVRON_SVG}
      </button>
      <ul class="dropdown" role="listbox" hidden></ul>
    `;
  }

  private cacheRefs(): void {
    this.triggerEl = this.shadowRoot!.querySelector<HTMLButtonElement>('.trigger')!;
    this.triggerPreviewEl = this.shadowRoot!.querySelector<HTMLElement>('.preview')!;
    this.triggerLabelEl = this.shadowRoot!.querySelector<HTMLSpanElement>('.trigger-label')!;
    this.dropdownEl = this.shadowRoot!.querySelector<HTMLUListElement>('.dropdown')!;
  }

  private bindEvents(): void {
    this.triggerEl.addEventListener('click', () => this.toggleDropdown());
    this.triggerEl.addEventListener('keydown', (e) => this.onTriggerKeydown(e));

    this.dropdownEl.addEventListener('pointermove', (e) => {
      const option = (e.target as Element).closest<HTMLLIElement>('.option');
      if (option) this.setActive(Number(option.dataset['idx']));
    });

    this.dropdownEl.addEventListener('click', (e) => {
      const option = (e.target as Element).closest<HTMLLIElement>('.option');
      if (!option) return;
      this.selectByIdx(Number(option.dataset['idx']));
      this.closeDropdown();
      this.triggerEl.focus();
    });

    this.dropdownEl.addEventListener('keydown', (e) => this.onDropdownKeydown(e));

    this.onDocClick = (e: MouseEvent) => {
      if (
        !this.contains(e.target as Node) &&
        !this.shadowRoot!.contains(e.target as Node)
      ) {
        this.closeDropdown();
      }
    };
    document.addEventListener('click', this.onDocClick, true);
  }

  private syncOptions(): void {
    const options = this.getOptions();

    if (options.length === 0) {
      this.dropdownEl.innerHTML = `<li class="empty">No textures available</li>`;
      this.updateTrigger();
      return;
    }

    this.dropdownEl.innerHTML = options
      .map((option, index) => /* html */ `
        <li
          class="option"
          role="option"
          data-idx="${index}"
          data-value="${this.escAttr(option.id)}"
          aria-selected="${option.id === this.value ? 'true' : 'false'}"
        >
          <img class="preview" src="${this.escAttr(option.previewUrl ?? '')}" alt="" />
          <span class="option-main">
            <span class="option-label">${this.escHtml(option.label)}</span>
            <span class="option-meta">${this.escHtml(option.sourceType)}</span>
          </span>
          ${CHECK_SVG}
        </li>`
      )
      .join('');

    this.updateTrigger();
  }

  private selectByIdx(idx: number): void {
    const options = this.getOptions();
    const selected = options[idx];
    if (!selected) return;

    this.setAttribute('value', selected.id);
    this.refreshOptionStates();
    this.updateTrigger();

    this.dispatchEvent(
      new CustomEvent<TextureSelectChangeDetail>('gg-texture-select-change', {
        bubbles: true,
        composed: true,
        detail: {
          value: selected.id,
          label: selected.label,
          name: this.name,
          kind: selected.kind,
          sourceType: selected.sourceType,
          previewUrl: selected.previewUrl ?? '',
        },
      })
    );
  }

  private updateTrigger(): void {
    const selected = this.getOptions().find((option) => option.id === this.value);
    if (!selected) {
      this.triggerPreviewEl.outerHTML = `<span class="preview is-empty" aria-hidden="true">-</span>`;
      this.triggerPreviewEl = this.shadowRoot!.querySelector<HTMLElement>('.preview')!;
      this.triggerLabelEl.textContent = this.placeholder;
      this.triggerLabelEl.classList.add('is-placeholder');
      return;
    }

    this.triggerPreviewEl.outerHTML = `<img class="preview" src="${this.escAttr(selected.previewUrl ?? '')}" alt="" />`;
    this.triggerPreviewEl = this.shadowRoot!.querySelector<HTMLElement>('.preview')!;
    this.triggerLabelEl.textContent = selected.label;
    this.triggerLabelEl.classList.remove('is-placeholder');
  }

  private refreshOptionStates(): void {
    const value = this.value;
    this.dropdownEl.querySelectorAll<HTMLLIElement>('.option').forEach((option) => {
      option.setAttribute(
        'aria-selected',
        option.dataset['value'] === value ? 'true' : 'false'
      );
    });
  }

  private toggleDropdown(): void {
    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }

  private openDropdown(): void {
    this.isOpen = true;
    this.triggerEl.setAttribute('aria-expanded', 'true');
    this.dropdownEl.removeAttribute('hidden');

    const items = this.dropdownItems();
    let startIdx = 0;
    items.forEach((item, index) => {
      if (item.getAttribute('aria-selected') === 'true') startIdx = index;
    });
    this.setActive(startIdx);
  }

  private closeDropdown(): void {
    this.isOpen = false;
    this.triggerEl.setAttribute('aria-expanded', 'false');
    this.dropdownEl.setAttribute('hidden', '');
    this.clearActive();
  }

  private onTriggerKeydown(e: KeyboardEvent): void {
    const handled = ['ArrowDown', 'ArrowUp', 'Enter', ' '];
    if (!handled.includes(e.key)) return;
    e.preventDefault();

    if (!this.isOpen) {
      this.openDropdown();
      return;
    }

    if (e.key === 'ArrowDown') this.moveActive(1);
    else if (e.key === 'ArrowUp') this.moveActive(-1);
    else if (e.key === 'Enter' || e.key === ' ') {
      if (this.activeIdx >= 0) {
        this.selectByIdx(this.activeIdx);
        this.closeDropdown();
      }
    }
  }

  private onDropdownKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.closeDropdown();
      this.triggerEl.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.moveActive(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.moveActive(-1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (this.activeIdx >= 0) {
        this.selectByIdx(this.activeIdx);
        this.closeDropdown();
        this.triggerEl.focus();
      }
    } else if (e.key === 'Tab') {
      this.closeDropdown();
    }
  }

  private setActive(idx: number): void {
    const items = this.dropdownItems();
    this.clearActive();
    if (idx < 0 || idx >= items.length) return;
    this.activeIdx = idx;
    items[idx].setAttribute('data-active', '');
    items[idx].scrollIntoView({ block: 'nearest' });
  }

  private clearActive(): void {
    this.dropdownItems().forEach((item) => item.removeAttribute('data-active'));
    this.activeIdx = -1;
  }

  private moveActive(direction: 1 | -1): void {
    const items = this.dropdownItems();
    if (items.length === 0) return;
    const next = (((this.activeIdx + direction) % items.length) + items.length) % items.length;
    this.setActive(next);
  }

  private dropdownItems(): HTMLLIElement[] {
    return [...this.dropdownEl.querySelectorAll<HTMLLIElement>('.option')];
  }

  private getOptions(): TextureSource[] {
    if (!this.kind) {
      // console.log(TextureRegistry.all())
return TextureRegistry.all();
    }
    return TextureRegistry.byKind(this.kind);
  }

  private escAttr(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  private escHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

if (!customElements.get('gg-texture-select')) {
  customElements.define('gg-texture-select', TextureSelect);
}

declare global {
  interface HTMLElementTagNameMap {
    'gg-texture-select': TextureSelect;
  }
}
