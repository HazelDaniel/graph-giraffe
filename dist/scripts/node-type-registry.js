// ─── Registry ────────────────────────────────────────────
export class NodeTypeRegistry {
    descriptors = new Map();
    containerTypes = new Set();
    leafTypes = new Set();
    renderMode = null;
    /**
     * Bind the registry to an editor-wide rendering mode. Once set, `register`
     * and `replace` enforce "replacing, not additive": in `"dom"` mode every
     * registered type must be DOM-backed, and in `"webgl"` mode a DOM descriptor
     * is rejected. This is what keeps the two pipelines from coexisting.
     */
    setRenderMode(renderMode) {
        this.renderMode = renderMode;
    }
    assertMode(descriptor) {
        if (this.renderMode === "webgl" && descriptor.renderMode === "dom") {
            throw new Error(`NodeTypeRegistry: type "${descriptor.type}" is a DOM descriptor but the editor is in webgl mode. DOM descriptors require renderMode: "dom" on the editor.`);
        }
        if (this.renderMode === "dom" && descriptor.renderMode !== "dom") {
            throw new Error(`NodeTypeRegistry: type "${descriptor.type}" is not a DOM descriptor but the editor is in dom mode. All primitives must be DOM-backed in dom mode.`);
        }
    }
    register(descriptor) {
        if (this.descriptors.has(descriptor.type)) {
            throw new Error(`NodeTypeRegistry: type "${descriptor.type}" is already registered`);
        }
        this.assertMode(descriptor);
        this.put(descriptor);
    }
    /**
     * Replace an already-registered descriptor (or add a new one). DOM plugins
     * use this to swap a built-in WebGL type for a DOM-backed descriptor under
     * the SAME type name, so snapshots stay portable across rendering modes.
     */
    replace(descriptor) {
        this.assertMode(descriptor);
        this.put(descriptor);
    }
    put(descriptor) {
        this.descriptors.set(descriptor.type, descriptor);
        if (descriptor.category === "container") {
            this.containerTypes.add(descriptor.type);
            this.leafTypes.delete(descriptor.type);
        }
        else {
            this.leafTypes.add(descriptor.type);
            this.containerTypes.delete(descriptor.type);
        }
    }
    get(type) {
        return this.descriptors.get(type);
    }
    has(type) {
        return this.descriptors.has(type);
    }
    getAll() {
        return this.descriptors.values();
    }
    isContainer(type) {
        return this.containerTypes.has(type);
    }
    isLeaf(type) {
        return this.leafTypes.has(type);
    }
    getZTier(type) {
        return this.descriptors.get(type)?.zTier ?? 0.4;
    }
    getDefaultSize(type, collapsed) {
        const desc = this.descriptors.get(type);
        if (!desc)
            return { width: 190, height: 150 };
        if (collapsed && desc.collapsedSize)
            return { ...desc.collapsedSize };
        return { ...desc.defaultSize };
    }
    canReparentTo(childType, parentType) {
        const desc = this.descriptors.get(childType);
        if (!desc)
            return false;
        if (parentType === null) {
            return desc.canBeRoot;
        }
        if (!this.isContainer(parentType))
            return false;
        if (desc.allowedParents === null) {
            return true;
        }
        return desc.allowedParents.includes(parentType);
    }
    isConnectionCandidate(type, connectionMode) {
        const desc = this.descriptors.get(type);
        if (!desc)
            return false;
        return desc.isConnectionCandidate(connectionMode);
    }
    hasHandles(type, connectionMode) {
        const desc = this.descriptors.get(type);
        if (!desc)
            return false;
        if (desc.handles.always)
            return true;
        return desc.isConnectionCandidate(connectionMode);
    }
    allowsMultiConnect(type) {
        return this.descriptors.get(type)?.handles.multiConnect ?? false;
    }
    isValidConnectionSide(type, side, role) {
        const desc = this.descriptors.get(type);
        if (!desc)
            return true;
        if (role === "source") {
            return desc.handles.outputSides ? desc.handles.outputSides.includes(side) : true;
        }
        return desc.handles.inputSides ? desc.handles.inputSides.includes(side) : true;
    }
    getToolbarActions(type, isCollapsed) {
        const desc = this.descriptors.get(type);
        if (!desc)
            return [];
        if (isCollapsed && desc.collapsedToolbarActions)
            return desc.collapsedToolbarActions;
        return desc.toolbarActions ?? [];
    }
    contributesToChildWorldPosition(type) {
        const desc = this.descriptors.get(type);
        if (!desc)
            return true;
        return desc.contributesToChildWorldPosition ?? true;
    }
    /** Whether a type's visual body is rendered as a DOM element (renderMode "dom"). */
    isDomRendered(type) {
        return this.descriptors.get(type)?.renderMode === "dom";
    }
    getDomRenderer(type) {
        return this.descriptors.get(type)?.domRenderer;
    }
}
//# sourceMappingURL=node-type-registry.js.map