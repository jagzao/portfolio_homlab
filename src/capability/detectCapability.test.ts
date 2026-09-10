import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectCapability } from './detectCapability'

function mockMatchMedia(matches: Record<string, boolean>) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matches[query] ?? false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

function mockWebGL(available: boolean) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((contextId: string) => {
    if (!available) return null
    if (contextId === 'webgl2' || contextId === 'webgl') return {} as WebGLRenderingContext
    return null
  }) as typeof HTMLCanvasElement.prototype.getContext)
}

describe('detectCapability', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    // @ts-expect-error test cleanup of a browser-only field
    delete navigator.connection
    // @ts-expect-error test cleanup of a browser-only field
    delete navigator.deviceMemory
  })

  it('falls back to semantic mode when WebGL is unavailable', () => {
    mockMatchMedia({})
    mockWebGL(false)
    const result = detectCapability()
    expect(result.tier).toBe('semantic')
    expect(result.reason).toBe('webgl-unavailable')
    expect(result.canOptIntoFull).toBe(false)
  })

  it('defaults to full tier when every signal is capable', () => {
    mockMatchMedia({})
    mockWebGL(true)
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true })
    const result = detectCapability()
    expect(result.tier).toBe('full')
  })

  it('prefers semantic mode with an opt-in when data saver is on', () => {
    mockMatchMedia({})
    mockWebGL(true)
    Object.defineProperty(navigator, 'connection', {
      value: { saveData: true },
      configurable: true,
    })
    const result = detectCapability()
    expect(result.tier).toBe('semantic')
    expect(result.reason).toBe('data-saver')
    expect(result.canOptIntoFull).toBe(true)
  })

  it('selects adapted tier for a coarse-pointer small viewport', () => {
    mockMatchMedia({ '(pointer: coarse)': true })
    mockWebGL(true)
    Object.defineProperty(window, 'innerWidth', { value: 390, configurable: true })
    const result = detectCapability()
    expect(result.tier).toBe('adapted')
    expect(result.reason).toBe('mobile-heuristic')
  })

  it('selects adapted tier for a low-memory desktop', () => {
    mockMatchMedia({})
    mockWebGL(true)
    Object.defineProperty(navigator, 'deviceMemory', { value: 2, configurable: true })
    const result = detectCapability()
    expect(result.tier).toBe('adapted')
    expect(result.reason).toBe('low-capability-device')
  })

  it('reports reduced motion independently of tier', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    mockWebGL(true)
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true })
    const result = detectCapability()
    expect(result.tier).toBe('full')
    expect(result.reducedMotion).toBe(true)
  })

  it('never restricts on an unknown/unavailable signal', () => {
    mockMatchMedia({})
    mockWebGL(true)
    // deviceMemory and connection are simply absent in this browser.
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true })
    const result = detectCapability()
    expect(result.tier).toBe('full')
  })
})
