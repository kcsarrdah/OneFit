# `controllers/water_controller.go`

## Purpose

Water-intake logging: add, list (optionally for one day), delete latest, delete by id. Talks to GORM directly (no service).

## Public API

```go
type WaterController struct { /* db */ }
func NewWaterController(db *gorm.DB) *WaterController
type LogWaterInput struct {
    Amount   float64 `json:"amount" binding:"required,min=0"` // mL
    LoggedAt *int64  `json:"logged_at,omitempty"`             // epoch ms, default now
}
func (wc *WaterController) LogWater(c *gin.Context)
func (wc *WaterController) GetWaterLogs(c *gin.Context)
func (wc *WaterController) DeleteLatestWaterLog(c *gin.Context)
func (wc *WaterController) DeleteWaterLog(c *gin.Context)
```

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| `POST` | `/api/water/` | Firebase | `{"amount": number, "logged_at"?: ms}` | `201 {"message": "Water logged successfully", "log": WaterLog}` |
| `GET` | `/api/water/` | Firebase | query `date`? (`YYYY-MM-DD`) | `200 {"logs": [WaterLog], "count": n, "total_amount": sum}` |
| `DELETE` | `/api/water/latest` | Firebase | none | `200 {"message": "Latest water log deleted successfully", "deleted_log": WaterLog}` |
| `DELETE` | `/api/water/:id` | Firebase | path `id` | `200 {"message": "Water log deleted successfully", "log": WaterLog}` |

Errors: 400 binding / `Water log cannot be in the future` / `Invalid date format. Use YYYY-MM-DD` / `Invalid log ID`; 404 `No water logs found to delete` / `Water log not found`; 500 `Failed to save|fetch|find|delete water log(s)`. Full detail: [API.md#water-apiwater](../API.md#water-apiwater).

## How it works

All queries are scoped by `user_id` from the `userId` context key. The date filter is `logged_at >= date 00:00 UTC AND < +24h`. "Latest" is by `logged_at DESC, created_at DESC`. Deletes are soft.

## Depends on

[models/water_log.go](../models/water_log.md), `gin`, `gorm`.

## Used by

[routes/water_routes.go](../routes/water_routes.md).

## Tests

none

## Gotchas / TODO

- `amount: 0` is rejected by `required` (so `min=0` is effectively `> 0`); there is no upper bound.
- The `date` day is a **UTC** day, and SQLite compares the stored timestamp text (which carries the server's local offset) with the bound UTC value. On a server not running in UTC, logs near midnight can land in the wrong day. Clients wanting a local day should pass explicit bounds (not supported yet).
- Response keys mix snake_case (`total_amount`, `deleted_log`) with the model's `ID`/`CreatedAt`.
