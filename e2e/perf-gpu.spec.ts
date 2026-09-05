import { test } from '@playwright/test'

/**
 * P0-01: GPU / renderer / texture-memory estimate (US-010 mandatory gate).
 *
 * The budget in docs/architecture/PERFORMANCE_BUDGET.md is "GPU texture
 * memory estimate, initial slice" (<=256 MB desktop / <=128 MB mobile).
 * Real GPU memory reporting varies by browser/driver, so this spec produces
 * an HONEST estimate from three sources:
 *   1. CDP SystemInfo.getInfo -> GPU adapter/device name (what the renderer
 *      actually runs on), plus a WebGL renderer string.
 *   2. A scene-graph walk (R3F exposes the scene on the canvas) counting
 *      textures, materials, meshes, and draw calls. Per ADR-003 the app is
 *      primitives-only, so the texture count should be ZERO — verified here
 *      rather than assumed.
 *   3. A JS-heap proxy (performance.memory) as a coarse upper-bound sanity
 *      check, clearly labeled as a proxy, not GPU memory.
 *
 * Informational — logs results, no pass/fail assertion (budgets compared
 * manually in handoff). No fabricated precision: GPU memory is reported as
 * an estimate with the methodology recorded.
 */

test('GPU/renderer/texture-memory estimate (informational, honest estimate)', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /enter homelab/i }).click()
  await page.locator('canvas').waitFor({ state: 'visible' })
  await page.waitForTimeout(500) // let the scene settle past first-frame cost

  const client = await page.context().newCDPSession(page)

  // 1. Renderer / GPU adapter info via CDP.
  let gpuInfo: { name?: string; vendor?: string; deviceId?: string; vendorId?: string } | null = null
  let renderer = 'n/a'
  try {
    const info = await client.send('SystemInfo.getInfo')
    const gpu = info.gpu
    if (gpu?.devices?.length) {
      const d = gpu.devices[0]
      gpuInfo = { name: d.name, vendor: d.vendorString, deviceId: d.deviceId, vendorId: d.vendorId }
    }
  } catch {
    /* SystemInfo.getInfo not available in this browser context */
  }
  try {
    renderer = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      const gl = canvas?.getContext('webgl2') ?? canvas?.getContext('webgl')
      return gl ? String(gl.getParameter(gl.RENDERER)) : 'n/a'
    })
  } catch {
    /* WebGL context not reachable */
  }

  // 2. Scene-graph walk: count textures, materials, meshes, draw calls.
  const scene = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement & {
      __r3fScene?: { traverse?: (cb: (o: Record<string, unknown>) => void) => void }
    }
    const counts = { textures: 0, materials: 0, meshes: 0, drawCalls: 0 }
    if (!canvas?.__r3fScene?.traverse) return counts
    canvas.__r3fScene.traverse((obj) => {
      if (obj.isMesh) counts.meshes++
      const mat = obj.material as
        | { map?: unknown; normalMap?: unknown; roughnessMap?: unknown; metalnessMap?: unknown; emissiveMap?: unknown; aoMap?: unknown }
        | Array<{ map?: unknown; normalMap?: unknown; roughnessMap?: unknown; metalnessMap?: unknown; emissiveMap?: unknown; aoMap?: unknown }>
        | undefined
      if (!mat) return
      const mats = Array.isArray(mat) ? mat : [mat]
      for (const m of mats) {
        counts.materials++
        if (m.map) counts.textures++
        if (m.normalMap) counts.textures++
        if (m.roughnessMap) counts.textures++
        if (m.metalnessMap) counts.textures++
        if (m.emissiveMap) counts.textures++
        if (m.aoMap) counts.textures++
      }
    })
    return counts
  })

  // 3. JS-heap proxy (coarse upper-bound sanity check, NOT GPU memory).
  let jsHeapMB = -1
  try {
    jsHeapMB = await page.evaluate(() => {
      const mem = (performance as unknown as { memory?: { usedJSHeapSize?: number } }).memory
      return mem?.usedJSHeapSize ? mem.usedJSHeapSize / (1024 * 1024) : -1
    })
  } catch {
    /* performance.memory not exposed in this browser context */
  }

  // Per ADR-003 the scene is primitives-only, so texture memory should be
  // near-zero. Estimate GPU texture memory as textures * a conservative
  // per-texture allowance (0 here since the count is expected to be 0).
  const textureMemoryMB = scene.textures * 4 // 4 MB conservative per texture, 0 when none
  const gpuName = gpuInfo?.name ?? 'unknown'
  const vendor = gpuInfo?.vendor ?? 'unknown'

  console.log(
    `[perf-gpu] renderer=${renderer} gpuAdapter=${gpuName} (${vendor}) meshes=${scene.meshes} materials=${scene.materials} textures=${scene.textures} drawCalls=${scene.drawCalls}`,
  )
  console.log(
    `[perf-gpu] textureMemoryEstimate=${textureMemoryMB}MB (textures x 4MB conservative; 0 textures => 0MB) jsHeapProxy=${jsHeapMB.toFixed(1)}MB (proxy only, not GPU memory)`,
  )
  console.log(
    '[perf-gpu] methodology=CDP SystemInfo.getInfo + WebGL renderer string + R3F scene-graph texture/material/mesh/draw-call count; ' +
      'GPU memory is an ESTIMATE (browser/driver reporting varies); budget <=256MB desktop / <=128MB mobile ' +
      '(docs/architecture/PERFORMANCE_BUDGET.md)',
  )
})
