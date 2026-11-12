# `services/user_service.go`

## Purpose

Local user lookup/creation by Firebase UID and profile saves.

## Public API

```go
type UserService struct { /* db */ }
func NewUserService(db *gorm.DB) *UserService
func (us *UserService) GetOrCreateUserByFirebaseUID(firebaseUID, email, name string) (*models.User, error)
func (us *UserService) GetUserByFirebaseUID(firebaseUID string) (*models.User, error)
func (us *UserService) UpdateUser(user *models.User) error // db.Save: writes every column
```

## How it works

`GetOrCreateUserByFirebaseUID` selects by `firebase_uid`; on `ErrRecordNotFound` it inserts `{FirebaseUID, Email, Name}`; other DB errors are returned.

## Depends on

[models/user.go](../models/user.md), `gorm`.

## Used by

[middleware/auth.go](../middleware/auth.md), [controllers/user_controller.go](../controllers/user_controller.md).

## Tests

none

## Gotchas / TODO

- Find-then-create is not atomic: two first requests in parallel for a new user can both try to insert; the loser fails the unique index and the middleware returns 500 for that request.
- Creation fails (500) if the email already belongs to another local user, e.g. the same address on a second Firebase account, or a soft-deleted user.
