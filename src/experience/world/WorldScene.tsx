import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { CAMPUS_BOUNDS, clampToBounds, isPointBlocked, type CircleObstacle, type Point2D } from './navigation'
import { PlayerCamera } from './PlayerCamera'

// Portal posts + atrium tree trunk + lab walls: solid graybox volumes a
// click-to-walk target may not land inside. Kept short and hand-placed —
// matches the handful of landmarks, not a general physics system (ADR-003:
// graybox first, no more machinery than the slice needs).
const OBSTACLES: CircleObstacle[] = [
  { x: -3, z: -22, radius: 1 }, // portal post (left)
  { x: 3, z: -22, radius: 1 }, // portal post (right)
  { x: 0, z: -38, radius: 2 }, // atrium tree trunk
]

const TREE_POSITIONS: Array<[number, number]> = [
  [-5, -2], [5, -3], [-6, -6], [6, -7], [-4.5, -9], [5.5, -10],
]

interface WorldSceneProps {
  target: Point2D
  reducedMotion: boolean
  tier: 'full' | 'adapted'
  onPositionChange: (point: Point2D) => void
  onGroundSelect: (point: Point2D) => void
}

export function WorldScene({ target, reducedMotion, tier, onPositionChange, onGroundSelect }: WorldSceneProps) {
  const trees = useMemo(() => (tier === 'adapted' ? TREE_POSITIONS.slice(0, 3) : TREE_POSITIONS), [tier])

  function handleGroundClick(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    const clamped = clampToBounds({ x: event.point.x, z: event.point.z }, CAMPUS_BOUNDS)
    if (isPointBlocked(clamped, OBSTACLES)) return
    onGroundSelect(clamped)
  }

  return (
    <>
      <color attach="background" args={['#0b0c0e']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 6]} intensity={0.9} />

      <PlayerCamera target={target} reducedMotion={reducedMotion} onPositionChange={onPositionChange} />

      {/* Ground: the whole walkable corridor. Click/tap-to-walk target surface. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -32]} onPointerDown={handleGroundClick}>
        <planeGeometry args={[20, 90]} />
        <meshStandardMaterial color="#1a2417" />
      </mesh>

      {/* Forest approach: graybox trees, decorative only (not obstacles). */}
      {trees.map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 1.5]} />
            <meshStandardMaterial color="#3d2b1f" />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <coneGeometry args={[0.9, 1.8, 8]} />
            <meshStandardMaterial color="#2f4a33" />
          </mesh>
        </group>
      ))}

      {/* HomeLab exterior: glass-pavilion silhouette, seen before entering. */}
      <mesh position={[0, 2, -14]}>
        <boxGeometry args={[10, 4, 0.5]} />
        <meshStandardMaterial color="#3a4048" transparent opacity={0.5} />
      </mesh>

      {/* Energy portal: the one entrance. Gold-accented frame; posts are obstacles. */}
      <group position={[0, 0, -22]}>
        <mesh position={[-3, 2, 0]}>
          <boxGeometry args={[0.6, 4, 0.6]} />
          <meshStandardMaterial color="#c9a24b" emissive="#c9a24b" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[3, 2, 0]}>
          <boxGeometry args={[0.6, 4, 0.6]} />
          <meshStandardMaterial color="#c9a24b" emissive="#c9a24b" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[6.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#c9a24b" emissive="#c9a24b" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Central Atrium: glass floor over water, central tree. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -38]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#1e3a4a" transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -38]}>
        <circleGeometry args={[6, 24]} />
        <meshStandardMaterial color="#e8e6df" transparent opacity={0.15} />
      </mesh>
      <mesh position={[0, 1.5, -38]}>
        <cylinderGeometry args={[0.4, 0.5, 3]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      <mesh position={[0, 3.5, -38]}>
        <sphereGeometry args={[2, 12, 12]} />
        <meshStandardMaterial color="#4caf7d" />
      </mesh>

      {/* Bridge over water to the Software Engineering Lab. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, -52]}>
        <planeGeometry args={[18, 16]} />
        <meshStandardMaterial color="#1e3a4a" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.05, -52]}>
        <boxGeometry args={[3, 0.1, 14]} />
        <meshStandardMaterial color="#3a4048" />
      </mesh>

      {/* Software Engineering Lab: entry point marker only, content is M5. */}
      <mesh position={[0, 2, -66]}>
        <boxGeometry args={[10, 4, 0.5]} />
        <meshStandardMaterial color="#3a5560" transparent opacity={0.6} />
      </mesh>
    </>
  )
}
