# `features/fasting/hooks/useFastCompletion.ts`

## Purpose

The "Fast complete" dialog's state: open it with a finished fast, add notes,
then save it to the backend API or discard it, with a toast either way.

## Public API

`useFastCompletion()` returns:

| Field | Type |
|---|---|
| `showModal` | `boolean` |
| `completedFast` | `CompletedFastData \| null` |
| `notes`, `setNotes` | `string`, setter |
| `isLoading` | `boolean` (saving) |
| `openModal(fast)` | clears notes, shows the dialog |
| `closeModal()` | hides and clears everything |
| `saveFast(userNotes?)` | POSTs the fast, see below |
| `discardFast()` | toast "Fast Discarded", close |

## How it works

`saveFast` sends

```
POST {API_BASE}/api/fasts
Content-Type: application/json
{ startTime, endTime, actualDurationSeconds, goalDurationSeconds, notes }
```

with a 10 s `AbortSignal.timeout`. `API_BASE` is `http://localhost:3000` in
development (`__DEV__`) and the placeholder `https://your-api.com` otherwise.
On 2xx: toast "Fast Saved!" with [formatFastLength](../lib/format.md), close.
On error or timeout: destructive toast "Save Failed", the dialog stays open.

This is the **only call from the app to the Go backend**. Everything else is
on-device.

## Depends on

[useToast](../../../hooks/useToast.md), [format](../lib/format.md), [types](../types.md), `fetch`.

## Used by

[FastingScreen](../screens/FastingScreen.md).

## Tests

[useFastCompletion.test](../../../__tests__/features/fasting/hooks/useFastCompletion.test.md).

## Gotchas / TODO

- **Saving cannot succeed against the real backend.** `POST /api/fasts/`
  requires a Firebase `Authorization: Bearer` token (see
  `backend/docs/API.md`), which the app never sends, so the backend answers
  401. The URL also lacks the trailing slash, which Gin answers with a 307
  redirect (and a CORS problem on web).
- The fast is not stored locally either, so a failed save loses it once the
  dialog is dismissed or discarded.
- The toasts are invisible because no [Toaster](../../../components/ui/Toaster.md)
  is mounted; the user sees no success or failure message.
- `localhost` is unreachable from a physical device or the Android emulator
  (`10.0.2.2`). `API_BASE` should come from config (`EXPO_PUBLIC_*`), as the
  TODO says.
- `AbortSignal.timeout` is missing on some React Native engines; if absent,
  `saveFast` throws before `fetch` and reports a failed save.
