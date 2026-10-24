import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const hotspots = JSON.parse(readFileSync(new URL('../data/hotspots.json', import.meta.url), 'utf8'));

test('as 4 áreas obrigatórias e Oceanos existem, na ordem do menu', () => {
  assert.deepEqual(hotspots.map(h => h.id), ['mundo', 'oceanos', 'habitantes', 'mural', 'portal']);
});

test('cada hotspot tem campos completos e um módulo de área', () => {
  for (const h of hotspots) {
    for (const k of ['label', 'nav', 'x', 'y', 'side', 'zoom']) assert.ok(h[k] !== undefined, `${h.id} sem ${k}`);
    assert.ok(['left', 'right'].includes(h.side));
    for (const k of ['scale', 'x', 'y']) assert.equal(typeof h.zoom[k], 'number');
    assert.ok(existsSync(new URL(`../js/areas/${h.id}.js`, import.meta.url)), `falta js/areas/${h.id}.js`);
  }
});
