# OneFit: rules for every agent

OneFit is an all-in-one fitness tracker. Three code folders:

| Folder | What | Run | Test |
|---|---|---|---|
| `backend/` | Go 1.24 + Gin API (SQLite via glebarez, Firebase auth) | `cd backend && go run .` (port 3000) | `go test ./...` |
| `frontend/` | Expo / React Native app (expo-router) | `cd frontend && npx expo start` · web: launch config `app-web` (port 8081) | `npx jest` · `npx tsc --noEmit` · `npx eslint app components hooks constants contexts` |
| `web/` | React 19 + Vite web app (Muscle Explorer, 3D body) | `npm --prefix web run dev` (port 5173, proxies `/api` to 3000) | `npm --prefix web test` · `npm --prefix web run build` · `npm --prefix web run lint` |

These four rules apply to every change, by every agent. They are not optional.

## 1. Design first, and the design always mirrors the app

The design source of truth is the Claude Design canvas **OneFit Design**:
https://claude.ai/artifact/PVCEjWyKi7SqwGjEEtWEJH

- **Before** changing any UI (app or web), change the canvas first: add or edit the affected artboards, publish, and get the user's go-ahead on the design. Then build it.
- **After** building, update the canvas so it matches what shipped (copy, spacing, states). The canvas must mirror the app at all times; a screen that exists in the app exists on the canvas, and nothing on the "App" or "Web" pages shows something the code does not do.
- Ideas that are not built yet live only on the **Proposed** page, clearly separate from the mirror.
- The user may edit the canvas by hand. Read `project/canvas.json` and any artboard you change before publishing, and build on what is there.
- Pages: one per area of the product (see the canvas). Keep artboard names matching the screen or component they mirror.

## 2. Every file is documented, and docs change with the code

Each code folder has a `docs/` folder that mirrors its source tree, with one Markdown file per source file and per test file:

```
frontend/components/ui/Button.tsx      ->  frontend/docs/components/ui/Button.md
frontend/__tests__/constants/x.test.ts ->  frontend/docs/__tests__/constants/x.test.md
backend/controllers/workout_controller.go -> backend/docs/controllers/workout_controller.md
web/src/features/body-3d/BodyModel.tsx ->  web/docs/src/features/body-3d/BodyModel.md
```

- In the same change as the code: create the doc for a new file, update the doc of every file you touch, delete the doc of a removed file, and update the folder's `docs/README.md` index.
- Each doc follows `docs/_TEMPLATE.md` in that folder: purpose, public API (exports, props, endpoints), how it works, dependencies, used by, tests, gotchas.
- Backend docs include each endpoint's method, path, auth, request and response shapes. `backend/docs/API.md` is the full API reference.
- Test docs say what each suite covers and what it does not.
- Never copy secrets into docs (`.env`, `serviceAccountKey.json`, tokens, passwords).

## 3. Clean, modular code

- One component or concern per file. Screens compose components; they do not hold 500 lines of everything. Aim for files under ~300 lines and split before 400.
- Pure logic (calculations, formatting, ordering) lives outside components (`constants/`, `lib/`, `services/`) and has unit tests.
- Reuse the UI library (`frontend/components/ui`, `web/src/components/ui`) before writing new primitives; add new primitives there, documented.
- No dead code, unused imports or stale styles. Lint and type-check clean for the files you touch.
- Never commit `backend/onefit.db` or secrets.

## Git: Graphite stacked PRs

Use the Graphite CLI (`gt`), not raw `git checkout -b`/`gh pr create` (full guide: `Rules_for_adding_Features.md`):

- `gt sync` first; `gt create -m "<type>(<area>): …"` for each concern (stacks on the current branch); `gt modify -a` to amend; `gt submit --stack` to open/update PRs.
- One concern per branch: e.g. design canvas + code, then docs, can be separate stacked PRs. Bottom of the stack merges first.
- `gt submit` needs `gt auth`; if it is not set up, push the branches and tell the user.

## 4. Design principles

The full system is in `DESIGN.md`; product context in `PRODUCT.md`. In short:

- **Simplicity**, even though OneFit tracks everything: one task per screen, one primary action, nothing on screen that is not needed right now.
- **Clean and smooth**: direct manipulation, physical motion (things follow your finger, spring back, fill the screen), fast feedback, haptics on native.
- **Dark only**, the "iron" palette: warm near-black, chalk text, one hot orange (`#ff6a1f`) for actions.
- **Oswald** for display (headings, big numbers, action labels); the platform sans for body.
- **Liquid glass**: the translucent, blurred floating panels (tab bar, sidebar) are part of the identity. Keep them.
- **Swipe to confirm** for logging, Robinhood style: the accent sheet rises with the finger and takes over the screen.

## Verifying UI

Check changes in the browser pane at phone size (375×812) for the app and at desktop and phone sizes for the web, before saying they work. The Expo web dev server does not hot-reload in this sandbox: restart the `app-web` preview after edits.
