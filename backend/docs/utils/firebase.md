# `utils/firebase.go`

## Purpose

Initialises the Firebase Admin SDK once and exposes ID-token verification.

## Public API

```go
func InitFirebase() error
func VerifyFirebaseToken(idToken string) (*auth.Token, error)
func GetFirebaseUser(uid string) (*auth.UserRecord, error)
```

## How it works

- `InitFirebase` reads the service-account file path from `FIREBASE_CREDENTIALS_PATH` (default `serviceAccountKey.json`, relative to the working directory), creates the app and auth client, and stores them in package globals.
- `VerifyFirebaseToken` calls `authClient.VerifyIDToken` (signature, expiry, audience; no revocation check). Returns `"firebase not initialized"` if init failed.
- `GetFirebaseUser` fetches a user record by UID.

## Depends on

`firebase.google.com/go/v4`, `google.golang.org/api/option`.

## Used by

[main.go](../main.md) (`InitFirebase`), [middleware/auth.go](../middleware/auth.md) (`VerifyFirebaseToken`).

## Tests

none

## Gotchas / TODO

- `GetFirebaseUser` is unused.
- The credentials file is a secret (git-ignored). Never copy its contents into docs or code.
- Revoked tokens stay valid until expiry (`VerifyIDTokenAndCheckRevoked` is not used).
