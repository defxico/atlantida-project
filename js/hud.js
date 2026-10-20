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

const BOOT_LINES = ['Lentes calibradas', 'Pressão externa  301 atm', 'Suporte de vida  ok', 'Conectando à Rede Náutilus', 'Conexão estabelecida'];

// Inicialização do HUD em etapas: lente acende, retícula calibra, bússola gira, medidores enchem, rede conecta, mensagem chega.
export function revealHud() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const clearProps = 'opacity,scale,x,y,rotate';
  const log = $('.hud__bootlog');
  const net = $('#hud-net');
  const heading = $('#hud-heading');
  const tl = gsap.timeline();

  tl.fromTo('.lens__window', { opacity: 0 }, { keyframes: [{ opacity: .6, duration: .06 }, { opacity: .15, duration: .08 }, { opacity: 1, duration: .5, ease: 'power2.out' }], clearProps: 'opacity' }, 0)
    .from('.lens__clip', { opacity: 0, duration: .8, clearProps: 'opacity' }, 0)
    .from('.hud__corner', { scale: 1.8, opacity: 0, duration: .45, stagger: .06, ease: 'back.out(2)', clearProps }, .15)
    .from('.lens__reticle i', { scale: 3, rotate: 90, opacity: 0, duration: .7, ease: 'power3.out', clearProps }, .3)
    .to('.lens__reticle i', { keyframes: [{ scale: 1.25, duration: .12 }, { scale: 1, duration: .25 }], clearProps: 'scale' }, 1.0)
    .from('.hud__status, .hud__brand, .hud__compass', { opacity: 0, y: -10, duration: .4, stagger: .08, clearProps }, .4);

  // bússola gira até a direção atual
  const hd = { v: 0 };
  tl.to(hd, { v: 274, duration: 1.1, ease: 'power3.out', onUpdate: () => { heading.textContent = `O · ${Math.round(hd.v)}°`; } }, .5);

  // log de inicialização
  tl.set(log, { opacity: 1, textContent: '' }, .5);
  let done = '';
  BOOT_LINES.forEach((text, i) => {
    const c = { n: 0 };
    tl.to(c, {
      n: text.length, duration: text.length * .016, ease: 'none',
      onUpdate: () => { log.textContent = done + text.slice(0, Math.round(c.n)); },
      onComplete: () => { done += text + '\n'; },
    }, .6 + i * .38);
  });

  // medidores enchem do zero com os números contando
  $$('.hud__gauges li').forEach((li, i) => {
    const bar = li.querySelector('b');
    const em = li.querySelector('em');
    const target = parseFloat(getComputedStyle(bar).getPropertyValue('--v')) || 0;
    const label = em.textContent;
    const num = parseFloat(label);
    const suffix = label.replace(/^[\d.,]+/, '');
    const o = { v: 0 };
    tl.from(li, { opacity: 0, x: -16, duration: .3, clearProps }, .9 + i * .25)
      .fromTo(bar, { '--v': 0 }, { '--v': target, duration: .9, ease: 'power2.out' }, .95 + i * .25)
      .to(o, { v: num, duration: .9, ease: 'power2.out', onUpdate: () => { em.textContent = Math.round(o.v) + suffix; } }, .95 + i * .25);
  });

  // rede conecta barra a barra
  tl.from('.hud__link', { opacity: 0, x: 16, duration: .3, clearProps }, 1.6)
    .call(() => { net.textContent = 'conectando…'; }, null, 1.6)
    .from('.hud__signal u', { opacity: 0, duration: .12, stagger: .18, clearProps: 'opacity' }, 1.75)
    .call(() => { net.textContent = 'online'; }, null, 2.5);

  // mensagem chega, depois pontos de interesse e menu
  tl.from('.hud__msg', { opacity: 0, x: 60, duration: .5, ease: 'power3.out', clearProps }, 2.6)
    .from('.hud__msg-body > *', { opacity: 0, y: 8, duration: .3, stagger: .1, clearProps }, 2.8)
    .from('.hotspot', { opacity: 0, scale: .6, duration: .4, stagger: .14, ease: 'back.out(2)', clearProps }, 2.9)
    .from('.hud__nav', { opacity: 0, y: 10, duration: .4, clearProps }, 3.0)
    .to(log, { opacity: 0, duration: .5 }, 3.4);
  return tl;
}
