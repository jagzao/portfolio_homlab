import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { WorldScene } from '../../experience/world/WorldScene'
import { LandmarkHud } from '../../experience/world/LandmarkHud'
import { GuidedControls } from '../../experience/world/GuidedControls'
import { DayNightToggle } from '../../experience/world/DayNightToggle'
import { LANDMARKS } from '../../experience/world/landmarks'
import { JOURNEY_OBSTACLES } from '../../experience/world/journeyObstacles'
import { CAMPUS_BOUNDS, clampToBounds, isPointBlocked, nearestLandmarkId, type Point2D } from '../../experience/world/navigation'
import { buildSplinePath, sliceSplinePathToIndex } from '../../experience/world/spline'
import { isWithinNoticeRadius, nextEncounterPhase, type EncounterPhase } from '../../experience/zavit/encounter'
import { ZavitGreeting } from '../../experience/zavit/ZavitGreeting'
import { SoftwareLabSection } from '../../experience/architecture/SoftwareLabSection'
import { useArchitectureTable } from '../../experience/architecture/ArchitectureTableContext'
import type { ExperienceTier } from '../../capability/detectCapability'

interface Experience3DProps {
  reducedMotion: boolean
  tier: ExperienceTier
  onContextLost: () => void
}

const START: Point2D = { x: LANDMARKS[0].position[0], z: LANDMARKS[0].position[2] }
const ARROW_STEP = 3
const NOTICING_DURATION_MS = 600
const SPLINE_SAMPLES = 12
/** Below this many px of pointer movement, treat a touch as a tap, not a look-drag. */
const DRAG_THRESHOLD_PX = 8

const ATRIUM_INDEX = LANDMARKS.findIndex((l) => l.id === 'atrium')
// Zavit only ever greets at the Atrium, so Guided Mode's first stop is the
// landmark right after it. If 'atrium' were ever renamed, findIndex returns
// -1 - fall back to "no stops left" rather than silently walking backward
// to the entrance.
const INITIAL_GUIDED_INDEX = ATRIUM_INDEX === -1 ? LANDMARKS.length : ATRIUM_INDEX + 1

export default function Experience3D({ reducedMotion, tier, onContextLost }: Experience3DProps) {
  const [target, setTarget] = useState<Point2D>(START)
  const [currentPosition, setCurrentPosition] = useState<Point2D>(START)
  const [encounterPhase, setEncounterPhase] = useState<EncounterPhase>('idle')
  const [journeyMode, setJourneyMode] = useState<'unset' | 'guided' | 'free'>('unset')
  const [guidedIndex, setGuidedIndex] = useState(INITIAL_GUIDED_INDEX)
  const [isDay, setIsDay] = useState(true)
  const [yaw, setYaw] = useState(0)
  const resolvedTier: 'full' | 'adapted' = tier === 'adapted' ? 'adapted' : 'full'

  // Full spline through every landmark (dense polyline). Sliced per-advance
  // (in `advanceTo`) into the segment the camera walks to the chosen stop;
  // stored in state so its reference stays stable across frames — recomputing
  // from the moving currentPosition would reset the camera's walk each frame.
  const fullSpline = useMemo(() => buildSplinePath(LANDMARKS.map((l) => ({ x: l.position[0], z: l.position[2] })), SPLINE_SAMPLES), [])
  const [guidedPath, setGuidedPath] = useState<Point2D[] | null>(null)

  // The keydown listener below binds once (see the empty-deps effect) and
  // its closure over `advanceGuided`/`journeyMode` is frozen at mount time.
  // Refs give that frozen closure a way to read current values instead of
  // stale ones — a plain function redefined each render would not help,
  // since the *listener's reference to that function* is what's frozen.
  const journeyModeRef = useRef(journeyMode)
  journeyModeRef.current = journeyMode
  const guidedIndexRef = useRef(guidedIndex)
  guidedIndexRef.current = guidedIndex
  const yawRef = useRef(yaw)
  yawRef.current = yaw
  const withinRadiusRef = useRef(false)
  const currentPositionRef = useRef(currentPosition)
  currentPositionRef.current = currentPosition

  // Any full-viewport overlay (Zavit's greeting, the Architecture Table)
  // must actually block world movement while it's open — aria-modal="true"
  // asserts background content is inert, and a keydown listener bound to
  // `window` doesn't respect visual layering the way pointer events do.
  const { open: architectureTableOpen } = useArchitectureTable()
  const inputBlockedRef = useRef(false)
  inputBlockedRef.current = encounterPhase === 'greeting' || architectureTableOpen

  useEffect(() => {
    withinRadiusRef.current = isWithinNoticeRadius(currentPosition)
    if (encounterPhase !== 'idle') return
    if (!withinRadiusRef.current) return
    setEncounterPhase(nextEncounterPhase('idle', true))
  }, [currentPosition, encounterPhase])

  useEffect(() => {
    if (encounterPhase !== 'noticing') return
    const delay = reducedMotion ? 0 : NOTICING_DURATION_MS
    const timer = setTimeout(() => {
      // If the visitor walked out of range during the notice window, don't
      // pop the greeting up wherever they ended up - go back to idle and
      // let proximity retrigger it naturally. Same if the Architecture
      // Table opened in the meantime - two independent real modals
      // (aria-modal="true" each) must never be visible at once; staying in
      // 'noticing' lets this same timer retry once the table closes,
      // rather than dropping the encounter entirely.
      if (architectureTableOpen) return
      setEncounterPhase(withinRadiusRef.current ? 'greeting' : 'idle')
    }, delay)
    return () => clearTimeout(timer)
  }, [encounterPhase, reducedMotion, architectureTableOpen])

  function chooseMode(mode: 'guided' | 'free') {
    setJourneyMode(mode)
    if (mode === 'free') setGuidedPath(null)
    setEncounterPhase('dismissed')
  }

  function advanceTo(index: number) {
    if (index >= LANDMARKS.length) return
    const landmark = LANDMARKS[index]
    setTarget({ x: landmark.position[0], z: landmark.position[2] })
    setGuidedPath(sliceSplinePathToIndex(fullSpline, currentPositionRef.current, index, SPLINE_SAMPLES))
    guidedIndexRef.current = index + 1
    setGuidedIndex(index + 1)
  }

  function advanceGuided() {
    advanceTo(guidedIndexRef.current)
  }

  // Skip the next stop: jump past it without dwelling, landing on the stop
  // after it (or completing the route if the next stop is the last one).
  function skipStop() {
    advanceTo(guidedIndexRef.current + 1)
  }

  // Supplemental keyboard control for Free Exploration (arrow/WASD nudge) and
  // Guided Mode (Space/right-arrow = Continue), per US-010's Movement and
  // Input Model. Bound once; reads current state via the refs above.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (inputBlockedRef.current) return

      // Escape opens semantic navigation (US-010 Movement and Input Model):
      // focus the semantic JourneyList section. Only acts when no modal is
      // open — the Zavit greeting and Architecture Table handle their own
      // Escape separately, so we must not steal focus from them. A DOM check
      // (rather than the inputBlocked ref) is timing-safe: it reflects the
      // actual page state at the moment the key fires, not a React render.
      if (event.key === 'Escape') {
        if (document.querySelector('[role="dialog"]')) return
        const journey = document.getElementById('journey-list')
        if (journey instanceof HTMLElement) {
          event.preventDefault()
          journey.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' })
          journey.focus()
        }
        return
      }

      if (journeyModeRef.current === 'guided') {
        if (event.key === ' ' || event.key === 'ArrowRight') {
          event.preventDefault()
          advanceGuided()
        }
        return
      }

      let dx = 0
      let dz = 0
      if (event.key === 'ArrowUp' || event.key === 'w') dz = -ARROW_STEP
      else if (event.key === 'ArrowDown' || event.key === 's') dz = ARROW_STEP
      else if (event.key === 'ArrowLeft' || event.key === 'a') dx = -ARROW_STEP
      else if (event.key === 'ArrowRight' || event.key === 'd') dx = ARROW_STEP
      else return

      event.preventDefault()
      setTarget((prev) => {
        const candidate = clampToBounds({ x: prev.x + dx, z: prev.z + dz }, CAMPUS_BOUNDS)
        return isPointBlocked(candidate, JOURNEY_OBSTACLES) ? prev : candidate
      })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reads latest values via refs, intentionally binds once
  }, [])

  const currentLandmarkId = nearestLandmarkId(currentPosition, LANDMARKS)

  // Real WebGL context-loss handling per ADR-002: when the GPU context is
  // lost, prevent the browser's automatic restore attempt (which would
  // otherwise loop) and immediately bubble up to the boundary so the semantic
  // shell takes over. The listener is attached to the canvas once it exists
  // and removed on unmount.
  const detachContextLostRef = useRef<(() => void) | null>(null)
  useEffect(() => {
    return () => detachContextLostRef.current?.()
  }, [])

  function handleCreated(state: { gl: { domElement: HTMLCanvasElement }; scene: unknown }) {
    const canvas = state.gl.domElement
    const onContextLostEvent = (event: Event) => {
      event.preventDefault()
      onContextLost()
    }
    canvas.addEventListener('webglcontextlost', onContextLostEvent)
    detachContextLostRef.current = () => canvas.removeEventListener('webglcontextlost', onContextLostEvent)
    // Expose the R3F scene graph and camera on the canvas so E2E tests can
    // assert on the 3D scene (e.g. Zavit's idle console) and the camera's
    // look yaw without a WebGL pixel probe.
    const canvasObj = canvas as HTMLCanvasElement & { __r3fScene?: unknown; __r3fCamera?: { rotation?: { y?: number } } }
    canvasObj.__r3fScene = state.scene
    const cam = (state as unknown as { camera?: { rotation?: { y?: number } } }).camera
    if (cam) canvasObj.__r3fCamera = cam

    // Drag-to-look (Free Exploration, coarse-pointer/touch): a horizontal
    // pointer drag on the canvas rotates the look yaw. Only active in Free
    // Exploration, and only for coarse (touch) pointers per the Movement and
    // Input Model. Small drags (below DRAG_THRESHOLD_PX) are treated as a
    // tap, not a look, so tap-to-walk keeps working on touch.
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (!coarsePointer) return
    let dragging = false
    let dragStartX = 0
    let dragStartY = 0
    let accumulatedYaw = 0

    const onPointerDown = (e: PointerEvent) => {
      if (journeyModeRef.current !== 'free') return
      dragging = true
      dragStartX = e.clientX
      dragStartY = e.clientY
      accumulatedYaw = yawRef.current
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - dragStartX
      const dy = e.clientY - dragStartY
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
      setYaw(accumulatedYaw + dx * 0.005)
    }
    const onPointerUp = () => {
      dragging = false
    }
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    const detachDrag = () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
    }
    const prevDetach = detachContextLostRef.current
    detachContextLostRef.current = () => {
      prevDetach?.()
      detachDrag()
    }
  }

  return (
    <div style={{ position: 'relative', height: '60vh', minHeight: '20rem' }}>
      <Canvas
        onCreated={handleCreated}
        camera={{ position: [START.x, 1.7, START.z], fov: 60 }}
        dpr={resolvedTier === 'adapted' ? 1 : undefined}
        shadows={resolvedTier === 'full'}
        aria-label="HomeLab 3D journey — click the ground to walk, use arrow keys, or use the landmark list below"
      >
        <WorldScene
          target={target}
          currentPosition={currentPosition}
          reducedMotion={reducedMotion}
          tier={resolvedTier}
          zavitState={encounterPhase === 'noticing' || encounterPhase === 'greeting' ? encounterPhase : 'idle'}
          isDay={isDay}
          guidedPath={guidedPath ?? undefined}
          yaw={journeyMode === 'guided' ? 0 : yaw}
          onPositionChange={setCurrentPosition}
          onGroundSelect={setTarget}
        />
      </Canvas>
      <DayNightToggle isDay={isDay} onToggle={() => setIsDay((d) => !d)} />
      <LandmarkHud currentId={currentLandmarkId} onSelect={setTarget} />
      {encounterPhase === 'greeting' && <ZavitGreeting onChoose={chooseMode} />}
      {journeyMode === 'guided' && (
        <GuidedControls
          nextIndex={guidedIndex}
          onContinue={advanceGuided}
          onSkip={skipStop}
          onExitToFree={() => {
            setJourneyMode('free')
            setGuidedPath(null)
          }}
        />
      )}
      {currentLandmarkId === 'software-lab' && encounterPhase !== 'greeting' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: 'calc(100% - 2 * var(--space-3))',
            overflowY: 'auto',
          }}
        >
          <SoftwareLabSection idPrefix="overlay" />
        </div>
      )}
    </div>
  )
}
