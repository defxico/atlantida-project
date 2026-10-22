import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { respostaLocal, norm, SEM_SINAL } from '../js/lib/nautilos.js';

const load = f => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const ctx = { setores: load('mundo.json').setores, habitantes: load('habitantes.json') };

test('norm ignora acento e caixa', () => assert.equal(norm('Exploração'), 'exploracao'));

test('respostaLocal: habitante, setor, Residencial A, linhas e fallback', () => {
  assert.match(respostaLocal('Quem é a Lívia?', ctx), /Lívia Maris/);
  assert.match(respostaLocal('fale do setor industrial', ctx), /Industrial/);
  assert.match(respostaLocal('Por que o Residencial A está fechado?', ctx), /geradores de oxigênio/);
  assert.match(respostaLocal('as linhas estão abertas?', ctx), /interditadas/);
  assert.equal(respostaLocal('xyzzy', ctx), SEM_SINAL);
  assert.equal(respostaLocal('   ', ctx), SEM_SINAL);
});

import { validarRegistro, registrar } from '../js/lib/nautilos.js';

const reg = { nome: 'Ana Lis', setor: 'Comercial', ocupacao: 'Padeira', email: 'ana@nautilus.at', frase: 'Levo pão quente às cúpulas.' };

test('validarRegistro: campos vazios e válido', () => {
  const vazio = validarRegistro({ nome: '', setor: '', ocupacao: '', email: 'x', frase: '' });
  assert.deepEqual(Object.keys(vazio).sort(), ['email', 'frase', 'nome', 'ocupacao', 'setor']);
  assert.deepEqual(validarRegistro(reg), {});
});

test('registrar: sucesso, setor fechado acolhido no B e e-mail duplicado', async () => {
  const ok = await registrar(reg, ctx);
  assert.ok(ok.ok && /^RN-\d{4}$/.test(ok.protocolo));
  const a = await registrar({ ...reg, setor: 'Residencial A' }, ctx);
  assert.equal(a.setorFinal, 'Residencial B');
  const dup = await registrar(reg, { ...ctx, registros: [{ protocolo: 'RN-1111', email: 'ANA@nautilus.at' }] });
  assert.equal(dup.ok, false);
  assert.match(dup.texto, /RN-1111/);
});
