# `__tests__/features/fasting/hooks/useFastCompletion.test.ts`

## Purpose

Hook tests for [useFastCompletion](../../../../features/fasting/hooks/useFastCompletion.md)
with a mocked `fetch` and a mocked `useToast`. 10 tests in
`describe('useFastCompletion')`.

## Public API

| Test | Covers |
|---|---|
| should initialize with correct default state | Closed, no fast, empty notes, not loading |
| should open modal with fast data | `openModal` |
| should close modal and clear state | `closeModal` |
| should update notes correctly | `setNotes` |
| should save fast successfully | `POST http://localhost:3000/api/fasts` with JSON body including notes; modal closes |
| should handle API error when saving fast | 500: modal stays open with the fast |
| should handle network error when saving fast | Rejected fetch: modal stays open |
| should do nothing if no completed fast | No fetch without a fast |
| should discard fast and close modal | `discardFast` |
| should show loading state while saving | `isLoading` true while the request is pending |

## How it works

`global.fetch = jest.fn()`; `@/hooks/useToast` is mocked to
`{ toast: jest.fn() }`. The two error tests print the hook's
`console.error` output; that noise is expected.

## Depends on

`@testing-library/react-native`, [setup](../../../setup.md).

## Used by

`npx jest`.

## Tests

This is a test file.

## Gotchas / TODO

- The tests pin the URL without a trailing slash and without an
  `Authorization` header, i.e. they lock in the request the real backend
  rejects (see [useFastCompletion](../../../../features/fasting/hooks/useFastCompletion.md)).
  Update them with the fix.
- Toast content is not asserted (the mock `toast` is a new `jest.fn` per
  render), nor is the timeout path.
