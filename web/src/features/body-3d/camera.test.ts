import { describe, expect, it } from 'vitest'
import { BODY_HEIGHT, focusTargetY, normalizeAzimuth, shortestAzimuth, viewForAzimuth, viewForMuscle } from './camera'

const PI = Math.PI

describe('normalizeAzimuth', () => {
  it.each([
    [0, 0],
    [2 * PI, 0],
    [3 * PI, PI],
    [-3 * PI / 2, PI / 2],
    [7 * PI / 2, -PI / 2],
  ])('wraps %f to %f', (input, expected) => {
    expect(normalizeAzimuth(input)).toBeCloseTo(expected)
  })
})

describe('viewForAzimuth', () => {
  it('treats the front half-circle as the front view, after any number of turns', () => {
    expect(viewForAzimuth(0)).toBe('front')
    expect(viewForAzimuth(PI / 3)).toBe('front')
    expect(viewForAzimuth(-PI / 3 + 4 * PI)).toBe('front')
    expect(viewForAzimuth(PI)).toBe('back')
    expect(viewForAzimuth(-2 * PI / 3)).toBe('back')
  })
})

describe('shortestAzimuth', () => {
  it('turns the short way round even after several full spins', () => {
    const current = 4 * PI + 0.2 // two full turns plus a bit
    const target = shortestAzimuth(current, PI)
    expect(Math.abs(target - current)).toBeLessThanOrEqual(PI + 1e-9)
    expect(viewForAzimuth(target)).toBe('back')
  })

  it('does not move when already there', () => {
    expect(shortestAzimuth(2 * PI, 0)).toBeCloseTo(2 * PI)
  })
})

describe('viewForMuscle', () => {
  it('stays on the current side when the muscle is visible there', () => {
    expect(viewForMuscle(['front', 'back'], 'back')).toBe('back')
    expect(viewForMuscle(['front'], 'front')).toBe('front')
  })

  it('turns to a side where the muscle is visible', () => {
    expect(viewForMuscle(['back'], 'front')).toBe('back')
  })

  it('keeps the current side when the muscle has no views', () => {
    expect(viewForMuscle([], 'back')).toBe('back')
  })
})

describe('focusTargetY', () => {
  it('moves the look-at point toward the muscle but keeps the figure framed', () => {
    const feet = focusTargetY(0)
    const head = focusTargetY(BODY_HEIGHT)
    expect(feet).toBeGreaterThan(0)
    expect(head).toBeLessThan(BODY_HEIGHT)
    expect(head).toBeGreaterThan(feet)
  })
})
