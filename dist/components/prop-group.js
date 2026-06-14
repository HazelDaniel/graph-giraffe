export class GGInputPair extends HTMLElement {
    static get observedAttributes() {
        return ['label', 'value', 'uiprimitive', 'options'];
    }
    container;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.container = document.createElement('div');
        this.shadowRoot.appendChild(this.container);
    }
    connectedCallback() {
        this.render();
    }
    attributeChangedCallback() {
        if (this.isConnected) {
            this.render();
        }
    }
    get value() {
        const input = this.shadowRoot.querySelector('input, gg-select');
        if (!input)
            return '';
        if (input instanceof HTMLInputElement && input.type === 'checkbox') {
            return input.checked;
        }
        return input.value;
    }
    set value(val) {
        this.setAttribute('value', String(val));
    }
    render() {
        const labelText = this.getAttribute('label') || '';
        const valAttr = this.getAttribute('value') || '';
        const uiprimitive = this.getAttribute('uiprimitive') || 'text';
        const optionsAttr = this.getAttribute('options') || '';
        this.container.innerHTML = `
      <style>
        .pair-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          width: 100%;
          margin-bottom: 8px;
          font-family: inherit;
        }
        label {
          font-weight: 500;
          color: var(--text-main, #e2e8f0);
          flex: 1;
          font-size: 0.8rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--accent, #38bdf8);
        }
        input[type="text"], input[type="number"], input[type="range"] {
          flex: 1.5;
          padding: 6px 10px;
          background: var(--cs-surface, #1e293b);
          border: 1px solid var(--cs-border, rgba(77, 77, 77, 0.25));
          border-radius: 6px;
          color: #f8fafc;
          font-size: 14px;
          outline: none;
          max-width: 160px;
        }
        gg-select {
          flex: 1.5;
          max-width: 160px;
        }
      </style>
      <div class="pair-row">
        <label title="${labelText}">${labelText}</label>
        ${this.renderInput(uiprimitive, valAttr, optionsAttr)}
      </div>
    `;
        const input = this.shadowRoot.querySelector('input, gg-select');
        if (input) {
            input.addEventListener('change', () => {
                this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            });
            input.addEventListener('input', () => {
                this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            });
            input.addEventListener('gg-select-change', () => {
                this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            });
        }
    }
    renderInput(uiprimitive, value, optionsAttr) {
        if (uiprimitive === 'checkbox') {
            const isChecked = value === 'true' || value === '1';
            return `<input type="checkbox" ${isChecked ? 'checked' : ''}>`;
        }
        if (uiprimitive === 'select') {
            const options = optionsAttr ? optionsAttr.split(',') : [];
            return `
        <gg-select value="${value}">
          ${options.map(opt => `<gg-option value="${opt.trim()}">${opt.trim()}</gg-option>`).join('')}
        </gg-select>
      `;
        }
        return `<input type="${uiprimitive}" value="${value}">`;
    }
}
export class GGInputGroup extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        const groupName = this.getAttribute('id') || 'group';
        this.shadowRoot.innerHTML = `
      <style>
        fieldset {
          border: 1px solid var(--glass-border, rgba(77, 77, 77, 0.25));
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
          background: rgba(30, 41, 59, 0.1);
        }
        legend {
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent, #38bdf8);
          padding: 0 6px;
        }
      </style>
      <fieldset>
        <legend>${groupName}</legend>
        <slot></slot>
      </fieldset>
    `;
    }
}
export class GGPropGroup extends HTMLElement {
    useProps(data) {
        this.innerHTML = '';
        // 1. Render ungrouped properties first
        // Ungrouped Booleans
        if (data.booleans && data.booleans.ungrouped) {
            for (const item of data.booleans.ungrouped) {
                const pair = this.createPair(item);
                this.appendChild(pair);
            }
        }
        // Ungrouped Texts
        if (data.texts && data.texts.ungrouped) {
            for (const item of data.texts.ungrouped) {
                const pair = this.createPair(item);
                this.appendChild(pair);
            }
        }
        // Ungrouped Enums
        if (data.enums && data.enums.ungrouped) {
            for (const item of data.enums.ungrouped) {
                const pair = this.createPair(item);
                this.appendChild(pair);
            }
        }
        // 2. Render grouped properties in order of groups key
        if (data.groups) {
            for (const groupKey of data.groups) {
                const groupEl = document.createElement('gg-input-group');
                groupEl.setAttribute('id', groupKey);
                const groupBooleans = (data.booleans && data.booleans[groupKey]) || [];
                const groupTexts = (data.texts && data.texts[groupKey]) || [];
                const groupEnums = (data.enums && data.enums[groupKey]) || [];
                for (const item of groupBooleans) {
                    groupEl.appendChild(this.createPair(item, false));
                }
                for (const item of groupTexts) {
                    groupEl.appendChild(this.createPair(item, false));
                }
                for (const item of groupEnums) {
                    groupEl.appendChild(this.createPair(item, false));
                }
                this.appendChild(groupEl);
            }
        }
        // Attach event listeners to child elements with IDs
        this.attachEventListeners();
        // Validate DOM tree structure
        this.validateDOM();
        // Calculate Expanded Body Height
        return this.calculateExpandedHeight(data);
    }
    createPair(item, assignId = true) {
        const pair = document.createElement('gg-input-pair');
        pair.setAttribute('label', item.label);
        pair.setAttribute('uiprimitive', item.uiPrimitive);
        pair.setAttribute('value', String(item.value));
        if (item.options) {
            pair.setAttribute('options', item.options.join(','));
        }
        if (assignId) {
            const pairId = item.label.toLowerCase().replace(/\s+/g, '-');
            pair.setAttribute('id', pairId);
        }
        return pair;
    }
    attachEventListeners() {
        const childrenWithId = this.querySelectorAll('[id]');
        childrenWithId.forEach((child) => {
            child.addEventListener('change', (e) => this.handleEvent(e));
            child.addEventListener('input', (e) => this.handleEvent(e));
        });
    }
    handleEvent(e) {
        e.stopPropagation();
        const target = e.target;
        const pair = target.closest('gg-input-pair');
        if (!pair)
            return;
        const label = pair.getAttribute('label') || '';
        const uiPrimitive = pair.getAttribute('uiprimitive') || '';
        const value = pair.value;
        this.dispatchEvent(new CustomEvent('gg-prop-change', {
            bubbles: true,
            composed: true,
            detail: { label, value, uiPrimitive }
        }));
    }
    validateDOM() {
        for (const child of this.children) {
            const tag = child.tagName.toLowerCase();
            if (tag !== 'gg-input-pair' && tag !== 'gg-input-group') {
                throw new Error(`Invalid DOM structure inside gg-prop-group: direct child <${tag}> is not allowed.`);
            }
            if (tag === 'gg-input-group') {
                for (const nestedChild of child.children) {
                    const nestedTag = nestedChild.tagName.toLowerCase();
                    if (nestedTag !== 'gg-input-pair') {
                        throw new Error(`Invalid DOM structure inside gg-input-group: nested child <${nestedTag}> is not allowed.`);
                    }
                }
            }
        }
    }
    calculateExpandedHeight(data) {
        let numLines = 0;
        // Ungrouped
        const ungBooleans = (data.booleans && data.booleans.ungrouped) || [];
        const ungTexts = (data.texts && data.texts.ungrouped) || [];
        const ungEnums = (data.enums && data.enums.ungrouped) || [];
        numLines += ungBooleans.length + ungTexts.length + ungEnums.length;
        // Grouped
        if (data.groups) {
            for (const groupKey of data.groups) {
                numLines += 1; // subheading line
                const gBooleans = (data.booleans && data.booleans[groupKey]) || [];
                const gTexts = (data.texts && data.texts[groupKey]) || [];
                const gEnums = (data.enums && data.enums[groupKey]) || [];
                numLines += gBooleans.length + gTexts.length + gEnums.length;
            }
        }
        const baseHeight = 50;
        const lineHeight = 20;
        const bottomPadding = 15;
        return baseHeight + numLines * lineHeight + bottomPadding;
    }
}
if (!customElements.get('gg-input-pair')) {
    customElements.define('gg-input-pair', GGInputPair);
}
if (!customElements.get('gg-input-group')) {
    customElements.define('gg-input-group', GGInputGroup);
}
if (!customElements.get('gg-prop-group')) {
    customElements.define('gg-prop-group', GGPropGroup);
}
//# sourceMappingURL=prop-group.js.map