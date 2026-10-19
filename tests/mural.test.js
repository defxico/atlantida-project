import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortByDateDesc, filterByCategoria, formatDate } from '../js/lib/mural.js';

const posts = [
  { id: 'a', data: '2026-10-08', categoria: 'Aviso' },
  { id: 'b', data: '2026-10-12', categoria: 'Oferta' },
  { id: 'c', data: '2026-09-30', categoria: 'Aviso' },
];

test('ordena do mais recente para o mais antigo sem mutar', () => {
  assert.deepEqual(sortByDateDesc(posts).map(p => p.id), ['b', 'a', 'c']);
  assert.equal(posts[0].id, 'a');
});

test('filtra por categoria; "todos" devolve tudo', () => {
  assert.deepEqual(filterByCategoria(posts, 'Aviso').map(p => p.id), ['a', 'c']);
  assert.equal(filterByCategoria(posts, 'todos').length, 3);
  assert.deepEqual(filterByCategoria(posts, 'Amizade'), []);
});

test('formata data ISO sem depender de fuso', () => {
  assert.equal(formatDate('2026-10-12'), '12 out 2026');
  assert.equal(formatDate('2026-01-05'), '5 jan 2026');
});
