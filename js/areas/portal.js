import { validateField, validateForm } from '../lib/validate.js';

const SETORES = ['Cúpula Central', 'Setor Científico', 'Setor Comercial', 'Setor Residencial', 'Setor Industrial', 'Setor de Exploração'];
const TIPOS = ['Pedido de ajuda', 'Cadastro de habitante', 'Sugestão', 'Alerta de risco', 'Outro'];
const REQUIRED = ['nome', 'email', 'tipo', 'mensagem'];

const options = list => list.map(o => `<option>${o}</option>`).join('');
const field = (name, label, control, required = true) => `
  <div class="field">
    <label for="f-${name}">${label}${required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
    ${control}
    <p class="field__error" aria-live="polite" id="err-${name}"></p>
  </div>`;

export function render(container) {
  container.innerHTML = `
    <header class="panel__header">
      <p class="eyebrow">Canal direto</p>
      <h2 id="panel-title">Fale com o Portal</h2>
      <p class="lead">Precisa de ajuda, quer se cadastrar ou falar com a administração? Transmita sua mensagem pela Rede Náutilus.</p>
    </header>
    <form class="form" novalidate>
      ${field('nome', 'Nome', '<input id="f-nome" name="nome" type="text" autocomplete="name" required aria-describedby="err-nome">')}
      ${field('email', 'E-mail', '<input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="err-email">')}
      ${field('setor', 'Seu setor', `<select id="f-setor" name="setor" aria-describedby="err-setor"><option value="">Prefiro não dizer</option>${options(SETORES)}</select>`, false)}
      ${field('tipo', 'Tipo de mensagem', `<select id="f-tipo" name="tipo" required aria-describedby="err-tipo"><option value="">Selecione uma opção</option>${options(TIPOS)}</select>`)}
      ${field('mensagem', 'Mensagem', '<textarea id="f-mensagem" name="mensagem" required aria-describedby="err-mensagem"></textarea>')}
      <p class="form__hint"><span class="req">*</span> campos obrigatórios</p>
      <button class="btn" type="submit">Transmitir mensagem</button>
    </form>
    <div class="form__success" tabindex="-1" role="status" hidden>
      <span class="signal" aria-hidden="true"></span>
      <h3>Transmissão enviada pela Rede Náutilus</h3>
      <p>Sua mensagem chegou à administração. Em breve alguém da comunidade entra em contato.</p>
      <button class="btn btn--ghost" type="button" data-again>Enviar outra mensagem</button>
    </div>`;

  const form = container.querySelector('form');
  const success = container.querySelector('.form__success');

  const show = (name, msg) => {
    container.querySelector(`#err-${name}`).textContent = msg;
    form.elements[name].setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  form.addEventListener('blur', e => {
    if (REQUIRED.includes(e.target.name)) show(e.target.name, validateField(e.target.name, e.target.value));
  }, true);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const errors = validateForm(Object.fromEntries(new FormData(form)));
    for (const name of REQUIRED) show(name, errors[name] ?? '');
    const first = Object.keys(errors)[0];
    if (first) { form.elements[first].focus(); return; }
    form.reset();
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  success.querySelector('[data-again]').addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    form.elements.nome.focus();
  });
}
