import { centeredScrollX } from '@/lib/tabBarScroll';

describe('centeredScrollX', () => {
  const viewport = 310;
  const content = 7 * 73 + 8; // seven tabs plus padding

  it('centres a tab in the middle of the strip', () => {
    // Water: x 150, width 73 -> centre 186.5 -> 186.5 - 155
    expect(centeredScrollX({ x: 150, width: 73 }, viewport, content)).toBeCloseTo(31.5);
  });

  it('never scrolls before the start', () => {
    expect(centeredScrollX({ x: 4, width: 73 }, viewport, content)).toBe(0);
  });

  it('never scrolls past the end', () => {
    // Workouts, the last tab, stops at content - viewport.
    expect(centeredScrollX({ x: 442, width: 73 }, viewport, content)).toBe(content - viewport);
  });

  it('stays at 0 when everything fits', () => {
    expect(centeredScrollX({ x: 200, width: 73 }, 400, 300)).toBe(0);
  });
});
