# `models/user.go`

## Purpose

The local user row (`users` table), keyed to a Firebase account. Firebase owns credentials; there is no password column.

## Public API

```go
type User struct {
    Base
    FirebaseUID string `gorm:"uniqueIndex;not null"`
    Email       string `gorm:"uniqueIndex;not null"`
    Name        string
    Height      float64
    Weight      float64
    Goals       string `gorm:"type:text"` // free text / stringified JSON
    Settings    string `gorm:"type:text"` // free text / stringified JSON
}
```

## How it works

Created on first authenticated request by [user_service.go](../services/user_service.md) `GetOrCreateUserByFirebaseUID`. Profile and settings are edited through [user_controller.go](../controllers/user_controller.md).

## Depends on

[base.go](base.md).

## Used by

[middleware/auth.go](../middleware/auth.md), [services/user_service.go](../services/user_service.md), every controller via the `user` context key, and as a foreign key in all user-owned models.

## Tests

none

## Gotchas / TODO

- No JSON tags: `/api/auth/me` returns `FirebaseUID`, `Email`, `Name`, ... in Go case, unlike every other model. Changing this is an API break.
- `Email` is unique and not null. A Firebase account without an email claim (e.g. phone auth) is stored with `""`; a second such account fails the unique index and the middleware returns 500.
- If a user changes email in Firebase, the local `Email` is never updated.
