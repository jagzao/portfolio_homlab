import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { CAMPUS_BOUNDS, clampToBounds, isPointBlocked, isSegmentBlocked, type Point2D } from './navigation'
import { JOURNEY_OBSTACLES } from './journeyObstacles'
import { PlayerCamera } from './PlayerCamera'
import { Stars } from './Stars'
import { Zavit } from '../zavit/Zavit'
import type { ZavitState } from '../zavit/ZavitEyeColor'

const TREE_POSITIONS: Array<[number, number]> = [
  [-5, -2], [5, -3], [-6, -6], [6, -7], [-4.5, -9], [5.5, -10],
]

// Vertical-garden accents (MASTER_BACKLOG M7): leaf clusters against the
// exterior and lab facades. Decorative only, not obstacles. x positions
// matched to each facade's actual span (exterior: boxGeometry width 15 ->
// edges near ±7; lab walls: two 3.3-wide panels centered at x=±4.15 ->
// outer edges near ±5.8) — a prior version used the exterior's x offset for
// the lab too, floating the vines outside the narrower lab walls entirely.
const VINE_POSITIONS: Array<[number, number, number]> = [
  [-6.8, 2.25, -13], [6.8, 2.25, -13],
  [-5.7, 2.25, -66], [5.7, 2.25, -66],
]

const DAY = {
  sky: '#4a6a85',
  hemiSky: '#6a8aa5',
  hemiGround: '#4a5540',
  sun: '#fff3d6',
  sunIntensity: 1.6,
  ambient: 0.9,
}

const NIGHT = {
  sky: '#0a0e16',
  hemiSky: '#1a2438',
  hemiGround: '#12160f',
  sun: '#93a8c9',
  sunIntensity: 0.35,
  ambient: 0.3,
}

interface WorldSceneProps {
  target: Point2D
  currentPosition: Point2D
  reducedMotion: boolean
  tier: 'full' | 'adapted'
  zavitState: ZavitState
  isDay: boolean
  onPositionChange: (point: Point2D) => void
  onGroundSelect: (point: Point2D) => void
}

export function WorldScene({
  target,
  currentPosition,
  reducedMotion,
  tier,
  zavitState,
  isDay,
  onPositionChange,
  onGroundSelect,
}: WorldSceneProps) {
  const trees = useMemo(() => (tier === 'adapted' ? TREE_POSITIONS.slice(0, 3) : TREE_POSITIONS), [tier])
  const palette = isDay ? DAY : NIGHT

  function handleGroundClick(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    const clamped = clampToBounds({ x: event.point.x, z: event.point.z }, CAMPUS_BOUNDS)
    if (isPointBlocked(clamped, JOURNEY_OBSTACLES)) return
    if (isSegmentBlocked(currentPosition, clamped, JOURNEY_OBSTACLES)) return
    onGroundSelect(clamped)
  }

  return (
    <>
      <color attach="background" args={[palette.sky]} />
      <fog attach="fog" args={[palette.sky, 30, 90]} />
      <hemisphereLight args={[palette.hemiSky, palette.hemiGround, 0.6]} />
      <ambientLight intensity={palette.ambient} />
      <directionalLight position={[8, 12, 6]} intensity={palette.sunIntensity} color={palette.sun} />
      {!isDay && <Stars />}

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
        <meshStandardMaterial color="#8b97a1" transparent opacity={0.5} roughness={0.2} metalness={0.1} />
      </mesh>
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, 2.25, -12.7]}>
          <boxGeometry args={[0.12, 4.5, 0.15]} />
          <meshStandardMaterial color={palette.sky} />
        </mesh>
      ))}

      {/* Vertical garden accents on the exterior and lab facades: a thin
          stem with scattered flattened-sphere leaf clusters (varied
          size/offset) instead of evenly-spaced rungs, which read as a
          ladder rather than foliage. 0.5 units off the facade (was 0.3) for
          more separation from the semi-transparent glass behind it.
          4 leaves per vine (was 7, larger to keep similar coverage) - a
          measured p95 frame-time regression traced partly to the 28 extra
          draw calls; PERFORMANCE_BUDGET.md's own scaling order prescribes
          reducing vegetation density first when over budget. */}
      {VINE_POSITIONS.map(([x, y, z]) => (
        <group key={`${x}-${z}`} position={[x, y, z + 0.5]}>
          <mesh>
            <boxGeometry args={[0.06, 4, 0.06]} />
            <meshStandardMaterial color="#2f4a33" />
          </mesh>
          {[
            [-1.4, 0.18, 0.3],
            [-0.4, -0.15, 0.26],
            [0.5, 0.2, 0.3],
            [1.4, -0.1, 0.26],
          ].map(([dy, dx, size], i) => (
            <mesh key={i} position={[dx, dy, 0.1]}>
              <sphereGeometry args={[size, 6, 6]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#3d6644' : '#4a7a52'} />
            </mesh>
          ))}
        </group>
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

      {/* Central Atrium: glass floor over water, central tree. Water sits
          just ABOVE the general ground plane (y=0) so it's actually
          visible — it previously sat below the ground (y=-0.05), which is
          an opaque full-corridor plane that occluded it everywhere. Glass
          floor sits above the water in turn. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -38]}>
        <planeGeometry args={[18, 18]} />
        <meshPhysicalMaterial color="#2d5570" transparent opacity={0.75} roughness={0.15} clearcoat={0.8} clearcoatRoughness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -38]}>
        <circleGeometry args={[6, 24]} />
        <meshPhysicalMaterial color="#e8e6df" transparent opacity={0.3} roughness={0.1} clearcoat={0.9} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0, 1.5, -38]}>
        <cylinderGeometry args={[0.4, 0.5, 3]} />
        <meshStandardMaterial color="#5a4230" />
      </mesh>
      {/* Canopy: three overlapping clusters instead of one perfect sphere, for an organic read. */}
      <mesh position={[0, 3.6, -38]}>
        <sphereGeometry args={[1.9, 12, 12]} />
        <meshStandardMaterial color="#4caf7d" />
      </mesh>
      <mesh position={[-1.1, 3.2, -37.3]}>
        <sphereGeometry args={[1.2, 10, 10]} />
        <meshStandardMaterial color="#458f6b" />
      </mesh>
      <mesh position={[1.2, 3.1, -38.6]}>
        <sphereGeometry args={[1.3, 10, 10]} />
        <meshStandardMaterial color="#56c98a" />
      </mesh>

      <Zavit state={zavitState} reducedMotion={reducedMotion} />

      {/* Bridge over water to the Software Engineering Lab. Water at y=0.01,
          same fix as the Atrium — visible above the ground plane and below
          the deck (deck box spans y=0..0.1). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -52]}>
        <planeGeometry args={[18, 16]} />
        <meshPhysicalMaterial color="#2d5570" transparent opacity={0.75} roughness={0.15} clearcoat={0.8} clearcoatRoughness={0.1} />
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
        <meshStandardMaterial color="#6b8895" transparent opacity={0.5} roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[4.15, 2.25, -66]}>
        <boxGeometry args={[3.3, 4.5, 0.5]} />
        <meshStandardMaterial color="#6b8895" transparent opacity={0.5} roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0, 4.1, -66]}>
        <boxGeometry args={[3, 0.8, 0.5]} />
        <meshStandardMaterial color="#6b8895" transparent opacity={0.5} roughness={0.2} metalness={0.1} />
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
