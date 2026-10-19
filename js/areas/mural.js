import { sortByDateDesc, filterByCategoria, formatDate } from '../lib/mural.js';

const CATEGORIAS = ['todos', 'Aviso', 'Pedido de ajuda', 'Oferta', 'Conhecimento', 'Amizade'];

const post = (p, a) => `
  <li class="post">
    <img class="post__avatar" src="${a.img}" alt="" loading="lazy">
    <div>
      <p class="post__meta"><strong>${a.nome}</strong> · ${a.setor} · <time datetime="${p.data}">${formatDate(p.data)}</time></p>
      <span class="tag" data-cat="${p.categoria}">${p.categoria}</span>
      <p>${p.texto}</p>
    </div>
  </li>`;

export async function render(container) {
  const [posts, habitantes] = await Promise.all([
    fetch('data/mural.json').then(r => r.json()),
    fetch('data/habitantes.json').then(r => r.json()),
  ]);
  const autores = Object.fromEntries(habitantes.map(h => [h.id, h]));

  container.innerHTML = `
    <header class="panel__header">
      <p class="eyebrow">O coração da convivência</p>
      <h2 id="panel-title">Mural da Comunidade</h2>
      <p class="lead">Avisos, recados, pedidos e novidades de quem vive em Atlântida. Juntos, fazemos a cidade mais forte.</p>
    </header>
    <div class="filters" role="group" aria-label="Filtrar por categoria">
      ${CATEGORIAS.map(c => `<button type="button" class="chip" data-cat="${c}" aria-pressed="${c === 'todos'}">${c === 'todos' ? 'Todos' : c}</button>`).join('')}
    </div>
    <ol class="feed" aria-live="polite"></ol>`;

  const feed = container.querySelector('.feed');
  const draw = cat => {
    const items = filterByCategoria(sortByDateDesc(posts), cat);
    feed.innerHTML = items.map(p => post(p, autores[p.autorId])).join('')
      || '<li class="feed__empty">Nenhuma publicação nessa categoria.</li>';
  };

  container.querySelector('.filters').addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    container.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === btn)));
    draw(btn.dataset.cat);
  });

  draw('todos');
}
