# `models/water_log.go`

## Purpose

One water-intake entry (`water_logs` table).

## Public API

```go
type WaterLog struct {
    Base
    UserID   uint      `json:"user_id"`   // not null, indexed
    Amount   float64   `json:"amount"`    // mL
    LoggedAt time.Time `json:"logged_at"` // when it was drunk
    User     User      `json:"-"`
}
func (WaterLog) TableName() string // "water_logs"
```

## How it works

Written and read by [water_controller.go](../controllers/water_controller.md).

## Depends on

[base.go](base.md), [user.go](user.md).

## Used by

[controllers/water_controller.go](../controllers/water_controller.md), [setup.go](setup.md), SQL in [queries/user_queries.go](../queries/user_queries.md).

## Tests

none

## Gotchas / TODO

- `validate` tags are not evaluated; the controller's `binding` tags do the checking.
