# OneFit backend HTTP API

The complete reference, derived from `backend/routes/*.go`, `backend/controllers/*.go` and `backend/main.go`. When you change an endpoint, change this file in the same commit.

- Base URL (dev): `http://localhost:3000` (port from `PORT`).
- All bodies are JSON. All responses are JSON.
- **40 endpoints**: 2 root, 4 auth/profile, 2 fasting, 4 water, 5 exercises, 8 templates, 13 workouts, 2 anatomy.

## Contents

- [Conventions](#conventions)
- [Object shapes](#object-shapes)
- [Root](#root)
- [Auth and profile `/api/auth`](#auth-and-profile-apiauth)
- [Fasting `/api/fasts`](#fasting-apifasts)
- [Water `/api/water`](#water-apiwater)
- [Exercises `/api/exercises`](#exercises-apiexercises)
- [Templates `/api/templates`](#templates-apitemplates)
- [Workouts `/api/workouts`](#workouts-apiworkouts)
- [Anatomy `/api/anatomy`](#anatomy-apianatomy)
- [Mismatches with older docs](#mismatches-with-older-docs)

## Conventions

### Auth

Endpoints marked **Auth: Firebase** run `middleware.AuthMiddleware` ([doc](middleware/auth.md)). Send:

```
Authorization: Bearer <Firebase ID token>
```

The middleware verifies the token with the Firebase Admin SDK, then finds or creates the local `users` row by Firebase UID (email and `name` claim; name falls back to email). Middleware errors, returned before any controller runs:

| Status | Body |
|---|---|
| 401 | `{"error": "Authorization header required"}` |
| 401 | `{"error": "Invalid token format. Use: Bearer <token>"}` |
| 401 | `{"error": "Invalid Firebase token", "details": "<reason>"}` (also when Firebase failed to initialise: details `firebase not initialized`) |
| 500 | `{"error": "Failed to get user", "details": "<db error>"}` |

Every controller that reads the user from context can also return `500 {"error": "user not found in context"}` / `"invalid user type in context"`; this is unreachable behind the middleware.

### Errors

All errors are `{"error": "<message>"}`. Body binding failures (malformed JSON, missing `binding:"required"` field, wrong type) return **400** with Gin's validator message as `error`. An **empty body** on a PUT/PATCH whose fields are all optional is also a 400 (`"EOF"`): send `{}`.

Service-level validation errors (duplicate names, "in use", "at least one metric") are **not** mapped to 4xx; they come back as **500** with a generic message. See each endpoint.

### Trailing slashes

Collection routes are registered with a trailing slash (`/api/workouts/`, `/api/fasts/`, ...). Gin's default `RedirectTrailingSlash` answers `/api/workouts` with a redirect (301 for GET, 307 for other methods) to `/api/workouts/`. Call the slash form directly to avoid a redirect (and CORS preflight trouble).

### Timestamps and units

- Response times are Go `time.Time` JSON: RFC 3339 with the server's local offset (not necessarily UTC).
- Request times are either **epoch milliseconds** (fasting `startTime`/`endTime`, water `logged_at`) or **RFC 3339 strings** (workout `ended_at`, session exercise `completed_at`). This is per endpoint.
- Weight in kg, distance in metres, water in mL, fast `duration`/`target` stored in minutes.

### CORS

`main.go` allows origins from `CORS_ORIGINS` (comma-separated; default `http://localhost:3000`), methods `GET POST PUT PATCH DELETE OPTIONS`, headers `Origin Authorization Content-Type`.

## Object shapes

`models.Base` has no JSON tags, so every DB model serialises its base fields in Go case: `ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt` (`null` unless soft-deleted). Other fields use the snake_case tags below. Relations tagged `json:"-"` (e.g. `User`) are never emitted.

**User** (no JSON tags at all: every key is the Go field name; includes the Firebase UID)

```json
{"ID": 1, "CreatedAt": "...", "UpdatedAt": "...", "DeletedAt": null,
 "FirebaseUID": "abc", "Email": "a@b.c", "Name": "Ann",
 "Height": 0, "Weight": 0, "Goals": "", "Settings": ""}
```

**FastSession**

```json
{"ID": 1, "CreatedAt": "...", "UpdatedAt": "...", "DeletedAt": null,
 "user_id": 1, "start_time": "...", "end_time": "...",
 "duration": 960, "target": 960, "type": "16:8", "notes": ""}
```

**WaterLog**

```json
{"ID": 1, "CreatedAt": "...", "UpdatedAt": "...", "DeletedAt": null,
 "user_id": 1, "amount": 250, "logged_at": "..."}
```

**Exercise**

```json
{"ID": 1, "CreatedAt": "...", "UpdatedAt": "...", "DeletedAt": null,
 "name": "Squats", "muscle_groups": "legs,glutes", "equipment": "bodyweight",
 "instructions": "...", "is_custom": false, "created_by_user_id": null}
```

**WorkoutTemplate** / **TemplateExercise**

```json
{"ID": 1, "CreatedAt": "...", "UpdatedAt": "...", "DeletedAt": null,
 "user_id": 1, "name": "Push day", "description": "", "category": "strength", "is_public": false,
 "exercises": [
   {"ID": 3, "CreatedAt": "...", "UpdatedAt": "...", "DeletedAt": null,
    "template_id": 1, "exercise_id": 7, "order_index": 1, "target_sets": 3,
    "target_reps": "8-12", "target_weight": 60, "rest_seconds": 90,
    "exercise": { "...Exercise..." }}
 ]}
```

`exercises` is `null` when not preloaded (create/update responses). `exercise` is a zero-valued object when not preloaded.

**WorkoutSession** / **SessionExercise** / **ExerciseSet**

```json
{"ID": 1, "CreatedAt": "...", "UpdatedAt": "...", "DeletedAt": null,
 "user_id": 1, "template_id": null, "name": "Morning", "started_at": "...",
 "ended_at": null, "duration_minutes": null, "notes": "",
 "template": { "...WorkoutTemplate, omitted when template_id is null or not preloaded..." },
 "exercises": [
   {"ID": 5, "CreatedAt": "...", "UpdatedAt": "...", "DeletedAt": null,
    "session_id": 1, "exercise_id": 7, "order_index": 1, "notes": "", "completed_at": null,
    "exercise": { "...Exercise..." },
    "sets": [
      {"ID": 9, "CreatedAt": "...", "UpdatedAt": "...", "DeletedAt": null,
       "session_exercise_id": 5, "set_number": 1, "reps": 8, "weight": 60,
       "duration_seconds": null, "distance_meters": null, "rpe": 8, "completed_at": "..."}
    ]}
 ]}
```

**Muscle** (not a DB model; from `data/muscles.json`, snake_case, no base fields). See [data/muscles.md](data/muscles.md).

```json
{"id": "glutes", "name": "Glutes", "scientific_names": ["..."], "region": "lower",
 "views": ["back"], "summary": "...", "functions": ["..."], "tips": ["..."],
 "strength": [{"name": "...", "equipment": "...", "difficulty": "intermediate", "prescription": "4 × 8–12", "cues": ["..."]}],
 "flexibility": [{"name": "...", "type": "static", "duration": "30–45 s", "cues": ["..."]}]}
```

**MuscleSummary**: `id`, `name`, `scientific_names`, `region`, `views`, `summary`.

---

## Root

Defined inline in `main.go`. No auth.

### `GET /`

`200 {"message": "Welcome to OneFit Backend!"}`

### `GET /health`

`200 {"status": "healthy", "database": "connected"}`. Static: it does not check the database or Firebase.

---

## Auth and profile `/api/auth`

Routes: [routes/auth.go](routes/auth.md). Controller: [controllers/user_controller.go](controllers/user_controller.md). There are no register/login endpoints; sign-up and sign-in happen in Firebase on the client, and the first authenticated request creates the local user.

### `GET /api/auth/firebase-test`

Auth: none. `200 {"message": "Firebase test endpoint", "status": "Firebase integration ready", "note": "This is a public endpoint to test Firebase setup"}`. Static; does not touch Firebase.

### `GET /api/auth/me`

Auth: Firebase. `200 {"user": User}`.

### `PUT /api/auth/me`

Auth: Firebase. Body (all optional): `{"name": string, "height": number, "weight": number}`.

- `200 {"message": "Profile updated successfully", "user": User}`
- `400` binding error
- `500 {"error": "Failed to update profile"}`

### `PATCH /api/auth/me/settings`

Auth: Firebase. Body (all optional): `{"goals": string, "settings": string}`. Both are **strings** stored as text; to store JSON, send it stringified. Sending an object returns 400.

- `200 {"message": "Settings updated successfully", "user": User}`
- `400` binding error
- `500 {"error": "Failed to update settings"}`

---

## Fasting `/api/fasts`

Routes: [routes/fasting_routes.go](routes/fasting_routes.md). Controller: [controllers/fasting_controller.go](controllers/fasting_controller.md). Auth: Firebase on both.

### `POST /api/fasts/`

Save a completed fast (the timer runs on the client).

Body:

```json
{"startTime": 1731400000000, "endTime": 1731457600000,
 "actualDurationSeconds": 57600, "goalDurationSeconds": 57600, "notes": "optional"}
```

All but `notes` are required and must be non-zero (`binding:"required"`). Times are epoch **milliseconds**.

Stored as: `duration = actualDurationSeconds / 60`, `target = goalDurationSeconds / 60` (integer minutes, truncated), `type` from whole goal hours: 16 → `"16:8"`, 18 → `"18:6"`, 20 → `"20:4"`, 24 → `"OMAD"`, else `"custom"`.

- `201 {"message": "Fast saved successfully", "session": FastSession}`
- `400` binding error
- `400 {"error": "Start time must be before end time"}`
- `400 {"error": "Durations must be positive"}`
- `400 {"error": "Fast cannot be in the future"}`
- `500 {"error": "Failed to save fasting session"}`

### `GET /api/fasts/history`

All of the user's fasts, newest `created_at` first. No pagination.

- `200 {"sessions": [FastSession], "count": n}`
- `500 {"error": "Failed to fetch fasting history"}`

---

## Water `/api/water`

Routes: [routes/water_routes.go](routes/water_routes.md). Controller: [controllers/water_controller.go](controllers/water_controller.md). Auth: Firebase on all.

### `POST /api/water/`

Body: `{"amount": 250, "logged_at": 1731400000000}`. `amount` (mL) is required and must be > 0 (`required` rejects 0). `logged_at` is optional epoch **milliseconds**, default now.

- `201 {"message": "Water logged successfully", "log": WaterLog}`
- `400` binding error
- `400 {"error": "Water log cannot be in the future"}`
- `500 {"error": "Failed to save water log"}`

### `GET /api/water/`

Query: `date` (optional, `YYYY-MM-DD`): logs with `logged_at` in `[date 00:00 UTC, +24h)`. Without it, all logs. Ordered `logged_at` desc.

- `200 {"logs": [WaterLog], "count": n, "total_amount": sum}`
- `400 {"error": "Invalid date format. Use YYYY-MM-DD"}`
- `500 {"error": "Failed to fetch water logs"}`

### `DELETE /api/water/latest`

Soft-deletes the user's most recent log (by `logged_at`, then `created_at`). Registered before `/:id`, so `latest` is not parsed as an ID.

- `200 {"message": "Latest water log deleted successfully", "deleted_log": WaterLog}`
- `404 {"error": "No water logs found to delete"}`
- `500 {"error": "Failed to find water log"}` / `{"error": "Failed to delete water log"}`

### `DELETE /api/water/:id`

Path: `id` (uint, must belong to the user).

- `200 {"message": "Water log deleted successfully", "log": WaterLog}`
- `400 {"error": "Invalid log ID"}`
- `404 {"error": "Water log not found"}`
- `500 {"error": "Failed to find water log"}` / `{"error": "Failed to delete water log"}`

---

## Exercises `/api/exercises`

Routes: [routes/exercise_routes.go](routes/exercise_routes.md). Controller: [controllers/exercise_controller.go](controllers/exercise_controller.md). Service: [services/exercise_service.go](services/exercise_service.md). Auth: Firebase on all.

### `GET /api/exercises/`

Query (all optional):

| Param | Meaning |
|---|---|
| `muscle_group` | substring match on `muscle_groups` (`LIKE %x%`) |
| `equipment` | substring match on `equipment` |
| `search` | name search (**broken**, see below) |
| `include_custom` | default `true`; any value other than `true` means false. When true, adds the caller's own custom exercises to the built-ins. |

Ordered built-ins first, then by name.

- `200 {"exercises": [Exercise], "count": n}`
- `500 {"error": "Failed to fetch exercises"}`

Known bugs: any non-empty `search` returns 500 (the query uses `ILIKE`, which SQLite does not support). With `include_custom=false`, `muscle_group`/`equipment` filters are ignored for built-ins (missing parentheses). Details in [services/exercise_service.md](services/exercise_service.md).

### `GET /api/exercises/:id`

Any exercise by ID, including other users' custom exercises (no ownership check).

- `200 {"exercise": Exercise}`
- `400 {"error": "Invalid exercise ID"}`
- `404 {"error": "Exercise not found"}`
- `500 {"error": "Failed to fetch exercise"}`

### `POST /api/exercises/`

Create a custom exercise owned by the caller. Body: `{"name": string (required), "muscle_groups": string, "equipment": string, "instructions": string}`. Values are trimmed.

- `201 {"message": "Exercise created successfully", "exercise": Exercise}`
- `400` binding error
- `500 {"error": "Failed to create exercise"}`: also returned for a blank (whitespace) name, a name the caller already used, and any name that exists anywhere (`exercises.name` is globally unique, including soft-deleted rows and built-ins).

### `PUT /api/exercises/:id`

Update the caller's own custom exercise. Body (all optional): `{"name", "muscle_groups", "equipment", "instructions"}` (strings). A blank `name` is ignored.

- `200 {"message": "Exercise updated successfully", "exercise": Exercise}`
- `400 {"error": "Invalid exercise ID"}` / binding error
- `404 {"error": "Exercise not found or not owned by user"}` (also for built-ins)
- `500 {"error": "Failed to update exercise"}` (also name conflicts)

### `DELETE /api/exercises/:id`

Soft-delete the caller's own custom exercise.

- `200 {"message": "Exercise deleted successfully"}`
- `400 {"error": "Invalid exercise ID"}`
- `404 {"error": "Exercise not found or not owned by user"}`
- `500 {"error": "Failed to delete exercise"}` (also when the exercise is used in any template or workout)

---

## Templates `/api/templates`

Routes: [routes/template_routes.go](routes/template_routes.md). Controller: [controllers/template_controller.go](controllers/template_controller.md). Service: [services/template_service.go](services/template_service.md). Auth: Firebase on all.

Note: in `/:id/exercises/:exercise_id` here, `exercise_id` is the **Exercise** ID (`exercises.ID`), not the `template_exercises` row ID. The workout routes use the session-exercise row ID instead.

### `GET /api/templates/`

Query: `category` (exact match, optional), `include_public` (default `false`; only `true` enables; adds other users' public templates). Newest first. `exercises` preloaded with `exercise` (not sorted by `order_index`).

- `200 {"templates": [WorkoutTemplate], "count": n}`
- `500 {"error": "Failed to fetch templates"}`

### `GET /api/templates/:id`

Own or public template, `exercises` sorted by `order_index`.

- `200 {"template": WorkoutTemplate}`
- `400 {"error": "Invalid template ID"}`
- `404 {"error": "Template not found"}`
- `500 {"error": "Failed to fetch template"}`

### `POST /api/templates/`

Body: `{"name": string (required), "description": string, "category": string, "is_public": bool}`. Trimmed.

- `201 {"message": "Template created successfully", "template": WorkoutTemplate}` (`exercises: null`)
- `400` binding error
- `500 {"error": "Failed to create template"}` (also for a name the caller already uses)

### `PUT /api/templates/:id`

Owner only. Body (all optional): `{"name", "description", "category", "is_public"}`. A blank `name` is ignored.

- `200 {"message": "Template updated successfully", "template": WorkoutTemplate}` (`exercises: null`)
- `400 {"error": "Invalid template ID"}` / binding error
- `404 {"error": "Template not found or not owned by user"}`
- `500 {"error": "Failed to update template"}` (also name conflicts)

### `DELETE /api/templates/:id`

Owner only. Soft-deletes the template only (its `template_exercises` rows remain).

- `200 {"message": "Template deleted successfully"}`
- `400 {"error": "Invalid template ID"}`
- `404 {"error": "Template not found or not owned by user"}`
- `500 {"error": "Failed to delete template"}` (also when any non-deleted workout used this template)

### `POST /api/templates/:id/exercises`

Owner only (public is not enough). Body:

```json
{"exercise_id": 7, "order_index": 0, "target_sets": 3, "target_reps": "8-12",
 "target_weight": 60.0, "rest_seconds": 90}
```

`exercise_id` required; everything else optional. `order_index` 0 or omitted means "append" (max + 1).

- `201 {"message": "Exercise added to template successfully", "template_exercise": TemplateExercise}` (with `exercise`)
- `400 {"error": "Invalid template ID"}` / binding error
- `404 {"error": "Template or exercise not found"}`
- `500 {"error": "Failed to add exercise to template"}` (also when the exercise is already in the template)

### `PUT /api/templates/:id/exercises/:exercise_id`

Owner only. `exercise_id` = Exercise ID. Body (all optional): `{"order_index": int, "target_sets": int, "target_reps": string, "target_weight": number, "rest_seconds": int}`. `target_weight` cannot be cleared back to null.

- `200 {"message": "Template exercise updated successfully", "template_exercise": TemplateExercise}`
- `400 {"error": "Invalid template ID"}` / `{"error": "Invalid exercise ID"}` / binding error
- `404 {"error": "Template exercise not found"}` (also when the template is not the caller's)
- `500 {"error": "Failed to update template exercise"}`

### `DELETE /api/templates/:id/exercises/:exercise_id`

Owner only. `exercise_id` = Exercise ID. Remaining rows are not renumbered.

- `200 {"message": "Exercise removed from template successfully"}`
- `400 {"error": "Invalid template ID"}` / `{"error": "Invalid exercise ID"}`
- `404 {"error": "Template exercise not found"}`
- `500 {"error": "Failed to remove exercise from template"}`

---

## Workouts `/api/workouts`

Routes: [routes/workout_routes.go](routes/workout_routes.md). Controller: [controllers/workout_controller.go](controllers/workout_controller.md). Service: [services/workout_service.go](services/workout_service.md). Auth: Firebase on all. All operations are scoped to the caller's workouts.

In `/:id/exercises/:exercise_id...`, `exercise_id` is the **SessionExercise** ID (`session_exercises.ID`, the `exercises[].ID` in a workout), not the Exercise ID.

### `GET /api/workouts/`

Query: `limit` (default 20), `offset` (default 0), `start_date`, `end_date` (`YYYY-MM-DD`, inclusive, unvalidated). Newest `started_at` first; preloads `template`, `exercises[].exercise`, `exercises[].sets` (sets and exercises not sorted).

- `200 {"workouts": [WorkoutSession], "total": n, "limit": l, "offset": o}` (`total` ignores limit/offset)
- `500 {"error": "Failed to fetch workouts"}`

A non-numeric `limit` becomes 0, which returns an empty page; a negative `limit` disables the limit.

### `POST /api/workouts/`

Start a workout. Body: `{"name": string (required), "template_id": uint (optional), "notes": string}`. With `template_id` (own or public template), the template's exercises are copied in order with notes `"Target: <sets> sets of <reps>"`. `started_at` = now. Nothing stops a second workout starting while one is active.

- `201 {"message": "Workout started successfully", "workout": WorkoutSession}` (full details)
- `400` binding error
- `500 {"error": "Failed to start workout"}` (also when the template is missing or not accessible)

### `GET /api/workouts/active`

The caller's workout with `ended_at` null (lowest ID if several), with full details.

- `200 {"workout": WorkoutSession}`
- `200 {"workout": null, "message": "No active workout"}`
- `500 {"error": "Failed to fetch active workout"}`

### `GET /api/workouts/stats`

Query: `days` (default 30; invalid or ≤ 0 becomes 30).

```json
{"stats": {"total_workouts": 12, "total_minutes": 540, "total_sets": 180,
           "average_duration_minutes": 45, "period_days": 30}}
```

`total_workouts` and `total_minutes` count finished workouts started in the window. `total_sets` counts sets in all workouts started in the window, including unfinished and **deleted** workouts (bug, see service doc).

- `500 {"error": "Failed to fetch workout stats"}`

### `GET /api/workouts/:id`

Full details; exercises sorted by `order_index`, sets by `set_number`.

- `200 {"workout": WorkoutSession}`
- `400 {"error": "Invalid workout ID"}`
- `404 {"error": "Workout not found"}`
- `500 {"error": "Failed to fetch workout"}`

### `PUT /api/workouts/:id`

Rename, edit notes, or finish. Body (all optional):

```json
{"name": "string", "notes": "string", "ended_at": "2026-01-01T10:30:00Z", "is_active": false}
```

`ended_at` (RFC 3339) sets the end and `duration_minutes` (whole minutes from `started_at`). Without `ended_at`, `"is_active": false` ends the workout now if it has not ended. A blank `name` is ignored. The response does not preload exercises (`exercises: null`).

- `200 {"message": "Workout updated successfully", "workout": WorkoutSession}`
- `400 {"error": "Invalid workout ID"}` / binding error
- `404 {"error": "Workout not found or not owned by user"}`
- `500 {"error": "Failed to update workout"}`

### `DELETE /api/workouts/:id`

Soft-deletes the workout row only; its session exercises and sets stay in the database.

- `200 {"message": "Workout deleted successfully"}`
- `400 {"error": "Invalid workout ID"}`
- `404 {"error": "Workout not found or not owned by user"}`
- `500 {"error": "Failed to delete workout"}`

### `POST /api/workouts/:id/exercises`

Body: `{"exercise_id": uint (required, Exercise ID), "order_index": int, "notes": string}`. `order_index` 0/omitted appends. The same exercise can be added more than once.

- `201 {"message": "Exercise added to workout successfully", "session_exercise": SessionExercise}` (with `exercise`, `sets: null`)
- `400 {"error": "Invalid workout ID"}` / binding error
- `404 {"error": "Workout or exercise not found"}`
- `500 {"error": "Failed to add exercise to workout"}`

### `PUT /api/workouts/:id/exercises/:exercise_id`

`exercise_id` = SessionExercise ID. Body (all optional): `{"order_index": int, "notes": string, "completed_at": "RFC 3339"}`.

- `200 {"message": "Session exercise updated successfully", "session_exercise": SessionExercise}`
- `400 {"error": "Invalid workout ID"}` / `{"error": "Invalid session exercise ID"}` / binding error
- `404 {"error": "Session exercise not found"}`
- `500 {"error": "Failed to update session exercise"}`

### `DELETE /api/workouts/:id/exercises/:exercise_id`

`exercise_id` = SessionExercise ID. Soft-deletes the row; its sets remain.

- `200 {"message": "Exercise removed from workout successfully"}`
- `400 {"error": "Invalid workout ID"}` / `{"error": "Invalid session exercise ID"}`
- `404 {"error": "Session exercise not found"}`
- `500 {"error": "Failed to remove exercise from workout"}`

### `POST /api/workouts/:id/exercises/:exercise_id/sets`

`exercise_id` = SessionExercise ID. Body (all optional, but at least one of the first four):

```json
{"reps": 8, "weight": 60.0, "duration_seconds": 45, "distance_meters": 400.0, "rpe": 8}
```

`set_number` is assigned (max + 1); `completed_at` = now. `rpe` is not range-checked.

- `201 {"message": "Set logged successfully", "set": ExerciseSet}`
- `400 {"error": "Invalid workout ID"}` / `{"error": "Invalid session exercise ID"}` / binding error
- `404 {"error": "Session exercise not found"}`
- `500 {"error": "Failed to log set"}` (also when no metric is given)

### `PUT /api/workouts/:id/sets/:set_id`

Same body as logging, all optional. Provided fields overwrite; omitted fields are kept (a field cannot be cleared to null).

- `200 {"message": "Set updated successfully", "set": ExerciseSet}`
- `400 {"error": "Invalid workout ID"}` / `{"error": "Invalid set ID"}` / binding error
- `404 {"error": "Set not found"}`
- `500 {"error": "Failed to update set"}`

### `DELETE /api/workouts/:id/sets/:set_id`

Soft-deletes the set. Other sets are not renumbered.

- `200 {"message": "Set deleted successfully"}`
- `400 {"error": "Invalid workout ID"}` / `{"error": "Invalid set ID"}`
- `404 {"error": "Set not found"}`
- `500 {"error": "Failed to delete set"}`

---

## Anatomy `/api/anatomy`

Routes: [routes/anatomy_routes.go](routes/anatomy_routes.md). Controller: [controllers/anatomy_controller.go](controllers/anatomy_controller.md). Auth: **none** (public, read-only, served from the embedded [data/muscles.json](data/muscles.md)). Used by the web Muscle Explorer.

### `GET /api/anatomy/muscles`

Query (all optional): `region` (`upper` | `core` | `lower`), `view` (`front` | `back`), `search` (case-insensitive substring of the name, scientific names, or any strength/flexibility exercise name). Results keep file order.

- `200 {"muscles": [MuscleSummary], "count": n}`
- `400 {"error": "region must be one of: upper, core, lower"}`
- `400 {"error": "view must be one of: front, back"}`

### `GET /api/anatomy/muscles/:id`

`id` is the muscle slug (e.g. `glutes`, `upper-back`).

- `200 {"muscle": Muscle}`
- `404 {"error": "Muscle not found"}`
- `500 {"error": "Failed to fetch muscle"}` (unreachable today)

---

## Mismatches with older docs

The older reference is [`../Data_&_API_Related_Documentation/API_EndPoints.md`](../Data_&_API_Related_Documentation/API_EndPoints.md) (there is no `API_EndPoints.md` at the repo root). The ER diagrams and notes in the same folder ([users](../Data_&_API_Related_Documentation/users_ER_Diagram.md), [fasting](../Data_&_API_Related_Documentation/fasting_ER_Diagram.md), [water](../Data_&_API_Related_Documentation/Water_ER_Diagram.md), [workouts](../Data_&_API_Related_Documentation/workouts_ER_diag.md), [DB notes](../Data_&_API_Related_Documentation/Db_Related_Notes.md)) mix shipped tables with plans. Where they disagree with the code, this file follows the code:

1. **Missing endpoints.** The old doc has no auth/profile (`/api/auth/*`), fasting (`/api/fasts/*`), water (`/api/water/*`) or root (`/`, `/health`) endpoints.
2. **Counts.** It says workouts have 10 endpoints and the total is 23; the code has 13 workout endpoints and 40 in total.
3. **"All endpoints require Firebase auth".** `/`, `/health`, `/api/auth/firebase-test` and `/api/anatomy/*` are public.
4. **Template `order_index` "required".** It is optional; 0 or omitted appends.
5. **"Cascade deletes".** Deletes are GORM soft deletes. The `OnDelete:CASCADE` constraints never fire, so template exercises, session exercises and sets remain after their parent is deleted.
6. **"Users can only access their own data".** `GET /api/exercises/:id` returns any user's custom exercise.
7. **"Timestamps are UTC".** Responses use the server's local offset; fasting and water requests take epoch milliseconds, not ISO strings.
8. **Status codes.** It implies 400 for invalid input; duplicate names, "in use" deletes, a set with no metric and an inaccessible template all return 500.
9. **`:exercise_id` meaning** is not explained: Exercise ID under templates, SessionExercise ID under workouts.
10. **Response objects.** It does not say base fields are `ID`/`CreatedAt`/`UpdatedAt`/`DeletedAt` (Go case) or that `User` has no snake_case keys at all.
11. **ER diagrams.** `fasting_types`, `fasting_type_id`, `is_completed`, `timezone`, `date_of_birth`, `activity_level`, `weight_logs`, `body_measurements`, `user_preferences` do not exist in the models. `meals` exists in the schema (AutoMigrate) but has no endpoints.
