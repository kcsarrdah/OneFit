# `lib/tabBarScroll.ts`

## Purpose

Pure scroll maths for the bottom tab bar: where to scroll so a tab sits in the
middle of the bar.

## Public API

`centeredScrollX(tab: { x: number; width: number }, viewportWidth: number, contentWidth: number): number`:
the x offset that centres `tab`, clamped to `0..(contentWidth - viewportWidth)`
(0 when everything fits).

## How it works

`tab.x + tab.width / 2 - viewportWidth / 2`, clamped.

## Depends on

nothing.

## Used by

[ScrollableTabBar](../components/ui/ScrollableTabBar.md).

## Tests

[tabBarScroll.test](../__tests__/lib/tabBarScroll.test.md).

## Gotchas / TODO

none.
