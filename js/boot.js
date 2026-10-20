const KEY = 'nautilus.booted';
const LENS_AT = 3.9; // segundo do vídeo em que os óculos passam pelo olho

// Abertura: as mãos colocam os óculos (vídeo); quando as lentes passam pelo olho, o HUD começa a ligar.
// Resolve nesse instante; a troca para o loop acontece quando o vídeo da abertura termina.
export function runBoot() {
  const root = document.documentElement;
  if (!root.classList.contains('will-boot')) return Promise.resolve();

  const intro = document.getElementById('intro-video');
  const main = document.getElementById('scene-video');
  const flash = document.querySelector('.boot__flash');
  const skip = document.querySelector('.boot__skip');

  const toLoop = () => {
    if (intro.hidden) return;
    main.currentTime = 0;
    main.play().catch(() => {});
    const drop = () => { intro.pause(); intro.hidden = true; intro.removeAttribute('src'); intro.load(); };
    if (main.readyState >= 2) requestAnimationFrame(drop);
    else main.addEventListener('playing', drop, { once: true });
  };

  return new Promise(resolve => {
    let done = false;
    const lensOn = () => {
      if (done) return;
      done = true;
      gsap.timeline()
        .to(flash, { keyframes: [{ opacity: .55, duration: .05 }, { opacity: .1, duration: .07 }, { opacity: .75, duration: .05 }, { opacity: 0, duration: .45, ease: 'power2.out' }] })
        .call(() => {
          root.classList.remove('will-boot');
          try { localStorage.setItem(KEY, '1'); } catch {}
        }, null, .1);
      resolve();
    };

    intro.hidden = false;
    intro.src = intro.dataset.src;
    intro.addEventListener('timeupdate', () => { if (intro.currentTime >= LENS_AT) lensOn(); });
    intro.addEventListener('ended', toLoop, { once: true });
    intro.addEventListener('error', () => { lensOn(); toLoop(); }, { once: true });
    intro.play().catch(() => { lensOn(); toLoop(); });
    setTimeout(() => { lensOn(); }, 9000);

    skip.addEventListener('click', () => { lensOn(); toLoop(); }, { once: true });
  });
}
