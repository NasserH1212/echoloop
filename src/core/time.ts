export const TICK_RATE = 60;
export const ROUND_TICKS = 1200;

export function msToTicks(ms: number): number {
  if (!Number.isFinite(ms) || ms < 0) throw new RangeError('Invalid duration.');
  return ms === 0 ? 0 : Math.max(1, Math.round((ms * TICK_RATE) / 1000));
}
