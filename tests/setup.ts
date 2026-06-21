class TestCanvasRenderingContext2D {
  beginPath(): void {}
  moveTo(): void {}
  lineTo(): void {}
  arcTo(): void {}
  closePath(): void {}
}

Object.defineProperty(globalThis, "CanvasRenderingContext2D", {
  value: TestCanvasRenderingContext2D,
  configurable: true,
});

Object.defineProperty(globalThis, "document", {
  value: {
    addEventListener: () => {},
    removeEventListener: () => {},
    getElementById: (id: string) =>
      id === "sr-node-list"
        ? {
            appendChild: () => {},
          }
        : null,
    createElement: () => ({
      appendChild: () => {},
      remove: () => {},
      id: "",
      textContent: "",
    }),
  },
  configurable: true,
});
