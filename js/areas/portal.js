import { esc } from '../lib/html.js';
import { responder, registrar, validarRegistro, BOAS_VINDAS } from '../lib/nautilos.js';
import { loadVisitantes, saveVisitantes } from '../lib/visitantes.js';
export const bare = true; // sem moldura de página: tela de IA em HUD

const SUGESTOES = ['O que houve no Residencial A?', 'Quem é Kael Vetra?', 'Como funcionam as linhas de transporte?'];
const MIN_PENSANDO = 1100; // a IA "pensa" ao menos isso, mesmo com resposta imediata
const REGISTROS = 'nautilus.registros';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const loadRegistros = () => {
  try { return JSON.parse(localStorage.getItem(REGISTROS)) ?? []; } catch { return []; }
};
const saveRegistros = list => {
  try { localStorage.setItem(REGISTROS, JSON.stringify(list)); } catch { /* sem armazenamento: vale só nesta sessão */ }
};

export async function render(container) {
  const [setores, habitantes] = await Promise.all([
    fetch('data/mundo.json').then(r => r.json()).then(m => m.setores),
    fetch('data/habitantes.json').then(r => r.json()),
  ]);
  let registros = loadRegistros();

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
        <button type="button" class="ia__reg">Registre-se no Náutilos</button>
        <div class="ia__chat">
          <div class="ia__log" role="log" aria-live="polite"></div>
          <div class="ia__sugestoes">${SUGESTOES.map(s => `<button type="button">${esc(s)}</button>`).join('')}</div>
          <form class="ia__form" novalidate>
            <input name="msg" type="text" maxlength="240" autocomplete="off" placeholder="Pergunte algo ao Náutilos…" aria-label="Sua mensagem para o Náutilos">
            <button type="submit" aria-label="Enviar mensagem">➤</button>
          </form>
        </div>
        <form class="ia__regform" novalidate hidden aria-label="Registro de novo habitante">
          <p class="ia__regtitulo">Registro de novo habitante</p>
          <div class="ia__regcampos">
            <label class="vform__f"><span>Nome do habitante</span><input name="nome" maxlength="60" autocomplete="name" aria-describedby="rg-nome"><em id="rg-nome" class="ia__err"></em></label>
            <label class="vform__f"><span>Setor onde vai morar</span><select name="setor" aria-describedby="rg-setor"><option value="">Selecione</option>${setores.map(s => `<option value="${esc(s.nome)}">${esc(s.nome)}${s.estado === 'fechado' ? ' (em manutenção)' : ''}</option>`).join('')}</select><em id="rg-setor" class="ia__err"></em></label>
            <label class="vform__f"><span>Ocupação ou talento</span><input name="ocupacao" maxlength="50" aria-describedby="rg-ocupacao"><em id="rg-ocupacao" class="ia__err"></em></label>
            <label class="vform__f"><span>Canal de retorno (e-mail)</span><input name="email" type="email" maxlength="80" autocomplete="email" aria-describedby="rg-email"><em id="rg-email" class="ia__err"></em></label>
            <label class="vform__f ia__regfull"><span>Como você ajuda a cidade?</span><input name="frase" maxlength="140" aria-describedby="rg-frase"><em id="rg-frase" class="ia__err"></em></label>
          </div>
          <div class="ia__regbtns"><button type="submit" class="vform__send">Enviar ao Náutilos</button><button type="button" class="mform__cancel">Cancelar</button></div>
        </form>
      </section>
    </div>`;

  const ia = container.querySelector('.ia');
  const orb = container.querySelector('.ia__orb');
  const status = container.querySelector('.ia__status span');
  const log = container.querySelector('.ia__log');
  const form = container.querySelector('.ia__form');
  const regForm = container.querySelector('.ia__regform');
  const regBtn = container.querySelector('.ia__reg');
  const input = form.elements.msg;
  const sugestoes = container.querySelector('.ia__sugestoes');
  const STATUS = { idle: 'online', listening: 'ouvindo', thinking: 'processando', speaking: 'transmitindo', erro: 'falha no sinal' };
  let ocupado = false;
  let vivo = true;
  const historico = []; // turnos enviados à IA para ela lembrar da conversa

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

  const falar = async (texto, final = 'idle') => {
    estado('speaking');
    await digitar(addMsg('ia'), texto);
    if (vivo) estado(final);
  };

  const pensar = async trabalho => {
    estado('thinking');
    const [resultado] = await Promise.all([trabalho, new Promise(r => setTimeout(r, reduce ? 0 : MIN_PENSANDO))]);
    return resultado;
  };

  const enviar = async texto => {
    if (ocupado || !texto.trim()) return;
    ocupado = true;
    input.value = '';
    input.disabled = true;
    sugestoes.hidden = true;
    addMsg('eu', texto.trim());
    const resposta = await pensar(responder(texto, { setores, habitantes }, historico));
    if (!vivo) return;
    historico.push({ role: 'user', content: texto.trim() }, { role: 'assistant', content: resposta });
    await falar(resposta);
    ocupado = false;
    input.disabled = false;
    input.focus();
  };

  // ---- registro de novo habitante ----
  const erros = (e = {}) => {
    for (const campo of ['nome', 'setor', 'ocupacao', 'email', 'frase']) {
      regForm.querySelector(`#rg-${campo}`).textContent = e[campo] ?? '';
      regForm.elements[campo].setAttribute('aria-invalid', e[campo] ? 'true' : 'false');
    }
  };
  const abrirRegistro = aberto => {
    regForm.hidden = !aberto;
    container.querySelector('.ia__chat').hidden = aberto;
    ia.classList.toggle('is-reg', aberto);
    regBtn.hidden = aberto;
    if (aberto) { estado('listening'); regForm.elements.nome.focus(); }
    else { estado('idle'); }
  };

  const enviarRegistro = async () => {
    const dados = Object.fromEntries(['nome', 'setor', 'ocupacao', 'email', 'frase'].map(k => [k, regForm.elements[k].value]));
    const e = validarRegistro(dados);
    erros(e);
    const primeiro = Object.keys(e)[0];
    if (primeiro) { regForm.elements[primeiro].focus(); return; }
    ocupado = true;
    abrirRegistro(false);
    sugestoes.hidden = true;
    addMsg('eu', `Registro: ${dados.nome.trim()} · ${dados.setor} · ${dados.ocupacao.trim()}`);
    const r = await pensar(registrar(dados, { registros, setores }));
    if (!vivo) return;
    if (r.ok) {
      registros = [{ protocolo: r.protocolo, nome: dados.nome.trim(), setor: r.setorFinal, email: dados.email.trim() }, ...registros];
      saveRegistros(registros);
      saveVisitantes([{ id: `v${Date.now()}`, autor: dados.nome.trim(), tipo: 'Amizade', data: new Date().toLocaleDateString('sv'),
        texto: `Acabei de me registrar no Náutilos como ${dados.ocupacao.trim()} no setor ${r.setorFinal}. ${dados.frase.trim()}` }, ...loadVisitantes()]);
      regForm.reset();
      await falar(r.texto);
    } else {
      await falar(r.texto, 'erro');
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'ia__retry';
      retry.textContent = 'Tentar de novo';
      retry.addEventListener('click', () => { retry.remove(); abrirRegistro(true); });
      log.append(retry);
      log.scrollTop = log.scrollHeight;
    }
    ocupado = false;
    input.disabled = false;
  };

  form.addEventListener('submit', e => { e.preventDefault(); enviar(input.value); });
  input.addEventListener('input', () => { if (!ocupado) estado(input.value.trim() ? 'listening' : 'idle'); });
  sugestoes.addEventListener('click', e => { const b = e.target.closest('button'); if (b) enviar(b.textContent); });
  regBtn.addEventListener('click', () => { if (!ocupado) abrirRegistro(true); });
  regForm.querySelector('.mform__cancel').addEventListener('click', () => { abrirRegistro(false); regBtn.focus(); });
  regForm.addEventListener('submit', e => { e.preventDefault(); enviarRegistro(); });

  // o router só encaixa este container na página depois do render: só conta como "fechado" quem já esteve na página
  let jaNaPagina = false;
  new MutationObserver(() => {
    if (container.isConnected) jaNaPagina = true;
    else if (jaNaPagina) vivo = false;
  }).observe(document.body, { childList: true, subtree: true });

  // a saudação roda depois do render, para não segurar a abertura do painel
  ocupado = true;
  (async () => {
    await new Promise(r => setTimeout(r, reduce ? 0 : 500));
    await falar(BOAS_VINDAS);
    ocupado = false;
  })();
}
