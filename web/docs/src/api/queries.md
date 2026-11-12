# `src/api/queries.ts`

## Purpose

TanStack Query options and hooks for the anatomy content.

## Public API

- `musclesQuery`: `queryOptions` with key `['anatomy', 'muscles']`.
- `muscleQuery(id)`: key `['anatomy', 'muscles', id]`.
- `useMuscles()`: `useQuery(musclesQuery)`.
- `useMuscle(id: string | null)`: disabled while `id === null`.

## How it works

Both queries use `staleTime: Infinity, gcTime: Infinity`: the content is static
reference data, so each muscle is fetched once per session. The query
function's `AbortSignal` is passed through to `fetch`.

## Depends on

[anatomy.ts](anatomy.md), `@tanstack/react-query`.

## Used by

[App](../App.md) (`useMuscles`), [MuscleDetail](../features/muscle-detail/MuscleDetail.md) (`useMuscle`).

## Tests

Indirectly by [App.test](../App.test.md).

## Gotchas / TODO

- Nothing prefetches a muscle on hover; adding `queryClient.prefetchQuery(muscleQuery(id))`
  in the roster would make selection instant.
