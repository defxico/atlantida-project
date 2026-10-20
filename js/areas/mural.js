import { sortByDateDesc, filterByCategoria, formatDate } from '../lib/mural.js';
export const bare = true; // sem moldura de página: cartões em HUD

const CATEGORIAS = ['todos', 'Aviso', 'Pedido de ajuda', 'Oferta', 'Conhecimento', 'Amizade'];

const MORADOR = { setor: 'Morador', img: 'assets/img/avatar-morador.svg' };

const post = (p, a) => `
  <li class="msg" data-cat="${p.categoria}">
    <header class="msg__head"><b>${p.categoria}</b><time datetime="${p.data}">${formatDate(p.data)}</time></header>
    <div class="msg__body">
      <img class="post__avatar" src="${a.img}" alt="" loading="lazy">
      <div>
        <p class="msg__src"><strong>${a.nome}</strong><span>${a.setor}</span></p>
        <p class="msg__text">${p.texto}</p>
      </div>
    </div>
  </li>`;

export async function render(container) {
  const [posts, habitantes] = await Promise.all([
    fetch('data/mural.json').then(r => r.json()),
    fetch('data/habitantes.json').then(r => r.json()),
  ]);
  const autores = Object.fromEntries(habitantes.map(h => [h.id, h]));

  container.innerHTML = `
    <div class="mural">
      <h2 id="panel-title" class="sr-only">Mural da Comunidade</h2>
      <p class="map__hint">Transmissões da comunidade</p>
      <div class="mural__filters" role="group" aria-label="Filtrar por categoria">
        ${CATEGORIAS.map(c => `<button type="button" class="map__node mural__chip" data-cat="${c}" aria-pressed="${c === 'todos'}">${c === 'todos' ? 'Todos' : c}</button>`).join('')}
      </div>
      <p class="sr-only" role="status"></p>
      <ol class="feed"></ol>
    </div>`;

  const feed = container.querySelector('.feed');
  const status = container.querySelector('[role="status"]');
  const draw = cat => {
    const items = filterByCategoria(sortByDateDesc(posts), cat);
    feed.innerHTML = items.map(p => post(p, autores[p.autorId] ?? { ...MORADOR, nome: p.autor })).join('')
      || '<li class="feed__empty">Nenhuma publicação nessa categoria.</li>';
    status.textContent = (items.length === 1 ? '1 publicação' : `${items.length} publicações`) + (cat !== 'todos' ? ` em ${cat}` : '');
  };

  container.querySelector('.mural__filters').addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    container.querySelectorAll('.mural__chip').forEach(c => {
      c.setAttribute('aria-pressed', String(c === btn));
      c.classList.toggle('is-active', c === btn);
    });
    draw(btn.dataset.cat);
  });

  container.querySelector('.mural__chip').classList.add('is-active');
  draw('todos');
}
