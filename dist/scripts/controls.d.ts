import { GGPropGroup } from "../components/prop-group";
import { NodeData, ThemeName } from "./types";
/** All interaction events the NodeEditor handles, expressed as plain callbacks. */
export interface ControlCallbacks {
    onAddNode(): void;
    onAddGroup(): void;
    onAddComposition(): void;
    onToggleMultiSelect(): void;
    onUndo(): void;
    onRedo(): void;
    onDeleteNode(): void;
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
export declare class UIControls {
    private addNodeButton;
    private createSubgraphButton;
    private addGroupButton;
    private addCompositionButton;
    private multiSelectButton;
    private undoButton;
    private redoButton;
    private deleteNodeButton;
    private sidebar;
    private sidebarToggle;
    private nodeProperties;
    private nodeLabelInput;
    nodePropGroup: GGPropGroup;
    constructor(canvas: HTMLCanvasElement, container: HTMLElement, historyPane: HTMLElement, toolPane: HTMLElement, callbacks: ControlCallbacks);
    enableDelete(): void;
    disableDelete(): void;
    enableAddComposition(): void;
    disableAddComposition(): void;
    setMultiSelectActive(active: boolean): void;
    enableUndo(): void;
    disableUndo(): void;
    enableRedo(): void;
    disableRedo(): void;
    showProperties(node: NodeData): void;
    hideProperties(): void;
}
