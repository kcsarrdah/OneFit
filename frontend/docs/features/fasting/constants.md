# `features/fasting/constants.ts`

## Purpose

Fasting schedules (16:8 and friends) and the physiological milestones along a
fast.

## Public API

- `FastingSchedule { id, name, durationHours (0 = custom), iconName, description }`
  and `FASTING_SCHEDULES`: 16:8, 18:6, 20:4, Custom.
- `FastingMilestone { id, timeHours, name, iconName, description }` and
  `FASTING_MILESTONES` at 4, 8, 12, 18, 24, 48 and 72 h (blood sugar drops,
  glycogen depletion, ketosis, fat burning, autophagy, growth hormone,
  immune reset).

## How it works

Static data.

## Depends on

nothing.

## Used by

[FastingScreen](screens/FastingScreen.md) (`FASTING_SCHEDULES[0]` only).
`FASTING_MILESTONES` is not shown anywhere yet.

## Tests

none.

## Gotchas / TODO

- `FASTING_MILESTONES` is never passed to the ring, so no milestones show.
- Schedule `iconName`s (`clock.3`, `clock.6`, `clock.9`, `pencil`) are not in
  the [IconSymbol](../../components/ui/IconSymbol.md) map; Android/web would
  draw nothing if they were rendered.
- The milestone descriptions are health claims shown to users; have them
  reviewed before they ship.
