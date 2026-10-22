export const TIPOS = ['Projeto', 'Estudo em grupo', 'Mentoria', 'Freelance', 'Pesquisa e exploração'];
export const DIFICULDADES = { 'Fácil': 10, 'Média': 25, 'Difícil': 50 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const repDe = m => DIFICULDADES[m.dificuldade] ?? 0;
export const nivel = rep => 1 + Math.floor(rep / 50);
export const ocupadas = (m, embarcou) => m.tripulacao.length + (embarcou ? 1 : 0);
export const temVaga = (m, embarcou) => embarcou || ocupadas(m, false) < m.vagas;

export function filtrar(missoes, { tipo = 'todas', comVagas = false } = {}, embarcadas = []) {
  return missoes.filter(m => (tipo === 'todas' || m.tipo === tipo) && (!comVagas || temVaga(m, embarcadas.includes(m.id))));
}

// devolve a mensagem do primeiro erro, ou '' se a missão pode ser publicada
export function validarMissao(f) {
  if (f.autor.trim().length < 3) return 'Informe seu nome (mínimo 3 letras).';
  if (f.titulo.trim().length < 5) return 'O título precisa de pelo menos 5 letras.';
  if (f.texto.trim().length < 20) return 'Descreva a missão com pelo menos 20 caracteres.';
  const vagas = Number(f.vagas);
  if (!Number.isInteger(vagas) || vagas < 2 || vagas > 8) return 'O grupo deve ter de 2 a 8 membros.';
  const { email = '', linkedin = '', github = '' } = f.contato;
  if (![email, linkedin, github].some(c => c.trim())) return 'Preencha pelo menos um canal de conexão.';
  if (email.trim() && !EMAIL.test(email.trim())) return 'Esse e-mail não parece válido (ex: nome@nautilus.at).';
  return '';
}
