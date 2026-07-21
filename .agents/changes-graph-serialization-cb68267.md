# Graph Serialization (Import/Export) & Kebab Menu

**Commit:** `cb68267`  
**Date:** 2026-07-21  
**Branch:** `master`

---

## Summary

Introduced full graph serialization (import/export) and an expandable `<gg-kebab-menu>` web component. The editor state (nodes, edges, parent-child relationships, custom textures, theme, colors, camera, and node properties) can now be exported to a JSON snapshot and restored.

---

## New Files

| File | Purpose |
|------|---------|
| `src/scripts/graph-serialization.ts` | Schema types (`GraphSnapshot`, `SerializedNode`, `SerializedEdge`, `SerializedTexture`), `serializeGraph()` and `deserializeGraph()` pure functions |
| `src/components/kebab-menu.ts` | Standalone `<gg-kebab-menu>` custom element with glassmorphic kebab button, dropdown box, click-outside dismissal, and action events |
| `tests/graph-serialization.test.ts` | Comprehensive round-trip test suite (20 tests covering empty graphs, single/multi nodes, parent-child trees, props, subgraphs, compositions, hubs, texture sources, and error handling) |

---

## Modified Files

| File | Changes |
|------|---------|
| `src/scripts/node-store.ts` | Added `clear()` (resets nodes, groups, z-orders, ID counter) and `restoreIdCounter()` |
| `src/scripts/edge-store.ts` | Added `clear()` (resets edges, adjacency, ID counter) and `restoreIdCounter()` |
| `src/scripts/history.ts` | Added `clear()` (resets undo/redo stacks) |
| `src/scripts/node-editor.ts` | Added `exportGraph()`, `importGraph()`, `handleExport()`, and `handleImport()` methods |
| `src/scripts/controls.ts` | Added `onImport` and `onExport` callbacks to `ControlCallbacks` and wired `gg-kebab-action` listener |
| `src/shell.ts` | Inserted `<gg-kebab-menu id="kebab-menu"></gg-kebab-menu>` positionally aligned beside `<gg-history-pane>` |
| `src/index.ts` | Exported `serializeGraph`, `deserializeGraph`, `GraphSnapshot` types, and `KebabMenu` component |

---

## Design Decisions

1. **Pure Serialization Functions**: `serializeGraph()` and `deserializeGraph()` are decoupled from WebGL and DOM, making them reusable in headless tests or Node.js scripts.
2. **Transient vs Persistent State**: Transient fields (`pickColor`, `isSelected`, `handles`, `visible`) are omitted from JSON snapshots and reconstructed deterministically on import.
3. **Non-Undoable Import**: Importing a snapshot replaces the active graph as a fresh baseline and clears the undo/redo stack.
4. **Handle Reconstruction**: Node handle connection states are rebuilt during import by iterating restored edges.
5. **Standalone Kebab Web Component**: `<gg-kebab-menu>` is positionally aligned next to history pane buttons, isolated in Shadow DOM, and communicates via custom events (`gg-kebab-action`).

---

## Usage

### Exporting Graph Programmatically
```typescript
const snapshot = editor.exportGraph();
const jsonStr = JSON.stringify(snapshot, null, 2);
```

### Importing Graph Programmatically
```typescript
const snapshot = JSON.parse(jsonStr);
editor.importGraph(snapshot);
```

### Kebab Menu UI Component
```html
<gg-kebab-menu id="kebab-menu"></gg-kebab-menu>
```
```typescript
kebabMenu.addEventListener("gg-kebab-action", (e: CustomEvent<{ action: "import" | "export" }>) => {
  if (e.detail.action === "import") {
    // Trigger import
  } else if (e.detail.action === "export") {
    // Trigger export
  }
});
```
