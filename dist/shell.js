const SHELL = `
  <!-- WebGL Canvas -->
  <canvas id="2d-bg-canvas"></canvas>
  <canvas id="webgl-canvas"></canvas>

  <!-- Hidden 2D Canvas for Text to Texture generation -->
  <canvas id="2d-text-canvas" class="hidden"></canvas>

  <!-- Overlay 2D Canvas for crisp floating labels -->
  <canvas
    id="2d-label-canvas"
    style="pointer-events: none; z-index: 5"
  ></canvas>

  <!-- Custom DOM Overlay Containers -->
  <div id="gg-overlays-scaling" style="position: absolute; top: 0; left: 0; pointer-events: none; overflow: visible; z-index: 6; transform-origin: 0 0;"></div>
  <div id="gg-overlays-fixed" style="position: absolute; top: 0; left: 0; pointer-events: none; overflow: visible; z-index: 6; transform-origin: 0 0;"></div>

  <!-- Screen Reader Only Node List -->
  <ul
    id="sr-node-list"
    class="sr-only"
    aria-label="Workflow graph nodes"
    role="list"
  ></ul>

  <!-- History Pane -->
  <gg-history-pane id="undo-redo-wrapper"></gg-history-pane>

  <!-- Minimap -->
  <gg-minimap id="minimap"></gg-minimap>

  <!-- Kebab Menu (Options) -->
  <gg-kebab-menu id="kebab-menu"></gg-kebab-menu>

  <!-- Sidebar Overlay -->
  <gg-ui-controls
    id="sidebar"
    class="sidebar collapsed"
    part="gg-ui-control-host"
  >
  </gg-ui-controls>

  <!-- Action Pane -->
  <gg-action-pane id="tool-panel"></gg-action-pane>

  <gg-loading-screen></gg-loading-screen>
`;
export default SHELL;
//# sourceMappingURL=shell.js.map