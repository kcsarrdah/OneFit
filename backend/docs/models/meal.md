# `models/meal.go`

## Purpose

Placeholder for meal / nutrition logging (`meals` table). The table is migrated but nothing reads or writes it.

## Public API

```go
type Meal struct {
    Base
    UserID    uint
    Name      string
    Time      time.Time
    Calories  float64
    Protein   float64
    Carbs     float64
    Fats      float64
    FoodItems string `gorm:"type:text"`
    Notes     string
    User      User   `gorm:"foreignKey:UserID"`
}
```

## How it works

Only referenced by `AutoMigrate` in [setup.go](setup.md). GORM's default table name is `meals`.

## Depends on

[base.go](base.md), [user.go](user.md).

## Used by

[setup.go](setup.md) only.

## Tests

none

## Gotchas / TODO

- No routes, controller or service. No JSON tags (if exposed later, add snake_case tags and `json:"-"` on `User`, which would otherwise be serialised).
