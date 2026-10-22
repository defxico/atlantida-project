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
