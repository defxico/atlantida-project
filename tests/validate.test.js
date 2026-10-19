import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateField, validateForm } from '../js/lib/validate.js';

test('nome obrigatório e com 3+ letras', () => {
  assert.equal(validateField('nome', ''), 'Informe seu nome, habitante.');
  assert.equal(validateField('nome', ' Jo '), 'O nome precisa de pelo menos 3 letras.');
  assert.equal(validateField('nome', 'Kael'), '');
});

test('email obrigatório e válido', () => {
  assert.equal(validateField('email', ''), 'Informe um e-mail para resposta.');
  assert.equal(validateField('email', 'kael@'), 'Esse e-mail não parece válido (ex: nome@nautilus.at).');
  assert.equal(validateField('email', 'kael@nautilus.at'), '');
});

test('tipo e mensagem', () => {
  assert.equal(validateField('tipo', ''), 'Escolha o tipo de mensagem.');
  assert.equal(validateField('mensagem', 'curta'), 'A mensagem precisa de pelo menos 10 caracteres.');
  assert.equal(validateField('mensagem', 'Preciso de um filtro de ar.'), '');
});

test('campo sem regra é sempre válido', () => {
  assert.equal(validateField('setor', ''), '');
});

test('validateForm devolve só erros, na ordem dos campos', () => {
  const errors = validateForm({ nome: 'Kael', email: 'x', tipo: '', mensagem: 'Mensagem longa o bastante' });
  assert.deepEqual(Object.keys(errors), ['email', 'tipo']);
  assert.deepEqual(validateForm({ nome: 'Kael', email: 'k@n.at', tipo: 'Outro', mensagem: 'Mensagem longa o bastante' }), {});
});
