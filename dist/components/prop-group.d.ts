import { NodePropType } from "../scripts/types.js";
import "./multi-select.js";
export declare class GGPropGroup extends HTMLElement {
    constructor();
    private getFieldTarget;
    /**
     * Generates the DOM based on the NodePropType data.
     * Returns the estimated height of the WebGL node body based on the properties.
     */
    useProps(data: NodePropType): number;
    private dispatchPropChange;
}
