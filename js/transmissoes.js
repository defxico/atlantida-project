const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const dwell = t => Math.min(9500, 4200 + t.length * 38);

// Transmissões em loop dentro do HUD: uma por vez, texto "chegando", barra de tempo e pausa ao passar o mouse/focar.
export function initTransmissions(root, items) {
  if (!root || !items.length) return;
  const body = root.querySelector('.hud__msg-body');
  const src = root.querySelector('.tx__src');
  const text = root.querySelector('.tx__text');
  const dots = root.querySelector('.tx__dots');
  const bar = root.querySelector('.tx__bar');
  dots.innerHTML = items.map(() => '<i></i>').join('');
  const ticks = [...dots.children];

  let i = -1, tl, paused = false;

  const show = () => {
    i = (i + 1) % items.length;
    const m = items[i];
    root.dataset.tipo = m.tipo;
    src.innerHTML = '<b></b><span></span>';
    src.firstChild.textContent = m.origem;
    src.lastChild.textContent = m.assunto;
    ticks.forEach((t, k) => t.classList.toggle('is-on', k === i));
    const time = dwell(m.texto) / 1000;
    tl = gsap.timeline({ onComplete: show });
    if (reduce()) {
      text.textContent = m.texto;
      tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: time, ease: 'none' });
    } else {
      const c = { n: 0 };
      text.textContent = '';
      tl.fromTo(body, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .25 }, 0)
        .fromTo(src, { x: -10 }, { x: 0, duration: .3, ease: 'power2.out' }, 0)
        .to(c, { n: m.texto.length, duration: Math.min(1.6, m.texto.length * .011), ease: 'none', onUpdate: () => { text.textContent = m.texto.slice(0, Math.round(c.n)); } }, .15)
        .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: time, ease: 'none' }, 0)
        .to(body, { opacity: 0, y: -6, duration: .25 }, time - .25);
    }
    if (paused) tl.paused(true);
  };

  const pause = on => { paused = on; if (tl) tl.paused(on); };
  root.addEventListener('mouseenter', () => pause(true));
  root.addEventListener('mouseleave', () => pause(false));
  root.addEventListener('focusin', () => pause(true));
  root.addEventListener('focusout', () => pause(false));
  document.addEventListener('visibilitychange', () => { if (tl) tl.paused(document.hidden || paused); });

  show();
}
