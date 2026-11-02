import { describe, expect, it } from 'vitest'
import { leaderPoints, toSvgPoints } from './leader'

const panelRight = { left: 800, top: 100, width: 400, height: 600 }

describe('leaderPoints', () => {
  it('runs from the anchor to the near edge of a panel on the right', () => {
    const pts = leaderPoints({ x: 400, y: 200 }, panelRight)!
    expect(pts[0]).toEqual({ x: 400, y: 200 })
    expect(pts.at(-1)!.x).toBe(800)
    // the final run into the panel is horizontal
    expect(pts.at(-1)!.y).toBe(pts.at(-2)!.y)
  })

  it('enters the panel near its header even when the anchor is low', () => {
    const pts = leaderPoints({ x: 400, y: 650 }, panelRight)!
    expect(pts.at(-1)!.y).toBeLessThanOrEqual(panelRight.top + 160)
    expect(pts.at(-1)!.y).toBeGreaterThanOrEqual(panelRight.top)
  })

  it('works with a panel on the left', () => {
    const pts = leaderPoints({ x: 600, y: 300 }, { left: 0, top: 0, width: 300, height: 800 })!
    expect(pts.at(-1)!.x).toBe(300)
  })

  it('returns null when the panel is stacked below the anchor (mobile layout)', () => {
    expect(leaderPoints({ x: 200, y: 300 }, { left: 0, top: 600, width: 400, height: 500 })).toBeNull()
  })

  it('returns null when the anchor is too close to the panel to draw an elbow', () => {
    expect(leaderPoints({ x: 790, y: 300 }, panelRight)).toBeNull()
  })
})

describe('toSvgPoints', () => {
  it('formats points for an SVG polyline', () => {
    expect(toSvgPoints([{ x: 1, y: 2.345 }, { x: 3, y: 4 }])).toBe('1.0,2.3 3.0,4.0')
  })
})
