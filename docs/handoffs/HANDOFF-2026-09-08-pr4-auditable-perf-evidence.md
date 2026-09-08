# HANDOFF — PR #4 Final External Re-Audit Response (Auditable Perf Evidence)

Status: `READY FOR FINAL EXTERNAL RE-AUDIT — AUDITABLE PERF EVIDENCE / CI GREEN`
Branch: `feat/US-010-m2-application-foundation`
PR: `#4 — HomeLab UI Alpha — US-010 Vertical Slice 01 (M2-M8)`
Audit source: Final External Re-Audit `5136504663`
Date: 2026-09-08

## Traceability (stable roles, per audit P1-FINAL-2)

GitHub PR metadata is the authority for the current head. Stable role commits:

| Role | Commit |
|---|---|
| Performance-evidence gate (perf:reference + specs) | `ee8805a` |
| Evidence artifact commit (perf-reference-evidence.json + raw samples) | `340e5f9` |
| Handoff reconciliation commit | `340e5f9` (parent `ee8805a`) |

The actual PR head is whatever GitHub reports; the PR body is updated after the final commit without creating another code/docs commit.

## Summary

This handoff responds to Final External Re-Audit `5136504663`. The two P0 blockers (auditable evidence + automatic machine recording) and the two P1 items (literal 60s traces + traceability model) are resolved. A single deterministic `perf:reference` entry point now executes the accepted reference suite, writes a machine-generated evidence artifact, and exits non-zero on any binding budget failure. The PR remains **unmerged** and is now `READY FOR FINAL EXTERNAL RE-AUDIT — AUDITABLE PERF EVIDENCE / CI GREEN`.

## P0-FINAL-1 — Auditable reference performance evidence (fixed)

New `scripts/perf-reference.mjs` + `scripts/perf-evidence.mjs` + npm script `perf:reference`:

- Executes the accepted reference suite (desktop + mobile-4G perf specs) under the hardware-accelerated configs.
- Writes a machine-generated evidence artifact to `docs/audits/evidence/perf-reference-evidence.json` containing: commit SHA, timestamp, exact command, config, browser version, reference-machine metadata (OS/CPU/RAM from Node `os`), per-run frame p95, aggregate p95, raw frame samples (separate file + SHA-256 hash), all 10 LCP/CLS values + p75, heap samples, interaction-latency samples, long-task results, GPU/texture result.
- Exits non-zero when a binding budget fails (or a software renderer is detected).

The evidence artifact is committed to the repo (`docs/audits/evidence/`), so the external auditor can inspect it directly.

## P0-FINAL-2 — Automatic reference-machine recording (fixed)

`perf:reference` records OS/CPU/RAM from Node `os` (`platform`, `release`, `arch`, `cpuModel`, `cpuCount`, `totalmemMB`, `hostname`), browser version (from UA), and unmasked WebGL vendor/renderer via `WEBGL_debug_renderer_info`. It explicitly rejects SwiftShader/software renderers for the release measurement (`swiftshaderRejected`).

## P1-FINAL-1 — Literal 60s traces (fixed)

The frame sampler no longer self-terminates on `performance.now()` (which could be cut short by a wall-clock/NTP adjustment while the navigation loop used `Date.now()`). The test now drives navigation for a literal 60s window and stops the sampler immediately after, so each trace is a real 60s (±1 frame) of navigation. Verified: all 3 runs now collect ~3,700-3,800 frames (60s at ~60 FPS), vs the earlier buggy runs that cut to 458/60 frames.

## P1-FINAL-2 — Traceability model (fixed)

See the traceability table above. Stable role commits are recorded; GitHub PR metadata is the authority for the current head. The PR body is updated after the final commit without creating another code/docs commit.

## Reference-profile performance evidence (committed artifact)

`docs/audits/evidence/perf-reference-evidence.json` (commit `340e5f9`, evidence for code commit `ee8805a`):

| Metric | Budget | Measured | Verdict |
|---|---|---|---|
| Desktop p95 frame time (real nav, aggregate over 11,170 concatenated samples) | <=20ms | **17.90ms** | PASS |
| LCP (mobile 4G, p75 of 10 clean-cache runs) | <=2.5s | **560ms** | PASS |
| CLS (mobile 4G, p75) | <=0.10 | **0.000** | PASS |
| Lab interaction latency p75 (INP proxy) | <=200ms | **64ms** | PASS |
| Literal 5-min-route heap | <=250MB | **9.39MB**, growth 1.1MB | PASS |
| GPU/texture memory | <=256MB | 0MB (primitives-only) | PASS |
| Long tasks during entry | none >200ms, <=2 over 50ms | 1x>50ms, 0x>200ms | PASS |
| SwiftShader rejection | must not be software renderer | ANGLE (AMD Radeon 890M, OpenGL 4.5) | PASS |

Raw frame samples: `docs/audits/evidence/perf-frame-raw.json` (SHA-256 `5e603a58...`).

## Reference device (recorded automatically by perf:reference)

| Property | Value |
|---|---|
| CPU | AMD Ryzen AI 9 HX 370 (24 threads) |
| GPU | AMD Radeon 890M Graphics (ANGLE/OpenGL 4.5, hardware-accelerated) |
| RAM | 30,329 MB |
| OS | win32 (10.0.26200) |
| Browser | Chrome 151.0.7922.34 |
| Viewport | 1920×1080 (desktop) / 412×915 (mobile) |

## CI on exact head

All jobs **success** on the exact head (push + PR suites): Validate, E2E functional, E2E visual evidence, E2E performance sampling, CI summary. PR #4 `mergeable_state: clean`, `state: open`, **not merged**.

## Known gates

- **Final external re-audit**: the story is `READY FOR FINAL EXTERNAL RE-AUDIT — AUDITABLE PERF EVIDENCE / CI GREEN`. No merge until the audit clears.
- M7 visual fidelity remains graybox / Alpha-1 (P1-RA1 acknowledged, not final).
- Zavit close visual capture (P1-RA2) and Technology Wall real M6 capabilities (P1-RA3) remain for the next visual/product iteration.

## Git

Branch: `feat/US-010-m2-application-foundation`
PR: `#4` (open, **unmerged**, `mergeable_state: clean`)
Target status: `READY FOR FINAL EXTERNAL RE-AUDIT — AUDITABLE PERF EVIDENCE / CI GREEN`
