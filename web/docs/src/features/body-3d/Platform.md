# `src/features/body-3d/Platform.tsx`

## Purpose

The character-select style pedestal the figure stands on.

## Public API

`Platform({ accent }: { accent: string })`: an R3F `<group>`.

## How it works

- A dark metallic cylinder (radius 0.62-0.66 m, 8 cm tall) whose top is at
  y = 0, where the build script puts the feet.
- A glowing rim ring in `accent` (`toneMapped={false}` so bloom picks it up).
- Two partial inner rings that rotate at 0.25 rad/s in `useFrame` (the group is
  laid flat, so its local Z is world up).
- A faint additive light pool (6% opacity).

## Depends on

`@react-three/fiber`, three.

## Used by

[BodyViewer](BodyViewer.md) (`<Platform accent={theme.accent} />`).

## Tests

none.

## Gotchas / TODO

- The pedestal colour `#0f1628` is fixed (a blue-black) and does not follow the
  theme's `sceneBg`.
