# ADR-003 — Asset Pipeline: Graybox First, Compression on Trigger

Status: `ACCEPTED` (project-lead technical authority; presented for visibility at the `US-010` acceptance gate)
Traceability: `US-010`, `docs/architecture/PERFORMANCE_BUDGET.md`
Date: 2026-09-02

## Context

`M1` requires an asset-pipeline decision (GLTF/GLB, Meshopt/Draco, KTX2, ownership/licensing, loading boundaries, placeholder/graybox pipeline, source-vs-optimized storage) before any model work begins. `M3 — 3D Graybox` explicitly builds with primitives only and defers vegetation/model fidelity until scale and traversal are validated, so at `M1` there are effectively no real assets yet to compress.

## Decision

- **Graybox phase (`M3`).** Procedural/primitive Three.js geometry (`BoxGeometry`, `CylinderGeometry`, `PlaneGeometry`, hand-authored low-poly `BufferGeometry`) with solid-color `MeshStandardMaterial` only. Zero external model or texture files. No compression tooling is introduced at this stage — there is nothing to compress, and adding the tooling now would be ceremony ahead of need.
- **First real model format.** glTF 2.0 binary (`.glb`) — native `three`/R3F loader support (`useGLTF`/`GLTFLoader`), single-file packaging, industry-standard tooling.
- **Compression trigger, not default.** Meshopt/Draco/KTX2 are adopted only once a specific asset breaches `docs/architecture/PERFORMANCE_BUDGET.md`'s per-asset caps (model > 2 MB, texture > 1 MB) or the total first-slice payload approaches its 4 MB cap.
  - Geometry: Meshopt via `gltf-transform`, decoded at runtime with `three`'s `MeshoptDecoder`. Preferred over Draco by default for its smaller/simpler JS decoder footprint (Draco's WASM decoder is heavier); Draco is adopted only if a measured case shows Meshopt insufficient.
  - Textures: standard compressed web formats (WebP) by default; KTX2/Basis is adopted only for textures that ship in the initial non-lazy payload and only once WebP alone would still breach the texture budgets.
- **Ownership/licensing.** Every non-procedural asset is recorded in an `ASSET_MANIFEST` (introduced with the first real model, not before) with source, license, and author. Only Juan-authored or explicitly-licensed CC0/self-created assets ship publicly — no unlicensed third-party models or textures.
- **Source vs. optimized storage.** Author/source files (e.g. `.blend`, uncompressed textures) are never committed to `portfolio_homlab`; only the exported optimized `.glb`/compressed texture actually used at runtime is versioned. Source files live outside the runtime repository, referenced by the manifest.
- **Loading boundary.** Every asset belongs to exactly one journey zone (per `docs/architecture/TECHNICAL_ARCHITECTURE.md` Capability and Loading Boundaries) and loads only when that zone activates. No global preloading "in case a later pavilion needs it."

## Alternatives Considered

- **Pre-adopt Draco + KTX2 immediately.** Rejected — adds build tooling and a WASM decoder payload before any asset exists to justify it; contradicts "measure, don't suppose" and the graybox-first sequencing in `M3`.
- **Ship raw uncompressed glTF/PNG indefinitely.** Rejected — would breach `PERFORMANCE_BUDGET.md`'s non-negotiable per-asset caps the moment a real model or texture is authored.

## Consequences

- `M3` graybox proceeds with zero asset-pipeline tooling.
- Compression tooling (`gltf-transform`, `MeshoptDecoder`) is introduced only when `M4` (Zavit placeholder) or `M7` (Visual Fidelity) actually adds a model — a concrete, trackable trigger instead of upfront ceremony.
- The `ASSET_MANIFEST` and licensing check become a required gate the first time any binary asset is added to the repository.
