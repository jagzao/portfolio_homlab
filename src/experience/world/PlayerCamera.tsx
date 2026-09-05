import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { stepToward, type Point2D } from './navigation'

const EYE_HEIGHT = 1.7
const MOVE_SPEED = 14 // world units per second — crosses the ~70-unit corridor in ~5s

interface PlayerCameraProps {
  target: Point2D
  reducedMotion: boolean
  /** Optional dense spline path to walk instead of a straight line to `target`. */
  path?: Point2D[]
  /**
   * Look direction in radians. In Guided Mode this stays at 0 (fixed -Z,
   * deeper into the campus); in Free Exploration it tracks the visitor's
   * drag-to-look yaw. A zero yaw keeps the historical default behavior.
   */
  yaw: number
  onPositionChange: (point: Point2D) => void
}

/**
 * Moves the camera toward `target` each frame. The camera LOOKS along
 * `yaw` (drag-to-look in Free Exploration) rather than always facing -Z,
 * but its POSITION still advances along the path/stepToward toward the
 * target, so walking and looking are independent. In Guided Mode yaw stays
 * 0 (forward along the corridor), matching the historical fixed look.
 */
// Below this movement per frame, skip the React state update — camera.position
// (Three's own object, mutated directly above) stays exact regardless; this
// only throttles how often the DOM/React side (LandmarkHud) hears about it,
// since driving a ~60Hz useState from useFrame forces a full React re-render
// every frame for a value only the "you are here" HUD indicator needs.
const REPORT_THRESHOLD = 0.5

export function PlayerCamera({ target, reducedMotion, path, yaw, onPositionChange }: PlayerCameraProps) {
  const { camera } = useThree()
  const current = useRef<Point2D>({ x: camera.position.x, z: camera.position.z })
  // eslint-disable-next-line react-hooks/refs -- one-time init value, not a render-time ref read
  const lastReported = useRef<Point2D>(current.current)
  const pathStepRef = useRef(0)
  const lastPathRef = useRef<Point2D[] | undefined>(undefined)
  useFrame((_, delta) => {
    // Reset the walk when a new path (new Guided stop) arrives.
    if (lastPathRef.current !== path) {
      lastPathRef.current = path
      pathStepRef.current = 0
    }

    let next: Point2D
    if (path && path.length > 1) {
      // Follow the dense spline polyline. Reduce motion snaps to the final
      // waypoint (the current stop); otherwise step along the polyline.
      const waypoint = path[path.length - 1]
      if (reducedMotion) {
        next = waypoint
        pathStepRef.current = path.length - 1
      } else {
        pathStepRef.current = Math.min(pathStepRef.current + MOVE_SPEED * delta, path.length - 1)
        next = path[Math.floor(pathStepRef.current)]
      }
    } else {
      const maxStep = reducedMotion ? Infinity : MOVE_SPEED * delta
      next = stepToward(current.current, target, maxStep, reducedMotion)
    }
    current.current = next
    camera.position.set(next.x, EYE_HEIGHT, next.z)

    // Look along yaw. yaw is measured with yaw=0 pointing toward -Z; the
    // camera looks at the position offset by the sine/cosine projection.
    camera.lookAt(next.x + Math.sin(yaw) * 1, EYE_HEIGHT, next.z - Math.cos(yaw) * 1)

    const movedSinceReport = Math.hypot(next.x - lastReported.current.x, next.z - lastReported.current.z)
    const arrived = next.x === target.x && next.z === target.z
    if (movedSinceReport > REPORT_THRESHOLD || arrived) {
      lastReported.current = next
      onPositionChange(next)
    }
  })

  return null
}
