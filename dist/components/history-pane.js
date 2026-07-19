const STYLE_TEMPLATE = `
  :host {
    position: absolute;
    top: 0.8rem;
    left: 2rem;
    display: flex;
    padding: 0.8rem 1rem;
    gap: 0.8rem;
    z-index: 10;
  }

  :host>.root {
    top: inherit;
    right: inherit;
    left: inherit;
    bottom: inherit;
    height: inherit;
    width: inherit;
    display: flex;
    flex-direction: inherit;
    gap: inherit;
  }

  :host button {
    border-radius: 1rem;
    cursor: pointer;
  }

  :host button::selection {
    background: transparent;
  }

  button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    color: var(--text-main);
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
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
export class HistoryPane extends HTMLElement {
    #shadow = this.attachShadow({ mode: "open" });
    connectedCallback() {
        this.render();
    }
    render() {
        this.#shadow.innerHTML = `
    <style>
      ${STYLE_TEMPLATE}
    </style>

    ${this.getChildrenTemplate()}
  `;
    }
    getChildrenTemplate() {
        return `
    <div class="root" part="root">
      <button id="btn-undo" class="secondary" disabled>Undo</button>
      <button id="btn-redo" class="secondary" disabled>Redo</button>
    </div>
    `;
    }
}
if (!customElements.get("gg-history-pane"))
    customElements.define("gg-history-pane", HistoryPane);
//# sourceMappingURL=history-pane.js.map