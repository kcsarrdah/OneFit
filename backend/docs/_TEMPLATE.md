# `<path/to/file.go>`

> Copy this file to `backend/docs/<same path as the source>.md` (swap the extension for `.md`).
> Keep each section as short as the file deserves. Write "none" rather than deleting a section.

## Purpose

One or two sentences: what this file is for and why it exists.

## Public API

Exported types, functions, methods and constants, with signatures:

```go
func NewThing(db *gorm.DB) *Thing
func (t *Thing) DoIt(userID uint, name string) (*models.Thing, error)
```

For **controllers and routes**, list every endpoint instead:

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| `GET` | `/api/things/:id` | `AuthMiddleware` | none | `200 {"thing": Thing}` |

Full shapes, status codes and error strings belong in `backend/docs/API.md`; link to the section (from a doc in a subfolder the link is `../API.md#section`).

## How it works

The non-obvious parts: control flow, queries, validation, defaults, ordering.

## Depends on

Packages and files this file imports or calls (internal ones as links to their docs).

## Used by

Who calls this file (links to their docs).

## Tests

Which test files cover it, and what they check. Otherwise: "none".

## Gotchas / TODO

Bugs, risks, surprising behaviour, dead code, missing validation. Mark verified bugs as **Bug**.
