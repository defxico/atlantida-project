import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = f => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const CATEGORIAS = ['Aviso', 'Pedido de ajuda', 'Oferta', 'Conhecimento', 'Amizade'];

test('habitantes: ao menos 6, todos os campos preenchidos, ids únicos', () => {
  const hs = load('habitantes.json');
  assert.ok(hs.length >= 6);
  for (const h of hs) {
    for (const k of ['id', 'nome', 'funcao', 'setor', 'especialidade', 'descricao', 'img']) {
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
    assert.ok(ids.has(p.autorId), `${p.id}: autor ${p.autorId} não existe`);
    assert.match(p.data, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(CATEGORIAS.includes(p.categoria), `${p.id}: categoria ${p.categoria}`);
    assert.ok(p.texto.length > 20);
  }
});

test('mundo: 4 abas obrigatórias e 6 setores', () => {
  const m = load('mundo.json');
  assert.deepEqual(m.abas.map(a => a.id), ['historia', 'cotidiano', 'regras', 'portal']);
  for (const a of m.abas) assert.ok(a.paragrafos.length >= 2);
  assert.equal(m.setores.length, 6);
  assert.ok(m.setores.some(s => s.id === 'central'));
});

test('transmissões: pelo menos 8 mensagens com origem, assunto, tipo e texto', () => {
  const tx = JSON.parse(readFileSync(new URL('../data/transmissoes.json', import.meta.url), 'utf8'));
  assert.ok(tx.length >= 8);
  for (const m of tx) {
    for (const k of ['origem', 'assunto', 'texto']) assert.ok(m[k] && m[k].length > 3, k + ' vazio');
    assert.ok(['info', 'alerta', 'comunidade'].includes(m.tipo));
  }
});
