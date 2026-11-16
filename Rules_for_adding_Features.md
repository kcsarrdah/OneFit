# OneFit Development Rules & Git Workflow

OneFit uses **[Graphite](https://graphite.dev) stacked pull requests**. Every change is a small, reviewable PR; work that builds on unmerged work is stacked on top of it instead of waiting or piling into one giant PR.

Before writing code, read [CLAUDE.md](CLAUDE.md): design first on the OneFit Design canvas, document every file in `docs/`, keep code modular.

## One-time setup

```bash
npm install -g @withgraphite/graphite-cli   # installs `gt`
gt auth --token <token>                      # token from https://app.graphite.dev/activate
cd OneFit && gt init --trunk main            # already done in this repo; safe to rerun
```

`gt submit` needs the auth token; everything else (creating, restacking, viewing stacks) works without it.

## Branch names

`<type>/<short-description>`, lower-case with hyphens:

| Type | For |
|---|---|
| `feat/` | new user-facing behaviour (`feat/app-swipe-logger`) |
| `fix/` | bug fixes (`fix/water-animation`) |
| `refactor/` | structure without behaviour change (`refactor/app-modules`) |
| `docs/` | documentation only (`docs/per-file-docs`) |
| `chore/` | tooling, config, rules (`chore/design-system-and-docs`) |

Commit messages follow the same types (`feat(app): …`, `fix(web): …`, `docs(backend): …`).

## Everyday workflow

```bash
gt sync                          # pull main, restack, clean up merged branches
gt checkout main

# make changes (design first: update the canvas, then code, then docs)
gt add -A                        # or stage selectively; never stage backend/onefit.db
gt create -m "feat(app): swipe to log sets"     # new branch + commit, stacked on the current one

# need a follow-up that depends on it? stay on that branch and stack another:
gt create -m "feat(app): rest timer takeover"

gt modify -a                     # amend the current branch after review feedback (restacks children)
gt submit --stack                # push and open/update a PR for every branch in the stack
gt log short                     # see the stack
```

Rules of thumb:

- **One concern per branch.** A refactor, a feature and its docs can be three stacked PRs.
- **Bottom of the stack merges first.** Merge in order (Graphite's merge queue or the PR page); `gt sync` restacks the rest.
- **Never merge directly to `main`** and never force-push someone else's branch.
- **Keep the stack short** (about 2–5 PRs). Land the bottom before stacking much higher.

## What every PR must have

1. **Design**: for UI changes, the OneFit Design canvas updated first and again after building, so it mirrors the shipped UI. Link the artboards in the PR.
2. **Docs**: `docs/` updated for every added, changed or removed file (and the folder's `docs/README.md` index).
3. **Tests and checks** passing for the folders touched (see the table in [CLAUDE.md](CLAUDE.md)).
4. **Description**: what changed, why, how it was tested (sizes/devices for UI), screenshots for UI.

## Review

- Self-review the diff first (`gt submit` opens it; read every file).
- Reviewers check behaviour, design fidelity against the canvas, docs, and that files stay small and single-purpose.
- Address feedback with `gt modify`, then `gt submit` again.

## Hotfixes

```bash
gt checkout main && gt sync
gt create -m "fix(app): <critical issue>"
gt submit
```

Keep it minimal, get an expedited review, merge, then `gt sync` so open stacks restack onto the fix.

## Never commit

- `backend/onefit.db` (local database), `.env` files, `backend/serviceAccountKey.json`, tokens or keys.
- Build output (`web/dist`, `.expo`), `node_modules`.
