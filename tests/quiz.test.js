import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resultado } from '../js/lib/quiz.js';

test('resultado: oceano mais escolhido; empate vai para o escolhido por último', () => {
  assert.equal(resultado(['pacifico', 'artico', 'pacifico']), 'pacifico');
  assert.equal(resultado(['pacifico', 'artico', 'artico', 'pacifico', 'indico']), 'pacifico');
  assert.equal(resultado(['indico', 'austral', 'atlantico', 'artico', 'pacifico']), 'pacifico');
  assert.equal(resultado([]), null);
});
