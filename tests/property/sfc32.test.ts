import fc from 'fast-check';
import { expect, it } from 'vitest';
import { createRng } from '../../src/core/rng/sfc32';
import { referenceRng } from './sfc32-reference';

const U32 = 4294967296;
function compareReference(seed: number, count: number): void {
  const rng = createRng(seed);
  const ref = referenceRng(seed);
  const words = new Uint32Array(4);
  rng.writeState(words);
  expect([...words]).toEqual(ref.words());
  for (let i = 0; i < count; i++) expect(rng.nextU32()).toBe(ref.draw());
  rng.writeState(words);
  expect([...words]).toEqual(ref.words());
}

it.each([0, 1, 0x7fffffff, 0x80000000, 0xffffffff, 123456789])(
  'matches 1000 reference outputs for seed %s',
  (seed) => {
    compareReference(seed, 1000);
  },
);

it('matches the BigInt reference across the seed domain', () => {
  const { FC_SEED, FC_PATH } = process.env;
  fc.assert(
    fc.property(fc.integer({ min: -2147483648, max: 0xffffffff }), (seed) =>
      compareReference(seed, 64),
    ),
    {
      numRuns: 100,
      ...(FC_SEED === undefined ? {} : { seed: Number(FC_SEED) }),
      ...(FC_PATH === undefined ? {} : { path: FC_PATH }),
    },
  );
});

it.each([
  [891, 891],
  [-1, 0xffffffff],
  [-2147483648, 0x80000000],
])('repeats 10000 draws for equivalent seeds %s and %s', (s1, s2) => {
  const first = createRng(s1);
  const second = createRng(s2);
  for (let i = 0; i < 10000; i++)
    expect(first.nextU32()).toBe(second.nextU32());
});

it('restores 1000 outputs after a 500-draw checkpoint', () => {
  const rng = createRng(123);
  for (let i = 0; i < 500; i++) rng.nextU32();
  const words = new Uint32Array(6).fill(77);
  rng.writeState(words, 1);
  expect([words[0], words[5]]).toEqual([77, 77]);
  const expected = Array.from({ length: 1000 }, () => rng.nextU32());
  rng.readState(words, 1);
  expect(Array.from({ length: 1000 }, () => rng.nextU32())).toEqual(expected);
});

it('rejects invalid state slices before mutation', () => {
  const rng = createRng(1);
  const words = new Uint32Array(4).fill(42);
  for (const offset of [-1, 0.5, 1, NaN, Infinity]) {
    expect(() => rng.readState(words, offset)).toThrow(RangeError);
    expect(() => rng.writeState(words, offset)).toThrow(RangeError);
  }
  expect(() => rng.readState(new Uint32Array(3))).toThrow(RangeError);
  expect(() => rng.writeState(new Uint32Array(3))).toThrow(RangeError);
  expect([...words]).toEqual([42, 42, 42, 42]);
  rng.writeState(words);
  expect([...words]).toEqual(referenceRng(1).words());
});

it.each([-2147483649, U32, 0.5, NaN, Infinity, -Infinity])(
  'rejects seed %s',
  (seed) => {
    expect(() => createRng(seed)).toThrow(RangeError);
  },
);

it.each([0, -1, 1.5, U32 + 1, NaN, Infinity, -Infinity])(
  'rejects bound %s before drawing',
  (bound) => {
    const rng = createRng(4);
    expect(() => rng.nextInt(bound)).toThrow(RangeError);
    expect(rng.nextU32()).toBe(referenceRng(4).draw());
  },
);

it('consumes a single unsigned word for floats and the full range', () => {
  const rng = createRng(29);
  const ref = referenceRng(29);
  for (let i = 0; i < 1000; i++) {
    expect(rng.nextFloat()).toBe(ref.draw() / U32);
    expect(rng.nextInt(U32)).toBe(ref.draw());
    expect(rng.nextInt(1)).toBe(0);
    ref.draw();
  }
});

it('rejects exactly at the cutoff and accepts the preceding word', () => {
  const rng = createRng(0);
  rng.readState(Uint32Array.of(0xfffffffc, 0, 0, 0));
  expect(rng.nextInt(6)).toBe(1);
  rng.readState(Uint32Array.of(0xfffffffb, 0, 0, 0));
  expect(rng.nextInt(6)).toBe(5);
  expect(rng.nextU32()).toBe(1);
});

it('matches bounded draws including high rejection rates', () => {
  const rng = createRng(93);
  const ref = referenceRng(93);
  for (const n of [2, 3, 17, 0x80000001, 0xffffffff]) {
    const buckets = Math.floor(U32 / n);
    for (let i = 0; i < 300; i++) {
      let word = ref.draw();
      while (Math.floor(word / n) >= buckets) word = ref.draw();
      expect(rng.nextInt(n)).toBe(word % n);
    }
  }
});

it('passes the fixed six-bin distribution sanity check', () => {
  const rng = createRng(2026);
  const counts = new Uint32Array(6);
  for (let i = 0; i < 60000; i++) {
    const bin = rng.nextInt(6);
    counts[bin] = counts[bin]! + 1;
  }
  let statistic = 0;
  for (const count of counts) {
    const difference = count - 10000;
    statistic += (difference * difference) / 10000;
  }
  expect(statistic).toBeLessThan(25);
});
