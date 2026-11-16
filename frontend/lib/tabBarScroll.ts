/**
 * @file tabBarScroll.ts
 * @description Pure scroll maths for the bottom tab bar: where to scroll so a
 * tab sits in the middle of the bar, without scrolling past either end.
 */

/**
 * The x offset that centres `tab` in a bar `viewportWidth` wide, clamped to
 * 0..(contentWidth - viewportWidth) so the bar never overscrolls.
 */
export function centeredScrollX(
  tab: { x: number; width: number },
  viewportWidth: number,
  contentWidth: number,
): number {
  const max = Math.max(0, contentWidth - viewportWidth);
  const centred = tab.x + tab.width / 2 - viewportWidth / 2;
  return Math.min(max, Math.max(0, centred));
}
