const DEFAULT_STROKE = { color: "rgba(97, 158, 255, 0.82)", width: 1 };
export class EdgeTypeRegistry {
    descriptors = new Map();
    constructor() {
        for (const route of ["line", "cubic", "line-curve", "orthogonal"]) {
            this.register({
                type: route,
                route,
                stroke: { ...DEFAULT_STROKE },
                head: { type: route === "line" ? "none" : "arrow", skinId: "arrow" },
                label: { enabled: true, editable: false },
                hitTest: { tolerance: 8 },
                actions: { selectable: true, deletable: true },
            });
        }
    }
    register(descriptor) {
        if (this.descriptors.has(descriptor.type)) {
            throw new Error(`EdgeTypeRegistry: type "${descriptor.type}" is already registered`);
        }
        if (!["line", "cubic", "line-curve", "orthogonal"].includes(descriptor.route)) {
            throw new Error(`EdgeTypeRegistry: unsupported route "${descriptor.route}"`);
        }
        if (descriptor.hitTest.tolerance < 0) {
            throw new Error(`EdgeTypeRegistry: hit-test tolerance cannot be negative`);
        }
        this.descriptors.set(descriptor.type, descriptor);
    }
    replace(descriptor) {
        if (!this.descriptors.has(descriptor.type)) {
            throw new Error(`EdgeTypeRegistry: type "${descriptor.type}" is not registered`);
        }
        this.descriptors.delete(descriptor.type);
        this.register(descriptor);
    }
    get(type) {
        return this.descriptors.get(type);
    }
    has(type) {
        return this.descriptors.has(type);
    }
}
//# sourceMappingURL=edge-type-registry.js.map