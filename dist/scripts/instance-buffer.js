import { NODE_LAYOUT } from './types.js';
import { getWorldPosition } from './scene-graph.js';
/**
 * Per-instance stride: 16 floats = 64 bytes.
 *
 * | Attribute           | floats | Contents                                   |
 * |---------------------|--------|--------------------------------------------|
 * | a_InstancePosSize   | 4      | worldX, worldY, width, height              |
 * | a_InstanceColor     | 4      | r, g, b, a                                 |
 * | a_InstanceTexInfo   | 4      | texNativeW, texNativeH, use9Slice, useTex  |
 * | a_InstanceSlice     | 4      | left, top, right, bottom margins           |
 */
const INSTANCE_FLOATS = 16;
const SLICE_MARGIN = 16.0;
/**
 * Builds per-frame instance data arrays and groups them into batches
 * for the renderer to issue `drawElementsInstanced` calls.
 */
export class InstanceBuffer {
    gl;
    buffer;
    data;
    capacity = 256;
    constructor(gl) {
        this.gl = gl;
        this.buffer = gl.createBuffer();
        this.data = new Float32Array(this.capacity * INSTANCE_FLOATS);
    }
    get glBuffer() {
        return this.buffer;
    }
    ensureCapacity(count) {
        if (count <= this.capacity)
            return;
        this.capacity = Math.max(this.capacity * 2, count);
        this.data = new Float32Array(this.capacity * INSTANCE_FLOATS);
    }
    writeInstance(index, x, y, w, h, r, g, b, a, texNativeW, texNativeH, use9Slice, useTexture, sliceL, sliceT, sliceR, sliceB) {
        const offset = index * INSTANCE_FLOATS;
        this.data[offset + 0] = x;
        this.data[offset + 1] = y;
        this.data[offset + 2] = w;
        this.data[offset + 3] = h;
        this.data[offset + 4] = r;
        this.data[offset + 5] = g;
        this.data[offset + 6] = b;
        this.data[offset + 7] = a;
        this.data[offset + 8] = texNativeW;
        this.data[offset + 9] = texNativeH;
        this.data[offset + 10] = use9Slice;
        this.data[offset + 11] = useTexture;
        this.data[offset + 12] = sliceL;
        this.data[offset + 13] = sliceT;
        this.data[offset + 14] = sliceR;
        this.data[offset + 15] = sliceB;
    }
    buildPickBatch(nodes, allNodesMap) {
        if (nodes.length === 0)
            return [];
        this.ensureCapacity(nodes.length);
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const { x, y } = getWorldPosition(node.id, allNodesMap);
            this.writeInstance(i, x, y, node.width, node.height, node.pickColor[0], node.pickColor[1], node.pickColor[2], 1.0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
        this.upload(nodes.length);
        return [{ textureId: '__pick__', cachedTexture: null, offset: 0, count: nodes.length }];
    }
    buildGlowBatch(nodes, allNodesMap) {
        let cursor = 0;
        // First count to ensure capacity
        let glowCount = 0;
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].isDropTarget || nodes[i].isSelected)
                glowCount++;
        }
        if (glowCount === 0)
            return [];
        this.ensureCapacity(glowCount);
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (!node.isDropTarget && !node.isSelected)
                continue;
            const { x, y } = getWorldPosition(node.id, allNodesMap);
            const expand = node.isDropTarget ? 6 : 4;
            const r = node.isDropTarget ? 0.13 : 0.23;
            const g = node.isDropTarget ? 0.86 : 0.51;
            const b = node.isDropTarget ? 0.39 : 0.96;
            this.writeInstance(cursor++, x - expand, y - expand, node.width + expand * 2, node.height + expand * 2, r, g, b, 0.8, 0, 0, 0, 0, 0, 0, 0, 0);
        }
        this.upload(cursor);
        return [{ textureId: '__glow__', cachedTexture: null, offset: 0, count: cursor }];
    }
    buildTexturedBatches(nodes, allNodesMap, textureCache, quadType) {
        if (nodes.length === 0)
            return [];
        // 1. Collect unique texture IDs currently in use without allocating objects per node
        const activeTexIds = new Set();
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            activeTexIds.add(quadType === 'body' ? node.textureIds.body : node.textureIds.head);
        }
        this.ensureCapacity(nodes.length);
        const batches = [];
        let cursor = 0;
        // 2. Iterate over the unique texture IDs. For each ID, find matching nodes.
        // This avoids creating temporary grouping arrays/objects, trading a small amount of CPU
        // looping (O(TexCount * NodeCount)) for zero GC pressure, which is vastly better for 60fps.
        for (const texId of activeTexIds) {
            const cached = textureCache.getTexture(texId);
            if (!cached)
                continue;
            const batchStart = cursor;
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                const nodeTexId = quadType === 'body' ? node.textureIds.body : node.textureIds.head;
                if (nodeTexId !== texId)
                    continue;
                const { x, y } = getWorldPosition(node.id, allNodesMap);
                let quadH;
                if (quadType === 'head') {
                    if (node.nodeType === 'node' || node.nodeType === 'composition-child') {
                        quadH = NODE_LAYOUT.headerHeight;
                    }
                    else {
                        quadH = node.height;
                    }
                }
                else {
                    quadH = node.height;
                }
                this.writeInstance(cursor++, x, y, node.width, quadH, 1, 1, 1, 1, cached.nativeWidth, cached.nativeHeight, 1.0, 1.0, SLICE_MARGIN, SLICE_MARGIN, SLICE_MARGIN, SLICE_MARGIN);
            }
            if (cursor > batchStart) {
                batches.push({
                    textureId: texId,
                    cachedTexture: cached,
                    offset: batchStart,
                    count: cursor - batchStart,
                });
            }
        }
        this.upload(cursor);
        return batches;
    }
    upload(count) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        // Use bufferData with same or new size to upload.
        // If we wanted to avoid orphaning entirely, we'd use bufferSubData, but bufferData
        // is required to set the size of the buffer initially or when it grows.
        // DYNAMIC_DRAW allows the driver to optimize orphaning.
        gl.bufferData(gl.ARRAY_BUFFER, this.data.subarray(0, count * INSTANCE_FLOATS), gl.DYNAMIC_DRAW);
    }
    dispose() {
        this.gl.deleteBuffer(this.buffer);
    }
}
//# sourceMappingURL=instance-buffer.js.map