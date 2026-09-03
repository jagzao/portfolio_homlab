import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { WorldScene } from '../../experience/world/WorldScene'
import { LandmarkHud } from '../../experience/world/LandmarkHud'
import { GuidedControls } from '../../experience/world/GuidedControls'
import { LANDMARKS } from '../../experience/world/landmarks'
import { JOURNEY_OBSTACLES } from '../../experience/world/journeyObstacles'
import { CAMPUS_BOUNDS, clampToBounds, isPointBlocked, nearestLandmarkId, type Point2D } from '../../experience/world/navigation'
import { isWithinNoticeRadius, nextEncounterPhase, type EncounterPhase } from '../../experience/zavit/encounter'
import { ZavitGreeting } from '../../experience/zavit/ZavitGreeting'
import type { ExperienceTier } from '../../capability/detectCapability'

interface Experience3DProps {
  reducedMotion: boolean
  tier: ExperienceTier
}

const START: Point2D = { x: LANDMARKS[0].position[0], z: LANDMARKS[0].position[2] }
const ARROW_STEP = 3
const NOTICING_DURATION_MS = 600

const ATRIUM_INDEX = LANDMARKS.findIndex((l) => l.id === 'atrium')
// Zavit only ever greets at the Atrium, so Guided Mode's first stop is the
// landmark right after it. If 'atrium' were ever renamed, findIndex returns
// -1 - fall back to "no stops left" rather than silently walking backward
// to the entrance.
const INITIAL_GUIDED_INDEX = ATRIUM_INDEX === -1 ? LANDMARKS.length : ATRIUM_INDEX + 1

export default function Experience3D({ reducedMotion, tier }: Experience3DProps) {
  const [target, setTarget] = useState<Point2D>(START)
  const [currentPosition, setCurrentPosition] = useState<Point2D>(START)
  const [encounterPhase, setEncounterPhase] = useState<EncounterPhase>('idle')
  const [journeyMode, setJourneyMode] = useState<'unset' | 'guided' | 'free'>('unset')
  const [guidedIndex, setGuidedIndex] = useState(INITIAL_GUIDED_INDEX)
  const resolvedTier: 'full' | 'adapted' = tier === 'adapted' ? 'adapted' : 'full'

  // The keydown listener below binds once (see the empty-deps effect) and
  // its closure over `advanceGuided`/`journeyMode` is frozen at mount time.
  // Refs give that frozen closure a way to read current values instead of
  // stale ones — a plain function redefined each render would not help,
  // since the *listener's reference to that function* is what's frozen.
  const journeyModeRef = useRef(journeyMode)
  journeyModeRef.current = journeyMode
  const guidedIndexRef = useRef(guidedIndex)
  guidedIndexRef.current = guidedIndex
  const withinRadiusRef = useRef(false)

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
      // let proximity retrigger it naturally.
      setEncounterPhase(withinRadiusRef.current ? 'greeting' : 'idle')
    }, delay)
    return () => clearTimeout(timer)
  }, [encounterPhase, reducedMotion])

  function chooseMode(mode: 'guided' | 'free') {
    setJourneyMode(mode)
    setEncounterPhase('dismissed')
  }

  function advanceGuided() {
    const index = guidedIndexRef.current
    if (index >= LANDMARKS.length) return
    const landmark = LANDMARKS[index]
    setTarget({ x: landmark.position[0], z: landmark.position[2] })
    guidedIndexRef.current = index + 1
    setGuidedIndex(index + 1)
  }

  // Supplemental keyboard control for Free Exploration (arrow/WASD nudge) and
  // Guided Mode (Space/right-arrow = Continue), per US-010's Movement and
  // Input Model. Bound once; reads current state via the refs above.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
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

  return (
    <div style={{ position: 'relative', height: '60vh', minHeight: '20rem' }}>
      <Canvas
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
          onPositionChange={setCurrentPosition}
          onGroundSelect={setTarget}
        />
      </Canvas>
      <LandmarkHud currentId={nearestLandmarkId(currentPosition, LANDMARKS)} onSelect={setTarget} />
      {encounterPhase === 'greeting' && <ZavitGreeting onChoose={chooseMode} />}
      {journeyMode === 'guided' && (
        <GuidedControls nextIndex={guidedIndex} onContinue={advanceGuided} onExitToFree={() => setJourneyMode('free')} />
      )}
    </div>
  )
}
