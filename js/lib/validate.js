const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RULES = {
  nome: v => !v.trim() ? 'Informe seu nome, habitante.'
    : v.trim().length < 3 ? 'O nome precisa de pelo menos 3 letras.' : '',
  email: v => !v.trim() ? 'Informe um e-mail para resposta.'
    : !EMAIL.test(v.trim()) ? 'Esse e-mail não parece válido (ex: nome@nautilus.at).' : '',
  tipo: v => v ? '' : 'Escolha o tipo de mensagem.',
  mensagem: v => !v.trim() ? 'Escreva sua mensagem.'
    : v.trim().length < 10 ? 'A mensagem precisa de pelo menos 10 caracteres.' : '',
};

export function validateField(name, value = '') {
  return RULES[name] ? RULES[name](value) : '';
}

export function validateForm(data) {
  const errors = {};
  for (const name of Object.keys(RULES)) {
    const msg = validateField(name, data[name] ?? '');
    if (msg) errors[name] = msg;
  }
  return errors;
}
