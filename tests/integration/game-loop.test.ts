import { expect, it } from 'vitest';
import { GameLoop, runWhileVisible } from '../../src/app/loop/game-loop';
import { TickReadout } from '../../src/ui/tick-readout';

it('starts at tick zero, pauses while hidden and resumes without catch-up', () => {
  let now = 0;
  let nextId = 0;
  const scheduled = new Map<number, () => void>();
  const steps: number[] = [];
  const renders: number[][] = [];
  const loop = new GameLoop({
    now: () => now,
    requestFrame(callback) {
      const id = nextId++;
      scheduled.set(id, callback);
      return id;
    },
    cancelFrame(id) {
      scheduled.delete(id);
    },
    onStep(tick) {
      steps.push(tick);
    },
    onRender(alpha, dt) {
      renders.push([alpha, dt]);
    },
  });
  function fire(stamp: number) {
    expect(scheduled.size).toBe(1);
    const [id, callback] = scheduled.entries().next().value!;
    scheduled.delete(id);
    now = stamp;
    callback();
  }
  const visibility = Object.assign(new EventTarget(), { hidden: true });
  const stop = runWhileVisible(loop, visibility);
  const change = (hidden: boolean) => {
    visibility.hidden = hidden;
    visibility.dispatchEvent(new Event('visibilitychange'));
  };
  expect(scheduled.size).toBe(0);
  change(false);
  change(false);
  fire(100);
  expect(renders).toEqual([[0, 0]]);
  fire(125);
  expect(steps).toEqual([0]);
  expect(renders[1]![0]).toBeCloseTo(0.5);
  const stale = [...scheduled.values()][0]!;
  change(true);
  expect(scheduled.size).toBe(0);
  change(false);
  stale();
  fire(10125);
  expect(loop.ticksCompleted).toBe(1);
  expect(renders.at(-1)).toEqual([0, 0]);
  fire(10135);
  expect(loop.ticksCompleted).toBe(1);
  fire(10145);
  expect(steps).toEqual([0, 1]);
  const cancelled = [...scheduled.values()][0]!;
  stop();
  cancelled();
  change(true);
  change(false);
  expect(scheduled.size).toBe(0);
  expect(renders.length).toBe(5);
});

it('reports rolling wall-time counts and limits DOM writes', () => {
  let writes = 0;
  let shown = '';
  const display = new TickReadout({
    get textContent() {
      return shown;
    },
    set textContent(value) {
      shown = value;
      writes++;
    },
  });
  for (let k = 0; k <= 144; k++)
    display.frame((k * 1000) / 144, Math.floor((k * 60) / 144));
  expect(shown).toBe('TICK 60 · SIM 60 Hz · FPS 144');
  expect(writes).toBe(5); // inclusive endpoints at 0 and 1000 ms
  display.frame(11000, 60);
  expect(shown).toBe('TICK 60 · SIM 0 Hz · FPS 1');
  display.frame(13000, 60);
  expect(writes).toBe(6);
  display.frame(13100, 60);
  display.frame(13100.25, 61);
  display.frame(13250, 62);
  expect(shown).toBe('TICK 62 · SIM 2 Hz · FPS 4');
});
