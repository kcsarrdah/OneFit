# `src/features/body-3d/BodyModel.tsx`

## Purpose

The figure itself, inside the R3F canvas: loads the GLB, assigns materials,
adds the fat layer, animates shape, pose, colours and the intro reveal every
frame, and handles hover, click-to-select and drag-to-pose.

## Public API

`BodyModel(props)` and `type ViewerMode = 'explore' | 'pose'`.

| Prop | Type | Meaning |
|---|---|---|
| `selectedId`, `hoveredId` | `string \| null` | Drive colours, sweep, rim |
| `view` | `BodyView` | Side used to pick an auto-anchor |
| `style` | `BodyStyle` | Look; materials are rebuilt when it changes |
| `shape` | `BodyShape` | From [profile](profile.md) `bodyShape` |
| `mode` | `ViewerMode` | `pose` shows joint handles and enables dragging |
| `showFat` | `boolean` | Fades the fat layer in/out |
| `pose` | `Pose` | Target pose; a new object re-applies it |
| `onSelect` | `(id, anchor: SurfaceAnchor) => void` | Muscle clicked |
| `onHover` | `(id \| null) => void` | |
| `onAutoAnchor` | `(anchor) => void` | Selection changed without a click (roster, initial) |
| `onPoseEdited` | `() => void` | User finished dragging a limb |
| `accent`, `accentDeep` | hex | Theme colours |
| `onReady` | `() => void` | First rendered frame |
| `anchorRef` | `RefObject<SurfaceAnchor \| null>` | Current leader anchor (owned by [BodyViewer](BodyViewer.md)) |
| `controls` | `RefObject<CameraControls \| null>` | Disabled while dragging a limb |

Module side effect: `useGLTF.preload(MODEL_URL, false, true)` (no Draco, with
meshopt decoder) starts the download as soon as the 3D chunk loads.

## How it works

**Classifying the scene (`figure` memo).** Traverses the loaded scene once:
`joint-*` `Bone`s go into `joints`; every `SkinnedMesh` gets
`frustumCulled = false` (bounds are rest-pose, posed limbs must not be culled)
and `userData.node = parseNodeName(name)` ([modelNodes](modelNodes.md)). Fat
meshes get a no-op `raycast` (clicks pass through to muscles) and their
`extras` (`weightedArea`, `visceralArea`, `weightMax`) are summed into
`fatAreas`. Everything else is pickable and sorted into `bones`, `context`,
`head` and `muscles` (by id, both sides). The rest-pose left ankle height is
stored for foot planting.

**Effects.**

- Materials: per look, from [bodyMaterials](bodyMaterials.md); disposed on change.
- Fat layer: one `color` material on each fat mesh (render order 21) plus a
  `SkinnedMesh` twin sharing geometry and skeleton with the `depth` material
  (render order 20). Twins are added in an effect so StrictMode cannot leave
  duplicates.
- `PosedPicker` over all pickable meshes ([picking](picking.md)).
- Joint handles: small accent spheres (`depthTest: false`) parented to each
  posable joint, visible only in pose mode.
- On selection change: start the light sweep over the muscle's posed bounding
  box; and, unless the current anchor already belongs to that muscle, find an
  auto-anchor (`findAnchor`) and report it.

**Every frame (`useFrame`).** `k = 1 - exp(-10·dt)` eases most values.

1. Intro reveal: `uReveal` rises over 1.9 s (cubic ease) from below the feet to
   above the head (`scaleY × 1.75 + 0.1`), then is set to 99.
2. Shape: the group's scale eases to `scaleXZ`/`scaleY`; `uInflate` to
   `shape.inflate`; `uDesat` to `shape.desaturate` (only for looks with
   `desaturates`).
3. Fat: `uFatScale = subcutaneousL/1000 × weightMax / (weightedArea × sy × sxz²)`
   and `uVisc = visceralL/1000 × 0.3 / (visceralArea × sy × sxz²)`. Since
   `weightedArea = Σ area × weight`, the surface integral of the thickness
   equals the subcutaneous volume, corrected for the figure's scale. Only 30%
   (`VISCERAL_BULGE`) of the visceral volume shows as belly bulge.
   `uFatOpacity` eases to `showFat`; meshes are hidden below 0.01.
4. Pose (not while dragging): each joint slerps toward its target
   (`1 - exp(-7·dt)`); the spine target is multiplied by the age stoop
   (`shape.spineBend` about X).
5. Foot planting: moves the `root` joint so the lower ankle stays at its rest
   height (immediately while dragging, eased otherwise).
6. Picking refresh: once nothing has moved for 0.12 s, `picker.update()`.
7. Colours: each muscle lerps to selected / hovered / dim (another muscle is
   selected) / base colour; the selected one pulses its emissive; hover adds a
   rim; the sweep band runs bottom to top over 0.75 s.
8. Calls `onReady` once.

**Pointer handling** (on the `<primitive>`):

- Move: in explore mode, hover the muscle under the pointer (cursor `pointer`);
  in pose mode, show `grab` over draggable parts and clear hover.
- Click (explore): select if the pointer moved ≤ 5 px since pointer-down
  (`CLICK_SLOP`), creating a `SurfaceAnchor` from the hit.
- Pointer-down (pose) → `startDrag`: the dominant skin joint of the hit vertex
  (`dominantJoint`, highest of 4 weights) maps via `dragJointFor` to a joint.
  Camera controls are disabled. On each `pointermove` (window), the pointer is
  projected onto a camera-facing plane through the joint; the swing from the
  previous point to the new one (about the joint) is applied to the bone in
  world space, converted to the parent's frame, clamped
  (`clampJointQuaternion`) and stored as the new target. `pointerup` restores
  controls and calls `onPoseEdited`.

`findAnchor` casts a ray toward the posed bounding-box centre of the muscle
from the viewing side, preferring the side nearer the info panel (body's left
from the front, its right from the back).

## Depends on

`@react-three/drei` (`useGLTF`), `@react-three/fiber`, three,
[bodyMaterials](bodyMaterials.md), [camera](camera.md), [modelNodes](modelNodes.md),
[picking](picking.md), [pose](pose.md), [profile](profile.md) (type).

## Used by

[BodyViewer](BodyViewer.md).

## Tests

none directly (needs WebGL). Its inputs are covered by
[modelNodes.test](modelNodes.test.md), [pose.test](pose.test.md),
[profile.test](profile.test.md).

## Gotchas / TODO

- 536 lines, well above the ~300-line guideline; the drag logic, fat layer and
  per-frame animation are natural splits.
- The materials effect depends on `accent`, so a theme change rebuilds every
  muscle material: colours restart from the base palette and fade back, and the
  selected muscle briefly loses its highlight.
- `fatAreas.weightMax` takes the last fat mesh's value instead of a max; it is
  `4` on every node today.
- `joints.get('ankle-l')!` and `ankle-r` are non-null asserted: a model without
  those joints throws during render.
- If the component unmounts mid-drag, the window `pointermove`/`pointerup`
  listeners stay until the next pointer-up, and the body cursor may stay
  `grabbing`.
- `document.body.style.cursor` is written directly from pointer handlers.
