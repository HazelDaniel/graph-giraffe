// ─── Registry ────────────────────────────────────────────
export class NodeTypeRegistry {
    descriptors = new Map();
    containerTypes = new Set();
    leafTypes = new Set();
    register(descriptor) {
        if (this.descriptors.has(descriptor.type)) {
            throw new Error(`NodeTypeRegistry: type "${descriptor.type}" is already registered`);
        }
        this.descriptors.set(descriptor.type, descriptor);
        if (descriptor.category === "container") {
            this.containerTypes.add(descriptor.type);
        }
        else {
            this.leafTypes.add(descriptor.type);
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
    contributesToChildWorldPosition(type) {
        const desc = this.descriptors.get(type);
        if (!desc)
            return true;
        return desc.contributesToChildWorldPosition ?? true;
    }
}
//# sourceMappingURL=node-type-registry.js.map