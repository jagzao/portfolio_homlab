import test from 'node:test'
import assert from 'node:assert/strict'
import { validateEvidence } from './perf-evidence.mjs'

/**
 * Fail-closed validator tests (external audit 5148848138, P0-FINAL-3).
 * Proves validateEvidence() rejects missing metrics, -1 sentinels, wrong run
 * counts, missing raw samples, unavailable renderers, and software renderers,
 * and accepts a well-formed evidence object.
 *
 * Run: node --test scripts/perf-evidence.test.mjs
 */

/** A well-formed evidence object that satisfies the required schema. */
function validEvidence() {
  return {
    frame: {
      runP95s: [15.5, 16.2, 14.9],
      aggregateP95: 16.2,
      totalSamples: 12000,
      rawSamplesHash: 'a'.repeat(64),
      rawSamplesFile: 'docs/audits/evidence/perf-frame-raw.json',
      runDurationsMs: [60005.2, 60002.7, 60008.1],
      runSampleCounts: [4000, 4000, 4000],
    },
    vitals: {
      lcpAll: Array(10).fill(550),
      clsAll: Array(10).fill(0),
      lcpP75: 550,
      clsP75: 0,
    },
    heap: {
      beforeMB: 4,
      afterMB: 9.5,
      deltaMB: 5.5,
      growthMB: 1.2,
      perPassMB: [8.3, 8.7, 9.1, 9.5],
    },
    interaction: {
      values: Array(12).fill(50),
      p75: 50,
    },
    longTasks: {
      count: 1,
      over50: 1,
      over200: 0,
      durations: [67],
    },
    gpu: {
      unmaskedRenderer: 'ANGLE (NVIDIA GeForce RTX 4080, OpenGL 4.6)',
      unmaskedVendor: 'Google Inc. (NVIDIA)',
      textures: 0,
      textureMemoryMB: 0,
    },
  }
}

function expectValid(evidence, label) {
  const result = validateEvidence(evidence)
  assert.equal(result.valid, true, `${label}: expected VALID, errors=${JSON.stringify(result.errors)}`)
  assert.deepEqual(result.errors, [], `${label}: expected no errors`)
}

function expectInvalid(evidence, label) {
  const result = validateEvidence(evidence)
  assert.equal(result.valid, false, `${label}: expected INVALID`)
  assert.ok(result.errors.length > 0, `${label}: expected at least one validation error`)
  return result
}

test('accepts a well-formed evidence object', () => {
  expectValid(validEvidence(), 'well-formed evidence')
})

test('rejects a missing required metric group (no frame)', () => {
  const ev = validEvidence()
  delete ev.frame
  expectInvalid(ev, 'missing frame group')
})

test('rejects a missing raw sample reference (empty rawSamplesHash)', () => {
  const ev = validEvidence()
  ev.frame.rawSamplesHash = ''
  expectInvalid(ev, 'empty rawSamplesHash')
})

test('rejects an empty rawSamplesFile', () => {
  const ev = validEvidence()
  ev.frame.rawSamplesFile = ''
  expectInvalid(ev, 'empty rawSamplesFile')
})

test('rejects a wrong frame run count (2 instead of 3)', () => {
  const ev = validEvidence()
  ev.frame.runP95s = [15.5, 16.2]
  ev.frame.runDurationsMs = [60000, 60000]
  ev.frame.runSampleCounts = [4000, 4000]
  expectInvalid(ev, 'runP95s length 2')
})

test('rejects LCP missing sentinel (-1 in lcpAll)', () => {
  const ev = validEvidence()
  ev.vitals.lcpAll = [...Array(9).fill(550), -1]
  expectInvalid(ev, 'lcpAll contains -1')
})

test('rejects an unsupported-LCP p75 of -1', () => {
  const ev = validEvidence()
  ev.vitals.lcpAll = Array(10).fill(550)
  ev.vitals.lcpP75 = -1
  expectInvalid(ev, 'lcpP75 = -1')
})

test('rejects a wrong LCP/CLS run count (9 instead of 10)', () => {
  const ev = validEvidence()
  ev.vitals.clsAll = Array(9).fill(0)
  expectInvalid(ev, 'clsAll length 9')
})

test('rejects missing JSHeapUsedSize sentinel (-1 in heap)', () => {
  const ev = validEvidence()
  ev.heap.afterMB = -1
  expectInvalid(ev, 'heap.afterMB = -1')
})

test('rejects a -1 sentinel inside heap perPassMB', () => {
  const ev = validEvidence()
  ev.heap.perPassMB = [8.3, -1, 9.1]
  expectInvalid(ev, 'perPassMB contains -1')
})

test('rejects an empty heap perPassMB array', () => {
  const ev = validEvidence()
  ev.heap.perPassMB = []
  expectInvalid(ev, 'perPassMB empty')
})

test('rejects too few interaction samples (5 instead of >=10)', () => {
  const ev = validEvidence()
  ev.interaction.values = Array(5).fill(50)
  expectInvalid(ev, 'interaction.values length 5')
})

test('rejects an unavailable renderer (n/a)', () => {
  const ev = validEvidence()
  ev.gpu.unmaskedRenderer = 'n/a'
  expectInvalid(ev, 'unmaskedRenderer n/a')
})

test('rejects an unknown/unavailable vendor', () => {
  const ev = validEvidence()
  ev.gpu.unmaskedVendor = 'unknown'
  expectInvalid(ev, 'unmaskedVendor unknown')
})

test('rejects a known SwiftShader software renderer', () => {
  const ev = validEvidence()
  ev.gpu.unmaskedRenderer = 'ANGLE (Google, SwiftShader Device (Google), OpenGL ES 3.0)'
  expectInvalid(ev, 'SwiftShader renderer')
})

test('rejects an llvmpipe software renderer', () => {
  const ev = validEvidence()
  ev.gpu.unmaskedRenderer = 'Mesa llvmpipe (LLVM 17.0.0, 256 bits)'
  expectInvalid(ev, 'llvmpipe renderer')
})

test('rejects a missing renderer (empty string)', () => {
  const ev = validEvidence()
  ev.gpu.unmaskedRenderer = ''
  expectInvalid(ev, 'empty unmaskedRenderer')
})

test('rejects unavailable scene traversal recorded as textures=-1', () => {
  const ev = validEvidence()
  ev.gpu.textures = -1
  ev.gpu.textureMemoryMB = -1
  expectInvalid(ev, 'textures = -1')
})

test('rejects non-finite values (NaN aggregateP95)', () => {
  const ev = validEvidence()
  ev.frame.aggregateP95 = Number.NaN
  expectInvalid(ev, 'aggregateP95 NaN')
})

test('rejects non-finite values (Infinity CLS)', () => {
  const ev = validEvidence()
  ev.vitals.clsP75 = Infinity
  expectInvalid(ev, 'clsP75 Infinity')
})

test('rejects a completely empty evidence object', () => {
  expectInvalid({}, 'empty evidence')
})
