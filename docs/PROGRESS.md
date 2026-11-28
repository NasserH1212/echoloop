# ECHOLOOP Progress

## Status

M1b — DELIVERED. Runtime verification and release evidence are tracked below.

M1a — VERIFIED locally on 2026-11-27 by the developer.

M0 — VERIFIED on 2026-11-25. The ECHOLOOP title screen is live on [GitHub Pages](https://nasserh1212.github.io/echoloop/).

## Locked Decisions

- M1a uses 60 Hz, 1200 ticks per round, four sequential SplitMix32 seed words,
  twelve discarded SFC32 draws and checkpoint order a, b, c, d.
- Application timing: clamp real deltas at 250 ms before scaling, run at most four
  ticks per frame and discard excess whole ticks. A 1e-6 ms scheduling tolerance
  stays outside core. Hide/resume clears the remainder and previous timestamp.
- `Math.imul` and the 32-bit bitwise operators `|`, `&`, `^`, `~`, `<<`, `>>`, and `>>>` are exactly specified integer operations and are allowed in core alongside the operations permitted by contract §8.
- The hash mechanism is locked in M1: FNV-1a 32-bit with explicit little-endian scalars.
  The state coverage list will be locked in M2 under contract §10.2.
- Byte ranges are half-open. State and normalization offsets count elements;
  invalid slices throw RangeError before mutation.

- Node.js 26, npm lockfile, strict TypeScript, Vite, and PixiJS v8.
- Pages base path: `/echoloop/`.
- Landing canvas: 1600 × 1000 with a 16:10 display area.
- Space Grotesk and JetBrains Mono are self-hosted with their OFL licenses.
- Simulation code has its own import, math, and clock restrictions.
- Recording uses a separate Vitest configuration.

## Public Contract Changes

None.

## Files by Module

- Runtime: `src/app/loop/`, `src/ui/tick-readout.ts`, `docs/architecture.md`.
- Runtime tests: `tests/unit/fixed-step.test.ts`, `tests/integration/game-loop.test.ts`.

- Core primitives: `src/core/time.ts`, `src/core/types.ts`, `src/core/math/vector.ts`,
  `src/core/rng/sfc32.ts`, `src/core/hash/state-hasher.ts`.
- M1a verification: `tests/unit/m1-purity.test.mjs`, `tests/unit/time-math.test.ts`,
  `tests/unit/state-hasher.test.ts`, `tests/property/sfc32.test.ts` and its BigInt
  reference. Numeric policy and threat model: `docs/determinism.md`.

- Application: `index.html`, `src/main.ts`.
- Presentation: `src/render/landing.ts`, `src/ui/landing.css`, `public/fonts/`.
- Tooling: `tooling/core-purity.mjs`, `tooling/fetch-fonts.mjs`, root configs.
- Tests: `tests/unit/core-purity.test.mjs`, `tests/unit/fonts.test.mjs`.
- CI and deployment: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`.

## Verification Log

- 2026-11-27: M1b local Windows verification passed: 119 tests in eight files,
  including 14 new runtime tests. ESLint, TypeScript and Vite also passed.

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

- 2026-11-26: Local Windows run on Node v26.13.1: `npm.cmd run verify`
  exited 0. All 105 tests in six files passed (44 M0 and 61 new). Formatting,
  ESLint, TypeScript, and the Vite production build succeeded.
- 2026-11-27: Developer terminal screenshots confirm `npm.cmd run verify`
  passed in the project directory. Vitest passed all 105 tests across six files;
  Vite finished the production build in 427 ms.

## Waves

Waves 1–12: UNPROVEN. Par: undetermined.

## Known Issues & Risks

Replay divergence, numeric instability, hidden state, scope creep, poor feel,
render cost, library compatibility, and deployment.

## Next Tasks

1. Verify the deployed readout, display refresh and hidden-tab behavior.
