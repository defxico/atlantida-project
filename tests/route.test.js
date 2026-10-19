import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash } from '../js/lib/route.js';

const ids = ['mundo', 'habitantes', 'mural', 'portal'];

test('hash conhecido vira id', () => {
  assert.equal(parseHash('#mural', ids), 'mural');
});

test('vazio, "#" ou desconhecido vira null', () => {
  assert.equal(parseHash('', ids), null);
  assert.equal(parseHash('#', ids), null);
  assert.equal(parseHash('#xpto', ids), null);
});

test('hash malformado não quebra', () => {
  assert.equal(parseHash('#%E0%A4%A', ids), null);
});
