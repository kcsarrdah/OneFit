# `controllers/errors_test.go`

## Purpose

Proves service validation and conflict errors reach the client as 400/404/409, not 500.

## Public API

| Test | Checks |
|---|---|
| `TestRespondErrorStatusCodes` (11 subtests) | Through real handlers on an in-memory DB: blank exercise/template name → 400; duplicate exercise/template name → 409; deleting an exercise or template still in use → 409; exercise already in a template → 409; missing exercise → 404; starting a workout from another user's private template → 404; a set with no metric → 400 and with `reps` → 201. Every 4xx has a non-empty `error`. |

## How it works

Builds an exercise, a template using it, a workout started from the template and a session exercise, plus a second user's private template, then runs the table against [helpers_test.go](helpers_test.md)'s router.

## Depends on

[errors.go](errors.md), [helpers_test.go](helpers_test.md), [testutil/db.go](../testutil/db.md).

## Used by

`go test ./...`.

## Tests

Last run: see [tests/README.md](../tests/README.md).

## Gotchas / TODO

Not covered: update-name conflicts (same code path as create), fasting/water/user/anatomy controllers, 500 paths.
