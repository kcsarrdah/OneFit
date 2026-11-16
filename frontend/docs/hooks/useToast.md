# `hooks/useToast.ts`

## Purpose

A global toast store (port of shadcn's `use-toast`): `toast()` from anywhere,
`useToast()` to subscribe.

## Public API

- `toast({ title?, description?, variant?, duration? })` returns
  `{ id, dismiss(), update(props) }`.
- `useToast()` returns `{ toasts, toast, dismiss(toastId?) }`.

## How it works

Module-level `memoryState` and a reducer (`ADD_TOAST`, `UPDATE_TOAST`,
`DISMISS_TOAST`, `REMOVE_TOAST`); `dispatch` updates it and calls every
subscribed `setState`. `TOAST_LIMIT = 1` keeps only the newest toast.
Dismissing sets `open: false` and queues removal after `TOAST_REMOVE_DELAY`
(1 s). Each toast's `onOpenChange(false)` dismisses it.

## Depends on

React.

## Used by

[useFastCompletion](../features/fasting/hooks/useFastCompletion.md) (`toast`),
[Toaster](../components/ui/Toaster.md) (`toasts`).

## Tests

Mocked in [useFastCompletion.test](../__tests__/features/fasting/hooks/useFastCompletion.test.md);
no tests of its own.

## Gotchas / TODO

- Nothing renders the toasts: [Toaster](../components/ui/Toaster.md) is not
  mounted.
- The subscribe effect depends on `[state]`, so it unsubscribes and
  resubscribes on every change (shadcn's original has the same quirk).
- Lint: `actionTypes` only used as a type; `Array<T>` style; the
  `import { Toast }` is shadowed by the local `type Toast` and is otherwise
  unused (`no-redeclare`).
