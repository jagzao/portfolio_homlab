import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { CAMPUS_BOUNDS, clampToBounds, isPointBlocked, isSegmentBlocked, type Point2D } from './navigation'
import { JOURNEY_OBSTACLES } from './journeyObstacles'
import { PlayerCamera } from './PlayerCamera'
import { Zavit } from '../zavit/Zavit'
import type { ZavitState } from '../zavit/ZavitEyeColor'

const TREE_POSITIONS: Array<[number, number]> = [
  [-5, -2], [5, -3], [-6, -6], [6, -7], [-4.5, -9], [5.5, -10],
]

interface WorldSceneProps {
  target: Point2D
  currentPosition: Point2D
  reducedMotion: boolean
  tier: 'full' | 'adapted'
  zavitState: ZavitState
  onPositionChange: (point: Point2D) => void
  onGroundSelect: (point: Point2D) => void
}

export function WorldScene({ target, currentPosition, reducedMotion, tier, zavitState, onPositionChange, onGroundSelect }: WorldSceneProps) {
  const trees = useMemo(() => (tier === 'adapted' ? TREE_POSITIONS.slice(0, 3) : TREE_POSITIONS), [tier])

  function handleGroundClick(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    const clamped = clampToBounds({ x: event.point.x, z: event.point.z }, CAMPUS_BOUNDS)
    if (isPointBlocked(clamped, JOURNEY_OBSTACLES)) return
    if (isSegmentBlocked(currentPosition, clamped, JOURNEY_OBSTACLES)) return
    onGroundSelect(clamped)
  }

  return (
    <>
      <color attach="background" args={['#212a35']} />
      <fog attach="fog" args={['#212a35', 30, 90]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 12, 6]} intensity={1.2} />

      <PlayerCamera target={target} reducedMotion={reducedMotion} onPositionChange={onPositionChange} />

      {/* Ground: the whole walkable corridor. Click/tap-to-walk target surface. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -32]} onPointerDown={handleGroundClick}>
        <planeGeometry args={[20, 90]} />
        <meshStandardMaterial color="#4c5246" />
      </mesh>

      {/* Forest approach: graybox trees, decorative only (not obstacles). */}
      {trees.map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 1.5]} />
            <meshStandardMaterial color="#5a4230" />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <coneGeometry args={[0.9, 1.8, 8]} />
            <meshStandardMaterial color="#3d6644" />
          </mesh>
        </group>
      ))}

      {/* HomeLab exterior: glass-pavilion facade, seen before entering. Wider
          than the portal arch and with mullion divisions so it reads as a
          building, not a repeat of the portal's silhouette from a distance. */}
      <mesh position={[0, 2.25, -13]}>
        <boxGeometry args={[15, 4.5, 0.5]} />
        <meshStandardMaterial color="#8b97a1" transparent opacity={0.85} />
      </mesh>
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, 2.25, -12.7]}>
          <boxGeometry args={[0.12, 4.5, 0.15]} />
          <meshStandardMaterial color="#212a35" />
        </mesh>
      ))}

      {/* Energy portal: the one entrance. Gold-accented frame; posts are obstacles. */}
      <group position={[0, 0, -22]}>
        <mesh position={[-3, 2, 0]}>
          <boxGeometry args={[0.6, 4, 0.6]} />
          <meshStandardMaterial color="#c9a24b" emissive="#c9a24b" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[3, 2, 0]}>
          <boxGeometry args={[0.6, 4, 0.6]} />
          <meshStandardMaterial color="#c9a24b" emissive="#c9a24b" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[6.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#c9a24b" emissive="#c9a24b" emissiveIntensity={0.25} />
        </mesh>
      </group>

      {/* Central Atrium: glass floor over water, central tree. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -38]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#2d5570" transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -38]}>
        <circleGeometry args={[6, 24]} />
        <meshStandardMaterial color="#e8e6df" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 1.5, -38]}>
        <cylinderGeometry args={[0.4, 0.5, 3]} />
        <meshStandardMaterial color="#5a4230" />
      </mesh>
      <mesh position={[0, 3.5, -38]}>
        <sphereGeometry args={[2, 12, 12]} />
        <meshStandardMaterial color="#4caf7d" />
      </mesh>

      <Zavit state={zavitState} reducedMotion={reducedMotion} />

      {/* Bridge over water to the Software Engineering Lab. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, -52]}>
        <planeGeometry args={[18, 16]} />
        <meshStandardMaterial color="#2d5570" transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 0.05, -52]}>
        <boxGeometry args={[3, 0.1, 14]} />
        <meshStandardMaterial color="#7d8a94" />
      </mesh>
      <mesh position={[-1.4, 0.6, -52]}>
        <boxGeometry args={[0.1, 1, 14]} />
        <meshStandardMaterial color="#7d8a94" />
      </mesh>
      <mesh position={[1.4, 0.6, -52]}>
        <boxGeometry args={[0.1, 1, 14]} />
        <meshStandardMaterial color="#7d8a94" />
      </mesh>

      {/* Software Engineering Lab: entry wall with a doorway cutout, entry
          point marker only — interior content is M5. A recessed dark
          opening plus a gold threshold strip reads as an entrance, not a
          freestanding slab. */}
      <mesh position={[-4.15, 2.25, -66]}>
        <boxGeometry args={[3.3, 4.5, 0.5]} />
        <meshStandardMaterial color="#6b8895" transparent opacity={0.85} />
      </mesh>
      <mesh position={[4.15, 2.25, -66]}>
        <boxGeometry args={[3.3, 4.5, 0.5]} />
        <meshStandardMaterial color="#6b8895" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 4.1, -66]}>
        <boxGeometry args={[3, 0.8, 0.5]} />
        <meshStandardMaterial color="#6b8895" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 1, -66.3]}>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial color="#151a20" />
      </mesh>
      <mesh position={[0, 0.05, -65.7]}>
        <boxGeometry args={[3, 0.1, 0.6]} />
        <meshStandardMaterial color="#c9a24b" emissive="#c9a24b" emissiveIntensity={0.2} />
      </mesh>
    </>
  )
}
