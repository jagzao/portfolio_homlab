/**
 * Shared landmark data for the M3 graybox journey (US-010 Confirmed Journey).
 * Consumed by both the 3D world (camera waypoints, keyboard jump targets)
 * and the semantic/no-WebGL equivalent nav list — one source of truth so
 * the two presentations can never silently diverge.
 *
 * Unlike ground-click and keyboard nudge, jumping straight to a landmark
 * (Guided Mode advance, or the LandmarkHud list) does not run an
 * isSegmentBlocked check against JOURNEY_OBSTACLES - these positions are
 * curated, not user-picked, so obstacle placement (see CAMPUS_OBSTACLES in
 * navigation.ts) must keep every consecutive-landmark straight line clear
 * instead. Verified clear as of the current obstacle layout; re-check this
 * if either list changes.
 */
export interface Landmark {
  id: string
  label: string
  description: string
  /** World position [x, y, z] the camera moves to when this landmark is selected. */
  position: [number, number, number]
}

export const LANDMARKS: Landmark[] = [
  {
    id: 'forest-approach',
    label: 'Forest Approach',
    description: 'The path into HomeLab, through the forest.',
    position: [0, 1.7, 4],
  },
  {
    id: 'exterior',
    label: 'HomeLab Exterior',
    description: "HomeLab's glass-pavilion silhouette comes into view.",
    position: [0, 1.7, -8],
  },
  {
    id: 'portal',
    label: 'Energy Portal',
    description: 'The one entrance into HomeLab.',
    // Short of the arch at z=-22 (see WorldScene) so it's framed ahead, not straddling the camera.
    position: [0, 1.7, -18],
  },
  {
    id: 'atrium',
    label: 'Central Atrium',
    description: 'The glass atrium, water, and central tree — where Zavit greets visitors and offers a guided tour or free exploration.',
    // z=-32: close enough that the water plane (18x18 centered at z=-38,
    // near edge z=-29) actually falls inside the camera's forward view -
    // the camera looks dead level (see PlayerCamera's lookAt), so ground
    // right at the visitor's feet sits below the frame; anything closer
    // than this left the water plane entirely in that dead zone. Clear of
    // the tree (now offset to x=-3, see CAMPUS_OBSTACLES) either way.
    position: [0, 1.7, -32],
  },
  {
    id: 'bridge',
    label: 'Bridge',
    description: 'The bridge over water to the Software Engineering Lab.',
    position: [0, 1.7, -52],
  },
  {
    id: 'software-lab',
    label: 'Software Engineering Lab',
    description: "Juan's flagship professional area.",
    // Stops short of the entry-marker wall at z=-66 (see WorldScene) for an
    // arrival view, instead of landing inside the thin box's geometry.
    position: [0, 1.7, -62],
  },
]
