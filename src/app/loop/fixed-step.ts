import { TICK_RATE } from '../../core/time';

export const TICK_MS = 1000 / TICK_RATE;
const EPS_MS = 1e-6;

export class FixedStep {
  private remainder = 0;

  get alpha(): number {
    return this.remainder / TICK_MS;
  }

  advance(realDtMs: number, timeScale = 1): number {
    if (!Number.isFinite(timeScale) || timeScale < 0 || timeScale > 1) {
      throw new RangeError('timeScale must be between zero and one.');
    }
    const delta = Number.isFinite(realDtMs)
      ? Math.min(250, Math.max(0, realDtMs))
      : 0;
    this.remainder += delta * timeScale;
    const whole = Math.floor((this.remainder + EPS_MS) / TICK_MS);
    this.remainder = Math.max(0, this.remainder - whole * TICK_MS);
    return Math.min(4, whole);
  }

  reset(): void {
    this.remainder = 0;
  }
}
