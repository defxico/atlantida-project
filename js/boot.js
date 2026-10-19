const KEY = 'nautilus.booted';
const LINES = ['REDE NÁUTILUS · OS v3.0', 'Colocando os óculos ....... ok', 'Calibrando lentes .......... ok'];

// Abertura: as mãos levantam os óculos, a câmera "entra" pela lente e a taverna aparece com o HUD ligando.
export function runBoot() {
  const root = document.documentElement;
  if (!root.classList.contains('will-boot')) return Promise.resolve();

  const $ = s => document.querySelector(s);
  const boot = $('#boot');
  const stage = $('.boot__stage');
  const video = $('.boot__video');
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
      video.pause();
      gsap.set([stage, flash], { clearProps: 'all' });
      root.classList.remove('will-boot');
      try { localStorage.setItem(KEY, '1'); } catch {}
      resolve();
    };

    video.currentTime = 0;
    video.play().catch(() => {});

    const tl = gsap.timeline({ onComplete: finish });
    tl.from(line, { scaleX: 0, duration: .5, ease: 'power2.out' }, 0);

    let done = '';
    LINES.forEach((text, i) => {
      const c = { n: 0 };
      tl.to(c, {
        n: text.length, duration: text.length * .02, ease: 'none',
        onUpdate: () => { log.textContent = done + text.slice(0, Math.round(c.n)); },
        onComplete: () => { done += text + '\n'; },
      }, .25 + i * .45);
    });

    tl.to(screen, { opacity: 0, duration: .3 }, 1.55);
    tl.to(stage, { scale: 3.6, transformOrigin: '50% 82%', duration: 1.2, ease: 'power3.in' }, 1.7);
    tl.to(flash, { opacity: 1, duration: .3, ease: 'power1.in' }, 2.65);
    tl.call(() => { main.currentTime = 0; main.play().catch(() => {}); }, null, 2.8);
    tl.set(boot, { autoAlpha: 0 }, 2.95);
    tl.fromTo(camera, { scale: 1.16 }, { scale: 1, duration: 1.4, ease: 'power3.out', clearProps: 'transform' }, 2.9);

    $('.boot__skip').addEventListener('click', () => {
      main.play().catch(() => {});
      tl.progress(1);
    }, { once: true });
  });
}
