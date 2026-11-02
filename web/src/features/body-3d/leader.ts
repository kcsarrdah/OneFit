export interface Point {
  x: number
  y: number
}

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Leader line from a point on the body to the edge of the info panel, in
 * the style of game/atlas callouts: a diagonal run out of the anchor, then a
 * horizontal run into the panel.
 *
 * Returns SVG polyline points, or null when there's no room to draw one.
 */
export function leaderPoints(anchor: Point, panel: Rect, opts: { elbow?: number; inset?: number } = {}) {
  const elbow = opts.elbow ?? 56
  const inset = opts.inset ?? 28

  const panelLeftOfAnchor = panel.left + panel.width < anchor.x
  const edgeX = panelLeftOfAnchor ? panel.left + panel.width : panel.left
  const dir = panelLeftOfAnchor ? -1 : 1

  if ((edgeX - anchor.x) * dir < elbow * 0.5) return null

  // Enter the panel near its top, but follow the anchor vertically so the
  // line stays mostly horizontal.
  const minY = panel.top + inset
  const maxY = Math.max(minY, Math.min(panel.top + panel.height - inset, panel.top + 160))
  const endY = Math.min(maxY, Math.max(minY, anchor.y))

  const dx = Math.min(elbow, Math.abs(edgeX - anchor.x) * 0.5)
  const knee: Point = { x: anchor.x + dir * dx, y: endY }
  return [anchor, knee, { x: edgeX, y: endY }]
}

export function toSvgPoints(points: Point[]): string {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}
