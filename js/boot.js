const KEY = 'nautilus.booted';
const LINES = [
  'REDE NÁUTILUS · OS v3.0',
  'Acoplando óculos .......... ok',
  'Calibrando lentes ......... ok',
  'Sensores de pressão ....... ok',
  'Conectando à rede ......... ok',
];

// Abertura temporária (até a nova abertura em vídeo): terminal de inicialização, a lente acende com flicker e a taverna aparece.
export function runBoot() {
  const root = document.documentElement;
  if (!root.classList.contains('will-boot')) return Promise.resolve();

  const $ = s => document.querySelector(s);
  const boot = $('#boot');
  const flash = $('.boot__flash');
  const screen = $('.boot__screen');
  const log = $('.boot__log');
  const line = $('.boot__line');
  const camera = $('#camera');
  const main = $('#scene-video');

  return new Promise(resolve => {
    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      gsap.set([boot, flash, camera], { clearProps: 'all' });
      root.classList.remove('will-boot');
      try { localStorage.setItem(KEY, '1'); } catch {}
      resolve();
    };

    const tl = gsap.timeline({ onComplete: finish });
    tl.from(line, { scaleX: 0, duration: .5, ease: 'power2.out' }, 0);

    let done = '';
    LINES.forEach((text, i) => {
      const c = { n: 0 };
      tl.to(c, {
        n: text.length, duration: text.length * .018, ease: 'none',
        onUpdate: () => { log.textContent = done + text.slice(0, Math.round(c.n)); },
        onComplete: () => { done += text + '\n'; },
      }, .3 + i * .4);
    });

    const t = .3 + LINES.length * .4 + .3;
    tl.to(screen, { opacity: 0, duration: .25 }, t);
    tl.call(() => { main.currentTime = 0; main.play().catch(() => {}); }, null, t);
    tl.to(flash, { keyframes: [{ opacity: .7, duration: .06 }, { opacity: .1, duration: .08 }, { opacity: .9, duration: .06 }, { opacity: 0, duration: .5, ease: 'power2.out' }] }, t + .2);
    tl.to(boot, { backgroundColor: 'rgba(0,0,0,0)', duration: .5 }, t + .3);
    tl.fromTo(camera, { scale: 1.06, filter: 'brightness(1.6) blur(6px)' }, { scale: 1, filter: 'brightness(1) blur(0px)', duration: 1.2, ease: 'power3.out' }, t + .25);

    $('.boot__skip').addEventListener('click', () => {
      main.play().catch(() => {});
      tl.progress(1);
    }, { once: true });
  });
}
