import { useMemo } from 'react'

const STAR_COUNT = 200

/** Restrained night stars (MASTER_BACKLOG M7: "restrained night stars/deep-sky state") — a few points, not a dense particle field. */
export function Stars() {
  // Randomized once via useMemo's empty deps (mount-stable layout, not
  // recomputed per render) — the lint rule can't see through that.
  const positions = useMemo(() => {
    const array = new Float32Array(STAR_COUNT * 3)
    for (let i = 0; i < STAR_COUNT; i++) {
      // eslint-disable-next-line react-hooks/purity
      const radius = 60 + Math.random() * 20
      // eslint-disable-next-line react-hooks/purity
      const theta = Math.random() * Math.PI * 2
      // eslint-disable-next-line react-hooks/purity
      const phi = Math.random() * (Math.PI / 2.2) // upper hemisphere only
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      array[i * 3 + 1] = 15 + radius * Math.cos(phi)
      array[i * 3 + 2] = -32 + radius * Math.sin(phi) * Math.sin(theta)
    }
    return array
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#e8e6df" size={0.4} sizeAttenuation transparent opacity={0.8} />
    </points>
  )
}
