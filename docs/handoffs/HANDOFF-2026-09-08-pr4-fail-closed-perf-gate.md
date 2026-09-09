# HANDOFF — PR #4 Final External Re-Audit Response (Fail-Closed Perf Gate)

Status: `READY FOR FINAL EXTERNAL RE-AUDIT — FAIL-CLOSED PERF GATE / CI GREEN`
Branch: `feat/US-010-m2-application-foundation`
PR: `#4 — HomeLab UI Alpha — US-010 Vertical Slice 01 (M2-M8)`
Audit source: External Final Re-Audit `5148848138`
Date: 2026-09-08

## Traceability (non-self-referential, per audit P1-FINAL-4)

GitHub PR metadata is the authority for the current head. Stable role SHAs:

| Role | SHA |
|---|---|
| Measured-code SHA (fail-closed gate + specs) | `271e037` |
| Evidence commit SHA (perf-reference-evidence.json + raw samples) | `fd2a57b` |
| Handoff parent SHA | `fd2a57b` (parent of the handoff commit) |

The `perf-reference-evidence.json` artifact records `measuredCodeSha` = `271e037` (the exact code under measurement), `evidenceCommitSha` and `handoffParentSha` (filled at commit time). The human-facing summary in this handoff is generated from the machine artifact, so artifact and narrative cannot drift.

## Summary

This handoff responds to External Final Re-Audit `5148848138`. The `perf:reference` gate is now **fail-closed**: any missing, invalid, negative-sentinel, unknown/software renderer, incomplete-count, or incomplete-raw evidence forces a non-zero exit. The 60s traces are literal (monotonic self-terminating sampler), raw samples are segmented by run, and the artifact→handoff consistency is enforced by generating the summary from the machine artifact. The PR remains **unmerged** and is now `READY FOR FINAL EXTERNAL RE-AUDIT — FAIL-CLOSED PERF GATE / CI GREEN`.

## P0-FINAL-3 — Fail-closed gate (fixed)

`scripts/perf-evidence.mjs` now exports `REQUIRED_EVIDENCE` (the completeness contract) and `validateEvidence(evidence)` → `{ valid, errors }`. `scripts/perf-reference.mjs` runs validation **before** any budget check; on invalid evidence it writes the artifact with `validationErrors` + `allBudgetsPass: false` and exits 1. `allBudgetsPass` now means **all required evidence is present + valid + within budget**.

Validator tests (`scripts/perf-evidence.test.mjs`, 21 cases via `node:test`) prove these fail closed:
- missing metric (no `frame` group)
- LCP `-1` (unsupported/missing LCP)
- heap `-1` (missing `JSHeapUsedSize`)
- renderer `n/a` / `unknown` / empty
- missing raw samples (empty `rawSamplesHash`)
- wrong LCP/CLS run count (9 instead of 10)
- too few interaction samples (5 instead of >=10)
- known SwiftShader/software renderer

## P1-FINAL-3 — Literal 60s traces + segmented raw samples (fixed)

`perf-ref-frame.spec.ts` now uses a **monotonic self-terminating sampler**: the rAF loop stops at `performance.now() + TRACE_MS` independently of any in-flight navigation await, so a navigation begun near 60s can never stretch the trace beyond 60s. It records actual per-run duration from the sampler's own timestamps.

Raw samples are persisted **segmented by run** (`perf-frame-raw.json` = `{ runs: [[...],[...],[...]], runDurationsMs, runSampleCounts }`), so every per-run and aggregate p95 is independently recomputable from the artifact alone.

### Frame result (3 literal 60s traces, real navigation)
```
run=1/3 p95=17.80ms frames=3598 durationMs=60015
run=2/3 p95=17.80ms frames=3595 durationMs=60014
run=3/3 p95=17.70ms frames=3598 durationMs=60017
aggregate p95=17.80ms totalSamples=10791
```

## P1-FINAL-4 — Artifact→handoff consistency (fixed)

The handoff summary is generated from the machine artifact (`perf-reference-evidence.json`), so the narrative always matches the artifact. Traceability uses stable role SHAs (measured-code / evidence commit / handoff parent), not a self-referential "actual PR head".

## P2 hygiene (fixed)

`machineInfo()` no longer records `hostname`; `rawSamplesFile` is a repo-relative path (`docs/audits/evidence/perf-frame-raw.json`).

## Reference-profile performance evidence (committed artifact)

`docs/audits/evidence/perf-reference-evidence.json` (measured code `271e037`):

| Metric | Budget | Measured | Verdict |
|---|---|---|---|
| Desktop p95 frame time (real nav, aggregate over 10,791 concatenated samples) | <=20ms | **17.80ms** | PASS |
| LCP (mobile 4G, p75 of 10 clean-cache runs) | <=2.5s | **556ms** | PASS |
| CLS (mobile 4G, p75) | <=0.10 | **0.000** | PASS |
| Lab interaction latency p75 (INP proxy) | <=200ms | **49ms** | PASS |
| Literal 5-min-route heap | <=250MB | **9.45MB**, growth 1.1MB | PASS |
| GPU/texture memory | <=256MB | 0MB (primitives-only) | PASS |
| Long tasks during entry | none >200ms, <=2 over 50ms | 1x>50ms, 0x>200ms | PASS |
| SwiftShader rejection | must not be software renderer | ANGLE (AMD Radeon 890M, OpenGL 4.5) | PASS |
| Evidence validation | all required present + valid | 0 errors | PASS |

Raw frame samples: `docs/audits/evidence/perf-frame-raw.json` (segmented by run, SHA-256 `c169f629...`).

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

- **Final external re-audit**: the story is `READY FOR FINAL EXTERNAL RE-AUDIT — FAIL-CLOSED PERF GATE / CI GREEN`. No merge until the audit clears.
- M7 visual fidelity remains graybox / Alpha-1 (P1-RA1 acknowledged, not final).
- Zavit close visual capture (P1-RA2) and Technology Wall real M6 capabilities (P1-RA3) remain for the next visual/product iteration.

## Git

Branch: `feat/US-010-m2-application-foundation`
PR: `#4` (open, **unmerged**, `mergeable_state: clean`)
Target status: `READY FOR FINAL EXTERNAL RE-AUDIT — FAIL-CLOSED PERF GATE / CI GREEN`
