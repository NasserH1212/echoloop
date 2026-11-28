import { expect, it, vi } from 'vitest';
import { TICK_RATE, ROUND_TICKS, msToTicks } from '../../src/core/time';
import {
  DIR_X,
  DIR_Y,
  clamp,
  lerp,
  dot,
  cross,
  lengthSq,
  length,
  normalizeInto,
} from '../../src/core/math/vector';

it('uses the locked round and tick rate', () => {
  expect([TICK_RATE, ROUND_TICKS]).toEqual([60, 1200]);
});

it.each([
  [120, 7],
  [600, 36],
  [1000, 60],
  [25, 2],
  [16, 1],
  [8, 1],
  [20000, 1200],
  [0, 0],
  [-0, 0],
  [Number.MIN_VALUE, 1],
  [Number.MAX_VALUE, Infinity],
])('converts %s ms to %s ticks', (ms, result) => {
  expect(msToTicks(ms)).toBe(result);
});

it.each([-1, -Number.MIN_VALUE, NaN, Infinity, -Infinity])(
  'rejects duration %s',
  (ms) => {
    expect(() => msToTicks(ms)).toThrow(RangeError);
  },
);

const q = Math.SQRT1_2;
const directions = [
  [0, 0],
  [0, -1],
  [0, 1],
  [0, 0],
  [-1, 0],
  [-q, -q],
  [-q, q],
  [-1, 0],
  [1, 0],
  [q, -q],
  [q, q],
  [1, 0],
  [0, 0],
  [0, -1],
  [0, 1],
  [0, 0],
];

it('maps every movement mask in screen coordinates', () => {
  expect([DIR_X.length, DIR_Y.length]).toEqual([16, 16]);
  for (let frame = 0; frame < 32; frame++) {
    const index = frame & 15;
    const x = DIR_X[index]!;
    const y = DIR_Y[index]!;
    expect([x, y]).toEqual(directions[index]);
    if (x !== 0 || y !== 0)
      expect(Math.abs(x * x + y * y - 1)).toBeLessThanOrEqual(
        4 * Number.EPSILON,
      );
  }
});

it('rebuilds bit-identical direction tables', async () => {
  vi.resetModules();
  const fresh = await import('../../src/core/math/vector');
  expect(fresh.DIR_X).not.toBe(DIR_X);
  expect(new Uint8Array(fresh.DIR_X.buffer)).toEqual(
    new Uint8Array(DIR_X.buffer),
  );
  expect(new Uint8Array(fresh.DIR_Y.buffer)).toEqual(
    new Uint8Array(DIR_Y.buffer),
  );
});

it('evaluates scalar helpers at boundaries and interior points', () => {
  expect([-3, -2, 0, 2, 3].map((v) => clamp(v, -2, 2))).toEqual([
    -2, -2, 0, 2, 2,
  ]);
  expect([0, 0.25, 1, 2].map((t) => lerp(-2, 6, t))).toEqual([-2, 0, 6, 14]);
  expect(dot(2, -3, 4, 5)).toBe(-7);
  expect(cross(2, -3, 4, 5)).toBe(22);
  expect(lengthSq(3, -4)).toBe(25);
  expect(length(3, -4)).toBe(5);
  for (const x of [0, Number.MIN_VALUE, Number.MAX_VALUE])
    expect(length(x, 0)).toBe(x);
});

it('normalizes finite vectors into the requested pair only', () => {
  const out = new Float64Array(4).fill(9);
  normalizeInto(out, 1, 3, -4);
  expect([...out]).toEqual([9, 0.6, -0.8, 9]);
  normalizeInto(out, 1, -0, 0);
  expect([...out]).toEqual([9, 0, 0, 9]);
  for (const v of [Number.MIN_VALUE, Number.MAX_VALUE]) {
    normalizeInto(out, 1, v, v);
    expect(Math.abs(out[1]! - q)).toBeLessThanOrEqual(Number.EPSILON);
    expect(out[2]).toBe(out[1]);
  }
  const saved = out.slice();
  for (const offset of [-1, 0.5, 3, Infinity, NaN]) {
    expect(() => normalizeInto(out, offset, 1, 1)).toThrow(RangeError);
    expect(out).toEqual(saved);
  }
});
