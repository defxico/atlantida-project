const KEY = 'nautilus.booted';
const LINES = ['REDE NÁUTILUS · OS v3.0', 'Calibrando ótica ........ ok', 'Profundidade: 3.000 m', 'Sincronizando com a comunidade...'];

export function runBoot() {
  const root = document.documentElement;
  if (!root.classList.contains('will-boot')) return Promise.resolve();

  const boot = document.getElementById('boot');
  const log = boot.querySelector('.boot__log');
  const viewport = document.getElementById('viewport');

  return new Promise(resolve => {
    const finish = () => {
      gsap.set(viewport, { clearProps: 'filter' });
      root.classList.remove('will-boot');
      try { localStorage.setItem(KEY, '1'); } catch {}
      resolve();
    };
    const tl = gsap.timeline({ onComplete: finish });
    tl.set(viewport, { filter: 'blur(14px) brightness(.6)' });
    tl.from(boot.querySelector('.boot__line'), { scaleX: 0, duration: .4, ease: 'power2.out' });

    let done = '';
    for (const line of LINES) {
      const c = { n: 0 };
      tl.to(c, {
        n: line.length, duration: line.length * .018, ease: 'none',
        onUpdate: () => { log.textContent = done + line.slice(0, Math.round(c.n)); },
        onComplete: () => { done += line + '\n'; },
      });
      tl.to({}, { duration: .12 });
    }

    tl.to(boot.querySelector('.boot__screen'), { opacity: 0, duration: .25 });
    tl.to(boot.querySelector('.boot__lid--top'), { yPercent: -100, duration: .6, ease: 'power2.inOut' }, 'open');
    tl.to(boot.querySelector('.boot__lid--bottom'), { yPercent: 100, duration: .6, ease: 'power2.inOut' }, 'open');
    tl.to(viewport, { filter: 'blur(0px) brightness(1)', duration: .9, ease: 'power2.out' }, 'open+=.2');

    boot.querySelector('.boot__skip').addEventListener('click', () => tl.progress(1), { once: true });
  });
}
