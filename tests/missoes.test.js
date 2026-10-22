import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { repDe, nivel, temVaga, filtrar, validarMissao, TIPOS, DIFICULDADES } from '../js/lib/missoes.js';

const missoes = JSON.parse(readFileSync(new URL('../data/missoes.json', import.meta.url), 'utf8'));
const habitantes = JSON.parse(readFileSync(new URL('../data/habitantes.json', import.meta.url), 'utf8'));

test('missoes.json: campos, tipos e dificuldades válidos, autor e tripulação existem', () => {
  const ids = new Set(habitantes.map(h => h.id));
  assert.ok(missoes.length >= 4);
  for (const m of missoes) {
    for (const k of ['id', 'autorId', 'data', 'tipo', 'dificuldade', 'vagas', 'titulo', 'texto']) assert.ok(m[k], `${m.id} sem ${k}`);
    assert.ok(TIPOS.includes(m.tipo));
    assert.ok(m.dificuldade in DIFICULDADES);
    assert.ok(ids.has(m.autorId));
    assert.ok(m.tripulacao.every(t => ids.has(t)));
    assert.ok(m.tripulacao.length <= m.vagas);
  }
});

test('reputação, nível e vagas', () => {
  assert.equal(repDe({ dificuldade: 'Difícil' }), 50);
  assert.equal(nivel(0), 1);
  assert.equal(nivel(50), 2);
  const cheia = missoes.find(m => m.tripulacao.length === m.vagas);
  assert.equal(temVaga(cheia, false), false);
  assert.equal(temVaga(cheia, true), true);
});

test('filtrar por tipo e por vagas', () => {
  assert.ok(filtrar(missoes, { tipo: 'Projeto' }).every(m => m.tipo === 'Projeto'));
  assert.ok(filtrar(missoes, { comVagas: true }).every(m => m.tripulacao.length < m.vagas));
  assert.equal(filtrar(missoes).length, missoes.length);
});

test('validarMissao', () => {
  const ok = { autor: 'Ana Lis', titulo: 'Montar um bot', texto: 'Um bot que avisa a cidade sobre oscilações.', vagas: 3, contato: { email: 'a@b.co' } };
  assert.equal(validarMissao(ok), '');
  assert.match(validarMissao({ ...ok, titulo: 'ab' }), /título/);
  assert.match(validarMissao({ ...ok, vagas: 9 }), /membros/);
  assert.match(validarMissao({ ...ok, autor: ' ' }), /nome/);
  assert.ok(TIPOS.includes('Pesquisa e exploração'));
  assert.match(validarMissao({ ...ok, contato: {} }), /canal/);
  assert.match(validarMissao({ ...ok, contato: { email: 'x' } }), /e-mail/);
});
