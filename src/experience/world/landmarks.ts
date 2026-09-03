/**
 * Shared landmark data for the M3 graybox journey (US-010 Confirmed Journey).
 * Consumed by both the 3D world (camera waypoints, keyboard jump targets)
 * and the semantic/no-WebGL equivalent nav list — one source of truth so
 * the two presentations can never silently diverge.
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
    // 8 units from the tree at z=-38 (canopy radius 2, see WorldScene) so
    // the canopy doesn't fill the whole FOV at close range.
    position: [0, 1.7, -30],
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
