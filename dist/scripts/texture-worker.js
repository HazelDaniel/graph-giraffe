"use strict";
// Web Worker for asynchronous SVG rasterization
// Handles converting SVG strings into ImageBitmaps off the main thread
self.onmessage = async (e) => {
    const { id, svgText, width, height } = e.data;
    try {
        const blob = new Blob([svgText], { type: "image/svg+xml" });
        const bitmap = await createImageBitmap(blob);
        // Transfer the ImageBitmap back to the main thread with zero copy
        // @ts-ignore
        self.postMessage({ type: 'result', id, bitmap }, [bitmap]);
    }
    catch (error) {
        self.postMessage({ type: 'error', id, error: String(error) });
    }
};
//# sourceMappingURL=texture-worker.js.map