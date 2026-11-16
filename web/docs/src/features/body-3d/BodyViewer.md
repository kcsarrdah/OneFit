# `src/features/body-3d/BodyViewer.tsx`

## Purpose

The 3D stage: canvas, camera controls and framing, lighting, post-processing,
the leader line to the info panel, the loading overlay, and idle camera sway.
It is the root of the lazily loaded 3D chunk.

## Public API

`export default function BodyViewer(props: BodyViewerProps)` (default export
for `React.lazy`).

| Prop | Type | Meaning |
|---|---|---|
| `muscles` | `MuscleSummary[]` | Used to find a muscle's `views` when re-aiming |
| `selectedId`, `hoveredId` | `string \| null` | |
| `view` | `BodyView` | Requested side; the camera turns to it |
| `onSelect` | `(id) => void` | Muscle clicked on the model (the camera stays on the chosen side) |
| `onHover` | `(id \| null) => void` | |
| `onViewChange` | `(view) => void` | The user orbited past the side boundary |
| `leaderTargetRef` | `RefObject<HTMLElement \| null>` | Element the leader line runs to (the detail column) |
| `style`, `shape`, `showFat`, `mode`, `pose`, `onPoseEdited` | | Passed to [BodyModel](BodyModel.md) |
| `theme` | `Theme` | Background, fog, accent colours ([themes](../../theme/themes.md)) |

## How it works

**Canvas.** `frameloop` is `'never'` while the stage is off screen
(`useOnScreen`, an `IntersectionObserver`). DPR `[1, 1.5]`, camera fov 32 at
`(0, BODY_CENTER_Y, 3.9)`. drei's `PerformanceMonitor` switches quality to
`low` on decline: post-processing (Bloom, Vignette) is removed and DPR drops
to 1. It never switches back.

**Scene.** Background and fog (6-11 m) in `theme.sceneBg`; `CameraControls`
(distance 1.1-6, polar 0.35 to π/2 + 0.12, smooth time 0.35 s); an
`Environment` built from three `Lightformer`s (rendered once); `CameraRig`, a
group of one ambient and five directional lights that rotates with the camera
azimuth so the visible side always gets a warm key and a cool rim; the
[Platform](Platform.md); `ContactShadows` (baked once).

**Camera behaviour.**

- `InitialFraming`: jump to a far, high position, then glide to the default
  framing.
- When `view` differs from the side the camera shows, rotate the short way to
  `VIEW_AZIMUTH[view]` at a fixed polar angle (π/2 - 0.06).
- `onChange` reports a new side via `onViewChange` when orbiting crosses ±90°
  (`viewForAzimuth`); `lastView` prevents echo loops.
- Height changes: keep the look-at at `BODY_CENTER_Y × scaleY` and dolly back
  to at least `3.9 × scaleY`.
- `focus(y, azimuth?)`: keep zoom and polar angle, move the look-at height
  toward the muscle (`focusTargetY`, in unscaled units), optionally turn.
  Called on click (`handleSelect`, no turn) and on auto-anchor
  (`handleAutoAnchor`, turning to a side where the muscle is visible), except
  for the very first anchor so the intro framing is kept.
- `useIdleSway`: after 6 s with no pointer, wheel, key, camera drag or
  selection, the camera sways ±0.32 rad around where it was, ramping in over
  2.5 s. `lastInteraction` is a module-level timestamp.

**Leader line** (`useLeaderLine` + `LeaderOverlay`). The overlay is an SVG
portalled to `<body>` (fixed, full viewport, `pointer-events: none`), because
the stage panel's `backdrop-filter` would otherwise become the containing block
for `position: fixed`. Each frame, without React re-renders:

1. Read the anchor's world point ([picking](picking.md) `SurfaceAnchor.read`).
2. Every 3rd frame, raycast from the camera to the anchor; if another
   `SkinnedMesh` is hit more than 3 cm before it, the anchor is hidden (behind
   the body or a posed arm).
3. Project to screen pixels; if inside the canvas, compute
   [leaderPoints](leader.md) to the target's bounding rect.
4. Fade the group's opacity toward visible/hidden; draw the polyline on with a
   dash offset (`pathLength=1`, 0.45 s ease-out cubic); move the pulsing
   anchor dot and show the end dot once the line is drawn.

**Loading overlay.** drei `useProgress`: the bar shows 85% of download
progress, then 92% until `BodyModel` reports its first frame (`onReady`).

## Depends on

`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`,
three, `react-dom` (`createPortal`), [BodyModel](BodyModel.md),
[camera](camera.md), [leader](leader.md), [Platform](Platform.md),
[picking](picking.md) (type), [profile](profile.md) (type),
[themes](../../theme/themes.md) (type).

## Used by

[App](../../App.md) via `lazy(() => import('./features/body-3d/BodyViewer'))`.

## Tests

none (jsdom has no WebGL). The pure parts are covered by
[camera.test](camera.test.md) and [leader.test](leader.test.md).

## Gotchas / TODO

- 466 lines, above the ~300-line guideline; `useLeaderLine`/`LeaderOverlay`,
  `useIdleSway` and `CameraRig` could move to their own files.
- `lastInteraction` and the scratch vectors/raycaster are module-level, so two
  viewers on one page would share them.
- The occlusion raycaster sets `firstHitOnly` (a three-mesh-bvh extension);
  meshes without a BVH (the platform, handles) ignore it.
- The leader target rect is read with `getBoundingClientRect()` every frame
  (layout read per frame).
- Quality never steps back up after `PerformanceMonitor` declines.
