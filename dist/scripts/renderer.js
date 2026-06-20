import { EdgeHeadTextureLibrary, } from "./edge-head-textures.js";
import { buildConnectionPreviewGeometry, buildEdgeRouteGeometry, } from "./edge-geometry.js";
import { getWorldPosition } from "./scene-graph.js";
import { drawHandle } from "./texture.js";
import { getHandleScreenGeometry } from "./handle-geometry.js";
import { TextureCache } from "./texture-cache.js";
import { NODE_LAYOUT } from "./types.js";
import { getMSDFShaderLocations } from "./shader.js";
import { MsdfTextRenderer } from "./msdf-text.js";
/**
 * Owns the WebGL draw loop and all rendering logic.
 * It knows nothing about input events or UI — it only reads Camera and NodeStore state.
 */
export class Renderer {
    gl;
    canvas;
    bgCanvas;
    program;
    locations;
    geometry;
    bgGeometry;
    store;
    edgeStore;
    camera;
    bgProgram;
    bgLocations;
    labelCanvas;
    getConnectionPreview;
    getBgColor;
    msdfProgram;
    msdfAtlas;
    iconAtlas;
    modelMatrix = new Matrix4();
    projMatrix = new Matrix4();
    constructor(gl, canvas, bgCanvas, program, locations, geometry, bgGeometry, store, edgeStore, camera, bgProgram, bgLocations, labelCanvas, getConnectionPreview, 
    /** Callback so Renderer never stores bgColor itself — it belongs to the editor. */
    getBgColor, msdfProgram, msdfAtlas, iconAtlas) {
        this.gl = gl;
        this.canvas = canvas;
        this.bgCanvas = bgCanvas;
        this.program = program;
        this.locations = locations;
        this.geometry = geometry;
        this.bgGeometry = bgGeometry;
        this.store = store;
        this.edgeStore = edgeStore;
        this.camera = camera;
        this.bgProgram = bgProgram;
        this.bgLocations = bgLocations;
        this.labelCanvas = labelCanvas;
        this.getConnectionPreview = getConnectionPreview;
        this.getBgColor = getBgColor;
        this.msdfProgram = msdfProgram;
        this.msdfAtlas = msdfAtlas;
        this.iconAtlas = iconAtlas;
        this.labelCtx = labelCanvas.getContext("2d");
        this.edgeVertexBuffer = gl.createBuffer();
        this.edgeHeadBuffer = gl.createBuffer();
        if (!this.edgeVertexBuffer) {
            throw new Error("Unable to allocate edge vertex buffer");
        }
        if (!this.edgeHeadBuffer) {
            throw new Error("Unable to allocate edge head buffer");
        }
        this.edgeHeadTextures = new EdgeHeadTextureLibrary(gl);
        this.textureCache = new TextureCache(gl, () => {
            // It's a continuous loop, so we don't strictly need to force a redraw,
            // but if we were using on-demand rendering we would trigger it here.
        });
        const msdfLocations = getMSDFShaderLocations(gl, msdfProgram);
        this.textRenderer = new MsdfTextRenderer(gl, msdfProgram, msdfLocations, msdfAtlas);
        this.iconRenderer = new MsdfTextRenderer(gl, msdfProgram, msdfLocations, iconAtlas);
    }
    textRenderer;
    iconRenderer;
    labelCtx;
    edgeVertexBuffer;
    edgeHeadBuffer;
    edgeHeadTextures;
    edgeFrame = [];
    textureCache;
    /** Call once after each canvas resize to update the orthographic projection. */
    resize(width, height) {
        this.gl.viewport(0, 0, width, height);
        // Origin top-left, y-axis pointing down — matches screen and 2D canvas convention
        this.projMatrix.setOrtho(0, width, height, 0, -1, 1);
        this.labelCanvas.width = width;
        this.labelCanvas.height = height;
    }
    /** Start the RAF-driven render loop. */
    startLoop() {
        requestAnimationFrame(this.tick.bind(this));
    }
    tick() {
        this.drawBGFrame();
        this.drawFrame();
        requestAnimationFrame(this.tick.bind(this));
    }
    drawFrame() {
        this.textureCache.processUploads();
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        // gl.clearColor(0.0, 0.0, 0.0, 0.0);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.drawNodes(false);
        this.drawEdges();
        this.drawOverlay();
    }
    drawOverlay() {
        if (!this.labelCtx)
            return;
        this.labelCtx.clearRect(0, 0, this.labelCanvas.width, this.labelCanvas.height);
        this.drawConnectionPreview();
        this.drawEdgeLabels();
        for (const node of this.store.visibleNodes()) {
            this.drawHandles(node);
        }
        //TODO: conditionally call based on '!isZooming'
        this.drawGroupLabels();
    }
    drawConnectionPreview() {
        if (!this.labelCtx)
            return;
        const preview = this.getConnectionPreview();
        if (!preview)
            return;
        const route = buildConnectionPreviewGeometry(preview.sourceNodeId, preview.sourceHandleSide, preview.screenX, preview.screenY, this.store, this.camera);
        if (!route)
            return;
        this.labelCtx.save();
        this.labelCtx.beginPath();
        this.labelCtx.lineWidth = 2;
        this.labelCtx.strokeStyle = "rgba(96, 165, 250, 0.95)";
        this.labelCtx.setLineDash([8, 6]);
        this.labelCtx.moveTo(route.screenPoints[0].x, route.screenPoints[0].y);
        for (let i = 1; i < route.screenPoints.length; i++) {
            this.labelCtx.lineTo(route.screenPoints[i].x, route.screenPoints[i].y);
        }
        this.labelCtx.stroke();
        this.labelCtx.restore();
    }
    drawEdgeLabels() {
        if (!this.labelCtx)
            return;
        this.labelCtx.save();
        this.labelCtx.font = "500 12px Inter, sans-serif";
        this.labelCtx.textBaseline = "middle";
        this.labelCtx.fillStyle = "rgba(226, 232, 240, 0.95)";
        for (const route of this.edgeFrame) {
            if (!route.edge.label)
                continue;
            const x = route.labelScreenPoint.x;
            const y = route.labelScreenPoint.y - 12;
            const isSelected = route.edge.isSelected;
            const metrics = this.labelCtx.measureText(route.edge.label);
            const padX = 8;
            const padY = 4;
            const width = metrics.width + padX * 2;
            const height = 20;
            this.labelCtx.fillStyle = isSelected
                ? "rgba(69, 26, 3, 0.92)"
                : "rgba(15, 23, 42, 0.72)";
            this.labelCtx.beginPath();
            this.labelCtx.roundRect(x - width / 2, y - height / 2, width, height, 8);
            this.labelCtx.fill();
            this.labelCtx.fillStyle = isSelected
                ? "rgba(255, 243, 205, 0.98)"
                : "rgba(226, 232, 240, 0.95)";
            this.labelCtx.fillText(route.edge.label, x - metrics.width / 2, y);
        }
        this.labelCtx.restore();
    }
    isRectInViewport(worldX, worldY, width, height, extraPadding = 0) {
        const viewportMin = this.camera.screenToWorld(0, 0);
        const viewportMax = this.camera.screenToWorld(this.canvas.width, this.canvas.height);
        // Inflate viewport slightly for safety (e.g., thick strokes, glows, bezier curves)
        const padding = (50 + extraPadding) / this.camera.zoom;
        viewportMin.x -= padding;
        viewportMin.y -= padding;
        viewportMax.x += padding;
        viewportMax.y += padding;
        if (worldX + width < viewportMin.x)
            return false;
        if (worldY + height < viewportMin.y)
            return false;
        if (worldX > viewportMax.x)
            return false;
        if (worldY > viewportMax.y)
            return false;
        return true;
    }
    drawGroupLabels() {
        if (!this.labelCtx)
            return;
        this.labelCtx.font = "600 14px Inter, sans-serif";
        this.labelCtx.textBaseline = "middle";
        for (const node of this.store.visibleNodes()) {
            if (node.nodeType !== "group")
                continue;
            const { x, y } = getWorldPosition(node.id, this.store.allNodesMap);
            if (!this.isRectInViewport(x, y, node.width, node.height))
                continue;
            const screenPos = this.camera.worldToScreen(node.localX, node.localY);
            this.labelCtx.fillStyle = "#f8fafc";
            this.labelCtx.fillText(node.text, screenPos.x + 15, screenPos.y + 20);
        }
    }
    drawHandles(node) {
        if (!this.labelCtx || node.handles.length === 0)
            return;
        const { x, y } = getWorldPosition(node.id, this.store.allNodesMap);
        const zoom = this.camera.zoom;
        const { panX, panY } = this.camera;
        for (const handle of node.handles) {
            const geometry = getHandleScreenGeometry(x, y, node, handle, zoom, panX, panY);
            drawHandle(this.labelCtx, handle, geometry.centerX, geometry.centerY);
        }
    }
    drawEdges() {
        const gl = this.gl;
        const visibleEdges = this.edgeStore
            .allEdges()
            .filter((edge) => edge.visible);
        this.edgeFrame = [];
        if (visibleEdges.length === 0)
            return;
        const lineVertices = [];
        const headVertices = [];
        const lineDraws = [];
        const headDraws = [];
        let lineCursor = 0;
        let headCursor = 0;
        for (const edge of visibleEdges) {
            const sourceNode = this.store.get(edge.sourceNodeId);
            const targetNode = this.store.get(edge.targetNodeId);
            if (!sourceNode || !targetNode)
                continue;
            const sPos = getWorldPosition(sourceNode.id, this.store.allNodesMap);
            const tPos = getWorldPosition(targetNode.id, this.store.allNodesMap);
            const minX = Math.min(sPos.x, tPos.x);
            const minY = Math.min(sPos.y, tPos.y);
            const maxX = Math.max(sPos.x + sourceNode.width, tPos.x + targetNode.width);
            const maxY = Math.max(sPos.y + sourceNode.height, tPos.y + targetNode.height);
            if (!this.isRectInViewport(minX, minY, maxX - minX, maxY - minY, 100))
                continue;
            const geometry = buildEdgeRouteGeometry(edge, this.store, this.camera);
            if (!geometry || geometry.worldPoints.length < 2)
                continue;
            this.edgeFrame.push(geometry);
            if (edge.isSelected)
                continue;
            lineDraws.push({ first: lineCursor, count: geometry.worldPoints.length });
            lineCursor += geometry.worldPoints.length;
            for (const point of geometry.worldPoints) {
                lineVertices.push(point.x, point.y, 0, 0);
            }
            if (geometry.arrowhead) {
                const region = this.edgeHeadTextures.getRegion(edge.headSkinId);
                headDraws.push({ first: headCursor, count: 6 });
                headCursor += 6;
                headVertices.push(...this.buildHeadQuadVertices(geometry.arrowhead, region));
            }
        }
        gl.useProgram(this.program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this.bindEdgeVertexBuffer(this.edgeVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineVertices), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.uniformMatrix4fv(this.locations.u_ProjMatrix, false, this.projMatrix.elements);
        gl.uniformMatrix4fv(this.locations.u_ViewMatrix, false, this.camera.getViewMatrix().elements);
        this.modelMatrix.setIdentity();
        gl.uniformMatrix4fv(this.locations.u_ModelMatrix, false, this.modelMatrix.elements);
        gl.uniform1i(this.locations.u_UseTexture, 0);
        gl.uniform1i(this.locations.u_Use9Slice, 0);
        gl.uniform4f(this.locations.u_Color, 0.38, 0.62, 1.0, 0.72);
        let vertexOffset = 0;
        for (const draw of lineDraws) {
            gl.drawArrays(gl.LINE_STRIP, vertexOffset, draw.count);
            vertexOffset += draw.count;
        }
        if (headVertices.length > 0) {
            this.bindEdgeVertexBuffer(this.edgeHeadBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headVertices), gl.DYNAMIC_DRAW);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.edgeHeadTextures.texture);
            gl.uniform1i(this.locations.u_UseTexture, 1);
            gl.uniform1i(this.locations.u_Sampler, 0);
            gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
            let headOffset = 0;
            for (const draw of headDraws) {
                gl.drawArrays(gl.TRIANGLES, headOffset, draw.count);
                headOffset += draw.count;
            }
        }
        const selectedEdges = visibleEdges.filter((edge) => edge.isSelected);
        for (const selectedEdge of selectedEdges) {
            const selectedGeometry = buildEdgeRouteGeometry(selectedEdge, this.store, this.camera);
            if (selectedGeometry) {
                this.drawSingleEdge(selectedGeometry, "rgba(245, 158, 11, 0.98)", "rgba(251, 191, 36, 1)");
            }
        }
    }
    drawSingleEdge(geometry, strokeColor, headColor) {
        const gl = this.gl;
        this.bindEdgeVertexBuffer(this.edgeVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.worldPoints.flatMap((point) => [point.x, point.y, 0, 0])), gl.DYNAMIC_DRAW);
        gl.uniformMatrix4fv(this.locations.u_ProjMatrix, false, this.projMatrix.elements);
        gl.uniformMatrix4fv(this.locations.u_ViewMatrix, false, this.camera.getViewMatrix().elements);
        this.modelMatrix.setIdentity();
        gl.uniformMatrix4fv(this.locations.u_ModelMatrix, false, this.modelMatrix.elements);
        gl.uniform1i(this.locations.u_UseTexture, 0);
        gl.uniform4f(this.locations.u_Color, ...this.parseColor(strokeColor));
        gl.drawArrays(gl.LINE_STRIP, 0, geometry.worldPoints.length);
        if (geometry.arrowhead) {
            const region = this.edgeHeadTextures.getRegion(geometry.edge.headSkinId);
            const quad = this.buildHeadQuadVertices(geometry.arrowhead, region);
            this.bindEdgeVertexBuffer(this.edgeHeadBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.DYNAMIC_DRAW);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.edgeHeadTextures.texture);
            gl.uniform1i(this.locations.u_UseTexture, 1);
            gl.uniform1i(this.locations.u_Sampler, 0);
            gl.uniform4f(this.locations.u_Color, ...this.parseColor(headColor));
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    }
    buildHeadQuadVertices(head, region) {
        const headLength = 18;
        const headWidth = 12;
        const halfWidth = headWidth / 2;
        const tangentX = head.tangent.x;
        const tangentY = head.tangent.y;
        const backX = -tangentX;
        const backY = -tangentY;
        const normalX = -tangentY;
        const normalY = tangentX;
        const baseX = head.tip.x + backX * headLength;
        const baseY = head.tip.y + backY * headLength;
        const topLeft = {
            x: baseX + normalX * halfWidth,
            y: baseY + normalY * halfWidth,
        };
        const bottomLeft = {
            x: baseX - normalX * halfWidth,
            y: baseY - normalY * halfWidth,
        };
        const bottomRight = {
            x: head.tip.x - normalX * halfWidth,
            y: head.tip.y - normalY * halfWidth,
        };
        const topRight = {
            x: head.tip.x + normalX * halfWidth,
            y: head.tip.y + normalY * halfWidth,
        };
        return [
            topLeft.x,
            topLeft.y,
            region.u0,
            region.v0,
            bottomLeft.x,
            bottomLeft.y,
            region.u0,
            region.v1,
            bottomRight.x,
            bottomRight.y,
            region.u1,
            region.v1,
            topLeft.x,
            topLeft.y,
            region.u0,
            region.v0,
            bottomRight.x,
            bottomRight.y,
            region.u1,
            region.v1,
            topRight.x,
            topRight.y,
            region.u1,
            region.v0,
        ];
    }
    bindEdgeVertexBuffer(buffer) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(this.locations.a_Position, 2, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(this.locations.a_Position);
        gl.vertexAttribPointer(this.locations.a_TexCoord, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(this.locations.a_TexCoord);
    }
    parseColor(color) {
        if (color.startsWith("rgba(")) {
            const parts = color
                .slice(5, -1)
                .split(",")
                .map((part) => part.trim());
            return [
                Number(parts[0]) / 255,
                Number(parts[1]) / 255,
                Number(parts[2]) / 255,
                Number(parts[3]),
            ];
        }
        return [0.38, 0.62, 1.0, 1.0];
    }
    drawBGFrame() {
        const gl = this.gl;
        // gl.viewport(0, 0, this.bgCanvas.width, this.bgCanvas.height);
        const [r, g, b, a] = this.getBgColor();
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.drawBG(false);
    }
    /**
     * Draw all visible nodes.
     * @param picking — when true, each node is drawn as a flat pick-color silhouette
     *                  (blend disabled, no texture) for the off-screen pick render pass.
     */
    drawNodes(picking) {
        const gl = this.gl;
        gl.useProgram(this.program);
        if (picking) {
            gl.disable(gl.BLEND);
        }
        else {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            this.textRenderer.beginBatch();
            this.iconRenderer.beginBatch();
        }
        // Bind shared geometry buffers once for all nodes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.indexBuffer);
        const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(this.locations.a_Position, 2, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(this.locations.a_Position);
        gl.vertexAttribPointer(this.locations.a_TexCoord, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(this.locations.a_TexCoord);
        // Upload camera matrices (shared by all nodes this frame)
        gl.uniformMatrix4fv(this.locations.u_ProjMatrix, false, this.projMatrix.elements);
        gl.uniformMatrix4fv(this.locations.u_ViewMatrix, false, this.camera.getViewMatrix().elements);
        for (const node of this.store.visibleNodes()) {
            // Scene graph: resolve the absolute world position before building model matrix
            const { x, y } = getWorldPosition(node.id, this.store.allNodesMap);
            // Viewport culling
            if (!this.isRectInViewport(x, y, node.width, node.height)) {
                continue;
            }
            this.drawNode(node, x, y, picking);
        }
        if (!picking) {
            this.textRenderer.flush(this.camera, this.projMatrix);
            this.iconRenderer.flush(this.camera, this.projMatrix);
        }
    }
    /**
     * Draw all visible nodes.
     * @param picking — when true, each node is drawn as a flat pick-color silhouette
     *                  (blend disabled, no texture) for the off-screen pick render pass.
     */
    drawBG(picking) {
        const gl = this.gl;
        gl.useProgram(this.bgProgram);
        if (picking) {
            gl.disable(gl.BLEND);
        }
        else {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bgGeometry.vertexBuffer);
        gl.vertexAttribPointer(this.bgLocations.a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.bgLocations.a_Position);
        gl.uniform4f(this.bgLocations.u_Color, 0.1, 0.1, 0.1, 0.02); // dull gray pattern
        gl.uniform1i(this.bgLocations.u_UsePointMask, this.bgGeometry.primitiveType === gl.POINTS ? 1 : 0);
        gl.drawArrays(this.bgGeometry.primitiveType, 0, this.bgGeometry.length);
    }
    drawNode(node, worldX, worldY, picking) {
        const gl = this.gl;
        if (picking) {
            // Flat color silhouette — the RGB encodes the node id
            gl.uniform1i(this.locations.u_UseTexture, 0);
            gl.uniform1i(this.locations.u_Use9Slice, 0);
            gl.uniform4f(this.locations.u_Color, node.pickColor[0], node.pickColor[1], node.pickColor[2], 1.0);
            this.setModelMatrix(worldX, worldY, node.width, node.height);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            return;
        }
        if (node.isDropTarget) {
            this.setModelMatrix(worldX - 6, worldY - 6, node.width + 12, node.height + 12);
            gl.uniform1i(this.locations.u_UseTexture, 0);
            gl.uniform1i(this.locations.u_Use9Slice, 0);
            gl.uniform4f(this.locations.u_Color, 0.13, 0.86, 0.39, 0.8); // Green glow
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }
        else if (node.isSelected) {
            // Selection glow: draw a slightly larger quad behind the node
            this.setModelMatrix(worldX - 2, worldY - 2, node.width + 4, node.height + 4);
            gl.uniform1i(this.locations.u_UseTexture, 0);
            gl.uniform1i(this.locations.u_Use9Slice, 0);
            gl.uniform4f(this.locations.u_Color, 0.23, 0.23, 0.86, 1.0);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }
        // Draw body
        const bodyCache = this.textureCache.getTexture(node.textureIds.body);
        if (bodyCache) {
            this.setModelMatrix(worldX, worldY, node.width, node.height);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, bodyCache.texture);
            gl.uniform1i(this.locations.u_UseTexture, 1);
            gl.uniform1i(this.locations.u_Use9Slice, 1);
            gl.uniform2f(this.locations.u_Dimensions, node.width, node.height);
            gl.uniform2f(this.locations.u_TextureSize, bodyCache.nativeWidth, bodyCache.nativeHeight);
            gl.uniform4f(this.locations.u_SliceMargins, 16.0, 16.0, 16.0, 16.0);
            gl.uniform1i(this.locations.u_Sampler, 0);
            gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }
        // Draw head
        let headHeight = node.height;
        if (node.nodeType === "node" || node.nodeType === "composition-child") {
            headHeight = NODE_LAYOUT.headerHeight;
        }
        else if (node.nodeType === "group" || node.nodeType === "composition") {
            headHeight = node.height; // for containers, "head" might mean the entire background or top bar, depending on SVG
        }
        const headCache = this.textureCache.getTexture(node.textureIds.head);
        if (headCache) {
            this.setModelMatrix(worldX, worldY, node.width, headHeight);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, headCache.texture);
            gl.uniform1i(this.locations.u_UseTexture, 1);
            gl.uniform1i(this.locations.u_Use9Slice, 1);
            gl.uniform2f(this.locations.u_Dimensions, node.width, headHeight);
            gl.uniform2f(this.locations.u_TextureSize, headCache.nativeWidth, headCache.nativeHeight);
            gl.uniform4f(this.locations.u_SliceMargins, 16.0, 16.0, 16.0, 16.0);
            gl.uniform1i(this.locations.u_Sampler, 0);
            gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }
        // Draw overlay via MSDF
        if (!picking) {
            const theme = this.store.getTheme();
            let r = 1, g = 1, b = 1;
            if (theme === 'dark') {
                r = 248 / 255;
                g = 250 / 255;
                b = 252 / 255;
            }
            else if (theme === 'light') {
                r = 15 / 255;
                g = 23 / 255;
                b = 42 / 255;
            }
            else if (theme === 'neon') {
                r = 207 / 255;
                g = 250 / 255;
                b = 254 / 255;
            }
            const isCollapsed = this.store.shouldCollapseNode(node);
            const headOnly = node.nodeType === 'composition-child' || isCollapsed;
            const titleY = (node.nodeType === 'group' || node.nodeType === 'composition') && !isCollapsed
                ? 20
                : (headOnly ? node.height / 2 : NODE_LAYOUT.headerHeight / 2);
            if (node.nodeType === 'node' || node.nodeType === 'composition-child' || isCollapsed) {
                this.textRenderer.addText(node.text, worldX + NODE_LAYOUT.padding, worldY + titleY, 14, r, g, b, 1.0, 'left', 'middle');
            }
            // Close Icon
            if (node.nodeType === 'node' || node.nodeType === 'composition' || node.nodeType === "group") {
                const xPos = node.width - NODE_LAYOUT.closeBtnPaddingRight;
                this.iconRenderer.addText('', worldX + xPos, worldY + titleY, 16, r, g, b, 1.0, 'center', 'middle');
            }
            // Edit Icon (node only)
            if (node.nodeType === 'node') {
                const xPos = node.width - NODE_LAYOUT.editBtnPaddingRight;
                // Using '...' because true pencil emoji isn't in MSDF atlas
                this.iconRenderer.addText('', worldX + xPos, worldY + titleY, 16, r, g, b, 1.0, 'center', 'middle');
            }
            // Close Icon (composition child)
            if (isCollapsed && node.nodeType === 'composition-child') {
                const xPos = node.width - NODE_LAYOUT.closeBtnPaddingRight;
                this.iconRenderer.addText('', worldX + xPos, worldY + node.height / 2, 16, r, g, b, 1.0, 'center', 'middle');
            }
            // Group Add (+) Icon
            if (node.nodeType === 'group' && !isCollapsed) {
                const xPos = node.width / 2;
                const yPos = node.height - NODE_LAYOUT.plusBtnPaddingBottom;
                this.textRenderer.addText('+', worldX + xPos, worldY + yPos, 20, r, g, b, 1.0, 'center', 'middle');
            }
            if (!headOnly) {
                if (node.nodeType === 'node' && node.compositionRefId !== null) {
                    const padding = NODE_LAYOUT.padding;
                    const spacing = 8;
                    const titleHeight = 8;
                    let yOffset = NODE_LAYOUT.headerHeight + padding;
                    yOffset += titleHeight + spacing;
                    const composition = this.store.get(node.compositionRefId);
                    if (composition) {
                        const children = composition.childIds.map(id => this.store.get(id)).filter(Boolean);
                        if (children.length === 0) {
                            this.textRenderer.addText('No nodes', worldX + padding, worldY + yOffset, 12, r, g, b, 0.5, 'left', 'top');
                        }
                        else {
                            // We need to flush MSDF text first, then draw the children nodes using the main shader,
                            // then we can resume queuing MSDF text. Wait, MSDF text is completely deferred to the end of the frame!
                            // So we can just queue the child titles in textRenderer, and immediately draw their bodies using the main shader!
                            gl.useProgram(this.program);
                            for (let i = 0; i < Math.min(children.length, 5); i++) {
                                const child = children[i];
                                const childWidth = Math.min(child.width, node.width - 40);
                                const childHeight = Math.max(NODE_LAYOUT.headerHeight, child.height);
                                const x = worldX + (node.width - childWidth) / 2;
                                const y = worldY + yOffset;
                                // Draw child body
                                const bodyCache = this.textureCache.getTexture(child.textureIds.body);
                                if (bodyCache) {
                                    this.setModelMatrix(x, y, childWidth, childHeight);
                                    gl.activeTexture(gl.TEXTURE0);
                                    gl.bindTexture(gl.TEXTURE_2D, bodyCache.texture);
                                    gl.uniform1i(this.locations.u_UseTexture, 1);
                                    gl.uniform1i(this.locations.u_Use9Slice, 1);
                                    gl.uniform2f(this.locations.u_Dimensions, childWidth, childHeight);
                                    gl.uniform2f(this.locations.u_TextureSize, bodyCache.nativeWidth, bodyCache.nativeHeight);
                                    gl.uniform4f(this.locations.u_SliceMargins, 16.0, 16.0, 16.0, 16.0);
                                    gl.uniform1i(this.locations.u_Sampler, 0);
                                    gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
                                    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                                }
                                // Draw child head
                                const headCache = this.textureCache.getTexture(child.textureIds.head);
                                if (headCache) {
                                    this.setModelMatrix(x, y, childWidth, NODE_LAYOUT.headerHeight);
                                    gl.activeTexture(gl.TEXTURE0);
                                    gl.bindTexture(gl.TEXTURE_2D, headCache.texture);
                                    gl.uniform1i(this.locations.u_UseTexture, 1);
                                    gl.uniform1i(this.locations.u_Use9Slice, 1);
                                    gl.uniform2f(this.locations.u_Dimensions, childWidth, NODE_LAYOUT.headerHeight);
                                    gl.uniform2f(this.locations.u_TextureSize, headCache.nativeWidth, headCache.nativeHeight);
                                    gl.uniform4f(this.locations.u_SliceMargins, 16.0, 16.0, 16.0, 16.0);
                                    gl.uniform1i(this.locations.u_Sampler, 0);
                                    gl.uniform4f(this.locations.u_Color, 1, 1, 1, 1);
                                    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                                }
                                this.textRenderer.addText(child.text, x + 12, y + NODE_LAYOUT.headerHeight / 2, 13, r, g, b, 1.0, 'left', 'middle');
                                yOffset += childHeight + 10;
                            }
                            if (children.length > 5) {
                                this.textRenderer.addText(`+ ${children.length - 5} more nodes`, worldX + padding, worldY + yOffset, 12, r, g, b, 0.5, 'left', 'top');
                            }
                        }
                    }
                }
                else if (node.nodeType === 'node') {
                    if (node.props) {
                        let cursorY = worldY + NODE_LAYOUT.headerHeight + 16;
                        const xLeft = worldX + NODE_LAYOUT.padding + 4;
                        const xRight = worldX + node.width - NODE_LAYOUT.padding - 4;
                        // Draw ungrouped items (iterate maps directly — no temp arrays)
                        const boolU = node.props.booleans["ungrouped"];
                        const textU = node.props.texts["ungrouped"];
                        const enumU = node.props.enums["ungrouped"];
                        if (boolU)
                            for (let i = 0; i < boolU.length; i++) {
                                const p = boolU[i];
                                this.textRenderer.addText(p.label, xLeft, cursorY, 11, r, g, b, 0.7, 'left', 'middle');
                                this.iconRenderer.addText(p.value ? '' : '', xRight, cursorY, 11, r, g, b, 1.0, 'right', 'middle');
                                cursorY += 20;
                            }
                        if (textU)
                            for (let i = 0; i < textU.length; i++) {
                                const p = textU[i];
                                this.textRenderer.addText(p.label, xLeft, cursorY, 11, r, g, b, 0.7, 'left', 'middle');
                                this.textRenderer.addText(String(p.value), xRight, cursorY, 11, r, g, b, 1.0, 'right', 'middle');
                                cursorY += 20;
                            }
                        if (enumU)
                            for (let i = 0; i < enumU.length; i++) {
                                const p = enumU[i];
                                this.textRenderer.addText(p.label, xLeft, cursorY, 11, r, g, b, 0.7, 'left', 'middle');
                                this.textRenderer.addText(String(p.value), xRight, cursorY, 11, r, g, b, 1.0, 'right', 'middle');
                                cursorY += 20;
                            }
                        // Draw grouped items
                        const groups = node.props.groups;
                        for (let gi = 0; gi < groups.length; gi++) {
                            const groupName = groups[gi];
                            const boolG = node.props.booleans[groupName];
                            const textG = node.props.texts[groupName];
                            const enumG = node.props.enums[groupName];
                            const hasItems = (boolG && boolG.length > 0) || (textG && textG.length > 0) || (enumG && enumG.length > 0);
                            if (hasItems) {
                                // Subheading
                                this.textRenderer.addText(groupName.toUpperCase(), xLeft, cursorY, 10, r, g, b, 0.5, 'left', 'middle');
                                cursorY += 20;
                                if (boolG)
                                    for (let i = 0; i < boolG.length; i++) {
                                        const p = boolG[i];
                                        this.textRenderer.addText(p.label, xLeft + 8, cursorY, 11, r, g, b, 0.7, 'left', 'middle');
                                        this.iconRenderer.addText(p.value ? '' : '', xRight, cursorY, 11, r, g, b, 1.0, 'right', 'middle');
                                        cursorY += 20;
                                    }
                                if (textG)
                                    for (let i = 0; i < textG.length; i++) {
                                        const p = textG[i];
                                        this.textRenderer.addText(p.label, xLeft + 8, cursorY, 11, r, g, b, 0.7, 'left', 'middle');
                                        this.textRenderer.addText(String(p.value), xRight, cursorY, 11, r, g, b, 1.0, 'right', 'middle');
                                        cursorY += 20;
                                    }
                                if (enumG)
                                    for (let i = 0; i < enumG.length; i++) {
                                        const p = enumG[i];
                                        this.textRenderer.addText(p.label, xLeft + 8, cursorY, 11, r, g, b, 0.7, 'left', 'middle');
                                        this.textRenderer.addText(String(p.value), xRight, cursorY, 11, r, g, b, 1.0, 'right', 'middle');
                                        cursorY += 20;
                                    }
                            }
                        }
                    }
                    else {
                        this.textRenderer.addText('Properties...', worldX + NODE_LAYOUT.padding, worldY + NODE_LAYOUT.headerHeight + NODE_LAYOUT.padding, 12, r, g, b, 1.0, 'left', 'top');
                    }
                }
            }
        }
    }
    setModelMatrix(x, y, w, h) {
        this.modelMatrix.setIdentity();
        this.modelMatrix.translate(x, y, 0.0);
        this.modelMatrix.scale(w, h, 1.0);
        this.gl.uniformMatrix4fv(this.locations.u_ModelMatrix, false, this.modelMatrix.elements);
    }
}
//# sourceMappingURL=renderer.js.map