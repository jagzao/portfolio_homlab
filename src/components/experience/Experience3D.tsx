import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

interface GrayboxMarkerProps {
  reducedMotion: boolean
}

/**
 * Minimal graybox primitive proving the 3D entry boundary end to end.
 * Per ADR-003 this is the only 3D content M2 ships — procedural geometry,
 * zero external assets. The real journey (forest/portal/atrium/...) is M3.
 */
function GrayboxMarker({ reducedMotion }: GrayboxMarkerProps) {
  const ref = useRef<Mesh>(null!)
  useFrame(() => {
    if (reducedMotion) return
    ref.current.rotation.y += 0.005
  })
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#c9a24b" />
    </mesh>
  )
}

interface Experience3DProps {
  reducedMotion: boolean
}

export default function Experience3D({ reducedMotion }: Experience3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4] }}
      style={{ height: '60vh', minHeight: '20rem' }}
      aria-label="HomeLab graybox preview"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 4]} intensity={0.8} />
      <GrayboxMarker reducedMotion={reducedMotion} />
    </Canvas>
  )
}
