let layerSeq = 0;
const BUBBLE_CSS = `
  .gg-comment {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
  }
  .gg-comment-pin {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--gg-comment-avatar, linear-gradient(135deg, #6366f1, #8b5cf6));
    color: #fff;
    font: 600 10px/1 system-ui, -apple-system, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    z-index: 1;
    transition: transform 120ms ease;
  }
  .gg-comment-pin:hover {
    transform: translate(-50%, -50%) scale(1.12);
  }
  .gg-comment-tail {
    position: absolute;
    left: 0;
    top: 0;
    width: 40px;
    height: 40px;
    pointer-events: none;
    overflow: visible;
  }
  .gg-comment-popover {
    position: absolute;
    left: 32px;
    top: 32px;
    width: 248px;
    box-sizing: border-box;
    background: var(--gg-comment-bg, #0f172a);
    border: 1px solid var(--gg-comment-border, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5);
    color: var(--gg-comment-fg, #e2e8f0);
    font: 13px/1.45 system-ui, -apple-system, sans-serif;
    overflow: hidden;
    z-index: 2;
  }
  .gg-comment-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    cursor: grab;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
  .gg-comment-body {
    padding: 9px 12px 11px;
    white-space: pre-wrap;
    word-break: break-word;
    min-height: 20px;
  }
  .gg-comment-input {
    box-sizing: border-box;
    width: calc(100% - 16px);
    margin: 8px;
    resize: none;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    background: var(--gg-comment-input-bg, rgba(15, 23, 42, 0.9));
    color: inherit;
    padding: 7px 9px;
    font: inherit;
    min-height: 40px;
    display: block;
  }
  .gg-comment-input:focus {
    outline: none;
    border-color: var(--gg-comment-accent, #6366f1);
  }
  .gg-comment[data-mode="editing"] .gg-comment-body {
    display: none;
  }
  .gg-comment[data-mode="saved"] .gg-comment-input {
    display: none;
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
function emitDom(element, type, detail) {
    element.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}
/**
 * Build a single Figma-style comment bubble anchored at `worldX/worldY`:
 * an avatar pin sits on the anchor and a popover (composer or posted message)
 * floats beside it with a tail drawn back to the pin. Fixed on-screen size
 * regardless of zoom (`scaleWithZoom: false`).
 */
export function createCommentBubble(options) {
    ensureStyles();
    const id = options.id ?? "";
    const author = options.author ?? "Guest";
    const element = document.createElement("div");
    element.className = "gg-comment";
    element.setAttribute("data-mode", options.editing === false ? "saved" : "editing");
    const pin = document.createElement("div");
    pin.className = "gg-comment-pin";
    pin.title = author;
    pin.textContent = initials(author);
    pin.setAttribute("aria-label", `Comment by ${author}`);
    const tail = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    tail.setAttribute("class", "gg-comment-tail");
    tail.setAttribute("viewBox", "0 0 40 40");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M13 13 C 20 14 22 18 26 26");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "rgba(255,255,255,0.4)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    tail.appendChild(path);
    const popover = document.createElement("div");
    popover.className = "gg-comment-popover";
    const head = document.createElement("div");
    head.className = "gg-comment-head";
    const avatar = document.createElement("span");
    avatar.className = "gg-comment-avatar";
    avatar.textContent = initials(author);
    avatar.setAttribute("aria-hidden", "true");
    const authorEl = document.createElement("span");
    authorEl.className = "gg-comment-author";
    authorEl.textContent = author;
    const close = document.createElement("button");
    close.className = "gg-comment-close";
    close.type = "button";
    close.setAttribute("aria-label", "Delete comment");
    close.innerHTML = "&times;";
    head.append(avatar, authorEl, close);
    const body = document.createElement("div");
    body.className = "gg-comment-body";
    body.textContent = options.text ?? "";
    const input = document.createElement("textarea");
    input.className = "gg-comment-input";
    input.rows = 2;
    input.placeholder = options.placeholder ?? "Write a comment…";
    input.value = options.text ?? "";
    input.addEventListener("pointerdown", (event) => event.stopPropagation());
    popover.append(head, body, input);
    element.append(pin, tail, popover);
    const overlay = {
        id,
        element,
        worldX: options.worldX,
        worldY: options.worldY,
        scaleWithZoom: false,
        setMode(mode) {
            element.setAttribute("data-mode", mode);
            if (mode === "editing") {
                input.value = body.textContent;
            }
            else {
                body.textContent = input.value;
            }
        },
        focus() {
            input.focus();
        },
        getText() {
            return input.value;
        },
    };
    input.addEventListener("blur", () => options.onBlur?.(input.value));
    close.addEventListener("click", (event) => {
        event.stopPropagation();
        options.onDismiss?.(id);
    });
    pin.addEventListener("click", () => options.onPinClick?.(id));
    return overlay;
}
/**
 * Attach a comment layer to an editor. While enabled, clicking an empty part
 * of the canvas (`pane:click`) spawns a composer bubble at the click point,
 * auto-focused. Blurring the composer emits `save` (text) or `cancel` (empty).
 * Bubbles can be dragged by their header and dismissed individually.
 */
export function attachCommentLayer(editor, options = {}) {
    ensureStyles();
    const seq = ++layerSeq;
    const overlays = new Map();
    const listeners = new Map();
    let counter = 0;
    let enabled = options.enabled ?? true;
    const canvas = options.canvas ?? document.getElementById("webgl-canvas") ?? null;
    function emit(type, payload) {
        for (const handler of listeners.get(type) ?? []) {
            handler(payload);
        }
    }
    function resolveCanvasRect() {
        return canvas ? canvas.getBoundingClientRect() : null;
    }
    function spawnFromEvent(event) {
        const rect = resolveCanvasRect();
        if (!rect)
            return;
        const { x, y } = editor.screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
        add(x, y);
    }
    const onPaneClick = (payload) => {
        if (!enabled)
            return;
        spawnFromEvent(payload.event);
    };
    const unsubscribePane = editor.events.on("pane:click", onPaneClick);
    function add(worldX, worldY, bubbleOptions = {}) {
        const id = bubbleOptions.id ?? `gg-comment-${seq}-${++counter}`;
        if (overlays.has(id))
            remove(id);
        const overlay = createCommentBubble({
            ...bubbleOptions,
            id,
            worldX,
            worldY,
            author: bubbleOptions.author ?? options.author ?? "Guest",
            editing: bubbleOptions.editing ?? true,
            onBlur: (text) => handleBlur(overlay, text),
            onDismiss: (bubbleId) => {
                suppressBlur(overlay);
                emit("delete", { id: bubbleId });
                emitDom(overlay.element, "gg-comment:delete", { id: bubbleId });
                remove(bubbleId);
            },
            onPinClick: (bubbleId) => {
                const target = overlays.get(bubbleId);
                if (!target)
                    return;
                target.setMode("editing");
                target.focus();
            },
        });
        overlays.set(id, overlay);
        editor.addOverlay(overlay);
        wireBubbleDrag(editor, overlay);
        if (overlay.element.getAttribute("data-mode") === "editing") {
            overlay.focus();
        }
        emit("create", { id, author: overlayAuthor(overlay), worldX, worldY });
        emitDom(overlay.element, "gg-comment:create", {
            id,
            worldX,
            worldY,
        });
        return id;
    }
    function overlayAuthor(overlay) {
        return overlay.element.querySelector(".gg-comment-author")?.textContent ?? "Guest";
    }
    function handleBlur(overlay, text) {
        const trimmed = text.trim();
        const id = overlay.id;
        const author = overlayAuthor(overlay);
        const { worldX, worldY } = overlay;
        if (trimmed) {
            overlay.setMode("saved");
            emit("save", { id, author, text: trimmed, worldX, worldY });
            emitDom(overlay.element, "gg-comment:save", {
                id,
                author,
                text: trimmed,
                worldX,
                worldY,
            });
        }
        else {
            emit("cancel", { id, author, worldX, worldY });
            emitDom(overlay.element, "gg-comment:cancel", {
                id,
                worldX,
                worldY,
            });
            remove(id);
        }
    }
    function suppressBlur(overlay) {
        const input = overlay.element.querySelector(".gg-comment-input");
        if (input && typeof input.blur === "function") {
            // Removing focus before remove() prevents the blur handler from
            // double-firing a save/cancel while the bubble is being dismissed.
            input.blur();
        }
    }
    function load(records) {
        for (const record of records) {
            if (overlays.has(record.id))
                remove(record.id);
            const overlay = createCommentBubble({
                id: record.id,
                worldX: record.worldX,
                worldY: record.worldY,
                author: record.author,
                text: record.text,
                editing: false,
                onBlur: (text) => handleBlur(overlay, text),
                onDismiss: (bubbleId) => {
                    suppressBlur(overlay);
                    emit("delete", { id: bubbleId });
                    emitDom(overlay.element, "gg-comment:delete", { id: bubbleId });
                    remove(bubbleId);
                },
                onPinClick: (bubbleId) => {
                    const target = overlays.get(bubbleId);
                    if (!target)
                        return;
                    target.setMode("editing");
                    target.focus();
                },
            });
            overlays.set(record.id, overlay);
            editor.addOverlay(overlay);
            wireBubbleDrag(editor, overlay);
        }
        emit("load", { count: records.length });
    }
    function remove(id) {
        const overlay = overlays.get(id);
        if (!overlay)
            return;
        editor.removeOverlay(id);
        overlays.delete(id);
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
    function on(type, handler) {
        if (!listeners.has(type))
            listeners.set(type, new Set());
        const set = listeners.get(type);
        set.add(handler);
        return () => {
            set.delete(handler);
        };
    }
    function destroy() {
        clear();
        unsubscribePane();
        listeners.clear();
    }
    return {
        add,
        load,
        remove,
        get,
        clear,
        setEnabled,
        get enabled() {
            return enabled;
        },
        on,
        destroy,
    };
}
/**
 * Drag a fixed-size overlay by its header: a pointer drag translates the
 * anchor in world space (screen delta / zoom) and re-glues the bubble.
 */
function wireBubbleDrag(editor, overlay) {
    const head = overlay.element.querySelector(".gg-comment-head");
    if (!head)
        return;
    let startClientX = 0;
    let startClientY = 0;
    let startWorldX = 0;
    let startWorldY = 0;
    let dragging = false;
    head.addEventListener("pointerdown", (event) => {
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
    head.addEventListener("pointermove", (event) => {
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
    head.addEventListener("pointerup", stop);
    head.addEventListener("pointercancel", stop);
}
//# sourceMappingURL=overlay-primitives.js.map