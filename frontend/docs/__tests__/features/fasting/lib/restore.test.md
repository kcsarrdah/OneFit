# `__tests__/features/fasting/lib/restore.test.ts`

## Purpose

Unit tests for [restore](../../../../features/fasting/lib/restore.md). 4 tests.

## Public API

| Test | Covers |
|---|---|
| resumes a fast still short of its goal | 1 h into a 16 h fast: `resume` with 3600 s elapsed |
| completes a fast that reached its goal while the app was closed | 5 h past the goal: `complete`, end = start + goal, duration = goal |
| completes exactly at the goal | `elapsed === goal` completes |
| ignores nothing stored and a fast started under another goal | `none` for both |

## How it works

Pure function, fixed timestamps, no mocks.

## Depends on

`@/features/fasting/lib/restore`.

## Used by

`npx jest`.

## Tests

This is a test file.

## Gotchas / TODO

The hook wiring (removing the key, calling `onComplete`) is covered in
[useFastingTimer.test](../hooks/useFastingTimer.test.md).
