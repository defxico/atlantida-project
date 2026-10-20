import { renderHotspots, renderNav, revealHud } from './hud.js';
import { initScene } from './scene.js';
import { initLook } from './look.js';
import { runBoot } from './boot.js';
import { initTransmissions } from './transmissoes.js';
import { initRouter } from './router.js';

let started = false;
let hotspots = [];
let txItems = [];
try {
  const [hs, tx] = await Promise.all([fetch('data/hotspots.json').then(r => r.json()), fetch('data/transmissoes.json').then(r => r.json())]);
  hotspots = hs;
  txItems = tx;
  renderHotspots(document.getElementById('hotspots'), hotspots);
  renderNav(document.getElementById('hud-nav'), hotspots);
  const scene = initScene();
  initLook(document.getElementById('viewport'));

  await runBoot();
  revealHud();
  initTransmissions(document.querySelector('.hud__msg'), txItems);
  started = true;
  initRouter({ hotspots, scene });
} catch (err) {
  console.error(err);
  document.documentElement.classList.remove('will-boot');
  if (!started) initRouter({ hotspots, scene: { setSpeed() {} } });
}
