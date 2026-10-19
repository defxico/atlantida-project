export function renderHotspots(container, hotspots) {
  container.innerHTML = hotspots.map(h => `
    <a class="hotspot hotspot--${h.side}" href="#${h.id}" data-depth="${h.depth}" style="--x:${h.x};--y:${h.y}">
      <span class="hotspot__dot" aria-hidden="true"></span>
      <span class="hotspot__line" aria-hidden="true"></span>
      <span class="hotspot__label">${h.label}</span>
    </a>`).join('');
}

export function renderNav(nav, hotspots) {
  nav.innerHTML = '<a href="#" data-area="">Início</a>'
    + hotspots.map(h => `<a href="#${h.id}" data-area="${h.id}">${h.nav}</a>`).join('');
}

export function setArea(id, label) {
  document.getElementById('hud-area').textContent = label;
  document.querySelectorAll('#hud-nav a').forEach(a => {
    if (a.dataset.area === id) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

export function revealHud() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.timeline()
    .from('.hud__corner', { scale: 1.6, opacity: 0, duration: .5, stagger: .06, ease: 'back.out(2)' })
    .from('.hud__status, .hud__brand, .hud__nav', { opacity: 0, y: -8, duration: .4, stagger: .08 }, '-=.2')
    .from('.hud__intro', { opacity: 0, x: -20, duration: .5 }, '-=.2')
    .from('.hotspot', { opacity: 0, scale: .6, duration: .4, stagger: .15, ease: 'back.out(2)' }, '-=.1');
}
