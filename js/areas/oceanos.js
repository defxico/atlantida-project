import { renderMapa } from '../lib/holomapa.js';
import { resultado } from '../lib/quiz.js';
import { esc } from '../lib/html.js';
export const bare = true; // sem moldura de página: mapa holográfico e quiz em HUD

const DICA_MAPA = 'Navegue pelos cinco oceanos';
const DICA_QUIZ = 'Descubra sua nacionalidade oceânica';

const ficha = p => `
  <p class="tx__src"><b>${esc(p.regiao)}</b><span>${esc(p.titulo)}</span></p>
  <p class="tx__text">${esc(p.texto)}</p>
  <dl class="oc__dados">${p.dados.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <p class="oc__curio"><b>Curiosidade</b> ${esc(p.curiosidade)}</p>`;

export async function render(container) {
  const o = await fetch('data/oceanos.json').then(r => r.json());
  const mapa = renderMapa(container, {
    titulo: 'Os Cinco Oceanos — guia dos oceanos do planeta',
    dica: DICA_MAPA,
    cabecalho: 'Oceanos · Arquivo',
    imagem: o.imagem,
    pontos: o.pontos,
    folga: 7,
    ficha,
  });

  const holo = container.querySelector('.holo');
  const stage = holo.querySelector('.map-stage');
  const dica = holo.querySelector('.map__hint');
  holo.insertAdjacentHTML('beforeend', `
    <button type="button" class="mis__btn oc__modo" data-dock-left aria-pressed="false">Qual é o seu oceano?</button>`);
  stage.insertAdjacentHTML('afterend', `
    <section class="ficha quiz" aria-labelledby="quiz-q" hidden>
      <header class="ficha__head"><b>Rede Náutilus / Horóscopo dos oceanos</b><span class="quiz__passo"></span></header>
      <div class="quiz__main">
        <div class="quiz__corpo" aria-live="polite"></div>
        <figure class="quiz__qr">
          <img src="${o.quiz.qr}" alt="QR code">
          <figcaption>${esc(o.quiz.qrLegenda)}</figcaption>
        </figure>
      </div>
    </section>`);

  const quiz = holo.querySelector('.quiz');
  const corpo = quiz.querySelector('.quiz__corpo');
  const passo = quiz.querySelector('.quiz__passo');
  const modo = holo.querySelector('.oc__modo');
  const perguntas = o.quiz.perguntas;
  const porId = Object.fromEntries(o.pontos.map(p => [p.id, p]));
  let escolhas = [];

  // sem o arquivo do QR, fica um espaço reservado
  const qrImg = quiz.querySelector('.quiz__qr img');
  qrImg.addEventListener('error', () => qrImg.replaceWith(Object.assign(document.createElement('span'), { className: 'quiz__qr-vago', textContent: 'QR code' })), { once: true });

  const foca = () => corpo.querySelector('h3').focus();

  const pergunta = () => {
    const i = escolhas.length;
    const q = perguntas[i];
    passo.textContent = `Pergunta ${i + 1} / ${perguntas.length}`;
    corpo.innerHTML = `
      <h3 id="quiz-q" class="quiz__q" tabindex="-1">${esc(q.texto)}</h3>
      <div class="quiz__opcoes" role="group" aria-labelledby="quiz-q">
        ${q.opcoes.map(op => `<button type="button" class="quiz__op" data-oceano="${op.oceano}">${esc(op.texto)}</button>`).join('')}
      </div>`;
  };

  const final = () => {
    const p = porId[resultado(escolhas)];
    const par = porId[p.signo.combina];
    passo.textContent = 'Resultado';
    corpo.innerHTML = `
      <p class="ficha__reg">Sua nacionalidade oceânica</p>
      <h3 id="quiz-q" class="quiz__q quiz__res" tabindex="-1">${esc(p.titulo)}</h3>
      <p class="ficha__txt">${esc(p.signo.perfil)}</p>
      <dl class="ficha__dados">
        <div><dt>Criatura-guia</dt><dd>${esc(p.signo.guia)}</dd></div>
        <div><dt>Combina com</dt><dd>${esc(par.titulo)}</dd></div>
      </dl>
      <div class="quiz__acoes">
        <button type="button" class="mis__btn" data-ver="${p.id}">Ver no mapa</button>
        <button type="button" class="mform__cancel" data-refazer>Refazer</button>
      </div>`;
  };

  const mostrar = emQuiz => {
    mapa.fechar();
    stage.hidden = emQuiz;
    quiz.hidden = !emQuiz;
    dica.textContent = emQuiz ? DICA_QUIZ : DICA_MAPA;
    modo.textContent = emQuiz ? 'Ver o mapa' : 'Qual é o seu oceano?';
    modo.setAttribute('aria-pressed', String(emQuiz));
    if (emQuiz) { escolhas = []; pergunta(); foca(); }
  };

  modo.addEventListener('click', () => mostrar(quiz.hidden));
  corpo.addEventListener('click', e => {
    const op = e.target.closest('[data-oceano]');
    if (op) {
      escolhas.push(op.dataset.oceano);
      if (escolhas.length < perguntas.length) pergunta(); else final();
      foca();
    } else if (e.target.closest('[data-refazer]')) {
      escolhas = [];
      pergunta();
      foca();
    } else if (e.target.closest('[data-ver]')) {
      const id = e.target.closest('[data-ver]').dataset.ver;
      mostrar(false);
      mapa.abrir(id);
    }
  });
}
