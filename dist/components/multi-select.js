const STYLES = /* css */ `
  :host { display: inline-block; width: 100%; position: relative; font-family: inherit; }
  *, *::before, *::after { box-sizing: border-box; }
  .trigger {
    display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 14px;
    background: var(--cs-surface, #202124); border: 1.5px solid var(--cs-border, #4d4d4d);
    border-radius: 8px; color: var(--cs-text, #ebebeb); cursor: pointer; text-align: left;
  }
  .trigger-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chevron { width: 16px; height: 16px; transition: transform .2s ease; }
  .trigger[aria-expanded="true"] .chevron { transform: rotate(180deg); }
  .dropdown {
    position: absolute; z-index: 9999; top: calc(100% + 6px); left: 0; right: 0;
    max-height: 260px; overflow-y: auto; padding: 5px; margin: 0; list-style: none;
    background: var(--cs-surface, #202124); border: 1px solid var(--cs-border, #4d4d4d);
    border-radius: 8px; box-shadow: 0 8px 24px #0005;
  }
  .dropdown[hidden] { display: none; }
  .option { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 4px; color: var(--cs-text, #ebebeb); cursor: pointer; }
  .option:hover, .option[data-active] { background: var(--cs-hover-bg, #35363a); }
  .option[aria-selected="true"] { background: var(--cs-selected-bg, #eef2ff); color: var(--cs-selected-text, #3b82f6); }
  .check { width: 14px; height: 14px; border: 1px solid currentColor; border-radius: 3px; display: grid; place-items: center; }
  .option[aria-selected="true"] .check::after { content: "✓"; font-size: 11px; }
  .option-text { flex: 1; }
  ::slotted(gg-option) { display: none; }
`;
export class MultiSelect extends HTMLElement {
    static observedAttributes = ["disabled", "name"];
    triggerEl;
    triggerLabelEl;
    dropdownEl;
    valuesState = [];
    activeIdx = -1;
    isOpen = false;
    slotObserver = null;
    onDocClick;
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
        this.render();
        this.triggerEl = this.shadowRoot.querySelector(".trigger");
        this.triggerLabelEl = this.shadowRoot.querySelector(".trigger-label");
        this.dropdownEl = this.shadowRoot.querySelector(".dropdown");
        this.bindEvents();
        this.syncFromSlot();
        this.slotObserver = new MutationObserver(() => this.syncFromSlot());
        this.slotObserver.observe(this, { childList: true, subtree: true, attributes: true });
    }
    disconnectedCallback() {
        this.slotObserver?.disconnect();
        document.removeEventListener("click", this.onDocClick, true);
    }
    get values() {
        return [...this.valuesState];
    }
    set values(values) {
        this.valuesState = [...new Set(values)];
        if (this.dropdownEl)
            this.syncFromSlot();
    }
    get name() {
        return this.getAttribute("name") ?? "";
    }
    render() {
        this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <button class="trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
        <span class="trigger-label">Select one or more options</span>
        <svg class="chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <ul class="dropdown" role="listbox" aria-multiselectable="true" hidden></ul>
      <slot></slot>
    `;
    }
    bindEvents() {
        this.triggerEl.addEventListener("click", () => this.toggleDropdown());
        this.triggerEl.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                this.toggleDropdown();
            }
        });
        this.dropdownEl.addEventListener("click", (event) => {
            const option = event.target.closest(".option");
            if (!option)
                return;
            this.toggleValue(option.dataset.value ?? "");
        });
        this.dropdownEl.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                this.closeDropdown();
                this.triggerEl.focus();
            }
        });
        this.onDocClick = (event) => {
            if (!this.contains(event.target) && !this.shadowRoot.contains(event.target)) {
                this.closeDropdown();
            }
        };
        document.addEventListener("click", this.onDocClick, true);
    }
    getOptions() {
        return [...this.querySelectorAll("gg-option")].map((option) => ({
            value: option.getAttribute("value") ?? option.textContent?.trim() ?? "",
            label: option.textContent?.trim() ?? "",
        }));
    }
    syncFromSlot() {
        const options = this.getOptions();
        const allowed = new Set(options.map((option) => option.value));
        this.valuesState = this.valuesState.filter((value) => allowed.has(value));
        this.dropdownEl.innerHTML = options.map((option) => `
      <li class="option" role="option" tabindex="0" data-value="${this.escape(option.value)}" aria-selected="${this.valuesState.includes(option.value)}">
        <span class="check" aria-hidden="true"></span><span class="option-text">${this.escape(option.label)}</span>
      </li>`).join("");
        this.updateTriggerLabel(options);
    }
    toggleValue(value) {
        if (!value)
            return;
        this.valuesState = this.valuesState.includes(value)
            ? this.valuesState.filter((entry) => entry !== value)
            : [...this.valuesState, value];
        this.syncFromSlot();
        const labels = this.getOptions()
            .filter((option) => this.valuesState.includes(option.value))
            .map((option) => option.label);
        this.dispatchEvent(new CustomEvent("gg-multi-select-change", {
            bubbles: true,
            composed: true,
            detail: { values: [...this.valuesState], labels, name: this.name },
        }));
    }
    updateTriggerLabel(options) {
        const labels = options.filter((option) => this.valuesState.includes(option.value)).map((option) => option.label);
        this.triggerLabelEl.textContent = labels.length ? labels.join(", ") : "Select one or more options";
    }
    toggleDropdown() {
        this.isOpen ? this.closeDropdown() : this.openDropdown();
    }
    openDropdown() {
        this.isOpen = true;
        this.triggerEl.setAttribute("aria-expanded", "true");
        this.dropdownEl.removeAttribute("hidden");
    }
    closeDropdown() {
        this.isOpen = false;
        this.triggerEl.setAttribute("aria-expanded", "false");
        this.dropdownEl.setAttribute("hidden", "");
    }
    escape(value) {
        return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    }
}
if (!customElements.get("gg-multi-select")) {
    customElements.define("gg-multi-select", MultiSelect);
}
//# sourceMappingURL=multi-select.js.map