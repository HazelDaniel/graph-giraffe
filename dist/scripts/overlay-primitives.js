let layerSeq = 0;
const BUBBLE_CSS = `
  .gg-comment {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
  }
  .gg-comment-tail {
    position: absolute;
    left: 0;
    top: 0;
    width: 48px;
    height: 48px;
    pointer-events: none;
    overflow: visible;
  }
  .gg-comment-card {
    position: absolute;
    left: 16px;
    top: 16px;
    width: 240px;
    box-sizing: border-box;
    background: var(--gg-comment-bg, #0f172a);
    border: 1px solid var(--gg-comment-border, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    color: var(--gg-comment-fg, #e2e8f0);
    font: 13px/1.4 system-ui, -apple-system, sans-serif;
    overflow: hidden;
  }
  .gg-comment-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    cursor: grab;
  }
  .gg-comment-head.gg-comment-dragging {
    cursor: grabbing;
  }
  .gg-comment-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--gg-comment-avatar, linear-gradient(135deg, #6366f1, #8b5cf6));
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
  }
  .gg-comment-author {
    font-weight: 600;
    font-size: 12px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .gg-comment-close {
    border: 0;
    background: transparent;
    color: var(--gg-comment-muted, #94a3b8);
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 6px;
    flex: none;
  }
  .gg-comment-close:hover {
    color: #f87171;
    background: rgba(248, 113, 113, 0.12);
  }
  .gg-comment-input {
    box-sizing: border-box;
    width: calc(100% - 16px);
    margin: 0 8px 8px;
    resize: none;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    background: var(--gg-comment-input-bg, rgba(15, 23, 42, 0.9));
    color: inherit;
    padding: 6px 8px;
    font: inherit;
    min-height: 20px;
  }
  .gg-comment-input:focus {
    outline: none;
    border-color: var(--gg-comment-accent, #6366f1);
  }
`;
function ensureStyles() {
    if (document.getElementById("gg-comment-overlay-styles"))
        return;
    const style = document.createElement("style");
    style.id = "gg-comment-overlay-styles";
    style.textContent = BUBBLE_CSS;
    document.head.appendChild(style);
}
function initials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0)
        return "?";
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
function emit(element, type, detail) {
    element.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}
/**
 * Build a single comment-bubble `CustomOverlay` anchored at `worldX/worldY`.
 * The bubble keeps a fixed on-screen size regardless of zoom (like Figma
 * comments) while its anchor stays glued to the world point.
 */
export function createCommentBubble(options) {
    ensureStyles();
    const id = options.id ?? "";
    const element = document.createElement("div");
    element.className = "gg-comment";
    const tail = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    tail.setAttribute("class", "gg-comment-tail");
    tail.setAttribute("viewBox", "0 0 48 48");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M3 3 C 10 6 15 10 19 19");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "rgba(255,255,255,0.35)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    tail.appendChild(path);
    const card = document.createElement("div");
    card.className = "gg-comment-card";
    const head = document.createElement("div");
    head.className = "gg-comment-head";
    const avatar = document.createElement("span");
    avatar.className = "gg-comment-avatar";
    avatar.textContent = options.author ? initials(options.author) : "?";
    avatar.setAttribute("aria-hidden", "true");
    const author = document.createElement("span");
    author.className = "gg-comment-author";
    author.textContent = options.author ?? "Guest";
    const close = document.createElement("button");
    close.className = "gg-comment-close";
    close.type = "button";
    close.setAttribute("aria-label", "Dismiss comment");
    close.innerHTML = "&times;";
    close.addEventListener("click", (event) => {
        event.stopPropagation();
        options.onDismiss?.(id);
    });
    head.append(avatar, author, close);
    const input = document.createElement("textarea");
    input.className = "gg-comment-input";
    input.rows = 1;
    input.placeholder = options.placeholder ?? "Leave a comment…";
    input.value = options.initialText ?? "";
    input.addEventListener("pointerdown", (event) => event.stopPropagation());
    card.append(head, input);
    element.append(tail, card);
    return {
        id,
        element,
        worldX: options.worldX,
        worldY: options.worldY,
        scaleWithZoom: false,
    };
}
/**
 * Attach a comment layer to an editor. While enabled, clicking an empty part
 * of the canvas (`pane:click`) spawns a comment bubble at the exact click
 * point. Bubbles can be dragged by their header and dismissed individually.
 */
export function attachCommentLayer(editor, options = {}) {
    ensureStyles();
    const seq = ++layerSeq;
    const overlays = new Map();
    let counter = 0;
    let enabled = options.enabled ?? true;
    const canvas = options.canvas ??
        document.getElementById("webgl-canvas") ??
        null;
    const resolveCanvasRect = () => {
        if (canvas)
            return canvas.getBoundingClientRect();
        return null;
    };
    const spawnFromEvent = (event) => {
        const rect = resolveCanvasRect();
        if (!rect)
            return;
        const { x, y } = editor.screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
        add(x, y);
    };
    const onPaneClick = (payload) => {
        if (!enabled)
            return;
        spawnFromEvent(payload.event);
    };
    const unsubscribe = editor.events.on("pane:click", onPaneClick);
    function add(worldX, worldY, bubbleOptions = {}) {
        const id = bubbleOptions.id ?? `gg-comment-${seq}-${++counter}`;
        const overlay = createCommentBubble({
            ...bubbleOptions,
            id,
            worldX,
            worldY,
            author: bubbleOptions.author ?? options.author ?? "Guest",
            onDismiss: (bubbleId) => {
                remove(bubbleId);
                emit(overlay.element, "gg-comment:dismiss", { id: bubbleId });
            },
        });
        overlays.set(id, overlay);
        editor.addOverlay(overlay);
        wireBubbleDrag(editor, overlay);
        emit(overlay.element, "gg-comment:create", { id, worldX, worldY });
        options.onCreate?.(id, overlay);
        return id;
    }
    function remove(id) {
        const overlay = overlays.get(id);
        if (!overlay)
            return;
        editor.removeOverlay(id);
        overlays.delete(id);
        options.onRemove?.(id);
    }
    function get(id) {
        return overlays.get(id);
    }
    function clear() {
        for (const id of [...overlays.keys()])
            remove(id);
    }
    function setEnabled(value) {
        enabled = value;
    }
    function destroy() {
        clear();
        unsubscribe();
    }
    return {
        add,
        remove,
        get,
        clear,
        setEnabled,
        get enabled() {
            return enabled;
        },
        destroy,
    };
}
/**
 * Drag a fixed-size overlay by its header: a pointer drag translates the
 * anchor in world space (screen delta / zoom) and re-glues the bubble.
 */
function wireBubbleDrag(editor, overlay) {
    const card = overlay.element.querySelector(".gg-comment-card");
    if (!card)
        return;
    let startClientX = 0;
    let startClientY = 0;
    let startWorldX = 0;
    let startWorldY = 0;
    let dragging = false;
    card.addEventListener("pointerdown", (event) => {
        const pointer = event;
        const target = pointer.target;
        if (target.closest("button") || target.closest("textarea"))
            return;
        if (pointer.button !== 0)
            return;
        startClientX = pointer.clientX;
        startClientY = pointer.clientY;
        startWorldX = overlay.worldX;
        startWorldY = overlay.worldY;
        dragging = true;
        event.currentTarget.classList.add("gg-comment-dragging");
        event.currentTarget.setPointerCapture(pointer.pointerId);
    });
    card.addEventListener("pointermove", (event) => {
        if (!dragging)
            return;
        const pointer = event;
        const zoom = editor.getCameraState().zoom || 1;
        const nextX = startWorldX + (pointer.clientX - startClientX) / zoom;
        const nextY = startWorldY + (pointer.clientY - startClientY) / zoom;
        overlay.worldX = nextX;
        overlay.worldY = nextY;
        editor.updateOverlayPosition(overlay.id, nextX, nextY);
    });
    const stop = (event) => {
        if (!dragging)
            return;
        const pointer = event;
        dragging = false;
        event.currentTarget.classList.remove("gg-comment-dragging");
        event.currentTarget.releasePointerCapture(pointer.pointerId);
    };
    card.addEventListener("pointerup", stop);
    card.addEventListener("pointercancel", stop);
}
//# sourceMappingURL=overlay-primitives.js.map