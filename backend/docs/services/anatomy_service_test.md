# `services/anatomy_service_test.go`

## Purpose

Unit tests for [anatomy_service.go](anatomy_service.md) and, through it, the embedded [muscles.json](../data/muscles.md). The only Go tests in the backend.

## Public API

| Test | Checks |
|---|---|
| `TestNewAnatomyServiceLoadsEmbeddedContent` | The real embedded JSON loads; at least one muscle; every listed id resolves with `GetMuscle`; every muscle has ≥1 view, ≥1 strength and ≥1 flexibility entry; views are `front`/`back`; region is `upper`/`core`/`lower`. Duplicate/empty ids would fail construction. |
| `TestListMusclesFilters` (7 subtests) | On a 3-muscle fixture: no filter keeps order; region; view (including multi-view muscles); search by name is a plain substring (`"CALF"` finds nothing); search by scientific name; search by exercise name; region + view combined. |
| `TestGetMuscleNotFound` | Unknown id returns `ErrMuscleNotFound` (via `errors.Is`). |
| `TestNewAnatomyServiceRejectsDuplicateIDs` | Duplicate ids are rejected. |

## How it works

Same package (`package services`) so it can call the unexported `newAnatomyServiceFrom` with fixtures. No DB, no network.

## Depends on

[services/anatomy_service.go](anatomy_service.md), [models/muscle.go](../models/muscle.md), standard `testing`.

## Used by

`go test ./...`.

## Tests

Last run (2026-11-12, Go 1.24.5): all 4 tests and 7 subtests pass.

## Gotchas / TODO

Not covered:

- Empty-id rejection, search on flexibility names, whitespace trimming of search.
- `difficulty` / flexibility `type` values in the real content.
- The HTTP layer: `anatomy_controller.go` (400 for bad `region`/`view`, 404 mapping) and the routes.
