import type { BodyView } from '../../api/anatomy'

/** Figure height in metres (see scripts/build-body-model.mjs). */
export const BODY_HEIGHT = 1.71
/** Look-at height for the full figure on its pedestal. */
export const BODY_CENTER_Y = BODY_HEIGHT * 0.47

/** The figure faces +Z, so azimuth 0 looks at the front. */
export const VIEW_AZIMUTH: Record<BodyView, number> = { front: 0, back: Math.PI }

export const DISTANCE = { overview: 3.9, min: 1.1, max: 6 } as const

/** Wraps an azimuth to (-π, π]. */
export function normalizeAzimuth(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a))
}

/** Which side of the figure the camera is looking at. */
export function viewForAzimuth(azimuth: number): BodyView {
  return Math.abs(normalizeAzimuth(azimuth)) <= Math.PI / 2 ? 'front' : 'back'
}

/**
 * Azimuth to turn to for `target`, taking the shortest way round from
 * `current` so the camera never spins the long way.
 */
export function shortestAzimuth(current: number, target: number): number {
  return current + normalizeAzimuth(target - current)
}

/**
 * Picks which side to show for a muscle: stay on the current side if the
 * muscle is visible there, otherwise turn to a side where it is.
 */
export function viewForMuscle(views: BodyView[], current: BodyView): BodyView {
  if (views.length === 0 || views.includes(current)) return current
  return views[0]
}

/** Camera look-at height when focusing a muscle at height `y`. */
export function focusTargetY(y: number): number {
  const lo = 0.5
  const hi = BODY_HEIGHT - 0.4
  return Math.min(hi, Math.max(lo, BODY_CENTER_Y + (y - BODY_CENTER_Y) * 0.12))
}
