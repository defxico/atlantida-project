import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = f => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const CATEGORIAS = ['Aviso', 'Pedido de ajuda', 'Oferta', 'Conhecimento', 'Amizade'];

test('habitantes: ao menos 6, todos os campos preenchidos, ids únicos', () => {
  const hs = load('habitantes.json');
  assert.ok(hs.length >= 6);
  for (const h of hs) {
    for (const k of ['id', 'nome', 'funcao', 'setor', 'especialidade', 'descricao', 'img', 'registro', 'mora', 'atua', 'situacao']) {
      assert.ok(h[k], `${h.id ?? '?'} sem ${k}`);
    }
    assert.equal(typeof h.naTaverna, 'boolean');
  }
  assert.equal(new Set(hs.map(h => h.id)).size, hs.length);
});

test('mural: ao menos 5 posts, autor existe, data ISO, categoria válida', () => {
  const ids = new Set(load('habitantes.json').map(h => h.id));
  const posts = load('mural.json');
  assert.ok(posts.length >= 5);
  for (const p of posts) {
    assert.ok(p.autorId ? ids.has(p.autorId) : p.autor, `${p.id}: autor ${p.autorId ?? '?'} inválido`);
    assert.match(p.data, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(CATEGORIAS.includes(p.categoria), `${p.id}: categoria ${p.categoria}`);
    assert.ok(p.texto.length > 20);
  }
});

test('mundo: 9 setores do mapa, cada um com região, título e texto; ao menos um fechado', () => {
  const m = load('mundo.json');
  assert.equal(m.setores.length, 9);
  assert.ok(m.setores.some(s => s.id === 'nucleo'));
  assert.ok(m.setores.some(s => s.estado === 'fechado'));
  for (const x of m.setores) for (const k of ['nome', 'regiao', 'titulo', 'texto']) assert.ok(x[k] && x[k].length >= 3, `${x.id} sem ${k}`);
  assert.ok(m.video && m.poster);
});

test('transmissões: pelo menos 8 mensagens com origem, assunto, tipo e texto', () => {
  const tx = JSON.parse(readFileSync(new URL('../data/transmissoes.json', import.meta.url), 'utf8'));
  assert.ok(tx.length >= 8);
  for (const m of tx) {
    for (const k of ['origem', 'assunto', 'texto']) assert.ok(m[k] && m[k].length > 3, k + ' vazio');
    assert.ok(['info', 'alerta', 'comunidade'].includes(m.tipo));
  }
});

test('oceanos: 5 pontos completos, posições no quadro, signo e quiz coerentes', () => {
  const o = load('oceanos.json');
  const ids = o.pontos.map(p => p.id);
  assert.equal(ids.length, 5);
  assert.equal(new Set(ids).size, 5);
  for (const p of o.pontos) {
    for (const k of ['nome', 'regiao', 'titulo', 'texto', 'curiosidade']) assert.ok(p[k], `${p.id} sem ${k}`);
    for (const k of ['x', 'y']) assert.ok(p[k] >= 0 && p[k] <= 100, `${p.id}: ${k} fora do quadro`);
    assert.equal(p.dados.length, 4);
    assert.ok(p.dados.every(([k, v]) => k && v));
    assert.ok(p.signo.perfil && p.signo.guia && ids.includes(p.signo.combina), `${p.id}: signo incompleto`);
  }
  assert.ok(o.quiz.perguntas.length >= 3);
  for (const q of o.quiz.perguntas) {
    assert.ok(q.texto);
    assert.deepEqual(q.opcoes.map(op => op.oceano).sort(), [...ids].sort(), `"${q.texto}" precisa de uma opção por oceano`);
  }
});
