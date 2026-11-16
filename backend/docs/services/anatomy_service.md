# `services/anatomy_service.go`

## Purpose

In-memory, read-only access to the muscle reference content: filtered listing and lookup by id.

## Public API

```go
var ErrMuscleNotFound = errors.New("muscle not found")

type AnatomyService struct { /* muscles []models.Muscle; byID map[string]int */ }
func NewAnatomyService() (*AnatomyService, error)

type MuscleFilter struct {
    Region models.BodyRegion // "" = any
    View   models.BodyView   // "" = any
    Search string            // "" = any
}
func (as *AnatomyService) ListMuscles(f MuscleFilter) []models.MuscleSummary
func (as *AnatomyService) GetMuscle(id string) (*models.Muscle, error) // ErrMuscleNotFound
```

Unexported, used by tests: `newAnatomyServiceFrom([]models.Muscle) (*AnatomyService, error)`, `muscleMatches(m, search) bool`.

## How it works

- `NewAnatomyService` calls `data.LoadMuscles()`, then `newAnatomyServiceFrom` builds the id index and rejects an empty id (`muscle at index N has no id`) or a duplicate id (`duplicate muscle id "x"`).
- `ListMuscles` keeps file order. Region must match exactly; View must be in `Views`; Search is trimmed, lowercased and matched as a substring of `name`, any `scientific_names`, or any strength/flexibility exercise `name`. Returns an empty (non-nil) slice when nothing matches, so the JSON is `[]`.
- `GetMuscle` returns a pointer to a copy of the struct (the slices inside are shared).

## Depends on

[data/anatomy.go](../data/anatomy.md), [models/muscle.go](../models/muscle.md).

## Used by

[routes/anatomy_routes.go](../routes/anatomy_routes.md) (constructs it; `log.Fatalf` on error), [controllers/anatomy_controller.go](../controllers/anatomy_controller.md).

## Tests

[anatomy_service_test.go](anatomy_service_test.md): embedded content validity, every filter, not-found, duplicate ids.

## Gotchas / TODO

- Search is a raw substring match: "calf" does not find "Calves" (the test pins this), and short terms match many exercises.
- Callers could mutate shared slices through the returned `*Muscle`; the controller only serialises it.
