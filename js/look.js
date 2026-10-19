const MAX = 28;
const clamp = v => Math.max(-1, Math.min(1, v));

export function initLook(viewport, scene) {
  if (matchMedia('(hover: none)').matches) {
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layers = [...scene.querySelectorAll('[data-depth]')].map(el => ({
    depth: Number(el.dataset.depth),
    x: gsap.quickTo(el, 'x', { duration: .9, ease: 'power3.out' }),
    y: gsap.quickTo(el, 'y', { duration: .9, ease: 'power3.out' }),
  }));
  const look = (nx, ny) => layers.forEach(l => { l.x(-nx * l.depth * MAX); l.y(-ny * l.depth * MAX * .6); });

  window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    look((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
  });
  // ponytail: sem pedido de permissão do iOS (DeviceOrientationEvent.requestPermission); no iPhone fica só o arrasto
  window.addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    look(clamp(e.gamma / 30), clamp((e.beta - 45) / 30));
  });
}
