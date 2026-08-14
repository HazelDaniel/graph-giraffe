/**
 * Wires all DOM event listeners.
 * Receives plain callbacks instead of direct module references — this
 * prevents UIControls from depending on any other module, keeping it
 * fully decoupled from the rest of the system.
 */
export class UIControls {
    addNodeButton;
    addBranchButton;
    createSubgraphButton;
    addGroupButton;
    addCompositionButton;
    multiSelectButton;
    undoButton;
    redoButton;
    deleteNodeButton;
    commentModeButton;
    sidebar;
    sidebarToggle;
    nodeProperties;
    nodeLabelInput;
    nodePropGroup;
    constructor(canvas, container, historyPane, toolPane, callbacks) {
        this.sidebar = container;
        this.addNodeButton = toolPane.shadowRoot?.querySelector("#btn-add-node");
        this.addGroupButton = toolPane.shadowRoot?.querySelector("#btn-add-group");
        this.addCompositionButton = toolPane.shadowRoot?.querySelector("#btn-add-composition");
        this.multiSelectButton = toolPane.shadowRoot?.querySelector("#btn-multi-select");
        this.createSubgraphButton = toolPane.shadowRoot?.querySelector("#btn-create-subgraph");
        this.addBranchButton = toolPane.shadowRoot?.querySelector("#btn-add-branch");
        this.undoButton = historyPane.shadowRoot?.querySelector("#btn-undo");
        this.redoButton = historyPane.shadowRoot?.querySelector("#btn-redo");
        this.deleteNodeButton = toolPane.shadowRoot?.querySelector("#btn-delete-node");
        this.commentModeButton = toolPane.shadowRoot?.querySelector("#btn-comment-mode");
        this.sidebarToggle = container.shadowRoot?.querySelector("#sidebar-toggle");
        this.nodeProperties = container.shadowRoot?.querySelector("#node-properties");
        this.nodeLabelInput = container.shadowRoot?.querySelector("#node-label-input");
        this.nodePropGroup = container.shadowRoot?.querySelector("#node-prop-group");
        this.addNodeButton.addEventListener("click", () => callbacks.onAddNode());
        this.addGroupButton.addEventListener("click", () => callbacks.onAddGroup());
        this.addCompositionButton.addEventListener("click", () => callbacks.onAddComposition());
        this.multiSelectButton.addEventListener("click", () => callbacks.onToggleMultiSelect());
        this.createSubgraphButton.addEventListener("click", () => callbacks.onSubgraphCreate());
        this.addBranchButton?.addEventListener("click", () => callbacks.onAddBranch?.());
        this.undoButton.addEventListener("click", () => callbacks.onUndo());
        this.redoButton.addEventListener("click", () => callbacks.onRedo());
        this.deleteNodeButton.addEventListener("click", () => callbacks.onDeleteNode());
        this.commentModeButton.addEventListener("click", () => callbacks.onCommentMode?.());
        const kebabMenu = document.getElementById("kebab-menu");
        kebabMenu?.addEventListener("gg-kebab-action", (e) => {
            const customEvent = e;
            if (customEvent.detail.action === "import") {
                callbacks.onImport?.();
            }
            else if (customEvent.detail.action === "export") {
                callbacks.onExport?.();
            }
        });
        const bgPicker = container.shadowRoot?.querySelector("#bg-color-picker");
        bgPicker?.addEventListener("input", (e) => {
            const hex = e.target.value;
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            callbacks.onBgColorChange(r, g, b, 1.0);
        });
        const fontColorPicker = container.shadowRoot?.querySelector("#font-color-picker");
        fontColorPicker?.addEventListener("input", (e) => {
            const hex = e.target.value;
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            callbacks.onFontColorChange(r, g, b, 1.0);
        });
        const themeSelect = container.shadowRoot?.querySelector("#theme-selector");
        themeSelect?.addEventListener("gg-select-change", (e) => {
            callbacks.onThemeChange(e.target.value);
        });
        const textureSelect = container.shadowRoot?.querySelector("#texture-selector");
        textureSelect?.refresh(); // so that the uploaded textures appear
        container.addEventListener("gg-texture-select-change", (e) => {
            const customEvent = e;
            callbacks.onGlobalTextureChange(customEvent.detail.kind, customEvent.detail.value);
        });
        this.sidebarToggle.addEventListener("click", () => {
            this.sidebar.classList.toggle("collapsed");
        });
        this.nodeLabelInput.addEventListener("input", (e) => {
            callbacks.onLabelChange(e.target.value);
        });
        this.nodeLabelInput.addEventListener("blur", () => callbacks.onLabelCommit());
        this.nodeLabelInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.nodeLabelInput.blur();
            }
        });
        canvas.addEventListener("pointerdown", (e) => callbacks.onPointerDown(e));
        window.addEventListener("pointermove", (e) => callbacks.onPointerMove(e));
        window.addEventListener("pointerup", (e) => callbacks.onPointerUp(e));
        window.addEventListener("pointercancel", (e) => callbacks.onPointerCancel(e));
        canvas.addEventListener("wheel", (e) => callbacks.onWheel(e), {
            passive: false,
        });
    }
    enableDelete() {
        this.deleteNodeButton.disabled = false;
    }
    disableDelete() {
        this.deleteNodeButton.disabled = true;
    }
    enableAddComposition() {
        this.addCompositionButton.disabled = false;
    }
    disableAddComposition() {
        this.addCompositionButton.disabled = true;
    }
    setMultiSelectActive(active) {
        this.multiSelectButton.classList.toggle("active", active);
        if (this.multiSelectButton.classList.contains("active"))
            this.createSubgraphButton.disabled = false;
        else
            this.createSubgraphButton.disabled = true;
    }
    setCommentModeActive(active) {
        this.commentModeButton.classList.toggle("active", active);
    }
    enableUndo() {
        this.undoButton.disabled = false;
    }
    disableUndo() {
        this.undoButton.disabled = true;
    }
    enableRedo() {
        this.redoButton.disabled = false;
    }
    disableRedo() {
        this.redoButton.disabled = true;
    }
    showProperties(node) {
        this.nodeProperties.style.display = "flex";
        this.nodeLabelInput.value = node.text;
        if (node.props) {
            this.nodePropGroup.useProps(node.props);
            this.nodePropGroup.style.display = "block";
        }
        else {
            this.nodePropGroup.style.display = "none";
        }
        this.sidebar.classList.remove("collapsed");
    }
    hideProperties() {
        this.nodeProperties.style.display = "none";
    }
}
//# sourceMappingURL=controls.js.map