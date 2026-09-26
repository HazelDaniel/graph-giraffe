/**
 * Bundled DOM views ("skins") re-creating each built-in node type as a custom
 * element. These are the default DOM implementations of the built-ins; custom
 * skins replace them by registering a descriptor whose `domRenderer` builds
 * the consumer's own view (see `createCustomElementDomRenderer` and
 * `DOM_NODE_DESCRIPTORS`).
 *
 * Views are purely presentational: the DomNodeLayer positions and sizes them
 * to the node's world rect inside the camera-scaled overlay layer, keeps them
 * `pointer-events: none`, and calls `update(node)` whenever node state changes.
 * All host-level attributes (`data-selected`, `data-locked`, `data-collapsed`,
 * `data-drop-target`) are managed by the layer; the inner card is inset so the
 * WebGL-drawn connection handles stay visible at the node edges.
 */
const BASE_STYLE = `
  :host { display: block; }
  .card {
    position: absolute;
    inset: 6px;
    border-radius: 10px;
    overflow: hidden;
    box-sizing: border-box;
    font-family: Geist, ui-sans-serif, system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    color: #e2e8f0;
    background: rgba(15, 23, 42, 0.92);
    border: 1px solid rgba(100, 116, 139, 0.45);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    transition: box-shadow 120ms ease, border-color 120ms ease;
  }
  .card.branch {
    mask-image: url("data:image/svg+xml,%3Csvg width='100%' viewBox='0 0 333 258' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3Cpath d='M154.489 6.12569C159.827 -2.0419 173.173 -2.04189 178.511 6.1257L331.121 239.623C336.459 247.791 329.787 258 319.11 258H13.8898C3.21334 258 -3.45942 247.791 1.8788 239.623L154.489 6.12569Z' fill='%23D9D9D9'/%3E %3C/svg%3E");
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='100%' viewBox='0 0 333 258' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3Cpath d='M154.489 6.12569C159.827 -2.0419 173.173 -2.04189 178.511 6.1257L331.121 239.623C336.459 247.791 329.787 258 319.11 258H13.8898C3.21334 258 -3.45942 247.791 1.8788 239.623L154.489 6.12569Z' fill='%23D9D9D9'/%3E %3C/svg%3E");
    mask-repeat: no-repeat;
  }
  :host([data-node-type="node"][data-selected]) {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 0.6rem;
  }
  :host([data-node-type="node"][data-collapsed][data-selected]) {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
    border-radius: 0.6rem;
  }    
  :host([data-selected]) .card {
    border-color: #3b82f6;
    // border: unset;
    // outline: 2px solid #3b82f6;
    // outline-offset: 2px;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.55), 0 2px 8px rgba(0, 0, 0, 0.35);
  }
  :host([data-drop-target]) .card {
    border-color: #22c55e;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.55);
  }
  /* Collapsed (derived from being dropped into a group, or an explicit
     subgraph collapse): show the title bar only, mirroring WebGL's
     head-only rendering for collapsed nodes. */
  :host([data-collapsed]) .card {
    justify-content: center;
    border-radius: 8px;
  }
  :host([data-collapsed]) .body {
    display: none;
  }
  .head {
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: rgba(255, 255, 255, 0.06);
    border-top-right-radius: 0.6rem;
    border-top-left-radius: 0.6rem;
  }
  .head.collapsed {
    border-bottom-right-radius: 0.6rem;
    border-bottom-left-radius: 0.6rem;  
  }
  .head-middle-icon {
    margin-inline: auto;
    display: inline-block;
    width: 10px;
    height: 10px;
    position: absolute;
    top: 5px;
    left: 50%;
    transform: translateX(-50%) scale(1.2);

  }
  .head-middle-icon svg {
    width: 100%;
    height: 100%;
  }
  .title { overflow: hidden; text-overflow: ellipsis; }
  .lock { font-size: 10px; opacity: 0.9; }
  .body { flex: 1; padding: 6px 10px; font-size: 10px; overflow: hidden; }
  .prop-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 2px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .prop-row:last-child { border-bottom: none; }
  .prop-label { color: #94a3b8; }
  .prop-value { color: #e2e8f0; font-weight: 500; max-width: 60%; overflow: hidden; text-overflow: ellipsis; }
  .badge {
    margin-left: auto;
    font-size: 9px;
    padding: 1px 5px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.12);
    color: #cbd5e1;
    white-space: nowrap;
  }
  /* Add-child "+" affordance, mirroring the WebGL group's overlay icon at
     local (width/2, height - plusBtnPaddingBottom). The host is
     pointer-events: none, so clicks fall through to WebGL picking, which
     already owns the plus-button hit test (node-editor handleMouseDown). */
  .plus-btn {
    position: absolute;
    left: 50%;
    top: calc(100% - 20px);
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    box-sizing: border-box;
    border-radius: 50%;
    background: rgba(34, 197, 94, 0.18);
    border: 1.5px solid rgba(34, 197, 94, 0.75);
    color: #86efac;
    font-size: 13px;
    font-weight: 700;
    line-height: 17px;
    text-align: center;
    pointer-events: none;
    user-select: none;
  }
  .link-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    color: #93c5fd;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .link-icon { font-size: 11px; }
  .ref-label {
    font-size: 9px;
    color: #a5b4fc;
  }
  .ref-slot {
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(99, 102, 241, 0.12);
    border: 1px solid rgba(99, 102, 241, 0.35);
    color: #c7d2fe;
    font-size: 10px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
function renderPropRows(props) {
    if (!props)
        return "";
    const rows = [];
    const gkHash = {};
    const walk = (groupKey, list) => {
        if (!gkHash[groupKey]) {
            rows.push(`<div class="prop-row-label"> <h3>${groupKey} </h3></div>`);
            gkHash[groupKey] = true;
        }
        for (const item of list) {
            const value = typeof item.value === "boolean"
                ? (item.value ? "on" : "off")
                : Array.isArray(item.value) ? item.value.join(", ") : item.value;
            rows.push(`<div class="prop-row"><span class="prop-label">${escapeHtml(item.label)}</span><span class="prop-value">${escapeHtml(value)}</span></div>`);
        }
    };
    for (const groupKey of new Set(props.groups).values()) {
        walk(groupKey, props.booleans[groupKey] ?? []);
        walk(groupKey, props.texts[groupKey] ?? []);
        walk(groupKey, props.enums[groupKey] ?? []);
    }
    return rows.join("");
}
function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}
class DomNodeElement extends HTMLElement {
    shadow;
    ctx;
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }
    update(node, ctx) {
        this.ctx = ctx;
        this.render(node);
    }
    setContent(inner, styles = BASE_STYLE) {
        this.shadow.innerHTML = `<style>${styles}</style>${inner}`;
    }
    header(title, badges = [], { nodeType, isLocked }) {
        // Effective collapse (explicit subgraph toggle OR a leaf derived-collapsed
        // inside a group) comes from the context, not the raw `node.isCollapsed`
        // field, which only ever records the explicit toggle.
        const isCollapsed = this.ctx?.isCollapsed ?? false;
        return `<div class="head${isCollapsed ? " collapsed" : ""}">
      <span class="title">${escapeHtml(title)}</span>
      ${(() => {
            if (nodeType !== "group")
                return "";
            return isLocked ? `
        <span class="head-middle-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 3L21 21M17 10V8C17 5.23858 14.7614 3 12 3C11.0283 3 10.1213 3.27719 9.35386 3.75681M7.08383 7.08338C7.02878 7.38053 7 7.6869 7 8V10.0288M19.5614 19.5618C19.273 20.0348 18.8583 20.4201 18.362 20.673C17.7202 21 16.8802 21 15.2 21H8.8C7.11984 21 6.27976 21 5.63803 20.673C5.07354 20.3854 4.6146 19.9265 4.32698 19.362C4 18.7202 4 17.8802 4 16.2V14.8C4 13.1198 4 12.2798 4.32698 11.638C4.6146 11.0735 5.07354 10.6146 5.63803 10.327C5.99429 10.1455 6.41168 10.0647 7 10.0288M19.9998 14.4023C19.9978 12.9831 19.9731 12.227 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C17.773 10.0269 17.0169 10.0022 15.5977 10.0002M10 10H8.8C8.05259 10 7.47142 10 7 10.0288" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        </span>
        ` : `
        <span class="head-middle-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        </span>
        `;
        })()}
      ${badges.map((b) => `<span class="badge">${b}</span>`).join("")}
    </div>`;
    }
}
// ─── dom-node (standard leaf, props body + optional composition ref) ───────
class DomNodeElementImpl extends DomNodeElement {
    render(node) {
        if (node.compositionRefId != null) {
            this.renderCompositionReference(node);
            return;
        }
        this.setContent(this.header(node.text, [], node) +
            `<div class="body">${renderPropRows(node.props)}
        
        <span style="width: 100%; height: 30px; display: inline-block; margin-top: 6px;">
          <svg width="100%" viewBox="0 0 206 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_in_2_2)">
            <rect width="100%" height="100%" rx="8" fill="#8B8B8B"/>
            </g>
            <defs>
            <filter id="filter0_in_2_2" x="0" y="0" width="206" height="34" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="5"/>
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.62 0"/>
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_2"/>
            <feTurbulence type="fractalNoise" baseFrequency="0.25 0.25" stitchTiles="stitch" numOctaves="3" result="noise" seed="1670" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
            <feComponentTransfer in="alphaNoise" result="coloredNoise1">
            <feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 "/>
            </feComponentTransfer>
            <feComposite operator="in" in2="effect1_innerShadow_2_2" in="coloredNoise1" result="noise1Clipped" />
            <feFlood flood-color="rgba(0, 0, 0, 0.25)" result="color1Flood" />
            <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
            <feMerge result="effect2_noise_2_2">
            <feMergeNode in="effect1_innerShadow_2_2" />
            <feMergeNode in="color1" />
            </feMerge>
            </filter>
            </defs>
            </svg>

        </span>
      </div>`);
    }
    /** Composition references render like a composition (nested children,
     *  matching the WebGL layout) but with an accent tint to tell them apart
     *  from an actual composition. */
    renderCompositionReference(node) {
        const composition = this.ctx?.getNode?.(node.compositionRefId);
        const children = composition?.childIds
            ?.map((id) => this.ctx?.getNode?.(id))
            .filter((child) => Boolean(child)) ?? [];
        const slots = children.length === 0
            ? `<div class="body" style="font-size: 9px; color: #a5b4fc;">${composition ? escapeHtml(composition.text) : "Template"} · no slots</div>`
            : `<div class="body" style="font-size: 9px; color: #a5b4fc; display: flex; flex-direction: column; gap: 4px;">
            <span class="ref-label">${composition ? escapeHtml(composition.text) : "Template"} slots</span>
            ${children
                .map((child) => `<div class="ref-slot">${escapeHtml(child.text)}</div>`)
                .join("")}
          </div>`;
        this.setContent(`
      <style>${BASE_STYLE}</style>
      <div class="card" style="background: rgba(99, 102, 241, 0.06); border: 1.5px solid rgba(99, 102, 241, 0.55);">
        ${this.header(node.text, ["reference"], node)}
        ${slots}
      </div>
    `);
    }
}
// ─── dom-hub (wide pill, multi-connect) ────────────────────────────────────
class DomHubElement extends DomNodeElement {
    render(node) {
        this.setContent(`
      <style>${BASE_STYLE}</style>
      <div class="card" style="border-radius: 24px; align-items: center; justify-content: center; text-align: center;">
        <div style="font-size: 13px; font-weight: 600; padding: 0 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(node.text)}</div>
        <span class="badge" style="margin: 4px 0 0;">multi-connect</span>
      </div>
    `);
    }
}
// ─── dom-branch (rounded triangle, decision node) ──────────────────────────
class DomBranchElement extends DomNodeElement {
    render(node) {
        this.setContent(`
      <style>${BASE_STYLE}</style>
      <div class="card branch" style="border: none; background: transparent; box-shadow: none; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; background: rgba(92, 92, 94, 0.25); outline: 1.8px solid rgba(251, 146, 60, 0.8); border-radius: 18px;"></div>
        <div style="position: relative; font-size: 12px; font-weight: 600; color: #fdba74; padding: 34px 6px 6px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(node.text)}</div>
      </div>
    `);
    }
}
// ─── dom-group (dashed container, lock + spotlight) ────────────────────────
class DomGroupElement extends DomNodeElement {
    render(node) {
        const lock = node.isLocked ? true : false;
        this.setContent(`
      <style>${BASE_STYLE}</style>
      <div class="card" style="background: rgba(34, 197, 94, 0.05); border: 1.5px dashed rgba(34, 197, 94, 0.45);">
        ${this.header(node.text, [], node)}
        <div class="body" style="font-size: 9px; color: #94a3b8;">
          ${lock ? "Locked" : "Unlocked"} · ${node.childIds.length} children
        </div>
      </div>
      <div class="plus-btn">+</div>
    `);
    }
}
// ─── dom-composition (amber reusable template container) ───────────────────
class DomCompositionElement extends DomNodeElement {
    render(node) {
        this.setContent(`
      <style>${BASE_STYLE}</style>
      <div class="card" style="background: rgba(245, 158, 11, 0.06); border: 1.5px solid rgba(245, 158, 11, 0.5);">
        ${this.header(node.text, ["composition"], node)}
        <div class="body" style="font-size: 9px; color: #a8a29e;">${node.childIds.length} slot(s)</div>
      </div>
    `);
    }
}
// ─── dom-child (composition slot bar) ──────────────────────────────────────
class DomChildElement extends DomNodeElement {
    render(node) {
        this.setContent(`
      <style>${BASE_STYLE}</style>
      <div class="card" style="inset: 0; align-items: center; justify-content: center; border-radius: 6px; background: rgba(148, 163, 184, 0.12); border: 1px solid rgba(148, 163, 184, 0.35);">
        <div style="font-size: 11px; font-weight: 500; color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 10px;">${escapeHtml(node.text)}</div>
      </div>
    `);
    }
}
// ─── dom-subgraph (collapsible container) ──────────────────────────────────
class DomSubgraphElement extends DomNodeElement {
    render(node) {
        const badge = node.isCollapsed ? "collapsed" : `${node.childIds.length} children`;
        let body;
        if (node.isCollapsed) {
            body = "";
        }
        else {
            const linkRow = this.renderLinkRow(node);
            body = `<div class="body" style="font-size: 9px; color: #5eead4;">nested subgraph container${linkRow}</div>`;
        }
        this.setContent(`
      <style>${BASE_STYLE}</style>
      <div class="card" style="background: rgba(20, 184, 166, 0.05); border: 1.5px solid rgba(20, 184, 166, 0.45);">
        ${this.header(node.text, [badge], node)}
        ${body}
      </div>
    `);
    }
    renderLinkRow(node) {
        if (node.subgraphRefId == null)
            return "";
        const original = this.ctx?.getNode?.(node.subgraphRefId);
        const label = original ? escapeHtml(original.text) : `#${node.subgraphRefId}`;
        return `
      <div class="link-row">
        <span class="link-icon">&#x1F517;</span>
        <span>Open original · ${label}</span>
      </div>`;
    }
}
export function registerDomViews() {
    if (!customElements.get("gg-dom-node"))
        customElements.define("gg-dom-node", DomNodeElementImpl);
    if (!customElements.get("gg-dom-hub"))
        customElements.define("gg-dom-hub", DomHubElement);
    if (!customElements.get("gg-dom-branch"))
        customElements.define("gg-dom-branch", DomBranchElement);
    if (!customElements.get("gg-dom-group"))
        customElements.define("gg-dom-group", DomGroupElement);
    if (!customElements.get("gg-dom-composition"))
        customElements.define("gg-dom-composition", DomCompositionElement);
    if (!customElements.get("gg-dom-child"))
        customElements.define("gg-dom-child", DomChildElement);
    if (!customElements.get("gg-dom-subgraph"))
        customElements.define("gg-dom-subgraph", DomSubgraphElement);
}
export const DOM_VIEW_TAGS = {
    node: "gg-dom-node",
    hub: "gg-dom-hub",
    branch: "gg-dom-branch",
    group: "gg-dom-group",
    composition: "gg-dom-composition",
    "composition-child": "gg-dom-child",
    subgraph: "gg-dom-subgraph",
};
//# sourceMappingURL=dom-views.js.map