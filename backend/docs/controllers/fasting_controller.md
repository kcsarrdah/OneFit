# `controllers/fasting_controller.go`

## Purpose

Saves completed fasts sent by the client timer and returns the user's fasting history. Talks to GORM directly (no service).

## Public API

```go
type FastingController struct { /* db */ }
func NewFastingController(db *gorm.DB) *FastingController
type SaveFastInput struct {
    StartTime             int64  `json:"startTime" binding:"required"`             // epoch ms
    EndTime               int64  `json:"endTime" binding:"required"`               // epoch ms
    ActualDurationSeconds int    `json:"actualDurationSeconds" binding:"required"`
    GoalDurationSeconds   int    `json:"goalDurationSeconds" binding:"required"`
    Notes                 string `json:"notes"`
}
func (fc *FastingController) SaveFast(c *gin.Context)
func (fc *FastingController) GetHistory(c *gin.Context)
```

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| `POST` | `/api/fasts/` | Firebase | `SaveFastInput` (camelCase keys) | `201 {"message": "Fast saved successfully", "session": FastSession}` |
| `GET` | `/api/fasts/history` | Firebase | none | `200 {"sessions": [FastSession], "count": n}` |

Errors: 400 binding / `Start time must be before end time` / `Durations must be positive` / `Fast cannot be in the future`; 500 `Failed to save fasting session` / `Failed to fetch fasting history`. Full detail: [API.md#fasting-apifasts](../API.md#fasting-apifasts).

## How it works

`SaveFast` validates, converts ms to `time.Time`, stores `duration`/`target` in whole minutes (seconds / 60) and derives `type` with the private `determineType`: goal hours (integer) 16 → `16:8`, 18 → `18:6`, 20 → `20:4`, 24 → `OMAD`, else `custom`. `GetHistory` returns all rows for the user, `created_at DESC`.

## Depends on

[models/fast_session.go](../models/fast_session.md), `gin`, `gorm`. User id from the `userId` context key.

## Used by

[routes/fasting_routes.go](../routes/fasting_routes.md).

## Tests

none

## Gotchas / TODO

- Request keys are camelCase while the response is snake_case (`start_time`, ...).
- `actualDurationSeconds` is not checked against `endTime - startTime`.
- Goal hours are truncated: a 16.5 h goal is `16:8`; a 15 h 59 m goal is `custom`.
- History is ordered by save time (`created_at`), not by `start_time`; no pagination.
- No delete or edit endpoint for fasts.
