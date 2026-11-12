# `src/api/anatomy.ts`

## Purpose

Typed client for the backend's anatomy endpoints. Types mirror
`backend/models/muscle.go`.

## Public API

Types:

- `BodyView = 'front' | 'back'`, `BodyRegion = 'upper' | 'core' | 'lower'`,
  `Difficulty = 'beginner' | 'intermediate' | 'advanced'`,
  `FlexibilityType = 'static' | 'dynamic' | 'mobility'`.
- `MuscleSummary { id, name, scientific_names: string[], region, views: BodyView[], summary }`.
- `StrengthExercise { name, equipment, difficulty, prescription, cues: string[], video_url }`.
- `FlexibilityExercise { name, type, duration, cues: string[], video_url }`.
- `Muscle extends MuscleSummary { functions: string[], tips: string[], strength, flexibility }`.

Values:

- `class ApiError extends Error { status: number }`.
- `fetchMuscles(signal?): Promise<MuscleSummary[]>`.
- `fetchMuscle(id, signal?): Promise<Muscle>` (id is URL-encoded).

## How it works

`getJSON<T>(path, signal)` fetches `${VITE_API_BASE_URL ?? ''}${path}`. On a
non-2xx response it tries to read `{ error }` from the body and throws
`ApiError(status, error ?? 'Request failed (status)')`. Network failures reject
with the browser's `TypeError`.

Backend endpoints called (Go, `backend/routes/anatomy_routes.go`, public, no auth):

| Method | Path | Response | Errors |
|---|---|---|---|
| `GET` | `/api/anatomy/muscles` | `200 { muscles: MuscleSummary[], count: number }` | `400 { error }` for a bad `region`/`view` |
| `GET` | `/api/anatomy/muscles/:id` | `200 { muscle: Muscle }` | `404 { error: "Muscle not found" }`, `500 { error }` |

The list endpoint also accepts `region`, `view` and `search` query parameters;
the web client does not use them (it filters locally). Content comes from
`backend/data/muscles.json` (18 muscles).

## Depends on

`fetch`, [vite-env.d.ts](../vite-env.d.md).

## Used by

[queries.ts](queries.md); types are used across the app.

## Tests

Indirectly by [App.test](../App.test.md) (mocked `fetch`). No unit tests of
`getJSON` error parsing.

## Gotchas / TODO

- Responses are cast, not validated; a backend shape change fails at render time.
- `video_url` is required in the type but `ExerciseCard` treats it as optional.
