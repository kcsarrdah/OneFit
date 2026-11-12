# `models/muscle.go`

## Purpose

Types for the static anatomy reference content (muscles, their exercises and stretches). Not GORM models: they are loaded from the embedded [data/muscles.json](../data/muscles.md).

## Public API

```go
type BodyView string   // BodyViewFront = "front", BodyViewBack = "back"
type BodyRegion string // BodyRegionUpper = "upper", BodyRegionCore = "core", BodyRegionLower = "lower"

type Muscle struct {
    ID              string                `json:"id"`
    Name            string                `json:"name"`
    ScientificNames []string              `json:"scientific_names"`
    Region          BodyRegion            `json:"region"`
    Views           []BodyView            `json:"views"`
    Summary         string                `json:"summary"`
    Functions       []string              `json:"functions"`
    Tips            []string              `json:"tips"`
    Strength        []StrengthExercise    `json:"strength"`
    Flexibility     []FlexibilityExercise `json:"flexibility"`
}
type MuscleSummary struct { ID, Name, ScientificNames, Region, Views, Summary } // same tags
func (m Muscle) ToSummary() MuscleSummary

type StrengthExercise struct {
    Name, Equipment string
    Difficulty      string   // beginner | intermediate | advanced
    Prescription    string   // e.g. "3 × 8–12"
    Cues            []string
}
type FlexibilityExercise struct {
    Name     string
    Type     string   // static | dynamic | mobility
    Duration string
    Cues     []string
}
```

## How it works

`ToSummary` copies the list fields (sharing the slices). The enums are plain string types; only `Region` and `View` are validated (by the controller for query params, by the test for content).

## Depends on

nothing.

## Used by

[data/anatomy.go](../data/anatomy.md), [services/anatomy_service.go](../services/anatomy_service.md), [controllers/anatomy_controller.go](../controllers/anatomy_controller.md).

## Tests

Indirectly by [services/anatomy_service_test.go](../services/anatomy_service_test.md).

## Gotchas / TODO

- `Difficulty` and flexibility `Type` are not validated anywhere; a typo in the JSON ships as-is.
