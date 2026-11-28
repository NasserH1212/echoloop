import { Application, Graphics } from 'pixi.js';

export async function mountLanding(host: HTMLElement): Promise<() => void> {
  const app = new Application();

  await app.init({
    width: 1600,
    height: 1000,
    resolution: 1,
    background: 0x07080c,
    antialias: true,
    autoStart: false,
    preference: 'webgl',
  });

  const frame = new Graphics()
    .rect(1, 1, 1598, 998)
    .stroke({ color: 0x243039, width: 2 });

  app.stage.addChild(frame);
  app.canvas.setAttribute('aria-hidden', 'true');
  host.prepend(app.canvas);

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      app.destroy({ removeView: true }, { children: true });
    });
  }
  return () => app.render();
}
