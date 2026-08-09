import type { NodeData, NodePropType } from "@graph-giraffe/core";

/**
 * DOM views re-creating each built-in node type as a custom element.
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
`;

function renderPropRows(props: NodePropType | undefined): string {
  if (!props) return "";
  const rows: string[] = [];
  const walk = (groupKey: string, list: Array<{ label: string; value: string | boolean }>) => {
    for (const item of list) {
      const value = typeof item.value === "boolean" ? (item.value ? "on" : "off") : item.value;
      rows.push(
        `<div class="prop-row"><span class="prop-label">${escapeHtml(item.label)}</span><span class="prop-value">${escapeHtml(value)}</span></div>`
      );
    }
  };
  for (const groupKey of props.groups) {
    walk(groupKey, props.booleans[groupKey] ?? []);
    walk(groupKey, props.texts[groupKey] ?? []);
    walk(groupKey, props.enums[groupKey] ?? []);
  }
  return rows.join("");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

abstract class DomNodeElement extends HTMLElement {
  protected shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  update(node: NodeData): void {
    this.render(node);
  }

  protected abstract render(node: NodeData): void;

  protected setContent(inner: string, styles = BASE_STYLE): void {
    this.shadow.innerHTML = `<style>${styles}</style>${inner}`;
  }

  protected header(title: string, badges: string[] = []): string {
    return `<div class="head"><span class="title">${escapeHtml(title)}</span>${badges.map((b) => `<span class="badge">${b}</span>`).join("")}</div>`;
  }
}

// ─── dom-node (standard leaf, props body + optional composition ref) ───────
class DomNodeElementImpl extends DomNodeElement {
  protected render(node: NodeData): void {
    const ref = node.compositionRefId ? `<span class="badge">comp #${node.compositionRefId}</span>` : "";
    this.setContent(
      this.header(node.text, [ref]) +
      `<div class="body">${renderPropRows(node.props)}</div>`
    );
  }
}

// ─── dom-hub (wide pill, multi-connect) ────────────────────────────────────
class DomHubElement extends DomNodeElement {
  protected render(node: NodeData): void {
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
  protected render(node: NodeData): void {
    this.setContent(`
      <style>${BASE_STYLE}</style>
      <div class="card" style="border: none; background: transparent; box-shadow: none; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; background: rgba(15, 23, 42, 0.95); border: 1.8px solid rgba(251, 146, 60, 0.8); border-radius: 18px; clip-path: polygon(50% 6%, 100% 88%, 4% 88%);"></div>
        <div style="position: relative; font-size: 12px; font-weight: 600; color: #fdba74; padding: 34px 6px 6px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(node.text)}</div>
      </div>
    `);
  }
}

// ─── dom-group (dashed container, lock + spotlight) ────────────────────────
class DomGroupElement extends DomNodeElement {
  protected render(node: NodeData): void {
    const lock = node.isLocked ? '<span class="lock">🔒</span>' : "";
    this.setContent(`
      <style>${BASE_STYLE}</style>
      <div class="card" style="background: rgba(34, 197, 94, 0.05); border: 1.5px dashed rgba(34, 197, 94, 0.45);">
        ${this.header(node.text, [])}
        <div class="body" style="font-size: 9px; color: #94a3b8;">
          ${lock ? "Locked" : "Unlocked"} · ${node.childIds.length} children
        </div>
      </div>
    `);
  }
}

// ─── dom-composition (amber reusable template container) ───────────────────
class DomCompositionElement extends DomNodeElement {
  protected render(node: NodeData): void {
    this.setContent(`
      <style>${BASE_STYLE}</style>
      <div class="card" style="background: rgba(245, 158, 11, 0.06); border: 1.5px solid rgba(245, 158, 11, 0.5);">
        ${this.header(node.text, ["composition"])}
        <div class="body" style="font-size: 9px; color: #a8a29e;">${node.childIds.length} slot(s)</div>
      </div>
    `);
  }
}

// ─── dom-child (composition slot bar) ──────────────────────────────────────
class DomChildElement extends DomNodeElement {
  protected render(node: NodeData): void {
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
  protected render(node: NodeData): void {
    const badge = node.isCollapsed ? "collapsed" : `${node.childIds.length} children`;
    const body = node.isCollapsed
      ? ""
      : `<div class="body" style="font-size: 9px; color: #5eead4;">nested subgraph container</div>`;
    this.setContent(`
      <style>${BASE_STYLE}</style>
      <div class="card" style="background: rgba(20, 184, 166, 0.05); border: 1.5px solid rgba(20, 184, 166, 0.45);">
        ${this.header(node.text, [badge])}
        ${body}
      </div>
    `);
  }
}

export function registerDomViews(): void {
  if (!customElements.get("gg-dom-node")) customElements.define("gg-dom-node", DomNodeElementImpl);
  if (!customElements.get("gg-dom-hub")) customElements.define("gg-dom-hub", DomHubElement);
  if (!customElements.get("gg-dom-branch")) customElements.define("gg-dom-branch", DomBranchElement);
  if (!customElements.get("gg-dom-group")) customElements.define("gg-dom-group", DomGroupElement);
  if (!customElements.get("gg-dom-composition")) customElements.define("gg-dom-composition", DomCompositionElement);
  if (!customElements.get("gg-dom-child")) customElements.define("gg-dom-child", DomChildElement);
  if (!customElements.get("gg-dom-subgraph")) customElements.define("gg-dom-subgraph", DomSubgraphElement);
}

export const DOM_VIEW_TAGS: Record<string, string> = {
  "dom-node": "gg-dom-node",
  "dom-hub": "gg-dom-hub",
  "dom-branch": "gg-dom-branch",
  "dom-group": "gg-dom-group",
  "dom-composition": "gg-dom-composition",
  "dom-child": "gg-dom-child",
  "dom-subgraph": "gg-dom-subgraph",
};
