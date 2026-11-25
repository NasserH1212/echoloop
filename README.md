# ECHOLOOP

You are a team of six, and every teammate is you from the past.

ECHOLOOP is a browser arena game in development. Each planned round lasts
20 seconds. If enemies survive, the arena rewinds and an Echo replays the
player's previous inputs alongside the next attempt.

## Current build

The M0 build displays a centered title and a letterboxed 16:10 PixiJS canvas.
It includes self-hosted fonts, TypeScript checks, and automated tests for the
fonts and the rules that isolate simulation code. Playable combat is planned
for M3 and the first playable Echo for M4.

## Run locally

Use Node.js 26 and run these commands from the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Check and preview

```sh
npm run verify
npm run preview
```

`verify` formats the working tree, runs ESLint, checks TypeScript, runs the
tests, and builds the site into `dist/`. `preview` serves that build locally.

## Project layout

- `src/main.ts` starts the application.
- `src/render/landing.ts` creates the landing canvas.
- `src/ui/landing.css` controls the layout and typography.
- `public/fonts/` contains the fonts and their OFL licenses.
- `tooling/core-purity.mjs` defines the simulation boundary rule.
- `tests/unit/` contains the font and lint-rule tests.

See [milestone progress](docs/PROGRESS.md) for verification results.
