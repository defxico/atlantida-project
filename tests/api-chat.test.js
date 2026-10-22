import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/chat.js';

const res = () => {
  const r = { code: 200, headers: {}, body: null };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = c => { r.code = c; return r; };
  r.json = b => { r.body = b; return r; };
  r.end = () => r;
  return r;
};
const req = (body, extra = {}) => ({ method: 'POST', headers: { 'x-forwarded-for': `t${Math.random()}` }, body, ...extra });

test('registro: valida, processa e acolhe o Residencial A no B', async () => {
  const ok = { tipo: 'registro', nome: 'Ana Lis', setor: 'Residencial A', ocupacao: 'Padeira', email: 'ana@nautilus.at', frase: 'Levo pão quente às cúpulas.' };
  const r = res(); await handler(req(ok), r);
  assert.equal(r.body.ok, true);
  assert.equal(r.body.setorFinal, 'Residencial B');
  const ruim = res(); await handler(req({ ...ok, email: 'x' }), ruim);
  assert.equal(ruim.code, 400);
});

test('chat: sem chaves devolve 502 e rejeita origem desconhecida e mensagem vazia', async () => {
  delete process.env.ANTHROPIC_API_KEY; delete process.env.OPENAI_API_KEY;
  const r = res(); await handler(req({ tipo: 'chat', mensagem: 'oi' }), r);
  assert.equal(r.code, 502);
  const o = res(); await handler(req({ mensagem: 'oi' }, { headers: { origin: 'https://malvado.com', 'x-forwarded-for': 'o1' } }), o);
  assert.equal(o.code, 403);
  const v = res(); await handler(req({ mensagem: '  ' }), v);
  assert.equal(v.code, 400);
});

test('chat: usa o Claude quando responde e cai na OpenAI quando ele falha', async () => {
  process.env.ANTHROPIC_API_KEY = 'a'; process.env.OPENAI_API_KEY = 'b';
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async url => url.includes('anthropic')
      ? { ok: true, json: async () => ({ content: [{ type: 'text', text: 'Olá do Claude.' }] }) } : { ok: false };
    const a = res(); await handler(req({ tipo: 'chat', mensagem: 'oi', historico: [{ role: 'user', content: 'x' }, { role: 'assistant', content: 'y' }] }), a);
    assert.equal(a.body.resposta, 'Olá do Claude.');
    globalThis.fetch = async url => url.includes('anthropic') ? { ok: false, status: 500 }
      : { ok: true, json: async () => ({ choices: [{ message: { content: 'Olá da OpenAI.' } }] }) };
    const b = res(); await handler(req({ tipo: 'chat', mensagem: 'oi' }), b);
    assert.equal(b.body.resposta, 'Olá da OpenAI.');
  } finally { globalThis.fetch = original; delete process.env.ANTHROPIC_API_KEY; delete process.env.OPENAI_API_KEY; }
});
