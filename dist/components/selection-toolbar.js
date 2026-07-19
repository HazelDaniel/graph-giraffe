const STYLE_TEMPLATE = `
  :host {
    position: absolute;
    display: none;
    z-index: 30;
    pointer-events: auto;
    left: 0;
    top: 0;
    transform: translate(-86%, calc(-100% - 16px));
    contain: layout style paint;
    will-change: transform, left, top;
  }

  :host>.root {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem;
    border-radius: 0.45rem;
    background: rgba(18, 18, 18, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
  }

  button {
    width: 2rem;
    height: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.35rem;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(248, 250, 252, 0.96);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font: 600 0.85rem/1 Inter, sans-serif;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.22);
  }

  button:active {
    transform: translateY(1px);
  }

  button span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
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
export class SelectionToolbar extends HTMLElement {
    #shadow = this.attachShadow({ mode: "open" });
    actions = [];
    visible = false;
    posX = 0;
    posY = 0;
    actionSignature = "";
    constructor() {
        super();
        this.#shadow.addEventListener("click", (e) => {
            const target = e.target;
            const button = target?.closest("button[data-action]");
            if (!button)
                return;
            const action = button.dataset.action;
            if (!action)
                return;
            e.preventDefault();
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent("gg-selection-toolbar-action", {
                detail: { action },
                bubbles: true,
                composed: true,
            }));
        });
    }
    connectedCallback() {
        this.render();
    }
    setActions(actions) {
        const signature = actions.map((action) => action.action).join("|");
        if (signature === this.actionSignature)
            return;
        this.actionSignature = signature;
        this.actions = actions;
        this.render();
    }
    setPosition(screenX, screenY) {
        if (this.posX === screenX && this.posY === screenY)
            return;
        this.posX = screenX;
        this.posY = screenY;
        this.style.left = `${Math.round(screenX)}px`;
        this.style.top = `${Math.round(screenY)}px`;
        // this.style.transform = `translate(${Math.round(screenX)}px, ${Math.round(screenY) - parseInt(getComputedStyle(this).height) + 2}px)`;
    }
    show() {
        if (this.visible)
            return;
        this.visible = true;
        this.style.display = "block";
    }
    hide() {
        if (!this.visible)
            return;
        this.visible = false;
        this.style.display = "none";
    }
    render() {
        this.#shadow.innerHTML = `
      <style>${STYLE_TEMPLATE}</style>
      <div class="root" part="root" aria-label="Selection actions" role="toolbar">
        ${this.actions
            .map((action) => `
              <button
                type="button"
                data-action="${action.action}"
                aria-label="${action.label}"
                title="${action.label}"
              >
                <span aria-hidden="true">${action.glyph}</span>
                <span class="sr-only">${action.label}</span>
              </button>
            `)
            .join("")}
      </div>
    `;
        this.setPosition(this.posX, this.posY);
        if (!this.visible) {
            this.style.display = "none";
        }
    }
}
if (!customElements.get("gg-selection-toolbar")) {
    customElements.define("gg-selection-toolbar", SelectionToolbar);
}
//# sourceMappingURL=selection-toolbar.js.map