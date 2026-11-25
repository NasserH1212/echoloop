# ECHOLOOP Progress

## Status

M0 scaffold verified locally. Final files, remote CI, and public deployment
await verification.

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
  Developer terminal output showed 42 core-rule tests and 2 font tests passing.
  ESLint, TypeScript, and the Vite production build passed in the same run.
- Developer browser screenshot confirmed the local production preview
  at `/echoloop/` with the centered title and arena border.
- Verification after adding the final M0 files: pending.
- GitHub Actions run and public Pages URL: pending.

## Waves

Waves 1–12: UNPROVEN. Par: undetermined.

## Known Issues & Risks

Replay divergence, numeric instability, hidden state, scope creep, poor feel,
render cost, library compatibility, and deployment.

## Next Tasks

1. Run local verification with the final M0 files.
2. Run CI on GitHub and open the deployed Pages URL.
3. Record the run link and live URL, then close M0.
