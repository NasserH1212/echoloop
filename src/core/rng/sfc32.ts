const U32_RANGE = 4294967296;

export interface Rng {
  nextU32(): number;
  nextFloat(): number;
  nextInt(maxExclusive: number): number;
  writeState(out: Uint32Array, offset?: number): void;
  readState(src: Uint32Array, offset?: number): void;
}

function checkStateRange(buffer: Uint32Array, offset: number): void {
  if (!Number.isInteger(offset) || offset < 0 || offset > buffer.length - 4) {
    throw new RangeError('SFC32 state requires four consecutive words.');
  }
}

export function createRng(seed: number): Rng {
  if (!Number.isInteger(seed) || seed < -2147483648 || seed >= U32_RANGE) {
    throw new RangeError('Seed must be an int32 or uint32.');
  }
  let s = seed >>> 0;
  function splitmix32(): number {
    s = (s + 0x9e3779b9) | 0;
    let t = s ^ (s >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t ^= t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    t ^= t >>> 15;
    return t >>> 0;
  }

  let a = splitmix32();
  let b = splitmix32();
  let c = splitmix32();
  let d = splitmix32();

  function nextU32(): number {
    const t = (a + b + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (((c << 21) | (c >>> 11)) + t) | 0;
    return t >>> 0;
  }

  for (let i = 0; i < 12; i++) nextU32();

  return {
    nextU32,
    nextFloat() {
      return nextU32() / U32_RANGE;
    },
    nextInt(maxExclusive) {
      if (
        !Number.isInteger(maxExclusive) ||
        maxExclusive < 1 ||
        maxExclusive > U32_RANGE
      ) {
        throw new RangeError('Bound must be an integer from 1 to 2^32.');
      }
      const limit = U32_RANGE - (U32_RANGE % maxExclusive);
      let value: number;
      do {
        value = nextU32();
      } while (value >= limit);
      return value % maxExclusive;
    },
    writeState(out, offset = 0) {
      checkStateRange(out, offset);
      out[offset] = a >>> 0;
      out[offset + 1] = b >>> 0;
      out[offset + 2] = c >>> 0;
      out[offset + 3] = d >>> 0;
    },
    readState(src, offset = 0) {
      checkStateRange(src, offset);
      a = src[offset]! | 0;
      b = src[offset + 1]! | 0;
      c = src[offset + 2]! | 0;
      d = src[offset + 3]! | 0;
    },
  };
}
