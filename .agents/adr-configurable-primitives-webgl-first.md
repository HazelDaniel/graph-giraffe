# ADR — Configurable Primitives on a WebGL-First Core

**Status:** Accepted

**Date:** 2026-08-21

**Scope:** `@graph-giraffe/core`, `@graph-giraffe/react`, and Proctor v2

## Context

Graph Giraffe already has the foundations needed for configurable graph
primitives: a retained scene graph, command/history system, cancellable graph
events, an instance-scoped node registry, GPU picking, serialization, overlays,
and an editor-wide WebGL/DOM choice.

The current extensibility model is uneven. Nodes are descriptor-driven, while
edges, handles, and some interaction paths still depend on core-wide logic.
The React adapter also contains compatibility fallbacks that read private core
implementation details when newer public methods are unavailable.

Proctor v2 currently uses the React adapter as its public boundary. Its graph
state is still represented in Redux and synchronized through application-level
Yjs maps. This duplicates graph state and creates unnecessary synchronization
between the editor and the host application.

## Decision

We will evolve the existing architecture; we will not rewrite the retained graph
model or rendering engine.

### Primitive model

Nodes, edges, and overlays become first-class configurable registry primitives.
Handles remain owned by node/edge descriptors. Temporary interaction modes such
as comment/table/select remain interaction-layer concerns, not registry
primitives.

Edge descriptors select from core routing services. They may customize routing
parameters and rendering capabilities, but arbitrary custom routing is not the
default extension mechanism.

### Rendering

Rendering is editor-wide: an editor runs in either WebGL or DOM mode. Mixed
WebGL/DOM primitive bodies are not required.

WebGL is the default and performance-oriented backend. Custom WebGL primitives
receive safe utility APIs and constrained draw commands. Advanced plugins may opt
into direct WebGL access through an explicitly marked escape hatch with a
versioned contract.

### State ownership

The core graph store owns graph state inside Graph Giraffe. A controlled adapter
may own graph state only when its host genuinely requires that model. Rendering
backends never own graph state.

Proctor will move toward Graph Giraffe owning the authoritative graph. Redux may
remain for domain entities, UI state, forms, active modes, and derived
presentation state, but it must not mirror authoritative nodes and edges.

### Collaboration

Graph commands, rather than complete graph maps, become the normal collaboration
unit over Yjs. Commands require stable IDs, causal metadata, deterministic
application, validation, and local/remote/replay origin information.

Snapshots/checkpoints remain necessary for initial hydration, late joiners,
compaction, and recovery. The Proctor Yjs application layer may be rewritten to
support this model.

## Consequences

Positive:

- New node, edge, and overlay types can be added without editing renderer-wide
  switch statements.
- WebGL remains the scalable default while DOM/React remains available for rich
  application UI.
- Edge routing and rendering become reusable core services.
- Proctor avoids maintaining a second authoritative graph model.
- Command synchronization transfers incremental changes and naturally aligns with
  undo/history semantics.

Costs and constraints:

- Core needs a normalized edge registry and renderer-neutral primitive contracts.
- DOM interaction requires delegated pointer capture and explicit propagation
  control.
- Proctor selectors currently depending on graph-shaped Redux data need a core
  graph subscription/selector bridge.
- Command synchronization needs deterministic ordering, permissions, validation,
  and recovery design before Redux graph removal.
- Existing descriptor and adapter APIs must remain compatible during migration.

## Public boundary audit — Phase 0

### Core public surface

The package entry point currently exposes:

- `NodeEditor`, events, camera/viewport methods, graph projections, controlled
  reconciliation, serialization, and overlays;
- `NodeTypeRegistry`, built-in descriptors, DOM descriptor helpers, and DOM views;
- graph/node/edge/handle/configuration types;
- texture utilities, custom elements, shaders, and math helpers.

This is sufficient for the current React adapter and Proctor v2 milestone, but it
does not yet expose a first-class edge registry or a renderer-neutral command/draw
contract. Those belong to later implementation phases.

### React adapter private-internal usage

`@graph-giraffe/react` has compatibility fallbacks in `src/components/NodeEditor.tsx`
and `src/hooks/useGraphState.ts` that reach into:

- `editor.store` and `editor.edgeStore` for legacy graph reads and mutations;
- `editor.camera` as a fallback viewport setter;
- `editor.domNodeLayer` for legacy DOM reconciliation;
- `CoreNodeEditor._instance` to reset the singleton between mounts.

The preferred path already uses public methods such as `getNodes()`, `getEdges()`,
`applyControlledGraph()`, `setViewport()`, `setZoomRange()`, and `addNode()`.
Phase 1 must remove or isolate the remaining private fallbacks after the minimum
core version is fixed and the compatibility window is closed.

### Proctor v2 boundary

The inspected Proctor v2 canvas imports Graph Giraffe through `@graph-giraffe/react`
and does not directly import core internals. Its local ID map and imperative handle
registry are adapter concerns and are acceptable for the current phase.

### Phase 1 boundary slice completed

Core now exposes command-based public `addEdge()`, `removeNode()`, and
`removeEdge()` operations. The React adapter uses these APIs, plus the existing
public graph projection and viewport methods, instead of reading private stores,
camera state, or the DOM layer. Core build/typecheck and the 197-test suite pass;
React typecheck passes.

One private access remains: React resets the core singleton slot during unmount
because the current core has no public lifecycle/release API. This is isolated as
the next lifecycle subtask and is not used for graph state or rendering behavior.

## Migration order

1. Freeze the public core/React boundary and add contract tests.
2. Extract renderer-neutral graph projections, command records, and interaction
   results from `NodeEditor`.
3. Add edge descriptors and normalize handle capabilities.
4. Add WebGL utility/draw contracts with an advanced direct-WebGL escape hatch.
5. Complete DOM pointer capture and interactive handle routing.
6. Move Proctor Yjs synchronization from graph maps to commands and checkpoints.
7. Remove Proctor’s authoritative Redux graph state and migrate selectors.
8. Build edge actions, labels, collaboration semantics, and other product features
   on the stabilized primitive platform.

## Validation

Phase acceptance requires:

- public-boundary contract tests for core and React;
- no new adapter imports of private core fields;
- deterministic command replay tests;
- Yjs command synchronization tests with reconnect/recovery;
- browser tests for DOM/React pointer capture and graph propagation;
- WebGL performance measurements before and after renderer changes.
