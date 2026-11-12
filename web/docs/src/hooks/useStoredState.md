# `src/hooks/useStoredState.ts`

## Purpose

`useState` that persists its value in `localStorage` for this browser. All
viewer preferences (profile, units, fat layer toggle, look, theme) use it.

## Public API

```ts
useStoredState<T>(key: string, fallback: T, validate: (v: unknown) => v is T)
  : readonly [T, (next: T | ((prev: T) => T)) => void]
```

- Storage key is `onefit:<key>`; values are JSON.
- `validate` is a type guard; anything that fails it (or fails to parse) yields
  `fallback`.

## How it works

- Initial state is read once, lazily, in `useState(() => read(...))`.
- The setter computes the next value inside the functional `setValue` updater
  and writes it to `localStorage` there, then returns it.
- Every storage access is in `try/catch`: if storage is missing, blocked or
  full, the value lives in memory only.

Keys in use (see [App](../App.md)): `profile`, `units`, `showFat`, `style`, `theme`.

## Depends on

React, `localStorage`.

## Used by

[App](../App.md).

## Tests

[useStoredState.test](useStoredState.test.md).

## Gotchas / TODO

- Changing `key` on an existing component does not re-read storage; the hook
  keeps the old value.
- No cross-tab sync (no `storage` event listener).
- The write happens inside a state updater; React may call updaters twice in
  StrictMode. It is idempotent, so harmless, but it is a side effect in an
  updater.
- Validators are only as strict as the caller makes them. For example
  `isThemeId` in [themes](../theme/themes.md) accepts inherited keys such as
  `"toString"`.
