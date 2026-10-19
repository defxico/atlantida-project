import { renderHotspots, renderNav, revealHud } from './hud.js';
import { initScene } from './scene.js';
import { initLook } from './look.js';
import { runBoot } from './boot.js';
import { initRouter } from './router.js';

const hotspots = await fetch('data/hotspots.json').then(r => r.json());
const viewport = document.getElementById('viewport');
const sceneEl = document.getElementById('scene');

renderHotspots(document.getElementById('hotspots'), hotspots);
renderNav(document.getElementById('hud-nav'), hotspots);
const scene = initScene(sceneEl);
initLook(viewport, sceneEl);

await runBoot();
revealHud();
initRouter({ hotspots, scene });
