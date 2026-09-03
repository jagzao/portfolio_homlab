import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { stepToward, type Point2D } from './navigation'

const EYE_HEIGHT = 1.7
const MOVE_SPEED = 14 // world units per second — crosses the ~70-unit corridor in ~5s

interface PlayerCameraProps {
  target: Point2D
  reducedMotion: boolean
  onPositionChange: (point: Point2D) => void
}

/**
 * Moves the camera toward `target` each frame and always faces forward
 * (toward -Z, deeper into the campus) — a fixed look direction avoids
 * disorienting yaw during automated movement. Full free-look is a fidelity
 * concern (M7), not required to validate graybox scale/comfort (M3).
 */
export function PlayerCamera({ target, reducedMotion, onPositionChange }: PlayerCameraProps) {
  const { camera } = useThree()
  const current = useRef<Point2D>({ x: camera.position.x, z: camera.position.z })

  useFrame((_, delta) => {
    const maxStep = reducedMotion ? Infinity : MOVE_SPEED * delta
    const next = stepToward(current.current, target, maxStep, reducedMotion)
    current.current = next
    camera.position.set(next.x, EYE_HEIGHT, next.z)
    camera.lookAt(next.x, EYE_HEIGHT, next.z - 1)
    onPositionChange(next)
  })

  return null
}
