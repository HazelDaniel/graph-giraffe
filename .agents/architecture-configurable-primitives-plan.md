# Architecture Plan — Configurable Primitives with a WebGL-First Runtime

**Status:** Planning baseline — decisions recorded 2026-08-21

**Date:** 2026-08-21

**Scope:** `@graph-giraffe/core`, `@graph-giraffe/react`, and the Proctor v2 adapter

**Related analysis:**

- `changes-node-type-registry-bda54b9.md`
- `changes-node-type-registry-d881735.md`
- `changes-rendering-mode-0f1abaf.md`
- `changes-dom-collab-arc-510e825.md`
- `rfc-replace-reactflow-with-graphgiraffe-0773830.md`
- `codebase-analysis-510e825.md`

## 1. Decision in brief

Graph Giraffe is on the right architectural path. A full rewrite is not justified.

The existing strengths are the correct foundation:

- a retained scene graph with parent/child coordinates;
- a command/history system for mutations;
- an event system with cancellable `before:*` hooks;
- an instance-scoped type registry;
- WebGL GPU picking and batched rendering;
- pure serialization and geometry utilities;
- a DOM layer and framework adapter boundary already proven in Proctor v2.

The architecture should evolve through focused refactors. The main change is to
promote the current `NodeTypeDescriptor` into a broader primitive model and make
the rendering and interaction contracts explicitly backend-neutral.

The target is React Flow-like configurability without adopting React Flow's DOM-
per-node rendering cost as the default. A primitive should be definable once and
then rendered through WebGL or DOM according to the editor-wide configuration.
Per-primitive mixed rendering is explicitly out of scope.

## 2. Problem this plan solves

Today, node extensibility is ahead of edge extensibility:

- nodes have a registry and descriptors;
- edges still rely heavily on core-wide geometry, rendering, and interaction logic;
- handles are metadata, but their interaction behavior is largely hardcoded in
  `NodeEditor`;
- DOM skins can be interactive, but pointer capture and handle gesture ownership
  are incomplete;
- controlled adapters can reconcile graphs, but external change handling is still
  callback-by-callback rather than a unified change stream;
- overlays are useful primitives, but edge labels, edge actions, cursors, and
  comments do not yet share one complete extensibility model.

This creates a predictable scaling risk: each new primitive can still require
changes across `NodeEditor`, `renderer.ts`, geometry, texture handling, controls,
the DOM layer, and framework adapters.

## 3. Target architecture

```text
                    Framework adapters
              React / Vue / Svelte / Solid
                            │
                    primitive adapter API
                            │
┌───────────────────────────▼───────────────────────────┐
│                    Graph Giraffe core                  │
│                                                       │
│  Graph model + commands + history + serialization      │
│  Primitive registry + validation + capabilities        │
│  Scene graph + layout + coordinate transforms           │
│  Interaction router + event/change stream              │
│  Overlay and portal manager                            │
└───────────────┬───────────────────────┬───────────────┘
                │                       │
       WebGL backend (default)    DOM/framework backend
       batched bodies, edges,     opt-in interactive skins,
       labels, handles, picking   React provider/context bridge
```

The core remains the owner of graph semantics, coordinates, selection, commands,
history, connection validation, and camera state. A backend owns presentation and
backend-specific input translation; it must not become a second source of graph
truth.

### 3.1 Primitive categories

The registry will describe three first-class categories:

| Primitive | Responsibilities | Initial backend strategy |
|---|---|---|
| Node | body, label, handles, size, props, hierarchy | WebGL preset first; DOM/React skin optional |
| Edge | routing, stroke, head, label, hit area, actions | WebGL geometry first; DOM overlays for actions |
| Overlay | world/screen anchoring, zoom behavior, lifecycle | shared overlay manager |

Handles remain part of node/edge descriptors rather than independent registry
entries. Their direction, capacity, shape, hit region, and connection policy are
configured by the owning primitive.

Backgrounds remain renderer configuration. Temporary interaction modes—such as
the current Proctor comment, table, or select mode—are what the earlier draft
called “tools.” They are not primitives and will be implemented by the interaction
layer and adapters, emitting normal core commands/events.

### 3.2 Renderer-neutral descriptor shape

The existing node descriptor remains source-compatible initially, but its concepts
should converge on a common primitive contract:

```ts
interface PrimitiveDescriptor {
  type: string;
  capabilities: {
    category: "node" | "edge" | "overlay";
    selectable?: boolean;
    draggable?: boolean;
    connectable?: boolean;
    editable?: boolean;
  };
  defaults: unknown;
  validate?: (value: unknown, context: ValidationContext) => void;
  layout?: LayoutPolicy;
  interaction?: InteractionPolicy;
  renderers: {
    webgl?: WebGLPrimitiveRenderer;
    dom?: DomPrimitiveRenderer;
    overlay?: OverlayPrimitiveRenderer;
  };
}
```

This is a target contract, not a request to introduce an untyped `unknown`-based
API literally. Concrete node and edge types should retain strong generic types for
their data and props. The important separation is between semantic capabilities,
interaction, layout, and renderer implementations.

## 4. Architectural rules

These rules govern all implementation work under this plan:

1. **One graph truth.** The core store is authoritative inside an editor. A
   controlled adapter's host model is authoritative only when a host genuinely
   owns graph state. Rendering layers never own graph state.
2. **Commands for mutations.** User-visible core mutations go through commands and
   history. Controlled reconciliation is explicitly non-history and emits a
   controlled-sync event.
3. **Descriptors declare capability.** Code should query the registry instead of
   checking literal node/edge type names.
4. **Backend independence.** Geometry, layout, connection rules, and change events
   must work without WebGL or DOM. WebGL and DOM code consume those contracts.
5. **WebGL remains the default performance path.** DOM/React rendering is an
   editor-wide opt-in mode for rich application UI, context, or accessibility. A
   single editor does not mix WebGL and DOM primitive bodies.
6. **GPU picking remains an implementation detail.** It may remain authoritative
   for ordinary interactions, but DOM interactive descendants need an explicit
   escape hatch with pointer capture and propagation control.
7. **No unnecessary controlled mirroring.** Adapters should use the core graph and
   command/event APIs directly when possible. Controlled reconciliation remains
   available for hosts that genuinely own graph state, but it is not the default
   architecture for Proctor.
8. **Public APIs before adapter work.** Proctor and React should consume public core
   contracts, never private stores or renderer internals.
9. **Feature work must carry tests.** Every primitive or interaction feature needs
   headless semantic tests and, where browser event ordering matters, a browser
   smoke test.

## 5. Implementation phases

### Phase 0 — Adopt the architecture and freeze boundaries

Create a short ADR or accepted version of this document. Inventory all current
public exports and mark internal APIs that adapters must stop using. Add a small
architecture test/documentation section describing ownership of graph state,
rendering, input, and overlays.

**Exit criteria:** the core, React adapter, and Proctor v2 agree on the ownership
rules and the supported public adapter surface.

**Status:** Complete for documentation/audit. See
`adr-configurable-primitives-webgl-first.md`. The audit found legacy private-core
fallbacks in `@graph-giraffe/react`; removing them is Phase 1 work after the core
compatibility floor is fixed.

### Phase 1 — Split semantic core from backend orchestration

Refactor incrementally; do not move behavior and rename everything in one change.

- Extract renderer-neutral graph projections and change records from `NodeEditor`.
- Introduce explicit interfaces for scene queries, coordinate transforms, and
  interaction results.
- Move type-name checks into registry capability queries.
- Keep the existing WebGL path behaviorally unchanged while adding contract tests.
- Keep `WorldActionDriver` as the semantic test backend.

**Exit criteria:** graph creation, movement, parenting, connection validation,
selection, undo/redo, and serialization can be exercised without WebGL or DOM.

**Progress:** Public graph mutation/query APIs were added to core and the React
adapter now uses them instead of private stores, camera state, or DOM-layer
internals. Core build/typecheck and tests pass, and React typecheck passes. The
remaining singleton reset fallback is isolated for a later lifecycle API slice;
the renderer-neutral projection/interaction extraction remains in progress.

### Phase 2 — Generalize the primitive registry

Extend the node registry without breaking current descriptors.

- Add an edge descriptor registry with routing, stroke, head, label, hit-test, and
  action capabilities.
- Normalize handle descriptors: direction, capacity, connection policy, geometry,
  and display style.
- Define primitive capability queries for selection, dragging, editing, locking,
  collapsing, connecting, and custom actions.
- Add descriptor versioning/validation so malformed plugins fail at registration.
- Preserve `register`, `replace`, and built-in type names for snapshot portability.

**Exit criteria:** a custom node and a custom edge can be registered without edits
to `NodeEditor`, `renderer.ts`, `edge-geometry.ts`, or built-in switch statements.

### Phase 3 — Build the WebGL primitive backend

Make WebGL consume descriptors through stable draw contracts rather than requiring
each primitive to reach into renderer internals.

- Define a constrained WebGL draw context for bodies, labels, handles, and edges.
- Support preset renderers for common shapes, strokes, heads, labels, and icons.
- Retain an advanced custom shader/raw-draw escape hatch, but isolate it behind a
  versioned context.
- Batch compatible primitives by renderer/material/texture where possible.
- Keep GPU picking aligned with the same primitive bounds and hit policies.
- Add profiling hooks for draw calls, pick passes, visible primitives, and frame
  time.

**Exit criteria:** built-in node and edge visuals use the same descriptor-driven
  path as a representative custom node and edge, with no regression in picking or
  large-graph frame cost.

### Phase 4 — Complete the interaction router

Separate pointer interpretation from mutation commands and make interaction policy
configurable.

- Add delegated pointer capture for interactive DOM descendants.
- Add explicit handle registration and DOM-to-core connection gesture routing.
- Define `stopGraphPropagation()` and `captureGraphPointer()` semantics.
- Route drag, connect, resize, select, pan, and tool gestures through an
  interaction state machine.
- Ensure every completed gesture emits consistent start/change/stop records.
- Keep connection validation in core hooks, including source/target sides and
  primitive capabilities.

**Exit criteria:** React skins can contain buttons, dialogs, and handles without
  accidental graph drags; WebGL-only nodes retain the current interaction behavior.

### Phase 5 — Complete edge and overlay primitives

- Implement descriptor-driven edge rendering and routing.
- Add edge labels as first-class objects with world coordinates and hit regions.
- Provide edge actions through overlays, including Proctor’s delete-at-midpoint
  button.
- Unify comment bubbles, awareness cursors, selection tools, and custom overlays
  under the overlay manager while preserving scaling/fixed modes.
- Add lifecycle and camera-change guarantees for overlays.

**Exit criteria:** a custom edge can render, be selected, show a label/action, and
  participate in delete/undo/serialization without application-specific renderer
  changes.

### Phase 6 — Move collaboration and adapter ownership to commands

- Expose a React-friendly primitive API: node/edge registries, optional controlled
  graph support, command/event subscriptions, viewport handle, portals, and custom
  renderers.
- Make the core command stream the graph synchronization unit. Commands must have
  stable IDs, causal metadata, deterministic application, validation, and a clear
  distinction between local, remote, and replayed origin.
- Replace Proctor's Redux↔Yjs graph-map synchronization with command synchronization
  over Yjs. Keep snapshots/checkpoints for initial hydration, late joiners, and
  recovery; use commands for ordinary incremental updates.
- Remove graph ownership from Proctor Redux once command synchronization is proven.
  Redux may remain for domain data, UI state, selections, active modes, forms, and
  derived presentation state, but it must not mirror the authoritative graph.
- Keep controlled graph reconciliation as an adapter feature for other consumers,
  not as the required path for Proctor.
- Make ID mapping a documented adapter concern and test it through undo/redo,
  remote updates, deletion, and reparenting.
- Keep React provider/context bridging in the adapter, not in core.
- Add SSR-safe initialization guarantees and browser smoke coverage.

**Exit criteria:** Proctor v2 uses only public APIs, Graph Giraffe owns the graph
state, Yjs synchronizes commands plus recovery snapshots, and Redux contains no
authoritative duplicate of nodes or edges.

### Phase 7 — Product features on the stable primitive platform

Prioritize features that validate the architecture:

1. Proctor edge actions and bidirectional edge rendering.
2. Custom edge labels and label editing.
3. Rich node actions and resize/layout policies.
4. Collaboration cursors/comments and multi-user presence semantics.
5. Optional animation/tweening and edge pulses.
6. Type propagation/typed connection validation.
7. Simulation and worker/RPC execution, if still required by the product roadmap.

## 6. Testing and performance gates

Every phase should maintain:

- semantic tests through `WorldActionDriver`;
- registry contract tests for built-ins and custom primitives;
- serialization round trips including custom primitive identifiers/configuration;
- interaction tests for cancellation, pointer capture, and event ordering;
- browser smoke tests for DOM/React input and SSR boundaries;
- WebGL performance measurements on representative graph sizes.

Performance regressions should be evaluated using visible primitive count, draw-call
count, pick-pass cost, frame time, and memory—not only subjective smoothness.

The DOM path should be measured separately. It is a capability path for rich UI,
not the baseline for large graphs.

## 7. Explicit non-goals

- Replacing the retained graph model with React or Redux state.
- Making every primitive a React component.
- Supporting mixed WebGL/DOM body rendering in one editor.
- Adding a general plugin marketplace or remote code loading mechanism.
- Keeping Proctor's current Redux/Yjs graph-map collaboration layer once command
  synchronization is ready.
- Removing the existing node descriptor APIs before compatibility adapters exist.

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Registry becomes a generic bag of callbacks | Define capability schemas and validate descriptors at registration |
| WebGL custom draw hooks become unsafe/internal | Expose a constrained, versioned draw context and keep raw escape hatch advanced |
| DOM interaction causes duplicate graph events | Centralize propagation/capture rules and add real-browser tests |
| Controlled state overwrites user edits | Use a normalized change stream and echo suppression with explicit ownership |
| Command sync diverges across clients | Deterministic command application, stable command IDs, causal ordering, validation, and periodic snapshots |
| Removing Redux graph state breaks domain selectors | Introduce a core graph subscription/selector bridge and migrate selectors incrementally |
| Remote commands create unsafe or unauthorized mutations | Reuse core validation/hooks and add collaboration permissions before applying remote commands |
| Custom primitives break serialization | Require stable type IDs and versioned descriptor/config data |
| Refactor stalls feature delivery | Preserve compatibility APIs and make each phase independently shippable |
| Framework needs leak into core | Keep provider bridging and framework lifecycle code in adapters |

## 9. Resolved planning decisions

The following decisions are now part of the plan:

1. **Primitive scope:** nodes, edges, and overlays are first-class registry
   primitives. Handles are configured by nodes/edges. Temporary modes such as
   comment/table/select are interaction-layer concerns.
2. **Custom WebGL contract:** provide utility APIs and constrained draw commands by
   default, with an explicit advanced option for direct WebGL access.
3. **Edge model:** edge descriptors select from core routing services. Custom
   routing algorithms are not the default extension point.
4. **Controlled adapters:** use the model that minimizes duplicated state and
   bidirectional synchronization. Controlled reconciliation remains available, but
   Proctor should move to core-owned graph state.
5. **Rendering mode:** editor-wide WebGL or DOM mode is sufficient; mixed primitive
   body rendering is not required.
6. **Collaboration:** synchronize commands over Yjs, with snapshots/checkpoints for
   hydration and recovery. Rewrite the Proctor Yjs graph layer as needed.
7. **Redux:** remove Redux as Proctor's authoritative graph store once command sync
   and the core subscription/selector bridge are working. Retain Redux only for
   domain/UI concerns that still benefit from it.

## 10. Remaining implementation questions

The architecture is now sufficiently decided to begin Phase 0. These are
implementation details, not blockers to adopting the plan:

- What exact command envelope and ordering protocol will Yjs carry?
- Which Proctor domain selectors currently require graph-shaped Redux data and need
  a core graph selector equivalent?
- Which operations need permission metadata or server-side validation before remote
  command application?
- What WebGL utility API is safe and useful enough to expose before enabling direct
  context access?

## 11. Working agreement

Once adopted, this document is the planning source of truth for the architecture
work. Implementation should proceed phase by phase, with each phase updating this
document’s status, exit criteria, and deviations. New feature requests should be
classified as:

- a core semantic capability;
- a primitive descriptor/backend capability;
- an interaction/tool capability;
- an adapter capability; or
- a product feature built on the stable platform.

Any proposed deviation from the ownership rules or phase order should be recorded
here before implementation.
