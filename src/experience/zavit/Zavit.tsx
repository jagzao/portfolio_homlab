import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { ZAVIT_POSITION } from './zavitConfig'
import { eyeColorForState, type ZavitState } from './ZavitEyeColor'

interface ZavitProps {
  state: ZavitState
  reducedMotion: boolean
}

/**
 * Graybox placeholder per MASTER_BACKLOG M4: black body, white belly screen,
 * illuminated eyes (color by state), head buttons, red claw hands. Exact
 * proportions/final model are UNKNOWN pending a stronger reference from
 * Juan (docs/vision/ART_DIRECTION.md) — this is deliberately simple
 * primitives, not a final character model.
 */
export function Zavit({ state, reducedMotion }: ZavitProps) {
  const headRef = useRef<Mesh>(null!)
  const eyeColor = eyeColorForState(state)

  useFrame((frameState) => {
    if (reducedMotion || !headRef.current) return
    // Small idle head turn while "working" — never while greeting (stays attentive), never under reduced motion.
    if (state === 'idle') {
      headRef.current.rotation.y = Math.sin(frameState.clock.elapsedTime * 0.6) * 0.3
    } else {
      headRef.current.rotation.y = 0
    }
  })

  return (
    <group position={[ZAVIT_POSITION.x, 0, ZAVIT_POSITION.z]}>
      {/* Base: separates the body visually from the ground, so the hands
          (well above it) don't read as feet at graybox scale. */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.3]} />
        <meshStandardMaterial color="#15171b" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.9, 1.2, 0.6]} />
        <meshStandardMaterial color="#15171b" />
      </mesh>
      {/* Belly screen */}
      <mesh position={[0, 0.9, 0.31]}>
        <boxGeometry args={[0.6, 0.5, 0.02]} />
        <meshStandardMaterial color="#e8e6df" emissive="#e8e6df" emissiveIntensity={0.15} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.75, 0]}>
        <boxGeometry args={[0.7, 0.55, 0.55]} />
        <meshStandardMaterial color="#15171b" />
        {/* Eyes */}
        <mesh position={[-0.15, 0, 0.28]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.15, 0, 0.28]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.6} />
        </mesh>
        {/* Head buttons */}
        <mesh position={[-0.2, 0.32, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06]} />
          <meshStandardMaterial color="#c9a24b" />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06]} />
          <meshStandardMaterial color="#4caf7d" />
        </mesh>
        <mesh position={[0.2, 0.32, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06]} />
          <meshStandardMaterial color="#d1554a" />
        </mesh>
      </mesh>
      {/* Arms + red claw hands. Shorter and higher than a first pass that
          put the hands near the torso's bottom edge, where they read as
          feet with nothing else near the ground to disambiguate them. */}
      <mesh position={[-0.55, 1.05, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.45]} />
        <meshStandardMaterial color="#15171b" />
      </mesh>
      <mesh position={[-0.55, 0.78, 0]}>
        <boxGeometry args={[0.22, 0.18, 0.18]} />
        <meshStandardMaterial color="#d1554a" />
      </mesh>
      <mesh position={[0.55, 1.05, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.45]} />
        <meshStandardMaterial color="#15171b" />
      </mesh>
      <mesh position={[0.55, 0.78, 0]}>
        <boxGeometry args={[0.22, 0.18, 0.18]} />
        <meshStandardMaterial color="#d1554a" />
      </mesh>
    </group>
  )
}
