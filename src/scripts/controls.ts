import { GGPropGroup } from "../components/prop-group";
import { TextureSelect } from "../components/texture-select";
import { NodeData, ThemeName } from "./types";


/** All interaction events the NodeEditor handles, expressed as plain callbacks. */
export interface ControlCallbacks {
  onAddNode(): void;
  onAddGroup(): void;
  onAddBranch?(): void;
  onAddComposition(): void;
  onToggleMultiSelect(): void;
  onUndo(): void;
  onRedo(): void;
  onDeleteNode(): void;
  onCommentMode?(): void;
  setCommentModeActive?(active: boolean): void;
  onImport?(): void;
  onExport?(): void;

  onSubgraphCreate: () => void;
  onBgColorChange(r: number, g: number, b: number, a: number): void;
  onFontColorChange(r: number, g: number, b: number, a: number): void;
  onThemeChange(theme: ThemeName): void;
  onGlobalTextureChange(kind: string, textureId: string): void;
  onLabelChange(newLabel: string): void;
  onLabelCommit(): void;
  onPointerDown(e: PointerEvent): void;
  onPointerMove(e: PointerEvent): void;
  onPointerUp(e: PointerEvent): void;
  onPointerCancel(e: PointerEvent): void;
  onWheel(e: WheelEvent): void;
}

/**
 * Wires all DOM event listeners.
 * Receives plain callbacks instead of direct module references — this
 * prevents UIControls from depending on any other module, keeping it
 * fully decoupled from the rest of the system.
 */
export class UIControls {
  private addNodeButton: HTMLButtonElement;
  private addBranchButton?: HTMLButtonElement;
  private createSubgraphButton: HTMLButtonElement;
  private addGroupButton: HTMLButtonElement;
  private addCompositionButton: HTMLButtonElement;
  private multiSelectButton: HTMLButtonElement;
  private undoButton: HTMLButtonElement;
  private redoButton: HTMLButtonElement;
  private deleteNodeButton: HTMLButtonElement;
  private commentModeButton: HTMLButtonElement;

  private sidebar: HTMLElement;
  private sidebarToggle: HTMLButtonElement;
  private nodeProperties: HTMLElement;
  private nodeLabelInput: HTMLInputElement;
  public nodePropGroup: GGPropGroup;

  constructor(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    historyPane: HTMLElement,
    toolPane: HTMLElement,
    callbacks: ControlCallbacks,
    renderMode: "webgl" | "dom" = "webgl"
  ) {
    this.sidebar = container;
    // Expose the render pipeline on the host so WebGL-only sidebar inputs
    // (font color, node theme, node textures) can be hidden in DOM mode.
    container.setAttribute("data-render-mode", renderMode);
    this.addNodeButton = toolPane.shadowRoot?.querySelector(
      "#btn-add-node"
    )! as HTMLButtonElement;
    this.addGroupButton = toolPane.shadowRoot?.querySelector(
      "#btn-add-group"
    )! as HTMLButtonElement;
    this.addCompositionButton = toolPane.shadowRoot?.querySelector(
      "#btn-add-composition"
    )! as HTMLButtonElement;
    this.multiSelectButton = toolPane.shadowRoot?.querySelector(
      "#btn-multi-select"
    )! as HTMLButtonElement;
    this.createSubgraphButton = toolPane.shadowRoot?.querySelector(
      "#btn-create-subgraph"
    )! as HTMLButtonElement;
    this.addBranchButton = toolPane.shadowRoot?.querySelector(
      "#btn-add-branch"
    ) as HTMLButtonElement;
    this.undoButton = historyPane.shadowRoot?.querySelector(
      "#btn-undo"
    )! as HTMLButtonElement;
    this.redoButton = historyPane.shadowRoot?.querySelector(
      "#btn-redo"
    )! as HTMLButtonElement;
    this.deleteNodeButton = toolPane.shadowRoot?.querySelector(
      "#btn-delete-node"
    )! as HTMLButtonElement;
    this.commentModeButton = toolPane.shadowRoot?.querySelector(
      "#btn-comment-mode"
    )! as HTMLButtonElement;
    this.sidebarToggle = container.shadowRoot?.querySelector(
      "#sidebar-toggle"
    )! as HTMLButtonElement;
    this.nodeProperties = container.shadowRoot?.querySelector(
      "#node-properties"
    )! as HTMLDivElement;
    this.nodeLabelInput = container.shadowRoot?.querySelector(
      "#node-label-input"
    )! as HTMLInputElement;
    this.nodePropGroup = container.shadowRoot?.querySelector(
      "#node-prop-group"
    )! as GGPropGroup;

    this.addNodeButton.addEventListener("click", () => callbacks.onAddNode());
    this.addGroupButton.addEventListener("click", () => callbacks.onAddGroup());
    this.addCompositionButton.addEventListener("click", () =>
      callbacks.onAddComposition()
    );
    this.multiSelectButton.addEventListener("click", () =>
      callbacks.onToggleMultiSelect()
    );
    this.createSubgraphButton.addEventListener("click", () =>
      callbacks.onSubgraphCreate()
    );
    this.addBranchButton?.addEventListener("click", () =>
      callbacks.onAddBranch?.()
    );
    this.undoButton.addEventListener("click", () => callbacks.onUndo());
    this.redoButton.addEventListener("click", () => callbacks.onRedo());
    this.deleteNodeButton.addEventListener("click", () =>
      callbacks.onDeleteNode()
    );
    this.commentModeButton.addEventListener("click", () =>
      callbacks.onCommentMode?.()
    );

    const kebabMenu = document.getElementById("kebab-menu");
    kebabMenu?.addEventListener("gg-kebab-action", (e: Event) => {
      const customEvent = e as CustomEvent<{ action: "import" | "export" }>;
      if (customEvent.detail.action === "import") {
        callbacks.onImport?.();
      } else if (customEvent.detail.action === "export") {
        callbacks.onExport?.();
      }
    });

    const bgPicker = container.shadowRoot?.querySelector(
      "#bg-color-picker"
    ) as HTMLInputElement | null;
    bgPicker?.addEventListener("input", (e) => {
      const hex = (e.target as HTMLInputElement).value;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      callbacks.onBgColorChange(r, g, b, 1.0);
    });
    const fontColorPicker = container.shadowRoot?.querySelector(
      "#font-color-picker"
    ) as HTMLInputElement | null;
    fontColorPicker?.addEventListener("input", (e) => {
      const hex = (e.target as HTMLInputElement).value;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      callbacks.onFontColorChange(r, g, b, 1.0);
    });

    const themeSelect = container.shadowRoot?.querySelector(
      "#theme-selector"
    ) as HTMLSelectElement | null;
    themeSelect?.addEventListener("gg-select-change", (e) => {
      callbacks.onThemeChange(
        (e.target as HTMLSelectElement).value as ThemeName
      );
    });

    const textureSelect = container.shadowRoot?.querySelector(
      "#texture-selector"
    ) as TextureSelect | null;
    textureSelect?.refresh(); // so that the uploaded textures appear

    container.addEventListener("gg-texture-select-change", (e: Event) => {
      const customEvent = e as CustomEvent;
      callbacks.onGlobalTextureChange(
        customEvent.detail.kind,
        customEvent.detail.value
      );
    });

    this.sidebarToggle.addEventListener("click", () => {
      this.sidebar.classList.toggle("collapsed");
    });

    this.nodeLabelInput.addEventListener("input", (e) => {
      callbacks.onLabelChange((e.target as HTMLInputElement).value);
    });
    this.nodeLabelInput.addEventListener("blur", () =>
      callbacks.onLabelCommit()
    );
    this.nodeLabelInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.nodeLabelInput.blur();
      }
    });

    canvas.addEventListener("pointerdown", (e) => callbacks.onPointerDown(e));
    window.addEventListener("pointermove", (e) => callbacks.onPointerMove(e));
    window.addEventListener("pointerup", (e) => callbacks.onPointerUp(e));
    window.addEventListener("pointercancel", (e) =>
      callbacks.onPointerCancel(e)
    );
    canvas.addEventListener("wheel", (e) => callbacks.onWheel(e), {
      passive: false,
    });
  }

  enableDelete(): void {
    this.deleteNodeButton.disabled = false;
  }
  disableDelete(): void {
    this.deleteNodeButton.disabled = true;
  }
  enableAddComposition(): void {
    this.addCompositionButton.disabled = false;
  }
  disableAddComposition(): void {
    this.addCompositionButton.disabled = true;
  }
  setMultiSelectActive(active: boolean): void {
    this.multiSelectButton.classList.toggle("active", active);
    if (this.multiSelectButton.classList.contains("active"))
      this.createSubgraphButton.disabled = false;
    else this.createSubgraphButton.disabled = true;
  }
  setCommentModeActive(active: boolean): void {
    this.commentModeButton.classList.toggle("active", active);
  }
  enableUndo(): void {
    this.undoButton.disabled = false;
  }
  disableUndo(): void {
    this.undoButton.disabled = true;
  }
  enableRedo(): void {
    this.redoButton.disabled = false;
  }
  disableRedo(): void {
    this.redoButton.disabled = true;
  }

  showProperties(node: NodeData): void {
    this.nodeProperties.style.display = "flex";
    this.nodeLabelInput.value = node.text;
    if (node.props) {
      this.nodePropGroup.useProps(node.props);
      this.nodePropGroup.style.display = "block";
    } else {
      this.nodePropGroup.style.display = "none";
    }
    this.sidebar.classList.remove("collapsed");
  }

  hideProperties(): void {
    this.nodeProperties.style.display = "none";
  }
}
