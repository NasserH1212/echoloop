import { expect, it } from 'vitest';
import { FixedStep, TICK_MS } from '../../src/app/loop/fixed-step';
import { createRng } from '../../src/core/rng/sfc32';

function simulate(hz: number, seconds: number, scale = 1): number {
  const clock = new FixedStep();
  let ticks = 0;
  for (let k = 1; k <= seconds * hz; k++) {
    const delta = (k * 1000) / hz - ((k - 1) * 1000) / hz;
    ticks += clock.advance(delta, scale);
    expect(clock.alpha).toBeGreaterThanOrEqual(0);
    expect(clock.alpha).toBeLessThan(1);
  }
  return ticks;
}

it.each([30, 50, 60, 75, 90, 120, 144, 165, 240])(
  'advances 60 ticks per second at %i Hz',
  (hz) => {
    expect(simulate(hz, 1)).toBe(60);
    expect(simulate(hz, 10)).toBe(600);
  },
);

it('keeps jittered 144 Hz within one tick over ten seconds', () => {
  const rng = createRng(2026);
  const clock = new FixedStep();
  let previous = 0;
  let ticks = 0;
  for (let k = 1; k <= 1440; k++) {
    const jitter = k === 1440 ? 0 : (rng.nextFloat() - 0.5) * 0.25;
    // Offset each nominal timestamp by at most 1/8 frame: deltas vary by up to 1/4.
    const stamp = ((k + jitter) * 1000) / 144;
    ticks += clock.advance(stamp - previous);
    previous = stamp;
  }
  expect(Math.abs(ticks - 600)).toBeLessThanOrEqual(1);
});

it('caps catch-up, drops whole debt and preserves the fractional remainder', () => {
  expect(simulate(10, 1)).toBe(40);
  const clock = new FixedStep();
  clock.advance(TICK_MS / 3);
  expect(clock.advance(5000)).toBe(4);
  expect(clock.alpha).toBeCloseTo(1 / 3, 10);
  expect(clock.advance(0)).toBe(0);
  expect(clock.advance((TICK_MS * 2) / 3)).toBe(1);
  clock.advance(TICK_MS / 2);
  clock.reset();
  expect(clock.alpha).toBe(0);
});

it('clamps the real delta before scaling and ignores invalid deltas', () => {
  expect(simulate(60, 1, 0)).toBe(0);
  expect(simulate(60, 1, 0.25)).toBe(15);
  const clock = new FixedStep();
  expect(clock.advance(5000, 0.1)).toBe(1);
  for (const delta of [-1, NaN, Infinity, -Infinity]) {
    expect(clock.advance(delta)).toBe(0);
    expect(clock.alpha).toBeCloseTo(0.5, 10);
  }
  for (const scale of [-0.1, 1.1, NaN, Infinity, -Infinity]) {
    expect(() => clock.advance(200, scale)).toThrow(RangeError);
    expect(clock.alpha).toBeCloseTo(0.5, 10);
  }
});
