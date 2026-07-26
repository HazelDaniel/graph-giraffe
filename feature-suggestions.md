# Feature Suggestions from Codebase Analysis (2026-06-26)

## Architecture Improvements
1. **Decouple node type registration** — Plugin system for new primitives (sliders, dropdowns, checkboxes, textboxes)
2. **Extract animation/tweening system** — For handle-to-handle edge label animation, node/edge animations, simulation
3. **Add z-ordering layer** — Edges currently sit across all node types; need proper hidden-surface removal with z-indices
4. **Expand WorldActionDriver coverage** — Currently only history system tested; renderer, camera, edge routing, UI controls need test harness

## Priority Features (from user's roadmap)
- Handle-to-handle animation of edge labels
- Minimap/radar view
- Simulation system

## Known Bugs to Fix
3. History traversal causes texture color regression on some primitives
4. Composition-child label changes don't survive history traversal (not sure if still persists, but will test)
5. Edges lack z-ordering with nodes
6. Composition references created after texture switch don't reflect current texture
