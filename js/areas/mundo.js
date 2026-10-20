export const bare = true; // sem moldura de página: só o holograma e elementos do HUD

export async function render(container) {
  const m = await fetch('data/mundo.json').then(r => r.json());
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  container.innerHTML = `
    <div class="mundo">
      <h2 id="panel-title" class="sr-only">O Mundo — mapa holográfico de Atlântida</h2>
      <div class="map-stage">
        <div class="map">
          <video class="map__video" src="${m.video}" poster="${m.poster}" muted loop playsinline preload="metadata" aria-hidden="true"></video>
          ${m.setores.map(s => `<button type="button" class="map__node${s.estado === 'fechado' ? ' is-closed' : ''}" style="--x:${s.x};--y:${s.y}" data-id="${s.id}" aria-haspopup="true" aria-expanded="false">${s.nome}</button>`).join('')}
        </div>
        <section class="map__card" role="region" aria-live="polite" hidden>
          <header class="hud__msg-head"><b>Atlântida · Mapa</b><span>Rede Náutilus</span></header>
          <div class="map__card-body">
            <p class="tx__src"><b></b><span></span></p>
            <p class="tx__text"></p>
          </div>
          <footer class="tx__foot"><span></span><button type="button" class="map__card-close">Fechar ✕</button></footer>
        </section>
      </div>
      <p class="map__hint">Navegue pelos nomes dos setores</p>
      <ul class="map__legend"aria-label="Legenda do mapa">
        ${m.legenda.map(l => `<li><i class="map__key map__key--${l.tipo}" aria-hidden="true"></i>${l.texto}</li>`).join('')}
      </ul>
    </div>`;

  const card = container.querySelector('.map__card');
  const nodes = [...container.querySelectorAll('.map__node')];
  const src = card.querySelector('.tx__src');
  const text = card.querySelector('.tx__text');
  let active = null;

  const close = ({ refocus = true } = {}) => {
    if (!active) return;
    const n = active;
    active = null;
    nodes.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-expanded', 'false'); });
    card.hidden = true;
    if (refocus) n.focus();
  };

  // a caixa abre ao lado do domo (não sobre ele): à direita na metade esquerda do mapa, à esquerda na metade direita
  const stage = container.querySelector('.map-stage');
  const mobile = matchMedia('(max-width: 767px)');
  const DOMO = 11; // meia largura de um domo, em % da largura do mapa
  const place = s => {
    card.style.left = card.style.right = card.style.top = '';
    if (mobile.matches) return;
    if (s.x <= 50) card.style.left = `calc(${s.x + DOMO}% + 12px)`;
    else card.style.right = `calc(${100 - s.x + DOMO}% + 12px)`;
    const h = card.offsetHeight / 2;
    card.style.top = `${Math.min(Math.max(s.y / 100 * stage.clientHeight, h), stage.clientHeight - h)}px`;
  };

  const open = node => {
    const s = m.setores.find(x => x.id === node.dataset.id);
    nodes.forEach(x => { const on = x === node; x.classList.toggle('is-active', on); x.setAttribute('aria-expanded', String(on)); });
    active = node;
    card.dataset.tipo = s.estado === 'fechado' ? 'alerta' : 'info';
    card.dataset.lado = s.x <= 50 ? 'dir' : 'esq';
    src.firstChild.textContent = s.regiao;
    src.lastChild.textContent = s.titulo;
    text.textContent = s.texto;
    card.hidden = false;
    place(s);
    if (!reduce) gsap.fromTo(card, { opacity: 0, x: s.x <= 50 ? -24 : 24 }, { opacity: 1, x: 0, duration: .35, ease: 'power3.out', clearProps: 'transform' });
  };

  nodes.forEach(n => n.addEventListener('click', () => (n === active ? close() : open(n))));
  card.querySelector('.map__card-close').addEventListener('click', () => close());
  container.addEventListener('keydown', e => {
    if (e.key === 'Escape' && active) { e.stopPropagation(); close(); }
  });

  const video = container.querySelector('.map__video');
  if (video && !reduce) video.play().catch(() => {});
}
