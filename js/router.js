import { parseHash } from './lib/route.js';
import { setArea } from './hud.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initRouter({ hotspots, scene }) {
  const ids = hotspots.map(h => h.id);
  const viewport = document.getElementById('viewport');
  const camera = document.getElementById('camera');
  const panel = document.getElementById('panel');
  const frame = panel.querySelector('.panel__frame');
  const body = document.getElementById('panel-body');
  const closeBtn = panel.querySelector('.panel__close');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const d = s => (reduce ? 0 : s);
  let current = null;
  let returnFocus = null;
  let seq = 0;

  async function open(id) {
    const token = ++seq;
    const h = hotspots.find(x => x.id === id);
    if (!current) returnFocus = document.activeElement;
    current = id;
    scene.setSpeed(0.3);
    document.body.classList.add('is-panel-open');
    viewport.classList.add('is-dimmed');
    setArea(id, h.label);
    gsap.killTweensOf(camera);
    gsap.to(camera, { scale: h.zoom.scale, transformOrigin: `${h.zoom.x}% ${h.zoom.y}%`, duration: d(0.8), ease: 'power2.inOut' });
    try {
      const mod = await import(`./areas/${id}.js`);
      if (token !== seq) return;
      const tmp = document.createElement('div');
      await mod.render(tmp);
      if (token !== seq) return;
      panel.classList.toggle('panel--bare', !!mod.bare);
      body.replaceChildren(tmp);
      body.scrollTop = 0;
      if (!panel.hidden) return;
      panel.hidden = false;
      gsap.fromTo(frame,
        { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
        { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: d(0.5), delay: d(0.3), ease: 'power2.out' });
      closeBtn.focus();
    } catch (err) {
      if (token !== seq) return;
      console.error(err);
      goHome();
    }
  }

  function close() {
    seq++;
    current = null;
    scene.setSpeed(1);
    document.body.classList.remove('is-panel-open');
    viewport.classList.remove('is-dimmed');
    panel.hidden = true;
    panel.classList.remove('panel--bare');
    body.innerHTML = '';
    setArea('', 'Início');
    gsap.killTweensOf(camera);
    gsap.to(camera, { scale: 1, duration: d(0.8), ease: 'power2.inOut' });
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
  }

  function sync() {
    const id = parseHash(location.hash, ids);
    if (id && id !== current) open(id);
    else if (!id && current) close();
  }

  const goHome = () => { close(); location.hash = ''; };
  closeBtn.addEventListener('click', goHome);
  panel.addEventListener('click', e => { if (e.target === panel) goHome(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && current) { goHome(); return; }
    if (e.key !== 'Tab' || panel.hidden) return;
    const items = [...document.querySelectorAll('#hud-nav a, #panel .panel__frame *')]
      .filter(el => el.matches(FOCUSABLE) && !el.closest('[hidden]'));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (!items.includes(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.addEventListener('hashchange', sync);
  setArea('', 'Início');
  sync();
}
