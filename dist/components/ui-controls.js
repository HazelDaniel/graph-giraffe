const STYLE_TEMPLATE = `
      :host {
        position: absolute;
        top: 2.5vh;
        right: 0;
        height: 95vh;
        width: 280px;
        background: var(--glass-bg);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-left: 1px solid var(--glass-border);
        border: inset 2px solid transparent;
        box-shadow: -8px 0 32px rgba(0, 0, 0, 0.3);
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 20;
        border-radius: var(--radius-md) 0 0 var(--radius-md);
      }

      :host>.root {
        top: inherit;
        right: inherit;
        position: inherit;
        height: inherit;
        width: inherit;
        display: flex;
        flex-direction: inherit;
      }

      .sidebar-toggle {
        position: absolute;
        left: -24px;
        top: 20px;
        width: 24px;
        height: 48px;
        background: var(--glass-bg);
        backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border);
        border-right: none;
        border-radius: 8px 0 0 8px;
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0;
        box-shadow: -4px 4px 12px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }

      .sidebar-toggle svg {
        transform: scale(-0.8, 0.8);
      }

      .sidebar-toggle:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--accent);
      }

      :host(.collapsed) {
        transform: translateX(100%);
      }

      :host(.collapsed) .sidebar-toggle svg {
        transform: scale(0.8, 0.8);
      }

      .sidebar-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        font-size: 0.8rem;
      }

      .settings-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .settings-group.vertical {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        width: 100%;
      }

      .sidebar-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .section-header {
        font-size: 0.6rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: rgb(95, 95, 95);
        border-bottom: 1px solid var(--glass-border);
        padding-bottom: 6px;
        margin-bottom: 4px;
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

      .controls {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      button:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }

      button:active {
        transform: scale(0.98);
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      input[type="color" i] {
        display: block;
        border: none;
        outline: none;
        width: 2rem;
        border-radius: 50%;
        color: transparent;
        background-color: unset;
        height: 2rem;
        border-radius: 2rem;
      }

      input[type="color" i]::-webkit-color-swatch {
        border-radius: 50%;
        border: 1px solid var(--glass-border);
      }

      input[type="text"] {
        width: 90%;
        padding: 0.5rem 0.5rem;
        background-color: var(--material-surface);
        border: none;
        outline: none;
        color: white;
        border-radius: 0.3rem;
      }

`;
export class UIControls extends HTMLElement {
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
    <button
        id="sidebar-toggle"
        class="sidebar-toggle"
        aria-label="Toggle sidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 19L8 12L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
      </button>
      <div class="sidebar-content">
        <div class="sidebar-section">
          <div class="section-header">Canvas</div>
          <div class="settings-group">
            <label for="bg-color-picker">Color</label>
            <input type="color" id="bg-color-picker" value="#0f172a" />
          </div>

          <div class="settings-group vertical">
            <label for="theme-selector">Node Theme</label>
            <gg-select id="theme-selector">
              <gg-option value="dark">Dark (Glass)</gg-option>
              <gg-option value="light">Light</gg-option>
              <gg-option value="neon">Neon</gg-option>
            </gg-select>
          </div>

          <div class="settings-group vertical">
            <label for="texture-selector">Texture Theme</label>
            <gg-texture-select id="texture-selector">
            </gg-texture-select>
          </div>

        </div>

        <div id="node-properties" class="sidebar-section" style="display: none">
          <div class="section-header">Properties</div>
          <div class="settings-group vertical">
            <label for="node-label-input">Label</label>
            <input
              type="text"
              id="node-label-input"
              placeholder="Node label..."
              class="text-input"
            />
          </div>
        </div>
      </div>

    </div>

    `;
    }
}
if (!customElements.get("gg-ui-controls"))
    customElements.define("gg-ui-controls", UIControls);
//# sourceMappingURL=ui-controls.js.map