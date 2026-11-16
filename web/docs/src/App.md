# `src/App.tsx`

## Purpose

The page: header with theme picker, the three-column layout (body profile and
roster / 3D stage / muscle detail), and all cross-panel state.

## Public API

`export default function App()` (no props).

Local components (not exported): `ThemePicker`, `StageToolbar` (Explore/Pose
mode, pose presets, Look picker), `StageMessage`. Local validators for stored
values: `isProfile`, `isStyle`, `isUnits`, `isBoolean`.

## How it works

State it owns:

| State | Kind | Notes |
|---|---|---|
| `view` (`front`/`back`) | `useState` | Changed by the Front/Back control, by the camera (`onViewChange`) and by `select` |
| `selectedId` | `useState`, default `'chest'` | |
| `hoveredId` | `useState` | Cleared on every view change: a hovered muscle can vanish behind the figure without a `pointerleave` |
| `use3D` | `useState(supportsWebGL)` | Decided once on mount ([webgl](features/body-3d/webgl.md)) |
| `profile` | [`useStoredState`](hooks/useStoredState.md) key `profile` | Stored as `Partial<BodyProfile>`, always passed through `clampProfile` so older saves without `bodyFatPct` still work |
| `units`, `showFat`, `style`, `theme` | `useStoredState` keys `units`, `showFat`, `style`, `theme` | Defaults `metric`, `true`, `hologram`, `iron` |
| `mode` | `useState<'explore' \| 'pose'>` | |
| `pose` | `useState<{preset, pose}>` | A new object on every preset click so re-picking a preset re-applies it; `onPoseEdited` marks it `custom` |

Derived: `shape = bodyShape(profile)` (memoised on the four numbers),
`byId`/`names` maps from the muscle list, `theme = THEMES[themeId]`, and a
`motivation` line fixed for the session (`motivationFor(new Date())`).

`select(id)` (roster and 2D map) also turns the figure with
`viewForMuscle(muscle.views, view)` when the muscle is not visible from the
current side. Clicks on the 3D model call `setSelectedId` directly, since a
clicked muscle is already visible.

An effect writes `document.documentElement.dataset.theme`, which switches the
CSS palette in [index.css](index.css.md); the same `theme` object is passed to
the 3D scene.

Layout: on `lg` a 3-column grid (`250px | stage | 360-420px`); below `lg` the
order is stage, detail, then profile and roster. `detailRef` wraps the
`MuscleDetail` column and is the leader line's target.

The 3D viewer is `lazy(() => import('./features/body-3d/BodyViewer'))` inside
`Suspense`, so three.js loads in a separate chunk. Without WebGL the 2D
[BodyMap](features/body-map/BodyMap.md) renders instead, and the profile panel
and stage toolbar are hidden (they only affect the 3D figure).

On API error (`useMuscles().isError`) the main grid is replaced with a "Can't
reach the OneFit API" panel. The footer credits BodyParts3D (CC BY 4.0).

## Depends on

[queries](api/queries.md), [ui](components/ui.md),
[camera](features/body-3d/camera.md), [posePresets](features/body-3d/posePresets.md),
[profile](features/body-3d/profile.md), [styles](features/body-3d/styles.md),
[webgl](features/body-3d/webgl.md), [BodyViewer](features/body-3d/BodyViewer.md) (lazy),
[BodyMap](features/body-map/BodyMap.md), [MuscleDetail](features/muscle-detail/MuscleDetail.md),
[BodyProfilePanel](features/profile/BodyProfilePanel.md), [MuscleRoster](features/roster/MuscleRoster.md),
[useStoredState](hooks/useStoredState.md), [themes](theme/themes.md).

## Used by

[main.tsx](main.md).

## Tests

[App.test](App.test.md) (2D path only: jsdom has no WebGL).

## Gotchas / TODO

- The 3D branch (`BodyViewer`, `BodyProfilePanel` inside App, `StageToolbar`)
  is never rendered in tests.
- 332 lines, above the ~300-line guideline in `CLAUDE.md`; `ThemePicker` and
  `StageToolbar` are candidates to move into their own files.
- `STYLE_SWATCH` hard-codes swatch colours that duplicate palette values in
  [bodyMaterials](features/body-3d/bodyMaterials.md).
