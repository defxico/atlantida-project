const LENS_AT = 3.7; // segundo do vídeo em que os óculos chegam ao olho
const LINES = [
  'Rede Náutilus · OS v3.0',
  'Acoplando óculos ........ ok',
  'Sensores de pressão ..... ok',
  'Suporte de vida ......... ok',
  'Conectando à rede ....... ok',
];

// ruído de TV sem sinal desenhado num canvas pequeno e ampliado
function startStatic(canvas) {
  const ctx = canvas.getContext('2d');
  const w = (canvas.width = 224), h = (canvas.height = 126);
  const img = ctx.createImageData(w, h);
  let raf;
  const draw = () => {
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = v * .6; d[i + 1] = v; d[i + 2] = v * .95; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    raf = requestAnimationFrame(draw);
  };
  draw();
  return () => cancelAnimationFrame(raf);
}

// Abertura: vídeo das mãos -> tela preta com estática e terminal ("ligar" dos óculos) -> taverna em loop -> HUD liga.
// Resolve quando a taverna aparece; a troca de vídeo acontece escondida pela tela preta.
export function runBoot() {
  const root = document.documentElement;
  if (!root.classList.contains('will-boot')) return Promise.resolve();

  const $ = s => document.querySelector(s);
  const black = $('.boot__black');
  const stat = $('.boot__static');
  const flash = $('.boot__flash');
  const screen = $('.boot__screen');
  const line = $('.boot__line');
  const log = $('.boot__log');
  const intro = $('#intro-video');
  const main = $('#scene-video');

  return new Promise(resolve => {
    let phase2 = false, finished = false, stopStatic = () => {}, tl;

    const swapToLoop = () => {
      intro.pause();
      intro.hidden = true;
      intro.removeAttribute('src');
      intro.load();
      main.currentTime = 0;
      main.play().catch(() => {});
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      root.classList.remove('will-boot');
      resolve();
      setTimeout(() => { stopStatic(); root.classList.remove('boot-on'); }, 1600);
    };

    const powerOn = () => {
      if (phase2) return;
      phase2 = true;
      stopStatic = startStatic(stat);
      tl = gsap.timeline();
      tl.to(black, { opacity: 1, duration: .22 }, 0)
        .to(stat, { keyframes: [{ opacity: .95, duration: .12 }, { opacity: .3, duration: .2 }, { opacity: .8, duration: .08 }, { opacity: .12, duration: .3 }] }, 0)
        // linha de "tubo ligando"
        .set(screen, { opacity: 1 }, .45)
        .from(line, { scaleX: 0, duration: .35, ease: 'power3.out' }, .45)
        .to(stat, { y: '+=0', keyframes: [{ opacity: .35, duration: .05 }, { opacity: .1, duration: .1 }] }, .8);

      let done = '';
      LINES.forEach((text, i) => {
        const c = { n: 0 };
        tl.to(c, {
          n: text.length, duration: text.length * .014, ease: 'none',
          onUpdate: () => { log.textContent = done + text.slice(0, Math.round(c.n)); },
          onComplete: () => { done += text + '\n'; },
        }, .7 + i * .3);
        if (i === 2) tl.to(stat, { keyframes: [{ opacity: .7, duration: .05 }, { opacity: .1, duration: .09 }] }, .7 + i * .3);
      });

      const t = .7 + LINES.length * .3 + .25;
      tl.to(screen, { opacity: 0, duration: .15 }, t)
        .to(stat, { opacity: 1, duration: .08 }, t)
        .call(swapToLoop, null, t + .1)
        .to(flash, { keyframes: [{ opacity: .8, duration: .06 }, { opacity: .15, duration: .07 }, { opacity: .9, duration: .06 }, { opacity: 0, duration: .5, ease: 'power2.out' }] }, t + .12)
        .to(black, { opacity: 0, duration: .45, ease: 'power1.in' }, t + .22)
        .to(stat, { opacity: 0, duration: .6 }, t + .22)
        .call(finish, null, t + .25);
    };

    intro.hidden = false;
    intro.src = intro.dataset.src;
    intro.addEventListener('timeupdate', () => { if (intro.currentTime >= LENS_AT) powerOn(); });
    intro.addEventListener('ended', powerOn, { once: true });
    intro.addEventListener('error', powerOn, { once: true });
    intro.play().catch(powerOn);
    setTimeout(powerOn, 9000);

    $('.boot__skip').addEventListener('click', () => {
      if (tl) tl.progress(1);
      else { swapToLoop(); finish(); root.classList.remove('boot-on'); }
    }, { once: true });
  });
}
