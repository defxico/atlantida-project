import { parseHash } from './lib/route.js';
import { setArea } from './hud.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function initRouter({ hotspots, scene }) {
  const ids = hotspots.map(h => h.id);
  const viewport = document.getElementById('viewport');
  const camera = document.getElementById('camera');
  const panel = document.getElementById('panel');
  const frame = panel.querySelector('.panel__frame');
  const body = document.getElementById('panel-body');
  const closeBtn = panel.querySelector('.panel__close');
  const nav = document.getElementById('hud-nav');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const d = s => (reduce ? 0 : s);
  let current = null;
  let returnFocus = null;

  async function open(id) {
    const h = hotspots.find(x => x.id === id);
    if (!current) returnFocus = document.activeElement;
    current = id;
    scene.setSpeed(0.3);
    document.body.classList.add('is-panel-open');
    viewport.classList.add('is-dimmed');
    setArea(id, h.label);
    gsap.to(camera, { scale: h.zoom.scale, transformOrigin: `${h.zoom.x}% ${h.zoom.y}%`, duration: d(0.8), ease: 'power2.inOut' });
    const mod = await import(`./areas/${id}.js`);
    if (current !== id) return;
    body.innerHTML = '';
    await mod.render(body);
    if (current !== id) return;
    panel.hidden = false;
    body.scrollTop = 0;
    gsap.fromTo(frame,
      { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
      { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: d(0.5), delay: d(0.3), ease: 'power2.out' });
    closeBtn.focus();
  }

  function close() {
    current = null;
    scene.setSpeed(1);
    document.body.classList.remove('is-panel-open');
    viewport.classList.remove('is-dimmed');
    panel.hidden = true;
    body.innerHTML = '';
    setArea('', 'Início');
    gsap.to(camera, { scale: 1, duration: d(0.8), ease: 'power2.inOut' });
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
  }

  function sync() {
    const id = parseHash(location.hash, ids);
    if (id && id !== current) open(id);
    else if (!id && current) close();
  }

  const goHome = () => { location.hash = ''; };
  closeBtn.addEventListener('click', goHome);
  panel.addEventListener('click', e => { if (e.target === panel) goHome(); });
  document.addEventListener('keydown', e => {
    if (panel.hidden) return;
    if (e.key === 'Escape') { goHome(); return; }
    if (e.key !== 'Tab') return;
    const items = [...frame.querySelectorAll(FOCUSABLE), ...nav.querySelectorAll('a')]
      .filter(el => !el.closest('[hidden]'));
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.addEventListener('hashchange', sync);
  setArea('', 'Início');
  sync();
}
