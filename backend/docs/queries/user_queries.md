# `queries/user_queries.go`

## Purpose

Raw SQL strings for user-centric reads (history, stats). Currently **unused**: nothing imports package `queries`.

## Public API

```go
type UserQueries struct{} // empty, unused

const GetAllUserFasts          // fasts for user_id = ?, newest start_time first
const GetUserFastHistory       // last 50 fasts + status ('completed' if duration >= target) + completion_percentage
const GetUserWaterByDate       // water logs for user_id = ? AND DATE(logged_at) = ?, oldest first
const GetUserWorkoutTemplates  // user's templates + exercise_count
const GetUserWorkoutHistory    // user's sessions + template_name, exercises_performed, total_sets
const GetUserExercises         // custom exercises UNION exercises used in the user's templates
const GetUserProfileWithStats  // user row + fast, today's water and workout aggregates
```

All take positional `?` parameters (user id; `GetUserWaterByDate` also takes a `YYYY-MM-DD` date; `GetUserExercises` takes the user id twice). All filter `deleted_at IS NULL`.

## How it works

Plain string constants intended for `db.Raw(...)`.

## Depends on

The table/column names from [models](../README.md#models).

## Used by

nothing.

## Tests

none

## Gotchas / TODO

- Dead code; either wire it up or delete it.
- `GetUserProfileWithStats` LEFT JOINs four one-to-many tables at once, so the row count multiplies: `today_water_intake` (a `SUM`) is inflated by the number of fasts × workouts × templates. The `COUNT(DISTINCT ...)` columns are fine; `AVG(fs.duration)` is weighted by the fan-out.
- `GetUserFastHistory` divides by `fs.target`; a 0 target would give NULL in SQLite (no crash).
- `GetUserWorkoutHistory` joins `workout_templates` without a `deleted_at` filter, so deleted templates still provide `template_name` (probably intended).
- `CURRENT_DATE` / `DATE(logged_at)` are evaluated in UTC by SQLite while stored times carry the server's offset.
