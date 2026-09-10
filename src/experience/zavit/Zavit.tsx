import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshStandardMaterial } from 'three'
import { ZAVIT_POSITION } from './zavitConfig'
import { eyeColorForState, type ZavitState } from './ZavitEyeColor'
import { activityFrame } from './activity'

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
 *
 * While idle, Zavit performs a purposeful activity (US-010): it works on a
 * small repair console in front of it — hands reach toward the panel, the
 * panel screen cycles, and a status light blinks. On noticing/greeting it
 * stops working and becomes attentive to the visitor. Reduced motion keeps
 * the console visible in a static working pose (ADR-002).
 */
export function Zavit({ state, reducedMotion }: ZavitProps) {
  const headRef = useRef<Mesh>(null!)
  const leftHandRef = useRef<Mesh>(null!)
  const rightHandRef = useRef<Mesh>(null!)
  const panelRef = useRef<Mesh>(null!)
  const statusRef = useRef<Mesh>(null!)
  const eyeColor = eyeColorForState(state)

  useFrame((frameState) => {
    const frame = activityFrame(state, reducedMotion, frameState.clock.elapsedTime)
    if (headRef.current) {
      // Small idle head turn while "working" — never while greeting (stays attentive), never under reduced motion.
      headRef.current.rotation.y = frame.active ? Math.sin(frameState.clock.elapsedTime * 0.6) * 0.3 : 0
    }
    if (leftHandRef.current) leftHandRef.current.position.y = 0.78 + frame.handLift * 0.12
    if (rightHandRef.current) rightHandRef.current.position.y = 0.78 + frame.handLift * 0.12
    if (panelRef.current) {
      const mat = panelRef.current.material as MeshStandardMaterial
      mat.emissiveIntensity = frame.panelGlow
    }
    if (statusRef.current) {
      const mat = statusRef.current.material as MeshStandardMaterial
      mat.emissiveIntensity = frame.statusOn ? 0.8 : 0.05
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
      <mesh ref={leftHandRef} position={[-0.55, 0.78, 0]}>
        <boxGeometry args={[0.22, 0.18, 0.18]} />
        <meshStandardMaterial color="#d1554a" />
      </mesh>
      <mesh position={[0.55, 1.05, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.45]} />
        <meshStandardMaterial color="#15171b" />
      </mesh>
      <mesh ref={rightHandRef} position={[0.55, 0.78, 0]}>
        <boxGeometry args={[0.22, 0.18, 0.18]} />
        <meshStandardMaterial color="#d1554a" />
      </mesh>

      {/* Purposeful idle activity (US-010): a small repair console in front
          of Zavit. Hands reach toward it, the panel screen cycles, and a
          status light blinks while idle; all stop when Zavit notices/greets
          the visitor. Primitives only (ADR-003). */}
      <group name="zavit-console" position={[0, 0.55, 0.55]}>
        <mesh>
          <boxGeometry args={[0.5, 0.35, 0.12]} />
          <meshStandardMaterial color="#2a2e35" />
        </mesh>
        <mesh ref={panelRef} name="zavit-panel" position={[0, 0.02, 0.07]}>
          <boxGeometry args={[0.4, 0.24, 0.02]} />
          <meshStandardMaterial color="#4caf7d" emissive="#4caf7d" emissiveIntensity={0.35} />
        </mesh>
        <mesh ref={statusRef} position={[0.2, 0.1, 0.07]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#c9a24b" emissive="#c9a24b" emissiveIntensity={0.05} />
        </mesh>
      </group>
    </group>
  )
}
