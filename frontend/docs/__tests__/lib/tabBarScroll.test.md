# `__tests__/lib/tabBarScroll.test.ts`

## Purpose

Unit tests for [tabBarScroll](../../lib/tabBarScroll.md).

## Public API

`centeredScrollX`: centres a middle tab; never scrolls before the start
(first tab) or past the end (last tab); stays at 0 when all tabs fit.

Not covered: the tab bar component, layout measurement, the scroll animation.

## How it works

Plain numbers for a 310 pt bar of seven 73 pt tabs.

## Depends on

[tabBarScroll](../../lib/tabBarScroll.md).

## Used by

`npx jest`.

## Tests

itself.

## Gotchas / TODO

none.
