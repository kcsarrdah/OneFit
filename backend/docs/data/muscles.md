# `data/muscles.json`

## Purpose

The anatomy reference content served by `/api/anatomy/*`: 18 muscle groups, each with a description, functions, tips, strength exercises and stretches. Embedded at compile time by [anatomy.go](anatomy.md).

## Public API (schema)

A JSON array of muscle objects, decoded into [`models.Muscle`](../models/muscle.md):

| Key | Type | Notes |
|---|---|---|
| `id` | string | required, unique slug; the `:id` in `/api/anatomy/muscles/:id` |
| `name` | string | display name |
| `scientific_names` | string[] | searched by `?search=` |
| `region` | `"upper"` \| `"core"` \| `"lower"` | |
| `views` | (`"front"` \| `"back"`)[] | at least one |
| `summary` | string | |
| `functions` | string[] | |
| `tips` | string[] | |
| `strength` | object[] | at least one: `{name, equipment, difficulty: "beginner"\|"intermediate"\|"advanced", prescription, cues: string[]}` |
| `flexibility` | object[] | at least one: `{name, type: "static"\|"dynamic"\|"mobility", duration, cues: string[]}` |

Current ids, in file order (which is the API order): `neck`, `traps`, `delts`, `chest`, `biceps`, `triceps`, `forearms`, `abs`, `obliques`, `lats`, `upper-back`, `lower-back`, `glutes`, `adductors`, `quads`, `hamstrings`, `calves`, `shins` (9 upper, 3 core, 6 lower).

## How it works

Edit the file and rebuild; there is no runtime reload. The web app's 3D model maps these ids to meshes, so renaming an id is a cross-app change.

## Depends on

nothing.

## Used by

[data/anatomy.go](anatomy.md) → [services/anatomy_service.go](../services/anatomy_service.md).

## Tests

`TestNewAnatomyServiceLoadsEmbeddedContent` ([doc](../services/anatomy_service_test.md)) checks: file parses, ids non-empty and unique, every muscle has ≥1 view, ≥1 strength and ≥1 flexibility entry, and valid `views`/`region` values.

## Gotchas / TODO

- `difficulty` and flexibility `type` values are not validated by tests.
- Text contains Unicode (×, –, —); keep the file UTF-8.
