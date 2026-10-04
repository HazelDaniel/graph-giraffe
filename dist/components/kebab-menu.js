const STYLE_TEMPLATE = `
  :host {
    position: absolute;
    top: 0.8rem;
    left: 12.2rem;
    display: inline-flex;
    padding: 0.8rem 0;
    z-index: 10;
  }

  .root {
    position: relative;
    display: inline-flex;
  }

  button.kebab-button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.15));
    color: var(--text-main, #f8fafc);
    width: 42px;
    height: 42px;
    padding: 0;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    outline: none;
  }

  button.kebab-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--accent, #38bdf8);
  }

  button.kebab-button:active {
    transform: scale(0.96);
  }

  button.kebab-button.active {
    background: rgba(255, 255, 255, 0.12);
    border-color: var(--accent, #38bdf8);
    color: var(--accent, #38bdf8);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: -280%;
    min-width: 150px;
    background: rgba(22, 22, 22, 0.94);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.15));
    border-radius: 8px;
    padding: 6px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 100;
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  .dropdown-menu.hidden {
    display: none;
    opacity: 0;
    pointer-events: none;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    width: 100%;
    border: none;
    background: transparent;
    color: var(--text-main, #f8fafc);
    font-size: 0.85rem;
    font-family: inherit;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s ease, color 0.15s ease;
    box-sizing: border-box;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--accent, #38bdf8);
  }

  .menu-item svg {
    flex-shrink: 0;
    opacity: 0.85;
  }

  .menu-item:hover svg {
    opacity: 1;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;
export class KebabMenu extends HTMLElement {
    #shadow = this.attachShadow({ mode: "open" });
    isOpen = false;
    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }
    disconnectedCallback() {
        document.removeEventListener("pointerdown", this.handleOutsideClick);
    }
    setupEventListeners() {
        const btn = this.#shadow.querySelector("#btn-kebab");
        btn?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggle();
        });
        const dropdown = this.#shadow.querySelector("#kebab-dropdown");
        dropdown?.addEventListener("click", (e) => {
            const target = e.target;
            const button = target?.closest("button[data-action]");
            if (!button)
                return;
            const action = button.dataset.action;
            if (!action)
                return;
            e.preventDefault();
            e.stopPropagation();
            this.close();
            this.dispatchEvent(new CustomEvent("gg-kebab-action", {
                detail: { action },
                bubbles: true,
                composed: true,
            }));
        });
        document.addEventListener("pointerdown", this.handleOutsideClick);
    }
    handleOutsideClick = (e) => {
        if (!this.isOpen)
            return;
        const path = e.composedPath();
        if (!path.includes(this)) {
            this.close();
        }
    };
    toggle() {
        if (this.isOpen) {
            this.close();
        }
        else {
            this.open();
        }
    }
    open() {
        if (this.isOpen)
            return;
        this.isOpen = true;
        const dropdown = this.#shadow.querySelector("#kebab-dropdown");
        const btn = this.#shadow.querySelector("#btn-kebab");
        dropdown?.classList.remove("hidden");
        btn?.classList.add("active");
        btn?.setAttribute("aria-expanded", "true");
    }
    close() {
        if (!this.isOpen)
            return;
        this.isOpen = false;
        const dropdown = this.#shadow.querySelector("#kebab-dropdown");
        const btn = this.#shadow.querySelector("#btn-kebab");
        dropdown?.classList.add("hidden");
        btn?.classList.remove("active");
        btn?.setAttribute("aria-expanded", "false");
    }
    render() {
        this.#shadow.innerHTML = `
      <style>${STYLE_TEMPLATE}</style>
      <div class="root" part="root">
        <button
          id="btn-kebab"
          class="kebab-button"
          type="button"
          aria-label="More options"
          aria-expanded="false"
          aria-haspopup="true"
          title="More options"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="2.25" fill="currentColor"/>
            <circle cx="12" cy="12" r="2.25" fill="currentColor"/>
            <circle cx="12" cy="19" r="2.25" fill="currentColor"/>
          </svg>
        </button>
        <div id="kebab-dropdown" class="dropdown-menu hidden" role="menu" aria-label="Options menu">
          <button type="button" class="menu-item" data-action="import" role="menuitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Import</span>
          </button>
          <button type="button" class="menu-item" data-action="export" role="menuitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>
    `;
    }
}
if (!customElements.get("gg-kebab-menu")) {
    if (!customElements.get("gg-kebab-menu"))
        customElements.define("gg-kebab-menu", KebabMenu);
}
//# sourceMappingURL=kebab-menu.js.map