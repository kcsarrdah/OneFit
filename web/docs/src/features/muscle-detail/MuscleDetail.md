# `src/features/muscle-detail/MuscleDetail.tsx`

## Purpose

The info panel for the selected muscle: overview, strength exercises and
stretches, each with a tutorial link. It is also the leader line's target.

## Public API

`MuscleDetail({ muscleId: string | null })`.

Internal components: `MuscleDetailContent`, `Overview`, `Stat`,
`StrengthList`, `FlexibilityList`, `ExerciseCard`, `DifficultyMeter`, `PlayIcon`.

## How it works

`useMuscle(muscleId)` loads the full `Muscle`. States, in order:

1. `muscleId === null`: "Select a muscle" prompt.
2. Error: message and a "Try again" button (`refetch()`).
3. Pending: pulse skeleton (`aria-busy`).
4. Loaded: `<MuscleDetailContent key={muscle.id}>`. The `key` resets the tab
   and equipment filter whenever the selection changes; the `.panel-enter`
   class animates the swap.

Content: header with region and view `Badge`s, name (`<h2>`), scientific names,
summary, and a `SegmentedControl` for Overview / Strength / Flexibility.

- Overview: "What it does" (`functions`), "Coach's notes" (`tips`), counts of
  strength and flexibility moves.
- Strength: equipment filter chips (`all` + sorted unique `equipment`,
  `aria-pressed`, group labelled "Filter by equipment"), then cards with
  equipment badge, difficulty meter (1-3 bars), `prescription`, numbered cues.
- Flexibility: cards with a type badge (static = accent, dynamic = warm,
  mobility = neutral) and `duration`.
- `ExerciseCard` shows "Watch tutorial" when `videoUrl` is set: `target="_blank"`,
  `rel="noopener noreferrer"`, `aria-label="Watch tutorial for <name> (opens YouTube in a new tab)"`.

## Depends on

[queries](../../api/queries.md), [ui](../../components/ui.md), [anatomy types](../../api/anatomy.md),
`.section-title` / `.panel-enter` from [index.css](../../index.css.md).

## Used by

[App](../../App.md) (inside the `detailRef` column).

## Tests

[App.test](../../App.test.md): default muscle, tabs, equipment filter, tutorial
links. The error state and "Try again" are not tested.

## Gotchas / TODO

- List keys are exercise names / cue text; duplicate names in the content would
  collide.
- Switching tabs unmounts `StrengthList`, so the equipment filter resets when
  you return to Strength.
- The play icon's red (`#ff3d3d`) is hard-coded.
