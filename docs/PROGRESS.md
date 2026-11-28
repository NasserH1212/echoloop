# ECHOLOOP Progress

## Status

M1b — DELIVERED and deployed. Manual display and visibility checks pending.

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

- 2026-11-24: M0 Windows verification on Node v26.13.1 passed all 42 core-rule tests, both font tests, lint, typecheck and production build. The local preview showed the title and arena border.
- 2026-11-25: Final M0 local verification passed 44/44. The developer confirmed the deployed title after Pages succeeded for `2a3aeb0`. [M0 run](https://github.com/NasserH1212/echoloop/actions/runs/45591222899)
- 2026-11-26: M1a local verification on Node v26.13.1 passed 105/105 across six files, including formatting, lint, typecheck and build.
- 2026-11-27: Developer screenshots confirmed M1a, 105/105 and a 427 ms Vite build.
- 2026-11-27 and 2026-11-28: M1b Windows `npm.cmd run verify` passed 119/119 across eight files, including 14 new timing and readout tests. ESLint, TypeScript and Vite passed.
- 2026-11-28: GitHub Actions verified and deployed `d459f2b` to Pages. Both `build / verify` and `deploy` succeeded. [M1 run](https://github.com/NasserH1212/echoloop/actions/runs/46161132636)
- Automated integration covers a ten-second hidden interval. Live TICK, SIM, display FPS and return from a hidden tab await a developer browser observation.

## Waves

Waves 1–12: UNPROVEN. Par: undetermined.

## Known Issues & Risks

Replay divergence, numeric instability, hidden state, scope creep, poor feel,
render cost, library compatibility, and deployment.

## Next Tasks

1. Verify the deployed readout, display refresh and hidden-tab behavior.
