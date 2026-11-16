# `testutil/db.go`

## Purpose

Test helpers shared across packages: a fresh, migrated SQLite database per test and a user fixture.

## Public API

```go
func NewDB(t testing.TB) *gorm.DB
func NewUser(t testing.TB, db *gorm.DB, firebaseUID string) *models.User
```

## How it works

`NewDB` opens `file:<test name>?mode=memory&cache=shared` with `glebarez/sqlite` (same driver as production), silences the GORM logger, runs [`models.Migrate`](../models/setup.md) and closes the DB in `t.Cleanup`. The test name in the DSN keeps each test's database separate while letting GORM's pooled connections share it. `NewUser` inserts a user with the given Firebase UID and a derived unique email.

## Depends on

[models/setup.go](../models/setup.md), [models/user.go](../models/user.md), `glebarez/sqlite`, `gorm`.

## Used by

Controller and service tests (see [tests/README.md](../tests/README.md)).

## Tests

none (helper).

## Gotchas / TODO

Not a `_test.go` file, so it compiles into the `onefit/backend/testutil` package; nothing outside tests imports it.
