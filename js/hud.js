export function renderHotspots(container, hotspots) {
  container.innerHTML = hotspots.map(h => `
    <a class="hotspot hotspot--${h.side}" href="#${h.id}" style="--x:${h.x};--y:${h.y}">
      <span class="hotspot__dot" aria-hidden="true"></span>
      <span class="hotspot__line" aria-hidden="true"></span>
      <span class="hotspot__label">${h.label}</span>
    </a>`).join('');
}

export function renderNav(nav, hotspots) {
  nav.innerHTML = '<a href="#" data-area=""><span><i>01</i>Início</span></a>'
    + hotspots.map((h, i) => `<a href="#${h.id}" data-area="${h.id}"><span><i>${String(i + 2).padStart(2, '0')}</i>${h.nav}</span></a>`).join('');
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
  const clearProps = 'opacity,scale,x,y';
  gsap.timeline()
    .from('.lens__window', { opacity: 0, duration: .9, ease: 'power2.out', clearProps: 'opacity' })
    .from('.hud__corner', { scale: 1.8, opacity: 0, duration: .5, stagger: .07, ease: 'back.out(2)', clearProps }, '-=.6')
    .from('.hud__status, .hud__brand, .hud__compass, .hud__nav', { opacity: 0, y: -10, duration: .45, stagger: .08, clearProps }, '-=.3')
    .from('.hud__gauges li, .hud__link', { opacity: 0, x: -16, duration: .4, stagger: .1, clearProps }, '-=.3')
    .from('.hud__msg', { opacity: 0, x: 60, duration: .5, ease: 'power3.out', clearProps }, '-=.1')
    .from('.hud__msg-body > *', { opacity: 0, y: 8, duration: .35, stagger: .12, clearProps }, '-=.2')
    .from('.hotspot', { opacity: 0, scale: .6, duration: .45, stagger: .16, ease: 'back.out(2)', clearProps }, '-=.1');
}
