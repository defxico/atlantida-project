import { LOOP, yoyoRepeat } from './lib/loop.js';

export function initScene(scene) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = s => scene.querySelector(s);
  spawnBubbles(q('.bubbles'));

  const tl = gsap.timeline({ repeat: -1, paused: reduce, defaults: { ease: 'sine.inOut' } });
  const pulse = (target, vars, period) =>
    tl.to(target, { ...vars, duration: period / 2, yoyo: true, repeat: yoyoRepeat(period) }, 0);

  // Ambiente — sempre rodando, períodos divisores de 18
  scene.querySelectorAll('.glow').forEach((g, i) => pulse(g, { opacity: .45, scale: .92 }, [1.5, 2, 3][i % 3]));
  pulse(scene, { y: 2, rotation: .12 }, 6);
  tl.fromTo(q('.fog--back'), { xPercent: 0 }, { xPercent: -50, duration: LOOP, ease: 'none' }, 0);
  tl.fromTo(q('.fog--front'), { xPercent: -50 }, { xPercent: 0, duration: LOOP / 2, ease: 'none', repeat: 1 }, 0);
  tl.fromTo(q('.porthole__fish'), { xPercent: 0 }, { xPercent: -50, duration: LOOP / 2, ease: 'none', repeat: 1 }, 0);

  const depth = { v: 0 };
  const out = document.getElementById('hud-depth');
  tl.to(depth, {
    v: 2, duration: 4.5, yoyo: true, repeat: yoyoRepeat(9),
    onUpdate: () => { out.textContent = (3000 + Math.round(depth.v)).toLocaleString('pt-BR'); },
  }, 0);

  // Tubarão: entra 7s, sai 14s, fora de vista no resto do loop
  tl.fromTo(q('.porthole__shark'), { xPercent: -120 }, { xPercent: 260, duration: 7, ease: 'none' }, 7);

  // Robô bartender
  const rArm = q('.actor--robo .actor__arm');
  tl.to(rArm, { rotation: -8, duration: .75, yoyo: true, repeat: 3 }, 0);          // 0–3 limpa o balcão
  tl.to(rArm, { rotation: -30, duration: 1.5 }, 3);                                // 3–4.5 vai à torneira
  tl.fromTo(q('.robo__pour'), { scaleY: 0 }, { scaleY: 1, duration: .4 }, 4.5);    // enche
  tl.to(q('.robo__pour'), { scaleY: 0, duration: .4 }, 6.6);
  tl.to(rArm, { rotation: -55, y: -12, duration: 1.5 }, 7);                        // 7–8.5 ergue a caneca
  tl.to(q('.robo__eye'), { opacity: .15, duration: .15, yoyo: true, repeat: 5 }, 8); // pisca
  tl.to(rArm, { rotation: -30, y: 0, duration: 1.5 }, 10);                         // 10–11.5 pousa
  tl.to(rArm, { rotation: 0, duration: 1.5 }, 14);                                 // 14–15.5 volta
  tl.to(rArm, { rotation: -8, duration: .625, yoyo: true, repeat: 3 }, 15.5);      // 15.5–18 limpa → pose inicial

  // Cliente (Torak)
  const cArm = q('.actor--cliente .actor__arm');
  tl.to(cArm, { rotation: 4, duration: .75, yoyo: true, repeat: 3 }, 0);           // 0–3 gesticula
  tl.to(cArm, { rotation: -40, duration: 2 }, 3);                                  // 3–5 levanta a caneca
  tl.to(cArm, { rotation: -48, duration: .5, yoyo: true, repeat: 1 }, 7);          // 7–8 brinde
  tl.to(cArm, { rotation: -75, y: -6, duration: 1.5 }, 10);                        // 10–11.5 bebe
  tl.to(cArm, { rotation: 0, y: 0, duration: 2.5 }, 14);                           // 14–16.5 pousa
  tl.to(cArm, { rotation: 4, duration: .375, yoyo: true, repeat: 3 }, 16.5);       // 16.5–18 → pose inicial

  console.assert(Math.abs(tl.duration() - LOOP) < 1e-6, `loop com ${tl.duration()}s, esperado ${LOOP}s`);

  return {
    timeline: tl,
    setSpeed: n => gsap.to(tl, { timeScale: n, duration: .6, overwrite: true }),
  };
}

function spawnBubbles(el) {
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('span');
    b.style.setProperty('--i', i);
    el.append(b);
  }
}
