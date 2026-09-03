import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { WorldScene } from '../../experience/world/WorldScene'
import { LandmarkHud } from '../../experience/world/LandmarkHud'
import { LANDMARKS } from '../../experience/world/landmarks'
import {
  CAMPUS_BOUNDS,
  CAMPUS_OBSTACLES,
  clampToBounds,
  isPointBlocked,
  nearestLandmarkId,
  type Point2D,
} from '../../experience/world/navigation'
import type { ExperienceTier } from '../../capability/detectCapability'

interface Experience3DProps {
  reducedMotion: boolean
  tier: ExperienceTier
}

const START: Point2D = { x: LANDMARKS[0].position[0], z: LANDMARKS[0].position[2] }
const ARROW_STEP = 3

export default function Experience3D({ reducedMotion, tier }: Experience3DProps) {
  const [target, setTarget] = useState<Point2D>(START)
  const [currentPosition, setCurrentPosition] = useState<Point2D>(START)
  const resolvedTier: 'full' | 'adapted' = tier === 'adapted' ? 'adapted' : 'full'

  // Supplemental keyboard control for Free Exploration (US-010 Movement and
  // Input Model), alongside click-to-walk and the LandmarkHud jump list.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
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
        return isPointBlocked(candidate, CAMPUS_OBSTACLES) ? prev : candidate
      })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
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
          onPositionChange={setCurrentPosition}
          onGroundSelect={setTarget}
        />
      </Canvas>
      <LandmarkHud currentId={nearestLandmarkId(currentPosition, LANDMARKS)} onSelect={setTarget} />
    </div>
  )
}
