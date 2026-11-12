# `models/base.go`

## Purpose

Shared primary key, timestamps and soft-delete column embedded in every DB model.

## Public API

```go
type Base struct {
    ID        uint           `gorm:"primarykey"`
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
}
```

## How it works

GORM fills `CreatedAt`/`UpdatedAt` automatically. Because `DeletedAt` is a `gorm.DeletedAt`, every `db.Delete` on a model is a **soft delete** (sets `deleted_at`), and normal queries add `deleted_at IS NULL`.

## Depends on

`gorm`.

## Used by

Every model except the anatomy types in [muscle.go](muscle.md).

## Tests

none

## Gotchas / TODO

- No JSON tags: the fields serialise as `ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt` while the rest of each model is snake_case. Clients depend on this; changing it is an API break.
- Soft delete means `OnDelete:CASCADE` constraints on child relations never fire; children remain (see [workout_session.md](workout_session.md)).
- Soft-deleted rows still count for unique indexes (e.g. `exercises.name`, `users.email`).
