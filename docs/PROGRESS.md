# ECHOLOOP Progress

## Status

M0 — VERIFIED on 2026-11-25. The ECHOLOOP title screen is live on [GitHub Pages](https://nasserh1212.github.io/echoloop/).

## Locked Decisions

- Node.js 26, npm lockfile, strict TypeScript, Vite, and PixiJS v8.
- Pages base path: `/echoloop/`.
- Landing canvas: 1600 × 1000 with a 16:10 display area.
- Space Grotesk and JetBrains Mono are self-hosted with their OFL licenses.
- Simulation code has its own import, math, and clock restrictions.
- Recording uses a separate Vitest configuration.

## Public Contract Changes

None.

## Files by Module

- Application: `index.html`, `src/main.ts`.
- Presentation: `src/render/landing.ts`, `src/ui/landing.css`, `public/fonts/`.
- Tooling: `tooling/core-purity.mjs`, `tooling/fetch-fonts.mjs`, root configs.
- Tests: `tests/unit/core-purity.test.mjs`, `tests/unit/fonts.test.mjs`.
- CI and deployment: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`.

## Verification Log

- 2026-11-24: `npm.cmd run verify` passed on Windows with Node v26.13.1.
  All 42 core-rule tests and both font tests passed. ESLint, TypeScript, and the
  Vite production build passed in the same run.
- The local production preview at `/echoloop/` displayed the centered title
  and arena border.
- 2026-11-25: `npm.cmd run verify` passed with the final M0 files in place.
  All 44 tests and the production build passed.
- 2026-11-25: GitHub Actions verified commit `2a3aeb0` on `main`. All 44 tests
  passed. After GitHub Pages was enabled, the deployment succeeded on the
  second attempt. [View the workflow run](https://github.com/NasserH1212/echoloop/actions/runs/45591222899).
- 2026-11-25: The developer opened the public site in a browser and confirmed
  that the centered ECHOLOOP title rendered. [Open the live site](https://nasserh1212.github.io/echoloop/).

## Waves

Waves 1–12: UNPROVEN. Par: undetermined.

## Known Issues & Risks

Replay divergence, numeric instability, hidden state, scope creep, poor feel,
render cost, library compatibility, and deployment.

## Next Tasks

1. Begin M1.