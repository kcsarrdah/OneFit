# `models/setup.go`

## Purpose

Opens the SQLite database and migrates the schema.

## Public API

```go
func SetupDB() *gorm.DB
```

## How it works

- `gorm.Open(sqlite.Open("onefit.db"))` using `github.com/glebarez/sqlite` (pure-Go driver, no cgo). Panics with `"Failed to connect database"` on error.
- `db.AutoMigrate(...)` for `User`, `Meal`, `FastSession`, `WaterLog`, `Exercise`, `WorkoutTemplate`, `TemplateExercise`, `WorkoutSession`, `SessionExercise`, `ExerciseSet`. AutoMigrate creates missing tables, columns and indexes; it never drops or renames columns. There are no versioned migrations.

## Depends on

All DB models in this folder, `glebarez/sqlite`, `gorm`.

## Used by

[main.go](../main.md).

## Tests

none

## Gotchas / TODO

- The AutoMigrate error is ignored.
- The DB path is relative (`onefit.db` in the working directory) and not configurable by env.
- `backend/onefit.db` is committed to git, against the repo rule "Never commit `backend/onefit.db`". It should be removed from the index and git-ignored.
- SQLite foreign-key enforcement is not turned on explicitly, and soft deletes would bypass `ON DELETE CASCADE` anyway.
