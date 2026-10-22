import { esc } from '../lib/html.js';
import { responder, BOAS_VINDAS } from '../lib/nautilos.js';
export const bare = true; // sem moldura de página: tela de IA em HUD

const SUGESTOES = ['O que houve no Residencial A?', 'Quem é Kael Vetra?', 'Como funcionam as linhas de transporte?'];
const MIN_PENSANDO = 1100; // a IA "pensa" ao menos isso, mesmo com resposta imediata
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function render(container) {
  const [setores, habitantes] = await Promise.all([
    fetch('data/mundo.json').then(r => r.json()).then(m => m.setores),
    fetch('data/habitantes.json').then(r => r.json()),
  ]);

  container.innerHTML = `
    <div class="portal">
      <h2 id="panel-title" class="sr-only">Fale com o Portal: conversa com o Náutilos IA</h2>
      <p class="map__hint">Converse com o Náutilos</p>
      <section class="ia" aria-label="Conversa com o Náutilos IA">
        <div class="ia__orb" data-state="idle" aria-hidden="true">
          <i class="ia__ring"></i><i class="ia__ring"></i><i class="ia__ring"></i>
          <span class="ia__core"></span>
        </div>
        <p class="ia__status">Náutilos IA · <span>online</span></p>
        <div class="ia__log" role="log" aria-live="polite"></div>
        <div class="ia__sugestoes">${SUGESTOES.map(s => `<button type="button">${esc(s)}</button>`).join('')}</div>
        <form class="ia__form" novalidate>
          <input name="msg" type="text" maxlength="240" autocomplete="off" placeholder="Pergunte algo ao Náutilos…" aria-label="Sua mensagem para o Náutilos">
          <button type="submit" aria-label="Enviar mensagem">➤</button>
        </form>
      </section>
    </div>`;

  const orb = container.querySelector('.ia__orb');
  const status = container.querySelector('.ia__status span');
  const log = container.querySelector('.ia__log');
  const form = container.querySelector('.ia__form');
  const input = form.elements.msg;
  const sugestoes = container.querySelector('.ia__sugestoes');
  const STATUS = { idle: 'online', listening: 'ouvindo', thinking: 'processando', speaking: 'transmitindo' };
  let ocupado = false;
  let vivo = true;

  const estado = s => { orb.dataset.state = s; status.textContent = STATUS[s]; };
  const addMsg = (quem, texto = '') => {
    const p = document.createElement('p');
    p.className = `ia__msg ia__msg--${quem}`;
    p.textContent = texto;
    log.append(p);
    log.scrollTop = log.scrollHeight;
    return p;
  };

  // escreve a resposta aos poucos e faz o círculo "falar" no ritmo do texto
  const digitar = async (el, texto) => {
    if (reduce) { el.textContent = texto; return; }
    for (let i = 1; i <= texto.length && vivo; i++) {
      el.textContent = texto.slice(0, i);
      if (i % 3 === 0) orb.style.setProperty('--lvl', (0.25 + Math.random() * 0.75).toFixed(2));
      log.scrollTop = log.scrollHeight;
      await new Promise(r => setTimeout(r, 18));
    }
    orb.style.setProperty('--lvl', 0);
  };

  const falar = async texto => {
    estado('speaking');
    await digitar(addMsg('ia'), texto);
    if (vivo) estado('idle');
  };

  const enviar = async texto => {
    if (ocupado || !texto.trim()) return;
    ocupado = true;
    input.value = '';
    input.disabled = true;
    sugestoes.hidden = true;
    addMsg('eu', texto.trim());
    estado('thinking');
    const [resposta] = await Promise.all([responder(texto, { setores, habitantes }), new Promise(r => setTimeout(r, reduce ? 0 : MIN_PENSANDO))]);
    if (!vivo) return;
    await falar(resposta);
    ocupado = false;
    input.disabled = false;
    input.focus();
  };

  form.addEventListener('submit', e => { e.preventDefault(); enviar(input.value); });
  input.addEventListener('input', () => { if (!ocupado) estado(input.value.trim() ? 'listening' : 'idle'); });
  sugestoes.addEventListener('click', e => { const b = e.target.closest('button'); if (b) enviar(b.textContent); });

  // se o painel for fechado no meio de uma resposta, para de escrever
  new MutationObserver(() => { if (!container.isConnected) vivo = false; }).observe(document.body, { childList: true, subtree: true });

  ocupado = true;
  await new Promise(r => setTimeout(r, reduce ? 0 : 500));
  await falar(BOAS_VINDAS);
  ocupado = false;
}
