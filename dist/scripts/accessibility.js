function describeNodeType(type) {
    switch (type) {
        case 'group':
            return 'Group';
        case 'composition':
            return 'Composition';
        case 'composition-child':
            return 'Composition child';
        case 'node':
        default:
            return 'Node';
    }
}
export class AccessibilityTree {
    listElement;
    constructor() {
        this.listElement = document.getElementById('sr-node-list');
        if (!this.listElement) {
            console.warn('Screen reader node list not found');
        }
    }
    addNode(id, label, type) {
        if (!this.listElement)
            return;
        const li = document.createElement('li');
        li.id = `sr-node-${id}`;
        li.textContent = `${describeNodeType(type)}: ${label}`;
        this.listElement.appendChild(li);
    }
    removeNode(id) {
        if (!this.listElement)
            return;
        const li = document.getElementById(`sr-node-${id}`);
        if (li) {
            li.remove();
        }
    }
    updateLabel(id, label, type) {
        if (!this.listElement)
            return;
        const li = document.getElementById(`sr-node-${id}`);
        if (li) {
            li.textContent = `${describeNodeType(type)}: ${label}`;
        }
    }
}
//# sourceMappingURL=accessibility.js.map