import { esc } from './html.js';

const fichaPadrao = p => `
  <p class="tx__src"><b>${esc(p.regiao)}</b><span>${esc(p.titulo)}</span></p>
  <p class="tx__text">${esc(p.texto)}</p>`;

// Mapa holográfico: fundo (vídeo ou imagem) com pontos em HUD; cada ponto abre uma caixa ao lado dele.
// cfg: titulo, dica, cabecalho, video+poster ou imagem, pontos [{ id, nome, x, y, estado? }], legenda?, folga?, ficha?(ponto)
export function renderMapa(container, cfg) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fundo = cfg.video
    ? `<video class="map__video" src="${cfg.video}" poster="${cfg.poster}" muted loop playsinline preload="metadata" aria-hidden="true"></video>`
    : `<img class="map__video" src="${cfg.imagem}" alt="">`;
  const ficha = cfg.ficha ?? fichaPadrao;

  container.innerHTML = `
    <div class="holo">
      <h2 id="panel-title" class="sr-only">${esc(cfg.titulo)}</h2>
      <div class="map-stage">
        <div class="map">
          ${fundo}
          ${cfg.pontos.map(p => `<button type="button" class="map__node${p.estado === 'fechado' ? ' is-closed' : ''}" style="--x:${p.x};--y:${p.y}" data-id="${p.id}" aria-haspopup="true" aria-expanded="false">${esc(p.nome)}</button>`).join('')}
        </div>
        <section class="map__card" role="region" aria-live="polite" hidden>
          <header class="hud__msg-head"><b>${esc(cfg.cabecalho)}</b><span>Rede Náutilus</span></header>
          <div class="map__card-body"></div>
          <footer class="tx__foot"><span></span><button type="button" class="map__card-close">Fechar ✕</button></footer>
        </section>
      </div>
      <p class="map__hint">${esc(cfg.dica)}</p>
      ${cfg.legenda ? `<ul class="map__legend" aria-label="Legenda do mapa">
        ${cfg.legenda.map(l => `<li><i class="map__key map__key--${l.tipo}" aria-hidden="true"></i>${esc(l.texto)}</li>`).join('')}
      </ul>` : ''}
    </div>`;

  const card = container.querySelector('.map__card');
  const nodes = [...container.querySelectorAll('.map__node')];
  const corpo = card.querySelector('.map__card-body');
  let active = null;

  const close = ({ refocus = true } = {}) => {
    if (!active) return;
    const n = active;
    active = null;
    nodes.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-expanded', 'false'); });
    card.hidden = true;
    if (refocus) n.focus();
  };

  // a caixa abre ao lado do ponto (não sobre ele): à direita na metade esquerda do mapa, à esquerda na metade direita
  const stage = container.querySelector('.map-stage');
  const mobile = matchMedia('(max-width: 767px)');
  const FOLGA = cfg.folga ?? 11; // meia largura do que fica em volta do ponto, em % da largura do mapa
  const place = p => {
    card.style.left = card.style.right = card.style.top = '';
    if (mobile.matches) return;
    if (p.x <= 50) card.style.left = `calc(${p.x + FOLGA}% + 12px)`;
    else card.style.right = `calc(${100 - p.x + FOLGA}% + 12px)`;
    const h = card.offsetHeight / 2;
    card.style.top = `${Math.min(Math.max(p.y / 100 * stage.clientHeight, h), stage.clientHeight - h)}px`;
  };

  const open = node => {
    const p = cfg.pontos.find(x => x.id === node.dataset.id);
    nodes.forEach(x => { const on = x === node; x.classList.toggle('is-active', on); x.setAttribute('aria-expanded', String(on)); });
    active = node;
    card.dataset.tipo = p.estado === 'fechado' ? 'alerta' : 'info';
    corpo.innerHTML = ficha(p);
    card.hidden = false;
    place(p);
    if (!reduce) gsap.fromTo(card, { opacity: 0, x: p.x <= 50 ? -24 : 24 }, { opacity: 1, x: 0, duration: .35, ease: 'power3.out', clearProps: 'transform' });
  };

  nodes.forEach(n => n.addEventListener('click', () => (n === active ? close() : open(n))));
  card.querySelector('.map__card-close').addEventListener('click', () => close());
  container.addEventListener('keydown', e => {
    if (e.key === 'Escape' && active) { e.stopPropagation(); close(); }
  });

  const video = container.querySelector('video.map__video');
  if (video && !reduce) video.play().catch(() => {});

  return {
    abrir: id => open(nodes.find(n => n.dataset.id === id)),
    fechar: () => close({ refocus: false }),
  };
}
