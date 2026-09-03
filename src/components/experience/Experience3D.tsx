import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { WorldScene } from '../../experience/world/WorldScene'
import { LandmarkHud } from '../../experience/world/LandmarkHud'
import { LANDMARKS } from '../../experience/world/landmarks'
import { nearestLandmarkId, type Point2D } from '../../experience/world/navigation'
import type { ExperienceTier } from '../../capability/detectCapability'

interface Experience3DProps {
  reducedMotion: boolean
  tier: ExperienceTier
}

const START: Point2D = { x: LANDMARKS[0].position[0], z: LANDMARKS[0].position[2] }

export default function Experience3D({ reducedMotion, tier }: Experience3DProps) {
  const [target, setTarget] = useState<Point2D>(START)
  const [currentPosition, setCurrentPosition] = useState<Point2D>(START)
  const resolvedTier: 'full' | 'adapted' = tier === 'adapted' ? 'adapted' : 'full'

  return (
    <div style={{ position: 'relative', height: '60vh', minHeight: '20rem' }}>
      <Canvas
        camera={{ position: [START.x, 1.7, START.z], fov: 60 }}
        dpr={resolvedTier === 'adapted' ? 1 : undefined}
        shadows={resolvedTier === 'full'}
        aria-label="HomeLab 3D journey — click the ground to walk, or use the landmark list below"
      >
        <WorldScene
          target={target}
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
