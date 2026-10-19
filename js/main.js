import { renderHotspots, renderNav, revealHud } from './hud.js';
import { initScene } from './scene.js';
import { initLook } from './look.js';
import { runBoot } from './boot.js';
import { initRouter } from './router.js';

let started = false;
let hotspots = [];
try {
hotspots = await fetch('data/hotspots.json').then(r => r.json());
const viewport = document.getElementById('viewport');
const sceneEl = document.getElementById('scene');

renderHotspots(document.getElementById('hotspots'), hotspots);
renderNav(document.getElementById('hud-nav'), hotspots);
const scene = initScene(sceneEl);
initLook(viewport, sceneEl);

await runBoot();
revealHud();
started = true;
initRouter({ hotspots, scene });
} catch (err) {
  console.error(err);
  document.documentElement.classList.remove('will-boot');
  if (!started) initRouter({ hotspots, scene: { setSpeed() {} } });
}
