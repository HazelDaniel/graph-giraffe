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
  :host([data-selected]) .card {
    border-color: #3b82f6;
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
    const walk = (groupKey, list) => {
        for (const item of list) {
            const value = typeof item.value === "boolean" ? (item.value ? "on" : "off") : item.value;
            rows.push(`<div class="prop-row"><span class="prop-label">${escapeHtml(item.label)}</span><span class="prop-value">${escapeHtml(value)}</span></div>`);
        }
    };
    for (const groupKey of props.groups) {
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
        <img style="width: 100%; height: 30px; object-fit: cover;" src="data:image/jpeg;base64,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"/>
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
      <div class="card" style="border: none; background: transparent; box-shadow: none; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; background: rgba(92, 92, 94, 0.25); outline: 1.8px solid rgba(251, 146, 60, 0.8); border-radius: 18px; clip-path: polygon(50% 6%, 100% 88%, 4% 88%);"></div>
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