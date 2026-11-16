# `models/setup.go`

## Purpose

Opens the SQLite database and migrates the schema.

## Public API

```go
func SetupDB() *gorm.DB
func Migrate(db *gorm.DB) error
```

## How it works

- `gorm.Open(sqlite.Open("onefit.db"))` using `github.com/glebarez/sqlite` (pure-Go driver, no cgo). Panics with `"Failed to connect database"` on error.
- `Migrate` runs `db.AutoMigrate(...)` for `User`, `Meal`, `FastSession`, `WaterLog`, `Exercise`, `WorkoutTemplate`, `TemplateExercise`, `WorkoutSession`, `SessionExercise`, `ExerciseSet`. AutoMigrate creates missing tables, columns and indexes; it never drops or renames columns. There are no versioned migrations. `SetupDB` panics if it fails.

## Depends on

All DB models in this folder, `glebarez/sqlite`, `gorm`.

## Used by

[main.go](../main.md); `Migrate` also by [testutil/db.go](../testutil/db.md) for test databases.

## Tests

none

## Gotchas / TODO

- The DB path is relative (`onefit.db` in the working directory) and not configurable by env.
- `backend/onefit.db` is committed to git, against the repo rule "Never commit `backend/onefit.db`". It should be removed from the index and git-ignored.
- SQLite foreign-key enforcement is not turned on explicitly, and soft deletes would bypass `ON DELETE CASCADE` anyway.
