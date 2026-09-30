import "./multi-select.js";
class GGInputPair extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #e2e8f0;
          gap: 0.4rem;
        }
        :host(.row) {
          flex-direction: row;
        }
        label {
          flex: 1;
          margin-right: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .control-container {
          flex: 2;
          display: flex;
          justify-content: flex-end;
        }
        ::slotted(input[type="text"]) {
          width: 100%;
          background: #1e293b;
          border: 1px solid #334155;
          color: #f8fafc;
          border-radius: 4px;
          padding: 4px 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          box-sizing: border-box;
        }
        ::slotted(input[type="checkbox"]) {
          accent-color: #2C9F92;
          width: 16px;
          height: 16px;
          border-radius: 0.8rem;
        }

        ::slotted(input[type="range"]) {
          min-width: 12rem;
          accent-color: #2C9F92;
        }
        ::slotted(gg-select) {
          width: 100%;
        }
        ::slotted(gg-multi-select) {
          width: 100%;
        }
      </style>
      <label id="lbl"></label>
      <div class="control-container">
        <slot></slot>
      </div>
    `;
    }
    set label(text) {
        this.shadowRoot.getElementById("lbl").textContent = text;
    }
}
customElements.define("gg-input-pair", GGInputPair);
class GGInputGroup extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 16px;
        }
        fieldset {
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 12px;
          margin: 0;
          background:rgba(44, 159, 146, 0.1);
        }
        legend {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0 4px;
        }
      </style>
      <fieldset>
        <legend id="leg"></legend>
        <slot></slot>
      </fieldset>
    `;
    }
    set legend(text) {
        this.shadowRoot.getElementById("leg").textContent = text;
    }
}
customElements.define("gg-input-group", GGInputGroup);
export class GGPropGroup extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px 0;
          max-height: 100%;
          box-sizing: border-box;
          width: 100%;
          overflow: hidden;
        }

        :host>#container {
          width: 100%;
          overflow-y: auto;
        }
      </style>
      <div id="container" part="root"></div>
    `;
        const container = this.shadowRoot.getElementById("container");
        // Controls are rebuilt when a descriptor changes its declarative shape.
        // Keep the event bridge on this stable host instead of attaching handlers
        // to each generated control, so one edit cannot invalidate later edits.
        container.addEventListener("change", (event) => {
            const target = event.target;
            if (!target?.dataset.propLabel)
                return;
            // `change` is retargeted to gg-input-pair at this shadow boundary. The
            // native control remains slotted in the pair's light DOM, so read from
            // that control rather than from the pair host itself.
            const input = target instanceof HTMLInputElement
                ? target
                : target.querySelector("input");
            if (!input)
                return;
            this.dispatchPropChange(target.dataset.propLabel, input.type === "checkbox" ? input.checked : input.value, target.dataset.uiPrimitive ?? input.type);
        });
        container.addEventListener("gg-select-change", (event) => {
            const target = event.target;
            const detail = event.detail;
            if (!target?.dataset.propLabel || !detail)
                return;
            this.dispatchPropChange(target.dataset.propLabel, detail.value, target.dataset.uiPrimitive ?? "select");
        });
        container.addEventListener("gg-multi-select-change", (event) => {
            const target = event.target;
            const detail = event.detail;
            if (!target?.dataset.propLabel || !detail)
                return;
            this.dispatchPropChange(target.dataset.propLabel, detail.values, target.dataset.uiPrimitive ?? "multi-select");
        });
    }
    /**
     * Generates the DOM based on the NodePropType data.
     * Returns the estimated height of the WebGL node body based on the properties.
     */
    useProps(data) {
        const container = this.shadowRoot.getElementById("container");
        container.innerHTML = "";
        // We will estimate WebGL node height based on the number of items.
        let lineCount = 0;
        // Helper to create an input element based on primitive type
        const createControl = (primitive) => {
            const { label, value, uiPrimitive, options } = primitive;
            let control;
            if (uiPrimitive === "select") {
                control = document.createElement("gg-select");
                control.dataset.propLabel = label;
                control.dataset.uiPrimitive = uiPrimitive;
                // We assume gg-select has an 'options' setter and 'value' property.
                // For now, we'll just set its value attribute.
                control.setAttribute("value", value);
                if (Array.isArray(options)) {
                    for (const option of options) {
                        const optionTemplate = `<gg-option value="${option}">${option}</gg-option>`;
                        control.insertAdjacentHTML("beforeend", optionTemplate);
                    }
                }
            }
            else if (uiPrimitive === "multi-select") {
                control = document.createElement("gg-multi-select");
                control.dataset.propLabel = label;
                control.dataset.uiPrimitive = uiPrimitive;
                control.values = Array.isArray(value) ? value : [];
                if (Array.isArray(options)) {
                    for (const option of options) {
                        const optionTemplate = `<gg-option value="${option}">${option}</gg-option>`;
                        control.insertAdjacentHTML("beforeend", optionTemplate);
                    }
                }
            }
            else {
                const input = document.createElement("input");
                input.type = uiPrimitive === "checkbox" ? "checkbox" : uiPrimitive; // fallback to text
                input.dataset.propLabel = label;
                input.dataset.uiPrimitive = uiPrimitive;
                if (uiPrimitive === "checkbox") {
                    input.checked = value;
                }
                else {
                    input.value = value;
                }
                control = input;
            }
            return control;
        };
        // Helper to create a gg-input-pair
        const createPair = (primitive) => {
            const pair = document.createElement("gg-input-pair");
            // Events crossing the pair's shadow root are retargeted to this host.
            // Keep the field identity here so the stable delegated listener can
            // resolve the edit without reaching through the shadow boundary.
            pair.dataset.propLabel = primitive.label;
            pair.dataset.uiPrimitive = primitive.uiPrimitive;
            if ("uiPrimitive" in primitive && primitive["uiPrimitive"] === "checkbox")
                pair.classList.add("row");
            pair.label = primitive.label;
            const control = createControl(primitive);
            pair.appendChild(control);
            return pair;
        };
        const ungrouped = [
            ...(data.booleans["ungrouped"] || []),
            ...(data.texts["ungrouped"] || []),
            ...(data.enums["ungrouped"] || []),
        ];
        for (const item of ungrouped) {
            container.appendChild(createPair(item));
            lineCount++;
        }
        for (const groupName of data.groups) {
            const groupItems = [
                ...(data.booleans[groupName] || []),
                ...(data.texts[groupName] || []),
                ...(data.enums[groupName] || []),
            ];
            if (groupItems.length > 0) {
                const groupEl = document.createElement("gg-input-group");
                groupEl.legend = groupName;
                // Group heading counts as a line
                lineCount++;
                for (const item of groupItems) {
                    groupEl.appendChild(createPair(item));
                    lineCount++;
                }
                container.appendChild(groupEl);
            }
        }
        // headerHeight (30) + top padding (16) + (lineCount * 20) + bottom padding (16) + padding due to group spacing (8 * num_groups)
        return 30 + 16 + lineCount * 20 + 16 + (8 * data.groups.length);
    }
    dispatchPropChange(label, value, uiPrimitive) {
        const payload = { label, value, uiPrimitive };
        this.dispatchEvent(new CustomEvent("gg-prop-change", {
            detail: payload,
            bubbles: true,
            composed: true,
        }));
    }
}
customElements.define("gg-prop-group", GGPropGroup);
//# sourceMappingURL=prop-group.js.map