# `data/anatomy.go`

## Purpose

Embeds [muscles.json](muscles.md) into the binary and parses it.

## Public API

```go
func LoadMuscles() ([]models.Muscle, error)
```

## How it works

`//go:embed muscles.json` puts the file in `musclesJSON` at compile time; `LoadMuscles` unmarshals it into `[]models.Muscle`, wrapping errors as `parse muscles.json: ...`. No file I/O at runtime, so the content is versioned with the code.

## Depends on

[models/muscle.go](../models/muscle.md), [muscles.json](muscles.md).

## Used by

[services/anatomy_service.go](../services/anatomy_service.md) (`NewAnatomyService`).

## Tests

Indirectly by `TestNewAnatomyServiceLoadsEmbeddedContent` in [services/anatomy_service_test.go](../services/anatomy_service_test.md).

## Gotchas / TODO

- Unknown JSON keys are silently ignored, so a misspelt key loads as an empty field. The test catches missing views/exercises/regions, not other fields.
