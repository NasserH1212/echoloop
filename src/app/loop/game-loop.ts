import { FixedStep } from './fixed-step';

interface LoopDriver {
  now(): number;
  requestFrame(callback: () => void): number;
  cancelFrame(id: number): void;
  onStep?(tick: number): void;
  onRender(alpha: number, realDtMs: number): void;
}

export class GameLoop {
  private readonly driver: LoopDriver;
  private readonly clock = new FixedStep();
  private generation = 0;
  private running = false;
  private pending: number | undefined;
  private completed = 0;

  constructor(driver: LoopDriver) {
    this.driver = driver;
  }
  get ticksCompleted(): number {
    return this.completed;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    const generation = ++this.generation;
    let previous: number | undefined;
    const frame = () => {
      if (generation !== this.generation) return;
      this.pending = undefined;
      const now = this.driver.now();
      const elapsed = previous === undefined ? 0 : now - previous;
      previous = now;
      const delta = Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
      const steps = this.clock.advance(delta);
      for (let i = 0; i < steps; i++) {
        this.driver.onStep?.(this.completed);
        this.completed++;
        if (generation !== this.generation) return;
      }
      this.driver.onRender(this.clock.alpha, delta);
      if (generation === this.generation)
        this.pending = this.driver.requestFrame(frame);
    };
    this.pending = this.driver.requestFrame(frame);
  }

  stop(): void {
    this.running = false;
    this.generation++;
    if (this.pending !== undefined) this.driver.cancelFrame(this.pending);
    this.pending = undefined;
    this.clock.reset();
  }
}

export function runWhileVisible(
  loop: GameLoop,
  visibility: Pick<
    Document,
    'hidden' | 'addEventListener' | 'removeEventListener'
  >,
): () => void {
  const sync = () => {
    if (visibility.hidden) loop.stop();
    else loop.start();
  };
  visibility.addEventListener('visibilitychange', sync);
  sync();
  return () => {
    visibility.removeEventListener('visibilitychange', sync);
    loop.stop();
  };
}
