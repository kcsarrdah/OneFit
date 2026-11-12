# `controllers/auth.go`

## Purpose

Leftover from email/password auth, before Firebase. Nothing uses it.

## Public API

```go
type AuthController struct { /* db */ }
func NewAuthController(db *gorm.DB) *AuthController
type RegisterInput struct { Email, Password, Name string } // binding: required,email / required,min=6 / required
type LoginInput    struct { Email, Password string }
```

No endpoints. Registration and login happen in Firebase on the client; see [routes/auth.go](../routes/auth.md) and [user_controller.go](user_controller.md).

## How it works

Type declarations only; no methods.

## Depends on

`gorm`.

## Used by

nothing.

## Tests

none

## Gotchas / TODO

- Dead code; safe to delete (also the doc).
