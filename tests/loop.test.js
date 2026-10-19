import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOOP, cycles, yoyoRepeat } from '../js/lib/loop.js';

test('loop é 18s', () => assert.equal(LOOP, 18));

test('cycles conta quantas vezes o período cabe no loop', () => {
  assert.equal(cycles(1.5), 12);
  assert.equal(cycles(6), 3);
  assert.equal(cycles(18), 1);
});

test('período que não fecha em 18s é recusado', () => {
  assert.throws(() => cycles(4), /não fecha em 18s/);
  assert.throws(() => cycles(7), /não fecha em 18s/);
});

test('yoyoRepeat: número de repeats que termina na pose inicial', () => {
  assert.equal(yoyoRepeat(2), 17);
  assert.equal(yoyoRepeat(9), 3);
});
