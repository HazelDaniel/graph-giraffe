import { NodeType } from './types.js';
export declare class AccessibilityTree {
    private listElement;
    constructor();
    addNode(id: number, label: string, type: NodeType): void;
    removeNode(id: number): void;
    updateLabel(id: number, label: string, type: NodeType): void;
}
