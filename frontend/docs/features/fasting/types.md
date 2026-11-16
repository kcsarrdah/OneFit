# `features/fasting/types.ts`

## Purpose

Fasting types.

## Public API

`CompletedFastData { startTime: number; endTime: number; actualDurationSeconds: number; goalDurationSeconds: number }`:
a fast that has just been stopped, awaiting save or discard. Times are epoch
milliseconds.

## How it works

Matches the body of the backend's `POST /api/fasts/` (plus `notes`), see
`backend/docs/API.md`.

## Depends on

nothing.

## Used by

[useFastingTimer](hooks/useFastingTimer.md), [useFastCompletion](hooks/useFastCompletion.md),
[FastComplete](components/FastComplete.md).

## Tests

Type-checked.

## Gotchas / TODO

none.
