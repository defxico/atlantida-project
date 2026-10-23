import { sortByDateDesc, filterByCategoria, formatDate } from '../lib/mural.js';
import { validateField } from '../lib/validate.js';
import { esc } from '../lib/html.js';
import { mountMissoes } from '../missoes.js';
import { loadVisitantes, saveVisitantes } from '../lib/visitantes.js';
export const bare = true; // sem moldura de página: cartões em HUD

const CATEGORIAS = ['todos', 'Personalidades do mês', 'Aviso', 'Pedido de ajuda', 'Oferta', 'Conhecimento', 'Amizade', 'Visitantes'];
const VISITANTES = 'Visitantes';
const PERSONALIDADES = 'Personalidades do mês'; // posts dos 6 habitantes; não é um tipo de mensagem
const TIPOS = CATEGORIAS.slice(2, -1);

const MORADOR = { setor: 'Morador', img: 'assets/img/avatar-morador.svg' };
const VISITANTE = { setor: 'Visitante · FIAP NEXT', img: 'assets/img/avatar-morador.svg' };

const post = (p, a) => `
  <li class="msg" data-cat="${esc(p.categoria)}">
    <header class="msg__head"><b>${esc(p.categoria)}${p.tipo ? ` · ${esc(p.tipo)}` : ''}</b><time datetime="${p.data}">${formatDate(p.data)}</time></header>
    <div class="msg__body">
      <img class="post__avatar" src="${a.img}" alt="" loading="lazy">
      <div>
        <p class="msg__src"><strong>${esc(a.nome)}</strong><span>${a.setor}</span></p>
        <p class="msg__text">${esc(p.texto)}</p>
      </div>
    </div>
  </li>`;

export async function render(container) {
  const [fixos, habitantes, missoes] = await Promise.all([
    fetch('data/mural.json').then(r => r.json()),
    fetch('data/habitantes.json').then(r => r.json()),
    fetch('data/missoes.json').then(r => r.json()),
  ]);
  const autores = Object.fromEntries(habitantes.map(h => [h.id, h]));
  let visitantes = loadVisitantes();

  container.innerHTML = `
    <div class="mural">
      <h2 id="panel-title" class="sr-only">Mural da Comunidade</h2>
      <p class="map__hint">Missões da comunidade</p>
      <div class="mural__modes" role="group" aria-label="Seção do mural">
        <button type="button" class="map__node mural__mode is-active" data-modo="missoes" aria-pressed="true">Missões</button>
        <button type="button" class="map__node mural__mode" data-modo="recados" aria-pressed="false">Recados</button>
      </div>
      <div class="mural__pane" data-pane="missoes"></div>
      <div class="mural__pane" data-pane="recados" hidden>
      <div class="mural__filters" role="group" aria-label="Filtrar por categoria">
        ${CATEGORIAS.map(c => `<button type="button" class="map__node mural__chip" data-cat="${c}" aria-pressed="${c === 'todos'}">${c === 'todos' ? 'Todos' : c}</button>`).join('')}
      </div>
      <form class="vform" novalidate hidden>
        <div class="vform__row">
          <label class="vform__f"><span>Seu nome</span><input name="nome" type="text" maxlength="40" autocomplete="name" aria-describedby="vf-err"></label>
          <label class="vform__f"><span>Tipo</span><select name="tipo" aria-describedby="vf-err"><option value="">Selecione</option>${TIPOS.map(t => `<option>${t}</option>`).join('')}</select></label>
          <label class="vform__f vform__f--msg"><span>Sua mensagem</span><textarea name="mensagem" rows="2" maxlength="280" aria-describedby="vf-err"></textarea></label>
          <button class="vform__send" type="submit">Transmitir</button>
        </div>
        <p class="vform__err" id="vf-err" aria-live="polite"></p>
      </form>
      <p class="sr-only" role="status"></p>
      <ol class="feed"></ol>
      </div>
    </div>`;

  const rec = container.querySelector('[data-pane="recados"]');
  const hint = container.querySelector('.map__hint');
  const feed = rec.querySelector('.feed');
  const status = rec.querySelector('[role="status"]');
  const form = rec.querySelector('.vform');
  const err = rec.querySelector('#vf-err');
  let cat = 'todos';

  const draw = () => {
    const todos = [...visitantes.map(v => ({ ...v, categoria: VISITANTES })), ...fixos];
    const items = cat === PERSONALIDADES ? sortByDateDesc(fixos.filter(p => p.autorId)) : filterByCategoria(sortByDateDesc(todos), cat);
    feed.innerHTML = items.map(p => post(p, p.autorId ? autores[p.autorId] : { ...(p.categoria === VISITANTES ? VISITANTE : MORADOR), nome: p.autor })).join('')
      || `<li class="feed__empty">${cat === VISITANTES ? 'Nenhum visitante deixou mensagem ainda. Seja o primeiro!' : 'Nenhuma publicação nessa categoria.'}</li>`;
    status.textContent = (items.length === 1 ? '1 publicação' : `${items.length} publicações`) + (cat !== 'todos' ? ` em ${cat}` : '');
  };

  rec.querySelector('.mural__filters').addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    cat = btn.dataset.cat;
    rec.querySelectorAll('.mural__chip').forEach(c => {
      c.setAttribute('aria-pressed', String(c === btn));
      c.classList.toggle('is-active', c === btn);
    });
    form.hidden = cat !== VISITANTES;
    draw();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nome = form.elements.nome.value.trim();
    const texto = form.elements.mensagem.value.trim();
    const tipo = form.elements.tipo.value;
    const erros = { nome: validateField('nome', nome), tipo: validateField('tipo', tipo), mensagem: validateField('mensagem', texto) };
    const campo = Object.keys(erros).find(k => erros[k]);
    err.textContent = erros[campo] ?? '';
    if (campo) { form.elements[campo].focus(); return; }
    visitantes = [{ id: `v${Date.now()}`, autor: nome, tipo, data: new Date().toLocaleDateString('sv'), texto }, ...visitantes];
    saveVisitantes(visitantes);
    form.reset();
    draw();
    feed.scrollTop = 0;
  });

  rec.querySelector('.mural__chip').classList.add('is-active');
  draw();

  mountMissoes(container.querySelector('[data-pane="missoes"]'), { fixas: missoes, habitantes });

  container.querySelector('.mural__modes').addEventListener('click', e => {
    const b = e.target.closest('[data-modo]');
    if (!b) return;
    container.querySelectorAll('.mural__mode').forEach(m => { m.classList.toggle('is-active', m === b); m.setAttribute('aria-pressed', String(m === b)); });
    container.querySelectorAll('.mural__pane').forEach(p => { p.hidden = p.dataset.pane !== b.dataset.modo; });
    container.querySelector('.mural').classList.toggle('modo-recados', b.dataset.modo !== 'missoes');
    hint.textContent = b.dataset.modo === 'missoes' ? 'Missões da comunidade' : 'Transmissões da comunidade';
  });
}
