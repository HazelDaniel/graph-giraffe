import { NODE_LAYOUT, getSubgraphLinkLocal } from "./types.js";
function createDefaultProps() {
    return {
        groups: ["Appearance", "Data", "Meta"],
        booleans: {
            "ungrouped": [
                { label: "Visible", value: true, uiPrimitive: "checkbox" },
                { label: "Primary", value: false, uiPrimitive: "checkbox" },
            ],
            "Appearance": [{ label: "Shadow", value: true, uiPrimitive: "checkbox" }],
        },
        texts: {
            "Data": [
                { label: "Value", value: "0", uiPrimitive: "range" },
                { label: "default", value: "0", uiPrimitive: "range" },
            ],
        },
        enums: {
            "Appearance": [
                { label: "Size", value: "Medium", uiPrimitive: "select", options: ["Medium", "Large", "ExtraLarge"] },
            ],
            "Meta": [
                { label: "Depth", value: "Deep", uiPrimitive: "select", options: ["Shallow", "Steep", "Deep"] },
            ],
        },
    };
}
/**
 * Built-ins still own a measurement template even though their default
 * geometry is known. This keeps the intrinsic-measurement contract active for
 * DOM mode and gives adapters one consistent place to replace dimensions.
 */
function createBuiltinMeasurementTemplate(fallback, getHeight, collapsedHeight, getContainerSize) {
    return ({ node, props, children, element, isCollapsed }) => {
        const containerSize = getContainerSize?.(children);
        const width = containerSize?.width ?? fallback.width;
        const height = isCollapsed && collapsedHeight != null
            ? collapsedHeight
            : containerSize?.height ?? getHeight?.({ ...node, props }) ?? fallback.height;
        element.style.boxSizing = "border-box";
        element.style.width = `${width}px`;
        element.style.height = `${Math.max(1, height)}px`;
        return element;
    };
}
function getVerticalContainerSize(fallback, children) {
    const paddingY = 50;
    const paddingBottom = 40;
    const gapY = 10;
    const totalChildHeight = children.reduce((total, child) => total + child.height, 0);
    const gaps = Math.max(0, children.length - 1) * gapY;
    const maxChildWidth = children.reduce((maxWidth, child) => Math.max(maxWidth, child.width), 0);
    return {
        width: Math.max(fallback.width, maxChildWidth),
        height: Math.max(fallback.height, totalChildHeight + gaps + paddingY + paddingBottom),
    };
}
export const nodeDescriptor = {
    type: "node",
    category: "leaf",
    zTier: 0.4,
    defaultSize: { width: 190, height: 150 },
    collapsedSize: { width: 190, height: NODE_LAYOUT.headerHeight },
    measurementTemplate: createBuiltinMeasurementTemplate({ width: 190, height: 150 }, (node) => nodeDescriptor.calculateHeight?.(node) ?? 150, NODE_LAYOUT.headerHeight),
    handles: { always: true, sides: ["left", "right"], multiConnect: false },
    isConnectionCandidate: () => true,
    allowedParents: ["group", "subgraph"],
    canBeRoot: true,
    defaultTextureIds: { body: "gg-node-body-default", head: "gg-node-head-default" },
    textureKinds: ["node-body", "node-head"],
    createDefaultProps,
    calculateHeight: (node) => {
        if (!node.props)
            return 150;
        let lineCount = 0;
        for (const items of Object.values(node.props.booleans))
            lineCount += items.length;
        for (const items of Object.values(node.props.texts))
            lineCount += items.length;
        for (const items of Object.values(node.props.enums))
            lineCount += items.length;
        lineCount += node.props.groups.length;
        return NODE_LAYOUT.headerHeight + 16 + lineCount * 20 + 16;
    },
    renderMode: "textured",
    overlayConfig: {
        titlePosition: "header",
        showTitle: true,
        showLockIcon: false,
        showAddIcon: false,
        showProps: true,
        showCompositionRef: true,
    },
    toolbarActions: ["edit", "delete"],
    collapsible: false,
    lockable: false,
};
export const hubDescriptor = {
    type: "hub",
    category: "leaf",
    zTier: 0.4,
    defaultSize: { width: 240, height: 100 },
    measurementTemplate: createBuiltinMeasurementTemplate({ width: 240, height: 100 }),
    handles: {
        always: true,
        sides: ["left", "right"],
        multiConnect: true,
        outputSides: ["right"],
        inputSides: ["left"],
    },
    isConnectionCandidate: () => true,
    allowedParents: ["subgraph"],
    canBeRoot: true,
    defaultTextureIds: { body: "gg-node-body-default", head: "gg-node-head-default" },
    textureKinds: ["node-body", "node-head"],
    renderMode: "rounded-rect",
    renderConfig: {
        fillColor: [0.12, 0.13, 0.14, 1.0],
        borderColor: [0.25, 0.27, 0.29, 1.0],
        borderWidth: 1.5,
        radius: 16,
    },
    overlayConfig: {
        titlePosition: "header",
        showTitle: true,
        showLockIcon: false,
        showAddIcon: false,
        showProps: false,
        showCompositionRef: false,
    },
    toolbarActions: ["edit", "delete"],
    collapsible: false,
    lockable: false,
};
export const groupDescriptor = {
    type: "group",
    category: "container",
    zTier: 0,
    defaultSize: { width: 220, height: 200 },
    measurementTemplate: createBuiltinMeasurementTemplate({ width: 220, height: 200 }, undefined, undefined, (children) => getVerticalContainerSize({ width: 220, height: 200 }, children)),
    handles: { always: false, sides: ["left", "right"], multiConnect: false },
    isConnectionCandidate: (mode) => mode === "group",
    allowedParents: ["subgraph"],
    canBeRoot: true,
    defaultTextureIds: { body: "gg-group-body-default", head: "gg-group-head-default" },
    textureKinds: ["group-body", "group-head"],
    renderMode: "textured",
    overlayConfig: {
        titlePosition: "container-top",
        showTitle: false,
        showLockIcon: true,
        showAddIcon: true,
        showProps: false,
        showCompositionRef: false,
    },
    toolbarActions: ["spotlight", "edit", "delete"],
    collapsible: false,
    lockable: true,
    usesCanvasLabel: true,
    contributesToChildWorldPosition: true,
};
export const compositionDescriptor = {
    type: "composition",
    category: "container",
    zTier: 0.2,
    defaultSize: { width: 220, height: 200 },
    measurementTemplate: createBuiltinMeasurementTemplate({ width: 220, height: 200 }, undefined, undefined, (children) => getVerticalContainerSize({ width: 220, height: 200 }, children)),
    handles: { always: false, sides: ["left", "right"], multiConnect: false },
    isConnectionCandidate: (mode) => mode === "node",
    allowedParents: ["group", "subgraph"],
    canBeRoot: false,
    defaultTextureIds: { body: "gg-composition-body-default", head: "gg-composition-head-default" },
    textureKinds: ["composition-body", "composition-head"],
    renderMode: "textured",
    overlayConfig: {
        titlePosition: "container-top",
        showTitle: false,
        showLockIcon: false,
        showAddIcon: false,
        showProps: false,
        showCompositionRef: false,
    },
    toolbarActions: ["delete"],
    collapsible: false,
    lockable: false,
    contributesToChildWorldPosition: true,
};
export const compositionChildDescriptor = {
    type: "composition-child",
    category: "leaf",
    zTier: 0.4,
    defaultSize: { width: 160, height: NODE_LAYOUT.headerHeight },
    measurementTemplate: createBuiltinMeasurementTemplate({ width: 160, height: NODE_LAYOUT.headerHeight }),
    handles: { always: false, sides: [], multiConnect: false },
    isConnectionCandidate: () => false,
    allowedParents: ["composition"],
    canBeRoot: false,
    defaultTextureIds: { body: "gg-node-body-default", head: "gg-composition-child-head-default" },
    textureKinds: ["composition-child-head"],
    renderMode: "textured",
    overlayConfig: {
        titlePosition: "center",
        showTitle: true,
        showLockIcon: false,
        showAddIcon: false,
        showProps: false,
        showCompositionRef: false,
    },
    toolbarActions: ["edit", "delete"],
    collapsible: false,
    lockable: false,
};
export const subgraphDescriptor = {
    type: "subgraph",
    category: "container",
    zTier: -0.05,
    defaultSize: { width: 220, height: 160 },
    collapsedSize: { width: 190, height: NODE_LAYOUT.headerHeight },
    measurementTemplate: createBuiltinMeasurementTemplate({ width: 220, height: 160 }, undefined, NODE_LAYOUT.headerHeight),
    handles: {
        always: true,
        sides: ["left", "right"],
        multiConnect: false,
        outputSides: ["right"],
        inputSides: ["left"],
    },
    isConnectionCandidate: (mode) => mode === "node",
    allowedParents: ["subgraph"],
    canBeRoot: true,
    defaultTextureIds: { body: "", head: "" },
    renderMode: "rounded-rect",
    renderConfig: {
        fillColor: [0.11, 0.12, 0.13, 0.95],
        borderColor: [0.22, 0.24, 0.26, 1.0],
        borderWidth: 1.5,
        radius: 12,
    },
    overlayConfig: {
        titlePosition: "header",
        showTitle: true,
        showLockIcon: false,
        showAddIcon: false,
        showProps: false,
        showCompositionRef: false,
    },
    drawOverlay: ({ node, worldX, worldY, isCollapsed, iconRenderer, iconBackgroundRenderer }) => {
        // Clones show an "open original" link (U+F003) centered in the body.
        if (node.subgraphRefId == null || isCollapsed)
            return;
        const { x, y } = getSubgraphLinkLocal(node);
        const glyphSize = NODE_LAYOUT.subgraphLinkIconSize;
        iconBackgroundRenderer.addQuad(worldX + x, worldY + y + 1.2, 0.35, 0.55, 1.0, 0.16, 16, 16, 0, 0, glyphSize, "center", undefined, "circle");
        iconRenderer.addText("\u{F003}", worldX + x, worldY + y, glyphSize, 0.35, 0.55, 1.0, 1.0, "center", "middle");
    },
    toolbarActions: ["collapse", "ungraph", "clone", "edit", "delete"],
    collapsedToolbarActions: ["expand", "clone", "edit", "delete"],
    collapsible: true,
    lockable: false,
    contributesToChildWorldPosition: false,
};
export const branchDescriptor = {
    type: "branch",
    category: "leaf",
    zTier: 0.4,
    defaultSize: { width: 140, height: 120 },
    measurementTemplate: createBuiltinMeasurementTemplate({ width: 140, height: 120 }),
    handles: {
        always: true,
        sides: ["top", "left", "right"],
        multiConnect: false,
        outputSides: ["left", "right"],
        inputSides: ["top"],
    },
    isConnectionCandidate: () => true,
    allowedParents: ["subgraph"],
    canBeRoot: true,
    defaultTextureIds: { body: "gg-node-body-default", head: "gg-node-head-default" },
    textureKinds: ["node-body", "node-head"],
    renderMode: "rounded-triangle",
    renderConfig: {
        fillColor: [0.10, 0.11, 0.13, 0.95],
        borderColor: [0.45, 0.50, 0.58, 0.9],
        borderWidth: 1.8,
        radius: 10,
    },
    overlayConfig: {
        titlePosition: "center",
        showTitle: false,
        showLockIcon: false,
        showAddIcon: false,
        showProps: false,
        showCompositionRef: false,
    },
    toolbarActions: ["edit", "delete"],
    collapsible: false,
    lockable: false,
};
export const BUILTIN_DESCRIPTORS = [
    nodeDescriptor,
    hubDescriptor,
    branchDescriptor,
    groupDescriptor,
    compositionDescriptor,
    compositionChildDescriptor,
    subgraphDescriptor,
];
//# sourceMappingURL=builtin-types.js.map