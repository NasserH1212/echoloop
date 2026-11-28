import { expect, it } from 'vitest';
import { StateHasher } from '../../src/core/hash/state-hasher';

const ascii = new TextEncoder();
function hashBytes(bytes: Uint8Array): string {
  const hasher = new StateHasher();
  hasher.bytes(bytes);
  return hasher.digestHex();
}

it.each([
  ['', '811c9dc5'],
  ['a', 'e40c292c'],
  ['foobar', 'bf9cf968'],
])('matches FNV-1a for "%s"', (input, expected) => {
  expect(hashBytes(ascii.encode(input))).toBe(expected);
});

it('hashes half-open ranges incrementally and resets', () => {
  const input = ascii.encode('_foobar!');
  const hasher = new StateHasher();
  hasher.bytes(input, 1, 4);
  hasher.bytes(input, 4, 4);
  hasher.bytes(input, 4, 7);
  hasher.bytes(input, 8, 8);
  expect(hasher.digestHex()).toBe('bf9cf968');
  hasher.reset();
  expect(hasher.digestHex()).toBe('811c9dc5');
  hasher.bytes(input.subarray(1, 7));
  expect(hasher.digestHex()).toBe('bf9cf968');
});

it('rejects invalid ranges before updating', () => {
  const h = new StateHasher();
  const bytes = new Uint8Array(3);
  for (const [start, end] of [
    [-1, 1],
    [2, 1],
    [0, 4],
    [0.5, 1],
    [0, NaN],
  ] as const) {
    expect(() => h.bytes(bytes, start, end)).toThrow(RangeError);
    expect(h.digestHex()).toBe('811c9dc5');
  }
});

it('encodes integer words in little-endian order', () => {
  const h = new StateHasher();
  h.u32(0x89abcdef);
  h.i32(-0x1234568);
  expect(h.digestHex()).toBe(
    hashBytes(Uint8Array.of(0xef, 0xcd, 0xab, 0x89, 0x98, 0xba, 0xdc, 0xfe)),
  );
});

it('encodes binary64 using local little-endian DataView bytes', () => {
  for (const x of [
    0,
    -0,
    1.5,
    -77.25,
    Number.MIN_VALUE,
    Infinity,
    -Infinity,
    NaN,
  ]) {
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setFloat64(0, x, true);
    const h = new StateHasher();
    h.f64(x);
    expect(h.digestHex()).toBe(hashBytes(new Uint8Array(buffer)));
  }
});

it('distinguishes signed zeros across independent hashers', () => {
  const positive = new StateHasher();
  const negative = new StateHasher();
  positive.f64(0);
  negative.f64(-0);
  expect(positive.digestHex()).not.toBe(negative.digestHex());
});

it('preserves leading hex zeros', () => {
  for (let byte = 0; byte < 256; byte++) {
    const raw = ((0x811c9dc5n ^ BigInt(byte)) * 0x01000193n) & 0xffffffffn;
    if (raw < 0x10000000n) {
      expect(hashBytes(Uint8Array.of(byte))).toBe(
        raw.toString(16).padStart(8, '0'),
      );
      return;
    }
  }
  throw new Error('No leading-zero reference input found.');
});
