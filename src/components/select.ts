
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

// Augment the global event map so consumers get correct types when using
// addEventListener on a CustomSelect element.
declare global {
  interface HTMLElementEventMap {
    "gg-select-change": CustomEvent<CustomChangeDetail>;
  }
}

const STYLES = /* css */ `
  *, *::before, *::after { box-sizing: border-box; }

  :host {
    display: inline-block;
    width: 100%;
    position: relative;
    font-family: inherit;
    min-width: 200px;
    --cs-radius:        8px;
    --cs-border:rgba(77, 77, 77, 0.25);
    --cs-border-focus:rgba(75, 75, 75, 0.15);
    --cs-focus-ring:    rgba(92, 92, 95, 0.22);
    --cs-text:rgb(235, 235, 235);
    --cs-placeholder:   #9ca3af;
    --cs-surface: var(--material-surface);
    --cs-hover-bg:rgba(36, 37, 39, 0.36);
    --cs-selected-bg:   #eef2ff;
    --cs-selected-text: #3b82f6;
    --cs-selected-mark: #3b82f6;
    --cs-shadow:        0 8px 24px -4px rgba(0,0,0,.12), 0 3px 8px -2px rgba(0,0,0,.07);
    --cs-accent: #3b82f6;
  }
  :host([disabled]) { opacity: .45; pointer-events: none; }

  /* ── Trigger ── */
  .trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 14px;
    background: var(--cs-surface);
    border: 1.5px solid var(--cs-border);
    border-radius: var(--cs-radius);
    font-size: 14px;
    font-weight: 500;
    color: var(--cs-text);
    cursor: pointer;
    user-select: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .trigger:hover { border-color: #9ca3af; }
  .trigger:focus-visible {
    outline: none;
    border-color: var(--cs-border-focus);
    box-shadow: 0 0 0 3px var(--cs-focus-ring);
  }
  .trigger[aria-expanded="true"] {
    border-color: var(--cs-border-focus);
    box-shadow: 0 0 0 3px var(--cs-focus-ring);
  }

  .trigger-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
  .trigger-label.is-placeholder {
    color: var(--cs-placeholder);
    font-weight: 400;
  }

  /* ── Chevron ── */
  .chevron {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    color: #6b7280;
    transition: transform .2s ease;
  }
  .trigger[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  /* ── Dropdown ── */
  .dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 9999;
    background: var(--cs-surface);
    outline: 1.5px solid rgba(109, 109, 109, 0.76);
    border: 2px solid transparent;
    border-radius: var(--cs-radius);
    box-shadow: var(--cs-shadow);
    padding: 5px;
    margin: 0;
    list-style: none;
    max-height: 260px;
    overflow-y: auto;
    transform-origin: top center;
    animation: pop-in .13s ease both;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    backdrop-filter: blur(8px);
  }
  .dropdown[hidden] { display: none; }

  @keyframes pop-in {
    from { opacity: 0; transform: scaleY(.94) translateY(-4px); }
    to   { opacity: 1; transform: scaleY(1)  translateY(0);     }
  }

  /* ── Option rows ── */
  .option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.3rem 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    color: var(--cs-text);
    cursor: pointer;
    transition: background .1s linear;
  }
  .option:hover,
  .option[data-active] { background: var(--cs-accent); }

  .option[aria-selected="true"] {
    background: var(--cs-selected-bg);
    color: var(--cs-selected-text);
    font-weight: 500;
  }
  .option[aria-selected="true"]:hover,
  .option[aria-selected="true"][data-active] { background: #e0e7ff; }

  .option[aria-disabled="true"] {
    color: #d1d5db;
    cursor: not-allowed;
    pointer-events: none;
  }

  .option-text { flex: 1; }

  /* Checkmark */
  .check {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    color: var(--cs-selected-mark);
    visibility: hidden;
  }
  .option[aria-selected="true"] .check { visibility: visible; }

  /* Scrollbar */
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

// ─────────────────────────────────────────────────────────────────────────────
// <custom-select>
// ─────────────────────────────────────────────────────────────────────────────

export class CustomSelect extends HTMLElement {
  static readonly observedAttributes = [
    "placeholder",
    "value",
    "disabled",
    "name",
  ] as const;

  // Shadow-DOM refs (populated in connectedCallback)
  private triggerEl!: HTMLButtonElement;
  private triggerLabelEl!: HTMLSpanElement;
  private dropdownEl!: HTMLUListElement;

  private isOpen = false;
  private activeIdx = -1;
  private slotObserver: MutationObserver | null = null;
  private onDocClick!: (e: MouseEvent) => void;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.cacheRefs();
    this.bindEvents();
    this.syncFromSlot();

    this.slotObserver = new MutationObserver(() => this.syncFromSlot());
    this.slotObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["value", "disabled", "selected"],
    });
  }

  disconnectedCallback(): void {
    this.slotObserver?.disconnect();
    document.removeEventListener("click", this.onDocClick, true);
  }

  attributeChangedCallback(
    name: (typeof CustomSelect.observedAttributes)[number],
    oldVal: string | null,
    newVal: string | null
  ): void {
    if (oldVal === newVal || !this.triggerEl) return;

    switch (name) {
      case "placeholder":
        this.updateTriggerLabel();
        break;
      case "value":
        this.refreshOptionStates();
        this.updateTriggerLabel();
        break;
      case "disabled":
        this.triggerEl.disabled = this.disabled;
        break;
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────

  get value(): string {
    return this.getAttribute("value") ?? "";
  }
  set value(v: string) {
    this.setAttribute("value", v);
  }

  get name(): string {
    return this.getAttribute("name") ?? "";
  }

  get placeholder(): string {
    return this.getAttribute("placeholder") ?? "Select an option";
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  // ── Render ───────────────────────────────────────────────────────────────

  private render(): void {
    this.shadowRoot!.innerHTML = /* html */ `
      <style>${STYLES}</style>
      <button
        class="trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="false"
        ${this.disabled ? "disabled" : ""}
      >
        <span class="trigger-label is-placeholder">${this.placeholder}</span>
        ${CHEVRON_SVG}
      </button>
      <ul class="dropdown" role="listbox" hidden></ul>
      <slot style="display:none"></slot>
    `;
  }

  private cacheRefs(): void {
    this.triggerEl =
      this.shadowRoot!.querySelector<HTMLButtonElement>(".trigger")!;
    this.triggerLabelEl =
      this.shadowRoot!.querySelector<HTMLSpanElement>(".trigger-label")!;
    this.dropdownEl =
      this.shadowRoot!.querySelector<HTMLUListElement>(".dropdown")!;
  }

  // ── Events ───────────────────────────────────────────────────────────────

  private bindEvents(): void {
    this.triggerEl.addEventListener("click", () => this.toggleDropdown());
    this.triggerEl.addEventListener("keydown", (e) => this.onTriggerKeydown(e));

    this.dropdownEl.addEventListener("pointermove", (e) => {
      const opt = (e.target as Element).closest<HTMLLIElement>(".option");
      if (opt) this.setActive(Number(opt.dataset["idx"]));
    });

    this.dropdownEl.addEventListener("click", (e) => {
      const opt = (e.target as Element).closest<HTMLLIElement>(".option");
      if (opt && opt.getAttribute("aria-disabled") !== "true") {
        this.selectByIdx(Number(opt.dataset["idx"]));
        this.closeDropdown();
        this.triggerEl.focus();
      }
    });

    this.dropdownEl.addEventListener("keydown", (e) =>
      this.onDropdownKeydown(e)
    );

    this.onDocClick = (e: MouseEvent) => {
      if (
        !this.contains(e.target as Node) &&
        !this.shadowRoot!.contains(e.target as Node)
      ) {
        this.closeDropdown();
      }
    };
    document.addEventListener("click", this.onDocClick, true);
  }

  private syncFromSlot(): void {
    const options = this.getOptions();
    this.dropdownEl.innerHTML = options
      .map(
        (opt, i) => /* html */ `
          <li
            class="option"
            role="option"
            data-idx="${i}"
            data-value="${this.escAttr(opt.value)}"
            aria-selected="${opt.value === this.value ? "true" : "false"}"
            aria-disabled="${opt.disabled ? "true" : "false"}"
          >
            <span class="option-text">${opt.label}</span>
            ${CHECK_SVG}
          </li>`
      )
      .join("");
    this.updateTriggerLabel();
  }

  private selectByIdx(idx: number): void {
    const options = this.getOptions();
    const chosen = options[idx];
    if (!chosen || chosen.disabled) return;

    this.setAttribute("value", chosen.value);
    this.refreshOptionStates();
    this.updateTriggerLabel();

    const detail: CustomChangeDetail = {
      value: chosen.value,
      label: chosen.label,
      name: this.name,
    };

    this.dispatchEvent(
      new CustomEvent<CustomChangeDetail>("gg-select-change", {
        bubbles: true,
        composed: true, // escapes Shadow DOM
        detail,
      })
    );
  }

  private refreshOptionStates(): void {
    const val = this.value;
    this.dropdownEl.querySelectorAll<HTMLLIElement>(".option").forEach((li) => {
      li.setAttribute(
        "aria-selected",
        li.dataset["value"] === val ? "true" : "false"
      );
    });
  }

  private updateTriggerLabel(): void {
    const options = this.getOptions();
    const match = options.find((o) => o.value === this.value);
    if (match) {
      this.triggerLabelEl.textContent = match.label;
      this.triggerLabelEl.classList.remove("is-placeholder");
    } else {
      this.triggerLabelEl.textContent = this.placeholder;
      this.triggerLabelEl.classList.add("is-placeholder");
    }
  }

  private toggleDropdown(): void {
    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }

  private openDropdown(): void {
    this.isOpen = true;
    this.triggerEl.setAttribute("aria-expanded", "true");
    this.dropdownEl.removeAttribute("hidden");

    // Jump keyboard focus to the currently selected option (or first)
    const items = this.dropdownItems();
    let startIdx = 0;
    items.forEach((item, i) => {
      if (item.getAttribute("aria-selected") === "true") startIdx = i;
    });
    this.setActive(startIdx);
  }

  private closeDropdown(): void {
    this.isOpen = false;
    this.triggerEl.setAttribute("aria-expanded", "false");
    this.dropdownEl.setAttribute("hidden", "");
    this.clearActive();
  }

  // ── Keyboard ─────────────────────────────────────────────────────────────

  private onTriggerKeydown(e: KeyboardEvent): void {
    const handled = ["ArrowDown", "ArrowUp", "Enter", " "];
    if (!handled.includes(e.key)) return;
    e.preventDefault();

    if (!this.isOpen) {
      this.openDropdown();
      return;
    }

    if (e.key === "ArrowDown") this.moveActive(1);
    else if (e.key === "ArrowUp") this.moveActive(-1);
    else if (e.key === "Enter" || e.key === " ") {
      if (this.activeIdx >= 0) {
        this.selectByIdx(this.activeIdx);
        this.closeDropdown();
      }
    }
  }

  private onDropdownKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.closeDropdown();
      this.triggerEl.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.moveActive(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (this.activeIdx >= 0) {
        this.selectByIdx(this.activeIdx);
        this.closeDropdown();
        this.triggerEl.focus();
      }
    } else if (e.key === "Tab") {
      this.closeDropdown();
    }
  }

  // ── Active item ──────────────────────────────────────────────────────────

  private setActive(idx: number): void {
    const items = this.dropdownItems();
    this.clearActive();
    if (idx < 0 || idx >= items.length) return;
    this.activeIdx = idx;
    items[idx].setAttribute("data-active", "");
    items[idx].scrollIntoView({ block: "nearest" });
  }

  private clearActive(): void {
    this.dropdownItems().forEach((li) => li.removeAttribute("data-active"));
    this.activeIdx = -1;
  }

  private moveActive(dir: 1 | -1): void {
    const items = this.dropdownItems();
    const len = items.length;
    if (!len) return;

    let next = (((this.activeIdx + dir) % len) + len) % len;
    let guard = 0;
    while (
      items[next].getAttribute("aria-disabled") === "true" &&
      guard < len
    ) {
      next = (next + dir + len) % len;
      guard++;
    }
    this.setActive(next);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private dropdownItems(): HTMLLIElement[] {
    return [...this.dropdownEl.querySelectorAll<HTMLLIElement>(".option")];
  }

  private getOptions(): SelectOption[] {
    return [...this.querySelectorAll<HTMLElement>("gg-option")].map((el) => ({
      value: el.getAttribute("value") ?? el.textContent?.trim() ?? "",
      label: el.textContent?.trim() ?? "",
      disabled: el.hasAttribute("disabled"),
    }));
  }

  private escAttr(str: string): string {
    return str.replace(/"/g, "&quot;");
  }
}

if (!customElements.get("gg-select")) {
  if (!customElements.get("gg-select")) customElements.define("gg-select", CustomSelect);
}

declare global {
  interface HTMLElementTagNameMap {
    "gg-select": CustomSelect;
  }
}
