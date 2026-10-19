import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('index.html tem todos os containers', () => {
  const html = read('index.html');
  for (const id of ['viewport', 'camera', 'scene', 'hotspots', 'hud-nav', 'hud-depth', 'hud-area', 'panel', 'panel-body', 'boot']) {
    assert.match(html, new RegExp(`id="${id}"`), `falta #${id}`);
  }
  assert.match(html, /js\/vendor\/gsap\.min\.js/);
  assert.match(html, /<html lang="pt-BR"/);
});

test('tokens.css define a paleta oficial', () => {
  const css = read('css/tokens.css');
  for (const hex of ['#080D2B', '#25256B', '#6846AB', '#42D6D0', '#D8B45A']) {
    assert.ok(css.includes(hex), `falta ${hex}`);
  }
});
