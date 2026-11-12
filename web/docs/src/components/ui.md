# `src/components/ui.tsx`

## Purpose

The web app's small shared UI library.

## Public API

| Export | Props | Renders |
|---|---|---|
| `Panel` | `children`, `className?` | `<section>`: rounded, bordered, translucent `ink-900` with backdrop blur ("glass" panel) |
| `Badge` | `children`, `tone?: 'neutral' \| 'accent' \| 'warm'` (default neutral) | Small uppercase pill |
| `SegmentedControl<T extends string>` | `label`, `value: T`, `options: {value: T, label}[]`, `onChange(value: T)` | `role="radiogroup"` with `role="radio"` buttons (`aria-checked`); the active one is filled with the accent |

## How it works

Pure presentational components styled with theme tokens from
[index.css](../index.css.md), so they follow the active theme.

## Depends on

React types only.

## Used by

[App](../App.md), [MuscleDetail](../features/muscle-detail/MuscleDetail.md),
[MuscleRoster](../features/roster/MuscleRoster.md),
[BodyProfilePanel](../features/profile/BodyProfilePanel.md).

## Tests

Indirectly through [App.test](../App.test.md) (radios found by role and name).

## Gotchas / TODO

- `SegmentedControl` has no arrow-key navigation (WAI-ARIA radio groups expect
  it); every option is a separate tab stop.
- [App](../App.md) (`ThemePicker`, Look picker) and
  [BodyProfilePanel](../features/profile/BodyProfilePanel.md) (units, fat
  switch) hand-roll similar radio groups; they could reuse or extend this.
