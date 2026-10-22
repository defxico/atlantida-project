import { esc } from './lib/html.js';
import { formatDate } from './lib/mural.js';
import { TIPOS, DIFICULDADES, repDe, nivel, ocupadas, temVaga, filtrar, validarMissao } from './lib/missoes.js';

const STORE = 'nautilus.missoes';
const BARRAS = { 'Fácil': 1, 'Média': 2, 'Difícil': 3 };
const CANAIS = [['email', '@', 'E-mail'], ['linkedin', 'in', 'LinkedIn'], ['github', 'gh', 'GitHub']];
const VISITANTE = { setor: 'Visitante · FIAP NEXT' };
const iniciais = nome => nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';

const load = () => {
  try { return { embarcadas: [], criadas: [], ...JSON.parse(localStorage.getItem(STORE)) }; } catch { return { embarcadas: [], criadas: [] }; }
};
const save = s => {
  try { localStorage.setItem(STORE, JSON.stringify(s)); } catch { /* sem armazenamento: vale só nesta sessão */ }
};

const href = (canal, v) => canal === 'email' ? `mailto:${v}` : /^https?:/.test(v) ? v : `https://${v}`;

export function mountMissoes(pane, { fixas, habitantes }) {
  const autores = Object.fromEntries(habitantes.map(h => [h.id, h]));
  const state = load();
  const filtro = { tipo: 'todas', comVagas: false };
  const todas = () => [...state.criadas, ...fixas];
  const rep = () => todas().filter(m => state.embarcadas.includes(m.id)).reduce((t, m) => t + repDe(m), 0);

  const avatar = (id, cls = 'mis__av', nome = 'Você') => {
    const h = autores[id];
    return h ? `<img class="${cls}" src="${h.img}" alt="${esc(h.nome)}" title="${esc(h.nome)}">`
      : `<span class="${cls} mis__av--voce" title="${esc(nome)}">${esc(iniciais(nome))}</span>`;
  };

  const card = (m, { previa = false } = {}) => {
    const a = autores[m.autorId] ?? { ...VISITANTE, nome: m.autor };
    const a_bordo = state.embarcadas.includes(m.id);
    const ids = [...m.tripulacao, ...(a_bordo ? ['voce'] : [])];
    const slots = Array.from({ length: Math.min(m.vagas, 6) }, (_, i) => ids[i] ? avatar(ids[i]) : '<span class="mis__av mis__av--vaga"></span>').join('');
    const canais = CANAIS.filter(([k]) => m.contato?.[k]).map(([k, sigla, nome]) => a_bordo
      ? `<a class="mis__canal is-on" href="${esc(href(k, m.contato[k]))}" target="_blank" rel="noopener" title="${nome}: ${esc(m.contato[k])}">${sigla}</a>`
      : `<span class="mis__canal" title="${nome}: liberado ao embarcar">${sigla}</span>`).join('');
    const cheia = !temVaga(m, a_bordo);
    const botao = previa ? '<button type="button" class="mis__btn" disabled>Embarcar na missão</button>'
      : cheia ? '<button type="button" class="mis__btn" disabled>Tripulação completa</button>'
      : `<button type="button" class="mis__btn${a_bordo ? ' is-on' : ''}" data-embarcar="${esc(m.id)}" aria-pressed="${a_bordo}">${a_bordo ? 'A bordo ✓' : 'Embarcar na missão'}</button>`;
    return `
      <li class="mis" data-dif="${m.dificuldade}">
        <header class="mis__head"><b>Missão ${esc(m.id)} · ${esc(m.tipo)}</b>
          <span class="mis__dif">${'<i></i>'.repeat(BARRAS[m.dificuldade])}${m.dificuldade}</span></header>
        <div class="mis__body">
          <div class="mis__autor">${avatar(m.autorId, 'mis__av', m.autor)}<p><strong>${esc(a.nome)}</strong><span>${esc(a.funcao ? `${a.funcao} · ${a.setor}` : a.setor)} · ${formatDate(m.data)}</span></p></div>
          <h3 class="mis__titulo">${esc(m.titulo)}</h3>
          <p class="mis__texto">${esc(m.texto)}</p>
          <p class="mis__tags">${m.habilidades.map(t => `<span>${esc(t)}</span>`).join('')}</p>
        </div>
        <footer class="mis__foot">
          <div class="mis__crew">${slots}<span>${ocupadas(m, a_bordo)}/${m.vagas} membros</span></div>
          <div class="mis__canais">${canais}</div>
          <span class="mis__rep">+${repDe(m)} REP</span>${botao}
        </footer>
      </li>`;
  };

  pane.innerHTML = `
    <div class="mis__bar">
      <div class="mural__filters" role="group" aria-label="Filtrar missões">
        ${['todas', ...TIPOS].map(t => `<button type="button" class="map__node mural__chip${t === 'todas' ? ' is-active' : ''}" data-tipo="${t}" aria-pressed="${t === 'todas'}">${t === 'todas' ? 'Todas' : t}</button>`).join('')}
        <button type="button" class="map__node mural__chip" data-vagas aria-pressed="false">Com vagas</button>
      </div>
      <div class="mis__acoes"><span class="mis__nivel" aria-live="polite"></span><button type="button" class="vform__send mis__nova">+ Nova missão</button></div>
    </div>
    <p class="mis__passos"><b>1</b> Publique uma missão <i>›</i> <b>2</b> Habitantes embarcam <i>›</i> <b>3</b> Conectem-se: e-mail, LinkedIn e GitHub liberados a bordo</p>
    <p class="sr-only" role="status"></p>
    <ol class="feed mis__feed"></ol>
    <form class="mform" novalidate hidden>
      <div class="mform__campos">
        <label class="vform__f"><span>Seu nome</span><input name="autor" maxlength="60" autocomplete="name" placeholder="Como você quer aparecer na missão"></label>
        <label class="vform__f"><span>Título</span><input name="titulo" maxlength="80" placeholder="Ex.: Montar um bot para a Rede Náutilus"></label>
        <div class="mform__trio">
          <label class="vform__f"><span>Tipo</span><select name="tipo">${TIPOS.map(t => `<option>${t}</option>`).join('')}</select></label>
          <label class="vform__f"><span>Dificuldade</span><select name="dificuldade">${Object.keys(DIFICULDADES).map(d => `<option>${d}</option>`).join('')}</select></label>
          <label class="vform__f"><span>Membros</span><input name="vagas" type="number" min="2" max="8" value="3"></label>
        </div>
        <label class="vform__f"><span>Texto</span><textarea name="texto" rows="3" maxlength="400" placeholder="O que vocês vão construir, estudar ou resolver juntos?"></textarea></label>
        <label class="vform__f"><span>Habilidades buscadas (separe por vírgula)</span><input name="habilidades" maxlength="80" placeholder="Ex.: React, Design, Biologia"></label>
        <div class="mform__trio">
          ${CANAIS.map(([k, , nome]) => `<label class="vform__f"><span>${nome}</span><input name="${k}" maxlength="80" placeholder="${k === 'email' ? 'seu@email.com' : k + '.com/seu-usuario'}"></label>`).join('')}
        </div>
        <p class="vform__err" aria-live="polite"></p>
        <div class="mform__btns"><button class="vform__send" type="submit">Publicar missão</button><button type="button" class="mform__cancel">Cancelar</button></div>
      </div>
      <div class="mform__previa"><p class="mis__passos">Prévia no mural</p><ol class="feed mform__card"></ol></div>
    </form>`;

  const feed = pane.querySelector('.mis__feed');
  const status = pane.querySelector('[role="status"]');
  const form = pane.querySelector('.mform');
  const err = form.querySelector('.vform__err');
  const nivelEl = pane.querySelector('.mis__nivel');
  const bar = pane.querySelector('.mis__bar');
  const passos = pane.querySelector('.mis__passos');

  const draw = () => {
    const lista = filtrar(todas(), filtro, state.embarcadas);
    feed.innerHTML = lista.map(m => card(m)).join('') || '<li class="feed__empty">Nenhuma missão com esse filtro.</li>';
    status.textContent = `${lista.length} ${lista.length === 1 ? 'missão' : 'missões'} no mural`;
    const r = rep();
    nivelEl.textContent = `NV ${nivel(r)} · ${r} REP`;
  };

  const valores = () => {
    const f = form.elements;
    const get = n => f[n].value;
    return { autor: get('autor'), titulo: get('titulo'), tipo: get('tipo'), dificuldade: get('dificuldade'), vagas: get('vagas'), texto: get('texto'),
      habilidades: get('habilidades'), contato: { email: get('email'), linkedin: get('linkedin'), github: get('github') } };
  };
  const paraMissao = (v, id) => ({
    id, autor: v.autor.trim() || 'Você', data: new Date().toLocaleDateString('sv'), tipo: v.tipo, dificuldade: v.dificuldade,
    vagas: Number(v.vagas) || 3, tripulacao: [],
    titulo: v.titulo.trim() || 'Título da missão', texto: v.texto.trim() || 'Descreva o que a tripulação vai fazer junta.',
    habilidades: v.habilidades.split(',').map(s => s.trim()).filter(Boolean),
    contato: Object.fromEntries(Object.entries(v.contato).map(([k, x]) => [k, x.trim()]).filter(([, x]) => x)),
  });
  const previa = () => { form.querySelector('.mform__card').innerHTML = card(paraMissao(valores(), 'RN-0000'), { previa: true }); };

  const abrirForm = aberto => {
    form.hidden = !aberto;
    feed.hidden = bar.hidden = passos.hidden = aberto;
    if (aberto) { previa(); form.elements.titulo.focus(); }
  };

  pane.querySelector('.mural__filters').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if ('vagas' in b.dataset) {
      filtro.comVagas = !filtro.comVagas;
      b.classList.toggle('is-active', filtro.comVagas);
      b.setAttribute('aria-pressed', String(filtro.comVagas));
    } else {
      filtro.tipo = b.dataset.tipo;
      pane.querySelectorAll('[data-tipo]').forEach(c => { c.classList.toggle('is-active', c === b); c.setAttribute('aria-pressed', String(c === b)); });
    }
    draw();
  });

  feed.addEventListener('click', e => {
    const b = e.target.closest('[data-embarcar]');
    if (!b) return;
    const id = b.dataset.embarcar;
    state.embarcadas = state.embarcadas.includes(id) ? state.embarcadas.filter(x => x !== id) : [...state.embarcadas, id];
    save(state);
    draw();
    feed.querySelector(`[data-embarcar="${CSS.escape(id)}"]`)?.focus();
  });

  pane.querySelector('.mis__nova').addEventListener('click', () => abrirForm(true));
  form.querySelector('.mform__cancel').addEventListener('click', () => { abrirForm(false); pane.querySelector('.mis__nova').focus(); });
  form.addEventListener('input', previa);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = valores();
    err.textContent = validarMissao(v);
    if (err.textContent) return;
    const id = `RN-${String(Math.floor(1000 + Math.random() * 9000))}`;
    state.criadas = [paraMissao(v, id), ...state.criadas];
    save(state);
    form.reset();
    err.textContent = '';
    abrirForm(false);
    draw();
    feed.scrollTop = 0;
  });

  draw();
}
