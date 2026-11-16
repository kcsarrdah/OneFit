# `scripts/reset-project.js`

## Purpose

Expo template script that resets the project to a blank `app/`.

## Public API

`npm run reset-project` (interactive). Asks "move existing files to
/app-example instead of deleting them? (Y/n)".

## How it works

For `app`, `components`, `hooks`, `constants`, `scripts`: move them into
`app-example/` (Y) or delete them (n). Then writes a minimal `app/index.tsx`
and `app/_layout.tsx`.

## Depends on

Node `fs`, `path`, `readline`.

## Used by

`package.json` `reset-project`.

## Tests

none.

## Gotchas / TODO

**Destructive and obsolete for OneFit.** Answering "n" deletes most of the
app. It does not know about `features/`, `contexts/` or `docs/`, so even "Y"
leaves a broken tree. Remove the script and the npm entry.
