export function initScene() {
  const video = document.getElementById('scene-video');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const booting = document.documentElement.classList.contains('will-boot');
  if (!reduce && !booting) video.play().catch(() => {});

  const out = document.getElementById('hud-depth');
  if (!reduce) {
    const d = { v: 0 };
    gsap.to(d, {
      v: 2, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1,
      onUpdate: () => { out.textContent = (3000 + Math.round(d.v)).toLocaleString('pt-BR'); },
    });
  }

  const rate = { v: 1 };
  return {
    video,
    setSpeed(n) {
      if (reduce) return;
      gsap.to(rate, { v: n, duration: .6, overwrite: true, onUpdate: () => { video.playbackRate = Math.max(.1, rate.v); } });
    },
  };
}
