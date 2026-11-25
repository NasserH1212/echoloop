import { mountLanding } from './render/landing';
import './ui/landing.css';

const arena = document.querySelector<HTMLElement>('#arena');
const status = document.querySelector<HTMLElement>('#render-status');

if (!arena || !status) {
  throw new Error('The landing page requires #arena and #render-status.');
}

void mountLanding(arena).catch((error: unknown) => {
  status.hidden = false;
  status.textContent =
    'Graphics could not start. Check browser graphics support.';
  console.error('Pixi initialization failed.', error);
});
