// One slot per millisecond. Multiple presentation callbacks can share a slot.
const WINDOW_MS = 1000;

export class TickReadout {
  private readonly stamps = new Float64Array(WINDOW_MS).fill(-Infinity);
  private readonly frames = new Uint32Array(WINDOW_MS);
  private readonly ticks = new Uint32Array(WINDOW_MS);
  private previousTicks = 0;
  private lastUpdate = -Infinity;
  private readonly element: Pick<HTMLElement, 'textContent'>;

  constructor(element: Pick<HTMLElement, 'textContent'>) {
    this.element = element;
  }

  frame(now: number, completed: number): void {
    const ms = Math.floor(now);
    const slot = ms % WINDOW_MS;
    if (this.stamps[slot] !== ms) {
      this.stamps[slot] = ms;
      this.frames[slot] = 0;
      this.ticks[slot] = 0;
    }
    this.frames[slot] = this.frames[slot]! + 1;
    this.ticks[slot] = this.ticks[slot]! + completed - this.previousTicks;
    this.previousTicks = completed;
    if (now - this.lastUpdate < 250) return;
    this.lastUpdate = now;
    let fps = 0;
    let sim = 0;
    for (let i = 0; i < WINDOW_MS; i++) {
      if (this.stamps[i]! > ms - WINDOW_MS) {
        fps += this.frames[i]!;
        sim += this.ticks[i]!;
      }
    }
    const message = `TICK ${completed} · SIM ${sim} Hz · FPS ${fps}`;
    if (message !== this.element.textContent)
      this.element.textContent = message;
  }
}
