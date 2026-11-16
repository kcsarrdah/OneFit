# `main_test.go`

## Purpose

Proves the development test user is created when missing and never wipes an existing user 1.

## Public API

| Test | Checks |
|---|---|
| `TestSetupDevDataCreatesMissingUser` | On an empty DB in debug mode, user 1 is created with Firebase UID `test-firebase-uid-123`. |
| `TestSetupDevDataKeepsExistingUserAndData` | A second run (a restart) keeps user 1's changed name and its water log. The old code hard-deleted and re-created user 1 here. |
| `TestSetupDevDataSkipsReleaseMode` | With `GIN_MODE=release` no user is created. |

## How it works

`package main`, sets `GIN_MODE` with `t.Setenv`, uses an in-memory DB from [testutil.NewDB](testutil/db.md).

## Depends on

[main.go](main.md), [testutil/db.go](testutil/db.md).

## Used by

`go test ./...`.

## Tests

Last run: see [tests/README.md](tests/README.md).

## Gotchas / TODO

Does not start the server; CORS and route registration are not covered.
