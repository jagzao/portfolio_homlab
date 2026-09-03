// Kept close to the path centerline: at x=3 Zavit fell outside the
// horizontal FOV on portrait/mobile viewports (narrower aspect ratio means
// less horizontal FOV than the fixed 60deg vertical), almost entirely
// off-screen. x=1.5 stays visible on both viewports while still reading as
// "beside the tree," and z=-35 keeps clearance from the tree's obstacle
// radius (2.5, centered at z=-38).
/** Zavit stands in the Central Atrium (docs/vision/USER_JOURNEY.md step 4), off to the side of the tree. */
export const ZAVIT_POSITION = { x: 1.5, z: -35 } as const

/** Distance at which Zavit notices the visitor and greets them. */
export const NOTICE_RADIUS = 7
