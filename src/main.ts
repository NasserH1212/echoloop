import { GameLoop, runWhileVisible } from './app/loop/game-loop';
import { TickReadout } from './ui/tick-readout';
import { mountLanding } from './render/landing';
import './ui/landing.css';

const arena = document.querySelector<HTMLElement>('#arena');
const status = document.querySelector<HTMLElement>('#render-status');

const overlay = document.querySelector<HTMLElement>('#tick-readout');
if (!arena || !status || !overlay) {
  throw new Error(
    'The landing page requires its arena, status and tick readout.',
  );
}

const readout = new TickReadout(overlay);
let render: (() => void) | undefined;
const showFallback = (error: unknown) => {
  render = undefined;
  status.hidden = false;
  status.textContent =
    'Graphics could not start. Check browser graphics support.';
  console.error('Graphics unavailable.', error);
};

const loop: GameLoop = new GameLoop({
  now: () => performance.now(),
  requestFrame: (callback) => requestAnimationFrame(callback),
  cancelFrame: (id) => cancelAnimationFrame(id),
  onRender() {
    try {
      render?.();
    } catch (error) {
      showFallback(error);
    }
    readout.frame(performance.now(), loop.ticksCompleted);
  },
});
const stop = runWhileVisible(loop, document);
if (import.meta.hot) import.meta.hot.dispose(stop);
void mountLanding(arena)
  .then((draw) => {
    render = draw;
  })
  .catch(showFallback);
