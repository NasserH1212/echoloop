import { INPUT_BIT } from '../types';

export const DIR_X = new Float64Array(16);
export const DIR_Y = new Float64Array(16);

for (let frame = 0; frame < 16; frame++) {
  const x =
    Number(Boolean(frame & INPUT_BIT.Right)) -
    Number(Boolean(frame & INPUT_BIT.Left));
  const y =
    Number(Boolean(frame & INPUT_BIT.Down)) -
    Number(Boolean(frame & INPUT_BIT.Up));
  const scale = x !== 0 && y !== 0 ? Math.SQRT1_2 : 1;
  DIR_X[frame] = x * scale;
  DIR_Y[frame] = y * scale;
}

export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function dot(ax: number, ay: number, bx: number, by: number): number {
  return ax * bx + ay * by;
}

export function cross(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

export function lengthSq(x: number, y: number): number {
  return x * x + y * y;
}

export function length(x: number, y: number): number {
  const scale = Math.max(Math.abs(x), Math.abs(y));
  return scale === 0 ? 0 : scale * Math.sqrt(lengthSq(x / scale, y / scale));
}

export function normalizeInto(
  out: Float64Array,
  offset: number,
  x: number,
  y: number,
): void {
  if (!Number.isInteger(offset) || offset < 0 || offset > out.length - 2) {
    throw new RangeError('Normalization requires two output elements.');
  }
  const scale = Math.max(Math.abs(x), Math.abs(y));
  if (scale === 0) {
    out[offset] = 0;
    out[offset + 1] = 0;
    return;
  }
  const sx = x / scale;
  const sy = y / scale;
  const magnitude = Math.sqrt(lengthSq(sx, sy));
  out[offset] = sx / magnitude;
  out[offset + 1] = sy / magnitude;
}
