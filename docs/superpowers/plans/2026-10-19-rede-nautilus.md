# Rede Náutilus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portal "Rede Náutilus" para a VR CODE ARENA (FIAP NEXT, 24/10/2026): taverna em primeira pessoa com HUD de óculos, loop de 18s e 4 áreas em painéis holográficos.

**Architecture:** Página única estática. A cena é composta de camadas absolutas animadas por uma timeline GSAP mestre de 18s. Rotas por hash abrem painéis cujo conteúdo vem de módulos `js/areas/<id>.js` carregados dinamicamente e de JSONs em `data/`. Lógica pura (validação, mural, rotas, loop) fica em `js/lib/` e é testada com `node --test`.

**Tech Stack:** HTML, CSS (custom properties), JS ES modules, GSAP 3.12.5 (cdnjs), Google Fonts (Cinzel, Montserrat), Node 24 `node:test` (só testes), Python `http.server` (só dev), GitHub Pages.

## Global Constraints

- Sem build, sem framework, sem dependência npm. `package.json` existe só para `"type": "module"` e o script de teste.
- GSAP via `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js">`, usado como global `gsap`.
- Paleta exata: `#080D2B` `#25256B` `#6846AB` `#42D6D0` `#D8B45A`. Cores só via variáveis de `css/tokens.css`.
- Fontes: Cinzel (títulos), Montserrat (texto).
- Loop da cena: exatamente 18s (`LOOP = 18`). Todo tween cíclico usa período que divide 18; todo tween de personagem termina na pose inicial em t=18.
- Textos de interface em português do Brasil.
- Rotas: `#mundo`, `#habitantes`, `#mural`, `#portal`; hash vazio = Início.
- Nova área = 1 entrada em `data/hotspots.json` + 1 arquivo `js/areas/<id>.js` exportando `render(container)`.
- Requisitos FIAP: ≥6 habitantes (nome, imagem, função, descrição); ≥5 posts no mural (autor habitante, data, texto) em ordem cronológica gerados de JSON; formulário com validação de obrigatórios, mensagens claras e confirmação; menu em todas as áreas; responsivo; publicado em GitHub Pages.
- `prefers-reduced-motion: reduce` desliga loop, parallax, boot e animações CSS.
- Servidor de dev: `python -m http.server 5173` na raiz (fetch de JSON não funciona via `file://`).
- Todos os 4 integrantes precisam commitar: cada task indica o dono (P1–P4) e deve ser commitada pelo dono.

## File Structure

| Arquivo | Responsabilidade | Task |
|---|---|---|
| `index.html` | toda a marcação: cena, HUD, painel, boot | 1 |
| `css/tokens.css` | variáveis, reset, base, botões, reduced-motion | 1 |
| `package.json`, `.nojekyll`, `.claude/launch.json` | teste, Pages, preview | 1 |
| `tests/index.test.js` | smoke da marcação e tokens | 1 |
| `docs/assets-leonardo.md` | guia de geração/recorte de arte | 2 |
| `data/habitantes.json`, `data/mural.json`, `data/mundo.json` | conteúdo | 3 |
| `tests/data.test.js` | integridade do conteúdo | 3 |
| `js/lib/validate.js` + `tests/validate.test.js` | regras do formulário | 4 |
| `js/areas/portal.js` | painel Fale com o Portal | 4 |
| `js/lib/mural.js` + `tests/mural.test.js` | ordenar, filtrar, formatar data | 5 |
| `js/areas/mural.js` | painel Mural | 5 |
| `js/areas/habitantes.js` | painel Habitantes | 6 |
| `js/areas/mundo.js` | painel O Mundo (abas + mapa) | 7 |
| `css/panel.css` | moldura do painel + todos os blocos de conteúdo | 8 |
| `css/hud.css`, `js/hud.js` | HUD, menu, hotspots | 9 |
| `js/lib/route.js` + `tests/route.test.js`, `js/router.js`, `data/hotspots.json`, `tests/hotspots.test.js` | navegação | 10 |
| `js/lib/loop.js` + `tests/loop.test.js`, `css/scene.css`, `js/scene.js` | cena e loop | 11 |
| `js/look.js` | parallax / olhar em volta | 12 |
| `js/boot.js` | boot dos óculos | 13 |
| `js/main.js` | integração | 14 |

Ordem de execução por agente: 1 → 15 em sequência. Para o time humano, as tasks 2–9 podem rodar em paralelo depois da 1 (arquivos distintos).

---

### Task 1: Esqueleto, tokens e marcação completa (P2)

**Files:**
- Create: `index.html`, `css/tokens.css`, `package.json`, `.nojekyll`, `.claude/launch.json`, `tests/index.test.js`, `assets/img/taverna-fundo.webp` (placeholder)

**Interfaces:**
- Produces: IDs de DOM usados por todas as tasks: `viewport`, `camera`, `scene`, `hotspots`, `hud-nav`, `hud-depth`, `hud-area`, `panel`, `panel-body`, `boot`; classes `.layer`, `.porthole__fish`, `.porthole__shark`, `.bubbles`, `.fog--back`, `.fog--front`, `.actor--cliente`, `.actor--robo`, `.actor__body`, `.actor__arm`, `.robo__eye`, `.robo__pour`, `.glow`, `.panel__frame`, `.panel__close`, `.boot__lid--top`, `.boot__lid--bottom`, `.boot__screen`, `.boot__line`, `.boot__log`, `.boot__skip`, `.hud__corner`, `.hud__status`, `.hud__brand`, `.hud__intro`, `.hud__nav`. Classe `will-boot` no `<html>`. Classes utilitárias `.btn`, `.btn--ghost`, `.sr-only`.

- [ ] **Step 1: Criar `package.json`**

```json
{
  "name": "rede-nautilus",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "dev": "python -m http.server 5173"
  }
}
```

- [ ] **Step 2: Escrever o teste de smoke**

`tests/index.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('index.html tem todos os containers', () => {
  const html = read('index.html');
  for (const id of ['viewport', 'camera', 'scene', 'hotspots', 'hud-nav', 'hud-depth', 'hud-area', 'panel', 'panel-body', 'boot']) {
    assert.match(html, new RegExp(`id="${id}"`), `falta #${id}`);
  }
  assert.match(html, /gsap\/3\.12\.5\/gsap\.min\.js/);
  assert.match(html, /<html lang="pt-BR"/);
});

test('tokens.css define a paleta oficial', () => {
  const css = read('css/tokens.css');
  for (const hex of ['#080D2B', '#25256B', '#6846AB', '#42D6D0', '#D8B45A']) {
    assert.ok(css.includes(hex), `falta ${hex}`);
  }
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL com `ENOENT ... index.html`

- [ ] **Step 4: Criar `index.html`**

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rede Náutilus — A comunidade de Atlântida</title>
  <meta name="description" content="Portal da comunidade de Atlântida, visto pelos seus óculos.">
  <script>
    try {
      if (!localStorage.getItem('nautilus.booted') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('will-boot');
      }
    } catch (e) {}
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/scene.css">
  <link rel="stylesheet" href="css/hud.css">
  <link rel="stylesheet" href="css/panel.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script type="module" src="js/main.js"></script>
</head>
<body>
  <a class="skip-link" href="#hud-nav">Pular para o menu</a>

  <main id="viewport" class="viewport" aria-label="Taverna do Náutilus">
    <div id="camera" class="camera">
      <div id="scene" class="scene">
        <img class="layer layer--bg" data-depth="0.15" src="assets/img/taverna-fundo.webp"
             alt="Interior da Taverna do Náutilus: mesas de madeira, lanternas, um robô no balcão e uma grande vigia para o oceano.">
        <div class="layer porthole" data-depth="0.25" aria-hidden="true">
          <div class="porthole__fish"></div>
          <img class="porthole__shark" src="assets/img/tubarao.webp" alt="">
          <div class="bubbles"></div>
        </div>
        <div class="layer fog fog--back" data-depth="0.35" aria-hidden="true"></div>
        <div class="layer actor actor--cliente" data-depth="0.5" aria-hidden="true">
          <img class="actor__body" src="assets/img/cliente-corpo.webp" alt="">
          <img class="actor__arm" src="assets/img/cliente-braco.webp" alt="">
        </div>
        <div class="layer actor actor--robo" data-depth="0.55" aria-hidden="true">
          <img class="actor__body" src="assets/img/robo-corpo.webp" alt="">
          <span class="robo__eye"></span>
          <span class="robo__pour"></span>
          <img class="actor__arm" src="assets/img/robo-braco.webp" alt="">
        </div>
        <div class="layer glows" data-depth="0.55" aria-hidden="true">
          <span class="glow" style="--x:7.5;--y:29"></span>
          <span class="glow" style="--x:30;--y:37"></span>
          <span class="glow" style="--x:65;--y:66"></span>
          <span class="glow" style="--x:91.5;--y:29"></span>
        </div>
        <div class="layer dust" data-depth="0.7" aria-hidden="true"></div>
        <div class="layer fog fog--front" data-depth="0.85" aria-hidden="true"></div>
        <div id="hotspots" class="layer hotspots"></div>
      </div>
    </div>
  </main>

  <div class="hud">
    <span class="hud__corner hud__corner--tl" aria-hidden="true"></span>
    <span class="hud__corner hud__corner--tr" aria-hidden="true"></span>
    <span class="hud__corner hud__corner--bl" aria-hidden="true"></span>
    <span class="hud__corner hud__corner--br" aria-hidden="true"></span>
    <div class="hud__scan" aria-hidden="true"></div>
    <p class="hud__status">
      <span class="hud__depth">↓ <span id="hud-depth">3.000</span> m</span>
      <span id="hud-area" class="hud__area">Início</span>
    </p>
    <p class="hud__brand">Rede Náutilus <small>A comunidade de Atlântida</small></p>
    <section class="hud__intro" aria-labelledby="intro-title">
      <h1 id="intro-title">A cidade é grande. Nossa comunidade é maior.</h1>
      <p>Conectando habitantes, compartilhando histórias e mantendo Atlântida unida, uma mensagem de cada vez. Olhe em volta: seus óculos marcam cada canto da taverna.</p>
      <a class="btn" href="#mural">Entrar na comunidade →</a>
    </section>
    <nav id="hud-nav" class="hud__nav" aria-label="Áreas do portal"></nav>
  </div>

  <div id="panel" class="panel" hidden>
    <section class="panel__frame" role="dialog" aria-modal="true" aria-labelledby="panel-title">
      <button type="button" class="panel__close" aria-label="Fechar e voltar à taverna">✕</button>
      <div id="panel-body" class="panel__body"></div>
    </section>
  </div>

  <div id="boot" class="boot" aria-hidden="true">
    <div class="boot__lid boot__lid--top"></div>
    <div class="boot__lid boot__lid--bottom"></div>
    <div class="boot__screen">
      <span class="boot__line"></span>
      <pre class="boot__log"></pre>
    </div>
    <button type="button" class="boot__skip">Pular</button>
  </div>
</body>
</html>
```

- [ ] **Step 5: Criar `css/tokens.css`**

```css
:root {
  --abyss: #080D2B;
  --deep: #25256B;
  --violet: #6846AB;
  --cyan: #42D6D0;
  --gold: #D8B45A;

  --text: #E8ECF5;
  --text-dim: #A9B3CC;
  --error: #FF9AA6;
  --surface: rgb(8 13 43 / .82);
  --line: rgb(66 214 208 / .45);
  --glow-cyan: 0 0 12px rgb(66 214 208 / .6);

  --font-title: 'Cinzel', Georgia, serif;
  --font-body: 'Montserrat', system-ui, sans-serif;

  --space-1: .25rem;
  --space-2: .5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2.5rem;
  --radius: 12px;
  --ease-out: cubic-bezier(.2, .8, .2, 1);
}

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body {
  background: var(--abyss);
  color: var(--text);
  font: 400 1rem/1.6 var(--font-body);
  overflow: hidden;
}
h1, h2, h3 { font-family: var(--font-title); font-weight: 500; line-height: 1.2; margin: 0 0 var(--space-3); }
a { color: var(--cyan); }
:focus-visible { outline: 2px solid var(--cyan); outline-offset: 3px; }

.skip-link { position: absolute; left: -999px; top: var(--space-3); z-index: 100; padding: var(--space-2) var(--space-3); background: var(--abyss); }
.skip-link:focus { left: var(--space-3); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.btn {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .7rem 1.4rem; border: 0; border-radius: 999px;
  background: var(--gold); color: var(--abyss);
  font: 600 .95rem var(--font-body); text-decoration: none; cursor: pointer;
}
.btn:hover { filter: brightness(1.1); }
.btn--ghost { background: transparent; color: var(--cyan); border: 1px solid var(--line); }

.boot { display: none; }
.will-boot .boot { display: block; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 6: Criar `.nojekyll` (vazio), `.claude/launch.json` e o placeholder do fundo**

`.claude/launch.json`:
```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "nautilus", "runtimeExecutable": "python", "runtimeArgs": ["-m", "http.server", "5173"], "port": 5173 }
  ]
}
```

Run:
```bash
mkdir -p assets/img css js/lib js/areas data && touch .nojekyll && cp docs/referencia_inicial/conceito_01.png assets/img/taverna-fundo.webp
```
(Placeholder: PNG com extensão .webp; navegadores detectam o formato. A P1 substitui pela arte final na Task 2.)

Criar também `css/scene.css`, `css/hud.css`, `css/panel.css` e `js/main.js` vazios, para o HTML carregar sem 404:
```bash
touch css/scene.css css/hud.css css/panel.css js/main.js
```

- [ ] **Step 7: Rodar testes**

Run: `npm test`
Expected: PASS (2 testes)

- [ ] **Step 8: Commit**

```bash
git add index.html css js package.json .nojekyll .claude/launch.json tests/index.test.js assets/img/taverna-fundo.webp
git commit -m "feat: scaffold page markup, tokens and test runner"
```

---

### Task 2: Guia de arte no Leonardo AI (P1)

**Files:**
- Create: `docs/assets-leonardo.md`

**Interfaces:**
- Produces: nomes exatos dos arquivos em `assets/img/`: `taverna-fundo.webp`, `robo-corpo.webp`, `robo-braco.webp`, `cliente-corpo.webp`, `cliente-braco.webp`, `tubarao.webp`, `cardume.webp`, `cidade.webp`, `hab-kael.webp`, `hab-livia.webp`, `hab-torak.webp`, `hab-seren.webp`, `hab-darian.webp`, `hab-nami.webp`.

- [ ] **Step 1: Escrever `docs/assets-leonardo.md`**

````markdown
# Arte no Leonardo AI — passo a passo

## Configuração (vale para todas)
1. leonardo.ai → **Image Generation**.
2. Modelo: **Leonardo Phoenix** (ou Lucid Origin, se aparecer).
3. **Number of images: 2** (economiza os 150 tokens diários do plano free).
4. **Image Guidance → Style Reference**: envie `docs/referencia_inicial/conceito_01.png`, força **Mid**. Use em TODAS as imagens: é o que mantém o mesmo estilo entre elas.
5. Cole o **bloco de estilo** no fim de cada prompt:

```
painterly digital concept art, dieselpunk submarine tavern deep under the ocean, riveted brass and weathered dark wood, warm amber lantern light contrasted with teal bioluminescent glow, light volumetric fog, rich detail, cinematic lighting, color palette of deep navy, indigo, violet, teal and gold
```

6. **Negative prompt** (todas): `text, letters, watermark, logo, signature, frame, blurry, deformed hands, extra limbs`

## Imagens

| # | Arquivo | Proporção | Fundo |
|---|---|---|---|
| 1 | taverna-fundo.webp | 16:9 | cena completa |
| 2 | robo (vira corpo + braço) | 2:3 | transparente |
| 3 | cliente (vira corpo + braço) | 3:4 | transparente |
| 4 | tubarao.webp | 16:9 | preto puro |
| 5 | cardume.webp | 16:9 | preto puro |
| 6 | cidade.webp | 16:9 | cena completa |
| 7–12 | hab-*.webp | 3:4 | cena desfocada |

**1. Taverna (fundo):**
```
first-person point of view standing inside a circular riveted submarine tavern, wooden tables and stools, a few patrons quietly seated at the back tables, the front-left table is empty, community notice board with pinned paper notes on the left wall, large round porthole window in the center back showing dark empty deep blue water, long wooden bar counter on the right with beer taps and bottle shelves, empty space behind the bar, barrels, hanging oil lanterns
```
Negative extra: `robot, person in foreground, hands, glasses`.
Escolha a versão em que a vigia está mais parecida com a do conceito_01 (centro, um pouco à direita). Se tiver tokens, use **Upscale** antes de baixar.

**2. Robô bartender:**
```
full body humanoid bartender robot standing, slim white and silver armor plates with brass joints, round head with friendly glowing cyan LED eyes, right arm bent holding a glass beer mug at chest height, three-quarter view facing left, full figure visible head to feet, isolated on plain background
```
Ligue **Transparency** se a opção existir no modelo escolhido.

**3. Cliente da mesa (Torak Sulu):**
```
rugged bearded explorer in a worn leather jacket with a harness, sitting on a stool seen in three-quarter back view, right arm raised holding a pewter beer mug, upper body and stool visible, no table, isolated on plain background
```

**4. Tubarão:**
```
side profile of a large shark swimming to the right, lit by teal underwater glow, isolated on pure black background
```

**5. Cardume:**
```
school of small silver fish swimming to the left in a long horizontal band, isolated on pure black background
```
(Preto puro some na tela: a vigia usa modo de mesclagem "screen". Não precisa recortar 4 e 5.)

**6. Cidade (painel O Mundo):**
```
underwater city of Atlantis with glowing glass domes, slender spires and transparent tubes connecting districts, bioluminescent coral, a whale passing above, light rays from far above, deep blue ocean
```

**7–12. Retratos** (prefixo comum + descrição):
Prefixo: `bust portrait looking at the camera, softly blurred underwater dieselpunk city background, `

| Arquivo | Descrição |
|---|---|
| hab-kael.webp | young man with short dark hair, engineer armor vest with tools and cyan light accents |
| hab-livia.webp | woman with wavy light brown hair, white medical coat with a small brass badge |
| hab-torak.webp | rugged bearded explorer in a worn leather jacket with a harness (mesmo homem da imagem 3) |
| hab-seren.webp | woman with purple hair and goggles on her head, mechanic overalls with brass gears |
| hab-darian.webp | dark-skinned young man, messenger jacket with satchel and a small signal antenna |
| hab-nami.webp | woman with red braided hair, marine researcher suit with sample vials |

## Remover fundo (se não houve Transparency)
- No Leonardo: abra a imagem → **Remove Background**; ou
- No Photopea (photopea.com): **Selecionar › Remover fundo** (Select › Remove BG) → apagar.

## Separar o braço (robô e cliente) no Photopea
1. Abra o PNG transparente.
2. Ferramenta **Laço** (L): contorne o braço inteiro, do ombro até a mão com a caneca.
3. **Ctrl+J**: o braço vira uma camada nova ("braço").
4. Esconda a camada "braço". Na camada original, com a mesma seleção (Ctrl+clique na miniatura do braço), **Editar › Preencher › Sensível ao conteúdo** (Content-Aware) para "pintar" o tronco por trás do braço.
5. Exportar corpo: esconda "braço", **Arquivo › Exportar como › WEBP** → `robo-corpo.webp`.
6. Exportar braço: esconda o corpo, mostre "braço", exporte → `robo-braco.webp`.
   **As duas imagens precisam ter o mesmo tamanho de tela**: não corte (crop) nenhuma delas. É isso que faz elas se encaixarem no site.
7. Repita para o cliente (`cliente-corpo.webp`, `cliente-braco.webp`).

## Exportar
Tudo em **WEBP**, qualidade 80. Larguras máximas: fundo e cidade 2560px, personagens 1200px, retratos 800px, tubarão/cardume 1200px. Salve em `assets/img/` com os nomes exatos da tabela.

## Depois de trocar o fundo
Ajuste as posições em `css/scene.css` (bloco `.scene { --porthole-x … }`) e em `data/hotspots.json` (`x`, `y` em % da imagem) até os elementos baterem com a arte nova.
````

- [ ] **Step 2: Commit**

```bash
git add docs/assets-leonardo.md
git commit -m "docs: add Leonardo AI asset generation guide"
```

- [ ] **Step 3 (humano, P1): gerar e salvar as 14 imagens em `assets/img/` e commitar**

```bash
git add assets/img
git commit -m "feat: add tavern, characters and portrait art"
```

---

### Task 3: Conteúdo em JSON (P4)

**Files:**
- Create: `data/habitantes.json`, `data/mural.json`, `data/mundo.json`, `tests/data.test.js`

**Interfaces:**
- Produces:
  - `habitantes.json`: `Array<{ id, nome, funcao, setor, especialidade, descricao, img, naTaverna: boolean }>`
  - `mural.json`: `Array<{ id, autorId, data: 'YYYY-MM-DD', categoria: 'Aviso'|'Pedido de ajuda'|'Oferta'|'Conhecimento'|'Amizade', texto }>`
  - `mundo.json`: `{ intro, imagem, abas: Array<{ id, titulo, paragrafos: string[] }>, setores: Array<{ id, nome, descricao, x, y }> }` (x 0–100, y 0–60)

- [ ] **Step 1: Escrever o teste**

`tests/data.test.js`:
```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL com `ENOENT ... data/habitantes.json`

- [ ] **Step 3: Criar `data/habitantes.json`**

```json
[
  { "id": "kael", "nome": "Kael Vetra", "funcao": "Engenheiro de Sistemas", "setor": "Setor Científico", "especialidade": "Pressurização de cúpulas", "descricao": "Especialista em manutenção das cúpulas e dos equipamentos submarinos. Se a pressão oscila, é ele quem desce primeiro.", "img": "assets/img/hab-kael.webp", "naTaverna": false },
  { "id": "livia", "nome": "Lívia Maris", "funcao": "Médica", "setor": "Cúpula Central", "especialidade": "Medicina de profundidade", "descricao": "Cuida da saúde da comunidade e pesquisa novas formas de combater doenças marinhas. Atende no posto da Cúpula Central.", "img": "assets/img/hab-livia.webp", "naTaverna": false },
  { "id": "torak", "nome": "Torak Sulu", "funcao": "Explorador", "setor": "Setor de Exploração", "especialidade": "Rotas abissais", "descricao": "Conhece os recantos mais profundos do oceano e compartilha suas descobertas — quase sempre de caneca na mão, aqui na taverna.", "img": "assets/img/hab-torak.webp", "naTaverna": true },
  { "id": "seren", "nome": "Seren Velas", "funcao": "Mecânica", "setor": "Setor Industrial", "especialidade": "Propulsores e bombas de ar", "descricao": "Conserta, cria e dá vida a máquinas que mantêm a cidade funcionando. Nenhum filtro de oxigênio resiste a ela.", "img": "assets/img/hab-seren.webp", "naTaverna": false },
  { "id": "darian", "nome": "Darian Flux", "funcao": "Mensageiro", "setor": "Setor Comercial", "especialidade": "Túneis e correio pneumático", "descricao": "Liga pessoas, leva recados e garante que as informações cheguem a todos, mesmo nas cúpulas mais distantes.", "img": "assets/img/hab-darian.webp", "naTaverna": false },
  { "id": "nami", "nome": "Nami Quel'thar", "funcao": "Pesquisadora", "setor": "Setor Científico", "especialidade": "Biologia marinha", "descricao": "Estuda a vida marinha e trabalha pela preservação do oceano que protege — e ameaça — Atlântida.", "img": "assets/img/hab-nami.webp", "naTaverna": false }
]
```

- [ ] **Step 4: Criar `data/mural.json`**

```json
[
  { "id": "p1", "autorId": "livia", "data": "2026-10-12", "categoria": "Pedido de ajuda", "texto": "Alguém tem um kit de primeiros socorros extra? Minha vizinha da Cúpula Residencial está precisando e não consegue sair de casa agora." },
  { "id": "p2", "autorId": "kael", "data": "2026-10-11", "categoria": "Aviso", "texto": "A manutenção da cúpula oeste será amanhã, das 14h às 18h. Evitem a área durante esse período — as portas estanques ficarão fechadas." },
  { "id": "p3", "autorId": "nami", "data": "2026-10-10", "categoria": "Oferta", "texto": "Estou doando livros e materiais de estudo sobre a vida marinha. Interessados, me chamem aqui no Mural ou passem no Setor Científico." },
  { "id": "p4", "autorId": "seren", "data": "2026-10-09", "categoria": "Conhecimento", "texto": "Dica rápida: se o filtro de ar do seu módulo estiver chiando, limpe a grade de entrada antes de trocar a peça. Resolve 8 em cada 10 casos." },
  { "id": "p5", "autorId": "torak", "data": "2026-10-08", "categoria": "Amizade", "texto": "Voltei da fenda norte com histórias novas. Quarta à noite, mesa da frente da Taverna do Náutilus. A primeira rodada é por minha conta." },
  { "id": "p6", "autorId": "darian", "data": "2026-10-07", "categoria": "Aviso", "texto": "O correio pneumático do Setor Comercial voltou a funcionar. Encomendas atrasadas serão entregues até sexta." }
]
```

- [ ] **Step 5: Criar `data/mundo.json`**

```json
{
  "intro": "Conheça a história, o cotidiano e os desafios de Atlântida, a cidade que vive a 3.000 metros de profundidade.",
  "imagem": "assets/img/cidade.webp",
  "abas": [
    { "id": "historia", "titulo": "História", "paragrafos": [
      "Há séculos, exploradores e cientistas encontraram nas profundezas os primeiros vestígios de uma civilização perdida. Pessoas de diferentes povos desceram para estudá-los e, cúpula por cúpula, ergueram Atlântida sobre as ruínas.",
      "A primeira construção foi uma taverna: o Náutilus, um velho submarino encalhado no leito do mar, onde os pioneiros se reuniam para trocar notícias. Foi dali que nasceu a ideia de uma rede que conectasse todos."
    ]},
    { "id": "cotidiano", "titulo": "Cotidiano", "paragrafos": [
      "A luz do sol não chega até aqui. O dia é marcado pelo brilho das cúpulas, que esquenta pela manhã e esfria à noite. Os moradores se deslocam por túneis pressurizados e cápsulas que ligam os bairros.",
      "Cada setor tem sua vocação: ciência, comércio, indústria, moradia e exploração. No fim do expediente, muita gente acaba no mesmo lugar — a mesa de alguém, no Náutilus."
    ]},
    { "id": "regras", "titulo": "Regras e Desafios", "paragrafos": [
      "O oxigênio é o recurso mais precioso: cada cúpula tem cota diária, e desperdício é assunto da comunidade inteira. Portas estanques fecham automaticamente em qualquer variação de pressão.",
      "As distâncias entre os bairros são grandes e o oceano é ao mesmo tempo proteção e ameaça. Vazamentos, falhas de energia e criaturas das fendas fazem parte da rotina — e ninguém enfrenta isso sozinho."
    ]},
    { "id": "portal", "titulo": "Por que o Portal?", "paragrafos": [
      "Numa cidade onde sair de casa exige atravessar túneis sob pressão, uma mensagem pode salvar uma vida. A Rede Náutilus é o lugar onde os habitantes se conhecem, se comunicam, pedem e oferecem ajuda.",
      "Por isso todo morador usa os óculos da Rede: eles mostram quem está por perto, o que está acontecendo e onde alguém precisa de você."
    ]}
  ],
  "setores": [
    { "id": "central", "nome": "Cúpula Central", "descricao": "Coração de Atlântida: administração, posto médico e a Taverna do Náutilus.", "x": 50, "y": 30 },
    { "id": "cientifico", "nome": "Setor Científico", "descricao": "Laboratórios de pesquisa marinha e engenharia das cúpulas.", "x": 22, "y": 14 },
    { "id": "comercial", "nome": "Setor Comercial", "descricao": "Mercados, oficinas de troca e o correio pneumático.", "x": 78, "y": 14 },
    { "id": "residencial", "nome": "Setor Residencial", "descricao": "Onde a maioria dos habitantes vive, em módulos conectados por túneis.", "x": 18, "y": 46 },
    { "id": "industrial", "nome": "Setor Industrial", "descricao": "Geradores, filtros de oxigênio e fábricas de peças.", "x": 82, "y": 46 },
    { "id": "exploracao", "nome": "Setor de Exploração", "descricao": "Base das expedições às fendas e ao leito oceânico.", "x": 50, "y": 54 }
  ]
}
```

- [ ] **Step 6: Rodar testes**

Run: `npm test`
Expected: PASS (5 testes)

- [ ] **Step 7: Commit**

```bash
git add data tests/data.test.js
git commit -m "feat: add habitantes, mural and mundo content"
```

---

### Task 4: Validação e painel Fale com o Portal (P4)

**Files:**
- Create: `js/lib/validate.js`, `tests/validate.test.js`, `js/areas/portal.js`

**Interfaces:**
- Produces: `validateField(name: string, value: string): string` (mensagem de erro ou `''`); `validateForm(data: object): Record<string,string>` (só os campos com erro, na ordem nome, email, tipo, mensagem); `render(container: HTMLElement): void` em `portal.js`.

- [ ] **Step 1: Escrever o teste**

`tests/validate.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateField, validateForm } from '../js/lib/validate.js';

test('nome obrigatório e com 3+ letras', () => {
  assert.equal(validateField('nome', ''), 'Informe seu nome, habitante.');
  assert.equal(validateField('nome', ' Jo '), 'O nome precisa de pelo menos 3 letras.');
  assert.equal(validateField('nome', 'Kael'), '');
});

test('email obrigatório e válido', () => {
  assert.equal(validateField('email', ''), 'Informe um e-mail para resposta.');
  assert.equal(validateField('email', 'kael@'), 'Esse e-mail não parece válido (ex: nome@nautilus.at).');
  assert.equal(validateField('email', 'kael@nautilus.at'), '');
});

test('tipo e mensagem', () => {
  assert.equal(validateField('tipo', ''), 'Escolha o tipo de mensagem.');
  assert.equal(validateField('mensagem', 'curta'), 'A mensagem precisa de pelo menos 10 caracteres.');
  assert.equal(validateField('mensagem', 'Preciso de um filtro de ar.'), '');
});

test('campo sem regra é sempre válido', () => {
  assert.equal(validateField('setor', ''), '');
});

test('validateForm devolve só erros, na ordem dos campos', () => {
  const errors = validateForm({ nome: 'Kael', email: 'x', tipo: '', mensagem: 'Mensagem longa o bastante' });
  assert.deepEqual(Object.keys(errors), ['email', 'tipo']);
  assert.deepEqual(validateForm({ nome: 'Kael', email: 'k@n.at', tipo: 'Outro', mensagem: 'Mensagem longa o bastante' }), {});
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL com `Cannot find module ... js/lib/validate.js`

- [ ] **Step 3: Implementar `js/lib/validate.js`**

```js
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RULES = {
  nome: v => !v.trim() ? 'Informe seu nome, habitante.'
    : v.trim().length < 3 ? 'O nome precisa de pelo menos 3 letras.' : '',
  email: v => !v.trim() ? 'Informe um e-mail para resposta.'
    : !EMAIL.test(v.trim()) ? 'Esse e-mail não parece válido (ex: nome@nautilus.at).' : '',
  tipo: v => v ? '' : 'Escolha o tipo de mensagem.',
  mensagem: v => !v.trim() ? 'Escreva sua mensagem.'
    : v.trim().length < 10 ? 'A mensagem precisa de pelo menos 10 caracteres.' : '',
};

export function validateField(name, value = '') {
  return RULES[name] ? RULES[name](value) : '';
}

export function validateForm(data) {
  const errors = {};
  for (const name of Object.keys(RULES)) {
    const msg = validateField(name, data[name] ?? '');
    if (msg) errors[name] = msg;
  }
  return errors;
}
```

- [ ] **Step 4: Rodar testes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Implementar `js/areas/portal.js`**

```js
import { validateField, validateForm } from '../lib/validate.js';

const SETORES = ['Cúpula Central', 'Setor Científico', 'Setor Comercial', 'Setor Residencial', 'Setor Industrial', 'Setor de Exploração'];
const TIPOS = ['Pedido de ajuda', 'Cadastro de habitante', 'Sugestão', 'Alerta de risco', 'Outro'];
const REQUIRED = ['nome', 'email', 'tipo', 'mensagem'];

const options = list => list.map(o => `<option>${o}</option>`).join('');
const field = (name, label, control, required = true) => `
  <div class="field">
    <label for="f-${name}">${label}${required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
    ${control}
    <p class="field__error" id="err-${name}"></p>
  </div>`;

export function render(container) {
  container.innerHTML = `
    <header class="panel__header">
      <p class="eyebrow">Canal direto</p>
      <h2 id="panel-title">Fale com o Portal</h2>
      <p class="lead">Precisa de ajuda, quer se cadastrar ou falar com a administração? Transmita sua mensagem pela Rede Náutilus.</p>
    </header>
    <form class="form" novalidate>
      ${field('nome', 'Nome', '<input id="f-nome" name="nome" type="text" autocomplete="name" required aria-describedby="err-nome">')}
      ${field('email', 'E-mail', '<input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="err-email">')}
      ${field('setor', 'Seu setor', `<select id="f-setor" name="setor" aria-describedby="err-setor"><option value="">Prefiro não dizer</option>${options(SETORES)}</select>`, false)}
      ${field('tipo', 'Tipo de mensagem', `<select id="f-tipo" name="tipo" required aria-describedby="err-tipo"><option value="">Selecione uma opção</option>${options(TIPOS)}</select>`)}
      ${field('mensagem', 'Mensagem', '<textarea id="f-mensagem" name="mensagem" required aria-describedby="err-mensagem"></textarea>')}
      <p class="form__hint"><span class="req">*</span> campos obrigatórios</p>
      <button class="btn" type="submit">Transmitir mensagem</button>
    </form>
    <div class="form__success" tabindex="-1" role="status" hidden>
      <span class="signal" aria-hidden="true"></span>
      <h3>Transmissão enviada pela Rede Náutilus</h3>
      <p>Sua mensagem chegou à administração. Em breve alguém da comunidade entra em contato.</p>
      <button class="btn btn--ghost" type="button" data-again>Enviar outra mensagem</button>
    </div>`;

  const form = container.querySelector('form');
  const success = container.querySelector('.form__success');

  const show = (name, msg) => {
    container.querySelector(`#err-${name}`).textContent = msg;
    form.elements[name].setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  form.addEventListener('blur', e => {
    if (REQUIRED.includes(e.target.name)) show(e.target.name, validateField(e.target.name, e.target.value));
  }, true);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const errors = validateForm(Object.fromEntries(new FormData(form)));
    for (const name of REQUIRED) show(name, errors[name] ?? '');
    const first = Object.keys(errors)[0];
    if (first) { form.elements[first].focus(); return; }
    form.reset();
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  success.querySelector('[data-again]').addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    form.elements.nome.focus();
  });
}
```

- [ ] **Step 6: Verificar no navegador**

Run: `npm run dev` e abrir `http://localhost:5173`. No console:
```js
const p = document.getElementById('panel'); p.hidden = false;
(await import('/js/areas/portal.js')).render(document.getElementById('panel-body'));
```
Expected: formulário aparece; "Transmitir" vazio mostra 4 erros e foca "Nome"; preencher tudo válido mostra a confirmação.

- [ ] **Step 7: Commit**

```bash
git add js/lib/validate.js tests/validate.test.js js/areas/portal.js
git commit -m "feat: add Fale com o Portal form with validation"
```

---

### Task 5: Lógica e painel do Mural (P4)

**Files:**
- Create: `js/lib/mural.js`, `tests/mural.test.js`, `js/areas/mural.js`

**Interfaces:**
- Consumes: `data/mural.json`, `data/habitantes.json` (Task 3)
- Produces: `sortByDateDesc(posts): Post[]` (cópia), `filterByCategoria(posts, cat: string): Post[]` (`'todos'` devolve tudo), `formatDate(iso: 'YYYY-MM-DD'): string` (ex.: `'12 out 2026'`); `render(container): Promise<void>` em `areas/mural.js`.

- [ ] **Step 1: Escrever o teste**

`tests/mural.test.js`:
```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL com `Cannot find module ... js/lib/mural.js`

- [ ] **Step 3: Implementar `js/lib/mural.js`**

```js
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function sortByDateDesc(posts) {
  return [...posts].sort((a, b) => b.data.localeCompare(a.data));
}

export function filterByCategoria(posts, cat) {
  return cat === 'todos' ? posts : posts.filter(p => p.categoria === cat);
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MESES[m - 1]} ${y}`;
}
```

- [ ] **Step 4: Rodar testes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Implementar `js/areas/mural.js`**

```js
import { sortByDateDesc, filterByCategoria, formatDate } from '../lib/mural.js';

const CATEGORIAS = ['todos', 'Aviso', 'Pedido de ajuda', 'Oferta', 'Conhecimento', 'Amizade'];

const post = (p, a) => `
  <li class="post">
    <img class="post__avatar" src="${a.img}" alt="" loading="lazy">
    <div>
      <p class="post__meta"><strong>${a.nome}</strong> · ${a.setor} · <time datetime="${p.data}">${formatDate(p.data)}</time></p>
      <span class="tag" data-cat="${p.categoria}">${p.categoria}</span>
      <p>${p.texto}</p>
    </div>
  </li>`;

export async function render(container) {
  const [posts, habitantes] = await Promise.all([
    fetch('data/mural.json').then(r => r.json()),
    fetch('data/habitantes.json').then(r => r.json()),
  ]);
  const autores = Object.fromEntries(habitantes.map(h => [h.id, h]));

  container.innerHTML = `
    <header class="panel__header">
      <p class="eyebrow">O coração da convivência</p>
      <h2 id="panel-title">Mural da Comunidade</h2>
      <p class="lead">Avisos, recados, pedidos e novidades de quem vive em Atlântida. Juntos, fazemos a cidade mais forte.</p>
    </header>
    <div class="filters" role="group" aria-label="Filtrar por categoria">
      ${CATEGORIAS.map(c => `<button type="button" class="chip" data-cat="${c}" aria-pressed="${c === 'todos'}">${c === 'todos' ? 'Todos' : c}</button>`).join('')}
    </div>
    <ol class="feed" aria-live="polite"></ol>`;

  const feed = container.querySelector('.feed');
  const draw = cat => {
    const items = filterByCategoria(sortByDateDesc(posts), cat);
    feed.innerHTML = items.map(p => post(p, autores[p.autorId])).join('')
      || '<li class="feed__empty">Nenhuma publicação nessa categoria.</li>';
  };

  container.querySelector('.filters').addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    container.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === btn)));
    draw(btn.dataset.cat);
  });

  draw('todos');
}
```

- [ ] **Step 6: Verificar no navegador**

Console em `http://localhost:5173`:
```js
document.getElementById('panel').hidden = false;
await (await import('/js/areas/mural.js')).render(document.getElementById('panel-body'));
```
Expected: 6 posts, o de 12 out 2026 primeiro; "Aviso" mostra 2.

- [ ] **Step 7: Commit**

```bash
git add js/lib/mural.js tests/mural.test.js js/areas/mural.js
git commit -m "feat: add Mural da Comunidade with category filter"
```

---

### Task 6: Painel Habitantes (P4)

**Files:**
- Create: `js/areas/habitantes.js`

**Interfaces:**
- Consumes: `data/habitantes.json`
- Produces: `render(container): Promise<void>`

- [ ] **Step 1: Implementar `js/areas/habitantes.js`**

```js
const card = h => `
  <li class="card" tabindex="0">
    <figure class="card__media">
      <img src="${h.img}" alt="Retrato de ${h.nome}" loading="lazy">
      <span class="card__scan" aria-hidden="true"></span>
    </figure>
    <div class="card__body">
      ${h.naTaverna ? '<span class="tag tag--live">● na taverna agora</span>' : ''}
      <h3>${h.nome}</h3>
      <p class="card__role">${h.funcao}</p>
      <p>${h.descricao}</p>
      <dl class="sheet">
        <div><dt>Setor</dt><dd>${h.setor}</dd></div>
        <div><dt>Especialidade</dt><dd>${h.especialidade}</dd></div>
      </dl>
    </div>
  </li>`;

export async function render(container) {
  const habitantes = await fetch('data/habitantes.json').then(r => r.json());
  container.innerHTML = `
    <header class="panel__header">
      <p class="eyebrow">Quem vive aqui</p>
      <h2 id="panel-title">Habitantes</h2>
      <p class="lead">Conheça as pessoas que fazem parte de Atlântida. Cada morador tem uma história, um talento e um papel na cidade. Passe o olhar sobre um card para escanear a ficha.</p>
    </header>
    <ul class="grid grid--cards" role="list">${habitantes.map(card).join('')}</ul>`;

  container.querySelectorAll('.card__media img').forEach(img =>
    img.addEventListener('error', () => img.classList.add('is-missing'), { once: true }));
}
```

- [ ] **Step 2: Verificar no navegador**

```js
document.getElementById('panel').hidden = false;
await (await import('/js/areas/habitantes.js')).render(document.getElementById('panel-body'));
```
Expected: 6 cards; Torak Sulu tem a tag "na taverna agora"; sem retratos ainda, a área da imagem fica em gradiente (sem ícone quebrado depois da Task 8).

- [ ] **Step 3: Commit**

```bash
git add js/areas/habitantes.js
git commit -m "feat: add Habitantes panel with RPG sheet cards"
```

---

### Task 7: Painel O Mundo (P1)

**Files:**
- Create: `js/areas/mundo.js`

**Interfaces:**
- Consumes: `data/mundo.json`
- Produces: `render(container): Promise<void>`

- [ ] **Step 1: Implementar `js/areas/mundo.js`**

```js
export async function render(container) {
  const m = await fetch('data/mundo.json').then(r => r.json());

  container.innerHTML = `
    <div class="mundo" style="--bg:url('${m.imagem}')">
      <header class="panel__header">
        <p class="eyebrow">A cidade no fundo do mar</p>
        <h2 id="panel-title">O Mundo</h2>
        <p class="lead">${m.intro}</p>
      </header>
      <div class="tabs" role="tablist" aria-label="Sobre Atlântida">
        ${m.abas.map((a, i) => `<button type="button" role="tab" id="tab-${a.id}" aria-controls="tp-${a.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${a.titulo}</button>`).join('')}
      </div>
      ${m.abas.map((a, i) => `
        <section role="tabpanel" id="tp-${a.id}" aria-labelledby="tab-${a.id}" ${i ? 'hidden' : ''}>
          ${a.paragrafos.map(p => `<p>${p}</p>`).join('')}
        </section>`).join('')}
      <h3 class="mundo__subtitle">Setores de Atlântida</h3>
      <div class="map">
        <svg class="map__svg" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
          ${m.setores.filter(s => s.id !== 'central').map(s => `<line x1="50" y1="30" x2="${s.x}" y2="${s.y}"/>`).join('')}
        </svg>
        ${m.setores.map((s, i) => `<button type="button" class="map__node${i === 0 ? ' is-active' : ''}" style="--x:${s.x};--y:${s.y}" data-id="${s.id}" aria-describedby="map-info">${s.nome}</button>`).join('')}
      </div>
      <p id="map-info" class="map__info" aria-live="polite">${m.setores[0].descricao}</p>
    </div>`;

  const tabs = [...container.querySelectorAll('[role="tab"]')];
  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      container.querySelector(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    });
    tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (step) select(tabs[(i + step + tabs.length) % tabs.length]);
    });
  });

  const info = container.querySelector('#map-info');
  const nodes = [...container.querySelectorAll('.map__node')];
  const activate = node => {
    nodes.forEach(n => n.classList.toggle('is-active', n === node));
    info.textContent = m.setores.find(s => s.id === node.dataset.id).descricao;
  };
  nodes.forEach(n => ['mouseenter', 'focus', 'click'].forEach(ev => n.addEventListener(ev, () => activate(n))));
}
```

- [ ] **Step 2: Verificar no navegador**

```js
document.getElementById('panel').hidden = false;
await (await import('/js/areas/mundo.js')).render(document.getElementById('panel-body'));
```
Expected: 4 abas, setas ← → trocam a aba; passar o mouse num setor troca o texto abaixo do mapa.

- [ ] **Step 3: Commit**

```bash
git add js/areas/mundo.js
git commit -m "feat: add O Mundo panel with tabs and sector map"
```

---

### Task 8: Estilos do painel (P3)

**Files:**
- Modify: `css/panel.css` (estava vazio)

**Interfaces:**
- Consumes: classes geradas nas Tasks 4–7 (`.panel__header`, `.eyebrow`, `.lead`, `.tag`, `.tag--live`, `.grid--cards`, `.card*`, `.sheet`, `.filters`, `.chip`, `.feed`, `.post*`, `.form*`, `.field*`, `.signal`, `.mundo*`, `.tabs`, `.map*`)

- [ ] **Step 1: Escrever `css/panel.css`**

```css
.panel {
  position: fixed; inset: 0; z-index: 15;
  display: grid; place-items: center;
  padding: clamp(72px, 10vh, 96px) clamp(16px, 4vw, 48px) 96px;
}
.panel[hidden] { display: none; }
.panel__frame {
  position: relative; width: min(1100px, 100%); max-height: 100%;
  display: flex; flex-direction: column;
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
  box-shadow: 0 0 40px rgb(66 214 208 / .15), inset 0 0 60px rgb(37 37 107 / .5);
  backdrop-filter: blur(10px);
}
.panel__frame::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: repeating-linear-gradient(0deg, rgb(66 214 208 / .035) 0 1px, transparent 1px 3px);
}
.panel__close {
  position: absolute; top: var(--space-3); right: var(--space-3); z-index: 2;
  width: 40px; height: 40px; border-radius: 50%;
  border: 1px solid var(--line); background: var(--abyss); color: var(--cyan);
  font-size: 1.1rem; cursor: pointer;
}
.panel__body { overflow-y: auto; padding: clamp(20px, 4vw, 48px); }
.panel__header { margin-bottom: var(--space-4); max-width: 62ch; }
.panel__header h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); }
.eyebrow { margin: 0 0 var(--space-2); color: var(--cyan); font: 600 .75rem var(--font-body); letter-spacing: .25em; text-transform: uppercase; }
.lead { color: var(--text-dim); margin: 0; }

.tag { display: inline-block; padding: .15rem .6rem; border-radius: 999px; font-size: .72rem; font-weight: 600; background: rgb(104 70 171 / .35); color: #D9C9FF; }
.tag--live { background: rgb(66 214 208 / .15); color: var(--cyan); }
.tag[data-cat="Pedido de ajuda"] { background: rgb(216 180 90 / .2); color: var(--gold); }

/* Habitantes */
.grid--cards { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
.card { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius); background: rgb(37 37 107 / .35); transition: border-color .3s, translate .3s var(--ease-out); }
.card:hover, .card:focus-visible { border-color: var(--cyan); translate: 0 -4px; }
.card__media { position: relative; margin: 0; aspect-ratio: 4 / 5; background: linear-gradient(160deg, var(--deep), var(--violet)); }
.card__media img { display: block; width: 100%; height: 100%; object-fit: cover; }
.card__media img.is-missing { visibility: hidden; }
.card__scan { position: absolute; inset: 0 0 auto; height: 3px; background: var(--cyan); box-shadow: var(--glow-cyan); opacity: 0; }
.card:hover .card__scan, .card:focus-visible .card__scan { opacity: 1; animation: card-scan 1.2s var(--ease-out) forwards; }
@keyframes card-scan { from { top: 0; } to { top: 100%; opacity: 0; } }
.card__body { padding: var(--space-3); }
.card__body h3 { font-size: 1.15rem; margin: var(--space-2) 0 0; }
.card__role { margin: 0 0 var(--space-2); color: var(--gold); font-weight: 600; font-size: .85rem; }
.card__body p { margin: 0; font-size: .9rem; color: var(--text-dim); }
.sheet { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin: var(--space-3) 0 0; padding-top: var(--space-2); border-top: 1px dashed var(--line); font-size: .8rem; max-height: 0; opacity: 0; overflow: hidden; transition: max-height .4s, opacity .4s; }
.card:hover .sheet, .card:focus-visible .sheet { max-height: 120px; opacity: 1; }
.sheet dt { color: var(--cyan); text-transform: uppercase; letter-spacing: .1em; font-size: .65rem; }
.sheet dd { margin: 0; }
@media (hover: none) { .sheet { max-height: none; opacity: 1; } }

/* Mural */
.filters { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-4); }
.chip { padding: .4rem .9rem; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--text); font: 500 .85rem var(--font-body); cursor: pointer; }
.chip[aria-pressed="true"] { background: var(--cyan); border-color: var(--cyan); color: var(--abyss); }
.feed { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-3); }
.post { display: grid; grid-template-columns: 48px 1fr; gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--line); border-radius: var(--radius); background: rgb(37 37 107 / .3); }
.post__avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: var(--violet); }
.post__meta { margin: 0 0 var(--space-2); font-size: .8rem; color: var(--text-dim); }
.post__meta strong { color: var(--text); }
.post p:last-child { margin: var(--space-2) 0 0; }
.feed__empty { color: var(--text-dim); }

/* Fale com o Portal */
.form { display: grid; gap: var(--space-3); max-width: 640px; }
.form[hidden] { display: none; }
.field label { display: block; margin-bottom: var(--space-1); font-weight: 600; font-size: .9rem; }
.req { color: var(--gold); }
.field input, .field select, .field textarea { width: 100%; padding: .75rem .9rem; border-radius: 8px; border: 1px solid var(--line); background: rgb(8 13 43 / .7); color: var(--text); font: inherit; }
.field textarea { min-height: 140px; resize: vertical; }
.field [aria-invalid="true"] { border-color: var(--error); }
.field__error { min-height: 1.2em; margin: var(--space-1) 0 0; color: var(--error); font-size: .82rem; }
.form__hint { margin: 0; font-size: .8rem; color: var(--text-dim); }
.form .btn { justify-self: start; }
.form__success { max-width: 640px; padding: var(--space-5); text-align: center; border: 1px solid var(--cyan); border-radius: var(--radius); background: rgb(66 214 208 / .08); }
.form__success:focus { outline: none; }
.signal { position: relative; display: block; width: 64px; height: 64px; margin: 0 auto var(--space-3); border-radius: 50%; border: 2px solid var(--cyan); }
.signal::before, .signal::after { content: ''; position: absolute; inset: -2px; border-radius: 50%; border: 2px solid var(--cyan); animation: signal 1.8s ease-out infinite; }
.signal::after { animation-delay: .9s; }
@keyframes signal { from { scale: 1; opacity: .8; } to { scale: 2.2; opacity: 0; } }

/* O Mundo */
.mundo { margin: calc(-1 * clamp(20px, 4vw, 48px)); padding: clamp(20px, 4vw, 48px); background: linear-gradient(180deg, rgb(8 13 43 / .55), var(--abyss) 420px), var(--bg) top / cover no-repeat; }
.tabs { display: flex; flex-wrap: wrap; gap: var(--space-1); margin: var(--space-4) 0; border-bottom: 1px solid var(--line); }
.tabs [role="tab"] { padding: .6rem 1rem; border: 0; border-bottom: 2px solid transparent; background: none; color: var(--text-dim); font: 600 .9rem var(--font-body); cursor: pointer; }
.tabs [aria-selected="true"] { color: var(--gold); border-bottom-color: var(--gold); }
[role="tabpanel"] { max-width: 68ch; }
.mundo__subtitle { margin-top: var(--space-5); }
.map { position: relative; aspect-ratio: 100 / 60; border: 1px solid var(--line); border-radius: var(--radius); background: radial-gradient(ellipse at center, rgb(66 214 208 / .12), transparent 70%); }
.map__svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.map__svg line { stroke: var(--cyan); stroke-width: .3; stroke-dasharray: 1 1; opacity: .6; }
.map__node { position: absolute; left: calc(var(--x) * 1%); top: calc(var(--y) * 100% / 60); translate: -50% -50%; padding: .35rem .7rem; border-radius: 999px; border: 1px solid var(--line); background: var(--abyss); color: var(--text); font: 600 clamp(.6rem, 1.2vw, .85rem) var(--font-body); white-space: nowrap; cursor: pointer; }
.map__node.is-active, .map__node:hover { border-color: var(--gold); color: var(--gold); box-shadow: 0 0 16px rgb(216 180 90 / .4); }
.map__info { margin: var(--space-3) 0 0; color: var(--text-dim); text-align: center; }

@media (max-width: 767px) {
  .panel { padding: 0 0 56px; }
  .panel__frame { width: 100%; height: 100%; max-height: none; border-radius: 0; }
  .map__node { padding: .25rem .45rem; }
}
```

- [ ] **Step 2: Verificar no navegador**

Renderizar cada área como nas Tasks 4–7 (snippet de console) e conferir em 1440px e em 375px (DevTools › modo dispositivo): moldura com scanlines, cards em grade, chips, form, abas e mapa legíveis; nada estoura horizontalmente.

- [ ] **Step 3: Commit**

```bash
git add css/panel.css
git commit -m "feat: style holographic panel and area blocks"
```

---

### Task 9: HUD, menu e hotspots (P3)

**Files:**
- Modify: `css/hud.css` (estava vazio)
- Create: `js/hud.js`

**Interfaces:**
- Consumes: hotspot `{ id, label, nav, x, y, depth, side }` (formato definido na Task 10)
- Produces: `renderHotspots(container, hotspots): void`; `renderNav(nav, hotspots): void`; `setArea(id: string, label: string): void` (`''` = Início); `revealHud(): void`

- [ ] **Step 1: Implementar `js/hud.js`**

```js
export function renderHotspots(container, hotspots) {
  container.innerHTML = hotspots.map(h => `
    <a class="hotspot hotspot--${h.side}" href="#${h.id}" data-depth="${h.depth}" style="--x:${h.x};--y:${h.y}">
      <span class="hotspot__dot" aria-hidden="true"></span>
      <span class="hotspot__line" aria-hidden="true"></span>
      <span class="hotspot__label">${h.label}</span>
    </a>`).join('');
}

export function renderNav(nav, hotspots) {
  nav.innerHTML = '<a href="#" data-area="">Início</a>'
    + hotspots.map(h => `<a href="#${h.id}" data-area="${h.id}">${h.nav}</a>`).join('');
}

export function setArea(id, label) {
  document.getElementById('hud-area').textContent = label;
  document.querySelectorAll('#hud-nav a').forEach(a => {
    if (a.dataset.area === id) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

export function revealHud() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.timeline()
    .from('.hud__corner', { scale: 1.6, opacity: 0, duration: .5, stagger: .06, ease: 'back.out(2)' })
    .from('.hud__status, .hud__brand, .hud__nav', { opacity: 0, y: -8, duration: .4, stagger: .08 }, '-=.2')
    .from('.hud__intro', { opacity: 0, x: -20, duration: .5 }, '-=.2')
    .from('.hotspot', { opacity: 0, scale: .6, duration: .4, stagger: .15, ease: 'back.out(2)' }, '-=.1');
}
```

- [ ] **Step 2: Escrever `css/hud.css`**

```css
.hud { position: fixed; inset: 0; z-index: 20; pointer-events: none; }
.hud a, .hud button { pointer-events: auto; }

.hud__corner { position: absolute; width: clamp(28px, 6vw, 64px); aspect-ratio: 1; border: 2px solid var(--cyan); filter: drop-shadow(var(--glow-cyan)); }
.hud__corner--tl { top: var(--space-3); left: var(--space-3); border-right: 0; border-bottom: 0; }
.hud__corner--tr { top: var(--space-3); right: var(--space-3); border-left: 0; border-bottom: 0; }
.hud__corner--bl { bottom: var(--space-3); left: var(--space-3); border-right: 0; border-top: 0; }
.hud__corner--br { bottom: var(--space-3); right: var(--space-3); border-left: 0; border-top: 0; }

.hud__scan { position: absolute; inset: 0 0 auto; height: 18vh; background: linear-gradient(transparent, rgb(66 214 208 / .07), transparent); animation: hud-scan 9s linear infinite; }
@keyframes hud-scan { from { transform: translateY(-20vh); } to { transform: translateY(120vh); } }

.hud__status { position: absolute; top: calc(var(--space-3) + 10px); left: calc(var(--space-3) + 18px); margin: 0; display: flex; gap: var(--space-4); color: var(--cyan); font: 600 .95rem/1 var(--font-body); letter-spacing: .08em; text-transform: uppercase; text-shadow: var(--glow-cyan); }
.hud__area { font-family: var(--font-title); }
.hud__brand { position: absolute; top: calc(var(--space-3) + 8px); right: calc(var(--space-3) + 18px); margin: 0; text-align: right; color: var(--gold); font: 500 1.15rem var(--font-title); letter-spacing: .06em; }
.hud__brand small { display: block; color: var(--text-dim); font: 500 .62rem var(--font-body); letter-spacing: .3em; text-transform: uppercase; }

.hud__intro { position: absolute; left: clamp(16px, 5vw, 72px); bottom: clamp(88px, 14vh, 140px); max-width: min(440px, 80vw); padding: var(--space-4); border-left: 2px solid var(--cyan); background: linear-gradient(90deg, rgb(8 13 43 / .8), rgb(8 13 43 / .2)); pointer-events: auto; }
.hud__intro h1 { font-size: clamp(1.5rem, 3.2vw, 2.6rem); }
.hud__intro p { margin: 0 0 var(--space-3); color: var(--text-dim); }

.hud__nav { position: absolute; left: 50%; bottom: var(--space-3); translate: -50% 0; display: flex; gap: var(--space-1); padding: var(--space-1); border: 1px solid var(--line); border-radius: 999px; background: var(--surface); backdrop-filter: blur(8px); }
.hud__nav a { padding: .5rem 1rem; border-radius: 999px; color: var(--text); font-weight: 500; font-size: .9rem; text-decoration: none; white-space: nowrap; }
.hud__nav a:hover, .hud__nav a[aria-current="page"] { background: var(--cyan); color: var(--abyss); }

.is-panel-open .hud__intro, .is-panel-open .hotspots { opacity: 0; visibility: hidden; transition: opacity .3s, visibility .3s; }

/* Hotspots (ficam dentro da cena; posição em % da imagem) */
.hotspots { pointer-events: none; }
.hotspot { position: absolute; left: calc(var(--x) * 1%); top: calc(var(--y) * 1%); color: var(--cyan); text-decoration: none; pointer-events: auto; }
.hotspot__dot { position: absolute; width: 14px; height: 14px; translate: -50% -50%; border-radius: 50%; background: var(--cyan); box-shadow: var(--glow-cyan); animation: dot-pulse 3s ease-in-out infinite; }
.hotspot__dot::after { content: ''; position: absolute; inset: -8px; border: 1px solid var(--cyan); border-radius: 50%; opacity: .6; }
.hotspot__line { position: absolute; left: 0; top: 0; width: 80px; height: 1px; background: var(--cyan); transform-origin: 0 0; rotate: -35deg; }
.hotspot__label { position: absolute; left: 62px; top: -62px; padding: .3rem .6rem; background: rgb(8 13 43 / .6); font: 600 clamp(.75rem, 1.1vw, 1rem)/1 var(--font-title); letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; text-shadow: var(--glow-cyan); }
.hotspot--left .hotspot__line { rotate: -145deg; }
.hotspot--left .hotspot__label { left: auto; right: 62px; }
.hotspot__label::before, .hotspot__label::after { content: ''; position: absolute; top: -6px; bottom: -6px; width: 10px; border: 2px solid var(--cyan); opacity: 0; transition: .25s var(--ease-out); }
.hotspot__label::before { left: -16px; border-right: 0; }
.hotspot__label::after { right: -16px; border-left: 0; }
.hotspot:hover .hotspot__label::before, .hotspot:focus-visible .hotspot__label::before { left: -6px; opacity: 1; }
.hotspot:hover .hotspot__label::after, .hotspot:focus-visible .hotspot__label::after { right: -6px; opacity: 1; }
.hotspot:focus-visible { outline: none; }
@keyframes dot-pulse { 50% { scale: 1.35; opacity: .7; } }

@media (max-width: 767px) {
  .hud__nav { left: 0; right: 0; bottom: 0; translate: none; justify-content: flex-start; overflow-x: auto; border-radius: 0; }
  .hud__corner--bl, .hud__corner--br { bottom: 64px; }
  .hud__status { font-size: .75rem; gap: var(--space-2); }
  .hud__brand { font-size: .9rem; }
  .hud__brand small { display: none; }
  .hud__intro { left: 16px; right: 16px; bottom: 72px; max-width: none; padding: var(--space-3); }
  .hotspot__line { width: 48px; }
  .hotspot__label { left: 36px; top: -40px; }
  .hotspot--left .hotspot__label { right: 36px; }
}
```

- [ ] **Step 3: Verificar no navegador**

Console:
```js
const hud = await import('/js/hud.js');
const hs = [{ id: 'mural', label: 'Mural da Comunidade', nav: 'Mural', x: 17, y: 30, depth: .15, side: 'right' }];
hud.renderHotspots(document.getElementById('hotspots'), hs);
hud.renderNav(document.getElementById('hud-nav'), hs);
hud.setArea('', 'Início');
```
Expected: (cena ainda sem CSS, imagem solta) cantos ciano, status `↓ 3.000 m INÍCIO`, marca dourada, intro à esquerda, menu em pílula com "Início" ativo; hotspot com ponto pulsante, linha e label; hover fecha colchetes.

- [ ] **Step 4: Commit**

```bash
git add css/hud.css js/hud.js
git commit -m "feat: add glasses HUD, nav and hotspot callouts"
```

---

### Task 10: Rotas e transição de painel (P3)

**Files:**
- Create: `js/lib/route.js`, `tests/route.test.js`, `js/router.js`, `data/hotspots.json`, `tests/hotspots.test.js`

**Interfaces:**
- Consumes: `setArea` (Task 9); `scene.setSpeed(n)` (Task 11, objeto passado por parâmetro); módulos `js/areas/<id>.js` com `render(container)` (Tasks 4–7)
- Produces: `parseHash(hash: string, ids: string[]): string|null`; `initRouter({ hotspots, scene }): void`; `data/hotspots.json` no formato `{ id, label, nav, x, y, depth, side: 'left'|'right', zoom: { scale, x, y } }`

- [ ] **Step 1: Escrever os testes**

`tests/route.test.js`:
```js
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
```

`tests/hotspots.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const hotspots = JSON.parse(readFileSync(new URL('../data/hotspots.json', import.meta.url), 'utf8'));

test('as 4 áreas obrigatórias existem, na ordem do menu', () => {
  assert.deepEqual(hotspots.map(h => h.id), ['mundo', 'habitantes', 'mural', 'portal']);
});

test('cada hotspot tem campos completos e um módulo de área', () => {
  for (const h of hotspots) {
    for (const k of ['label', 'nav', 'x', 'y', 'depth', 'side', 'zoom']) assert.ok(h[k] !== undefined, `${h.id} sem ${k}`);
    assert.ok(['left', 'right'].includes(h.side));
    for (const k of ['scale', 'x', 'y']) assert.equal(typeof h.zoom[k], 'number');
    assert.ok(existsSync(new URL(`../js/areas/${h.id}.js`, import.meta.url)), `falta js/areas/${h.id}.js`);
  }
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL com `Cannot find module ... js/lib/route.js` e `ENOENT ... hotspots.json`

- [ ] **Step 3: Implementar `js/lib/route.js` e `data/hotspots.json`**

```js
export function parseHash(hash, ids) {
  let id;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return null; }
  return ids.includes(id) ? id : null;
}
```

```json
[
  { "id": "mundo", "label": "O Mundo", "nav": "O Mundo", "x": 64, "y": 30, "depth": 0.25, "side": "left", "zoom": { "scale": 2, "x": 64, "y": 38 } },
  { "id": "habitantes", "label": "Habitantes", "nav": "Habitantes", "x": 36, "y": 50, "depth": 0.5, "side": "right", "zoom": { "scale": 1.5, "x": 35, "y": 60 } },
  { "id": "mural", "label": "Mural da Comunidade", "nav": "Mural", "x": 17, "y": 30, "depth": 0.15, "side": "right", "zoom": { "scale": 1.7, "x": 15, "y": 40 } },
  { "id": "portal", "label": "Fale com o Portal", "nav": "Fale com o Portal", "x": 82, "y": 44, "depth": 0.55, "side": "left", "zoom": { "scale": 1.6, "x": 80, "y": 55 } }
]
```

- [ ] **Step 4: Rodar testes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Implementar `js/router.js`**

```js
import { parseHash } from './lib/route.js';
import { setArea } from './hud.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function initRouter({ hotspots, scene }) {
  const ids = hotspots.map(h => h.id);
  const viewport = document.getElementById('viewport');
  const camera = document.getElementById('camera');
  const panel = document.getElementById('panel');
  const frame = panel.querySelector('.panel__frame');
  const body = document.getElementById('panel-body');
  const closeBtn = panel.querySelector('.panel__close');
  const nav = document.getElementById('hud-nav');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const d = s => (reduce ? 0 : s);
  let current = null;
  let returnFocus = null;

  async function open(id) {
    const h = hotspots.find(x => x.id === id);
    if (!current) returnFocus = document.activeElement;
    current = id;
    scene.setSpeed(0.3);
    document.body.classList.add('is-panel-open');
    viewport.classList.add('is-dimmed');
    setArea(id, h.label);
    gsap.to(camera, { scale: h.zoom.scale, transformOrigin: `${h.zoom.x}% ${h.zoom.y}%`, duration: d(0.8), ease: 'power2.inOut' });
    const mod = await import(`./areas/${id}.js`);
    if (current !== id) return;
    body.innerHTML = '';
    await mod.render(body);
    if (current !== id) return;
    panel.hidden = false;
    body.scrollTop = 0;
    gsap.fromTo(frame,
      { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
      { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: d(0.5), delay: d(0.3), ease: 'power2.out' });
    closeBtn.focus();
  }

  function close() {
    current = null;
    scene.setSpeed(1);
    document.body.classList.remove('is-panel-open');
    viewport.classList.remove('is-dimmed');
    panel.hidden = true;
    body.innerHTML = '';
    setArea('', 'Início');
    gsap.to(camera, { scale: 1, duration: d(0.8), ease: 'power2.inOut' });
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
  }

  function sync() {
    const id = parseHash(location.hash, ids);
    if (id && id !== current) open(id);
    else if (!id && current) close();
  }

  const goHome = () => { location.hash = ''; };
  closeBtn.addEventListener('click', goHome);
  panel.addEventListener('click', e => { if (e.target === panel) goHome(); });
  document.addEventListener('keydown', e => {
    if (panel.hidden) return;
    if (e.key === 'Escape') { goHome(); return; }
    if (e.key !== 'Tab') return;
    const items = [...frame.querySelectorAll(FOCUSABLE), ...nav.querySelectorAll('a')]
      .filter(el => !el.closest('[hidden]'));
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.addEventListener('hashchange', sync);
  setArea('', 'Início');
  sync();
}
```

- [ ] **Step 6: Verificar no navegador (com cena falsa)**

Console:
```js
const hs = await fetch('/data/hotspots.json').then(r => r.json());
const hud = await import('/js/hud.js');
hud.renderHotspots(document.getElementById('hotspots'), hs);
hud.renderNav(document.getElementById('hud-nav'), hs);
(await import('/js/router.js')).initRouter({ hotspots: hs, scene: { setSpeed() {} } });
location.hash = '#habitantes';
```
Expected: a câmera aproxima, a cena escurece, o painel Habitantes materializa, o foco vai pro ✕. `Esc` volta ao Início e o foco retorna. Menu troca de área direto, com o painel aberto. `/#mural` digitado na URL abre o Mural.

- [ ] **Step 7: Commit**

```bash
git add js/lib/route.js tests/route.test.js js/router.js data/hotspots.json tests/hotspots.test.js
git commit -m "feat: add hash router with camera zoom and panel transition"
```

---

### Task 11: Cena e loop de 18s (P2)

**Files:**
- Create: `js/lib/loop.js`, `tests/loop.test.js`, `js/scene.js`
- Modify: `css/scene.css` (estava vazio)

**Interfaces:**
- Produces: `LOOP = 18`; `cycles(period): number` (lança erro se o período não divide 18); `yoyoRepeat(period): number`; `initScene(sceneEl): { timeline, setSpeed(n: number): void }`

- [ ] **Step 1: Escrever o teste**

`tests/loop.test.js`:
```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL com `Cannot find module ... js/lib/loop.js`

- [ ] **Step 3: Implementar `js/lib/loop.js`**

```js
export const LOOP = 18;

export function cycles(period) {
  const n = LOOP / period;
  if (Math.abs(n - Math.round(n)) > 1e-9) throw new Error(`Período ${period}s não fecha em ${LOOP}s`);
  return Math.round(n);
}

// yoyo com meia-duração period/2: 2 passadas por ciclo, número par → termina no início
export function yoyoRepeat(period) {
  return cycles(period) * 2 - 1;
}
```

- [ ] **Step 4: Rodar testes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Escrever `css/scene.css`**

```css
.viewport { position: fixed; inset: 0; overflow: hidden; background: var(--abyss); transition: filter .6s var(--ease-out); }
.viewport.is-dimmed { filter: blur(5px) brightness(.5); }

/* camera = caixa 16:9 que cobre a tela; % de hotspots/zoom são relativos a ela */
.camera {
  position: absolute;
  width: max(100vw, 177.78vh); height: max(100vh, 56.25vw);
  left: calc((100vw - max(100vw, 177.78vh)) / 2);
  top: calc((100vh - max(100vh, 56.25vw)) / 2);
  will-change: transform;
}

.scene {
  position: absolute; inset: 0;
  /* ponytail: posições calibradas sobre a arte; ajustar quando taverna-fundo.webp final chegar */
  --porthole-x: 55.5%; --porthole-y: 24%; --porthole-size: 17%;
  --robo-x: 78%; --robo-y: 43%; --robo-h: 50%; --robo-ratio: 2 / 5;
  --robo-shoulder: 45% 30%; --robo-eye-x: 55%; --robo-eye-y: 12%; --robo-tap-x: 8%; --robo-tap-y: 48%;
  --cliente-x: 21%; --cliente-y: 58%; --cliente-h: 30%; --cliente-ratio: 3 / 4;
  --cliente-shoulder: 70% 35%;
  --fog: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.006 .02' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .6 0 0 0 0 .8 0 0 0 0 .85 0 0 0 1.1 -.45'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E");
}

.layer { position: absolute; inset: 0; pointer-events: none; }
.layer--bg { width: 100%; height: 100%; object-fit: cover; }

.porthole { inset: auto; left: var(--porthole-x); top: var(--porthole-y); width: var(--porthole-size); aspect-ratio: 1; border-radius: 50%; overflow: hidden; mix-blend-mode: screen; opacity: .85; }
.porthole__fish { position: absolute; left: 0; top: 30%; width: 200%; height: 40%; background: url(../assets/img/cardume.webp) repeat-x left center / 50% auto; opacity: .7; }
.porthole__shark { position: absolute; left: 0; top: 20%; width: 40%; }
.bubbles span { position: absolute; bottom: -6%; left: calc(var(--i) * 8% + 2%); width: 3%; aspect-ratio: 1; border-radius: 50%; border: 1px solid rgb(180 240 255 / .5); animation: rise 6s linear infinite; animation-delay: calc(var(--i) * -.5s); }
.bubbles span:nth-child(odd) { animation-duration: 3s; }
@keyframes rise { from { transform: translateY(0); opacity: 0; } 15% { opacity: .8; } to { transform: translateY(-3600%); opacity: 0; } }

.fog { inset: 0 auto 0 0; width: 200%; background: var(--fog) repeat-x 0 0 / 50% 100%; mix-blend-mode: screen; }
.fog--back { opacity: .3; }
.fog--front { opacity: .22; -webkit-mask-image: linear-gradient(transparent 40%, #000); mask-image: linear-gradient(transparent 40%, #000); }

.actor { inset: auto; }
.actor--robo { left: var(--robo-x); top: var(--robo-y); height: var(--robo-h); aspect-ratio: var(--robo-ratio); }
.actor--cliente { left: var(--cliente-x); top: var(--cliente-y); height: var(--cliente-h); aspect-ratio: var(--cliente-ratio); }
.actor__body, .actor__arm { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.actor--robo .actor__arm { transform-origin: var(--robo-shoulder); }
.actor--cliente .actor__arm { transform-origin: var(--cliente-shoulder); }
.robo__eye { position: absolute; left: var(--robo-eye-x); top: var(--robo-eye-y); width: 6%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 10px 3px var(--cyan); }
.robo__pour { position: absolute; left: var(--robo-tap-x); top: var(--robo-tap-y); width: 2%; height: 12%; border-radius: 2px; background: linear-gradient(#F4C56A, #D89A2B); transform-origin: top; transform: scaleY(0); }

.glow { position: absolute; left: calc(var(--x) * 1%); top: calc(var(--y) * 1%); width: 9%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: radial-gradient(circle, rgb(255 186 92 / .55), rgb(255 186 92 / 0) 65%); mix-blend-mode: screen; }

.dust { background-image: radial-gradient(rgb(255 230 180 / .5) 1px, transparent 1.5px); background-size: 120px 120px; opacity: .25; animation: dust 18s linear infinite; -webkit-mask-image: radial-gradient(ellipse at 60% 30%, #000, transparent 60%); mask-image: radial-gradient(ellipse at 60% 30%, #000, transparent 60%); }
@keyframes dust { to { background-position: 120px -240px; } }

@media (max-width: 767px) and (orientation: portrait) {
  .viewport { overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
  .viewport::-webkit-scrollbar { display: none; }
  .camera { left: 0; }
}
```

- [ ] **Step 6: Implementar `js/scene.js`**

```js
import { LOOP, yoyoRepeat } from './lib/loop.js';

export function initScene(scene) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = s => scene.querySelector(s);
  spawnBubbles(q('.bubbles'));

  const tl = gsap.timeline({ repeat: -1, paused: reduce, defaults: { ease: 'sine.inOut' } });
  const pulse = (target, vars, period) =>
    tl.to(target, { ...vars, duration: period / 2, yoyo: true, repeat: yoyoRepeat(period) }, 0);

  // Ambiente — sempre rodando, períodos divisores de 18
  scene.querySelectorAll('.glow').forEach((g, i) => pulse(g, { opacity: .45, scale: .92 }, [1.5, 2, 3][i % 3]));
  pulse(scene, { y: 2, rotation: .12 }, 6);
  tl.fromTo(q('.fog--back'), { xPercent: 0 }, { xPercent: -50, duration: LOOP, ease: 'none' }, 0);
  tl.fromTo(q('.fog--front'), { xPercent: -50 }, { xPercent: 0, duration: LOOP / 2, ease: 'none', repeat: 1 }, 0);
  tl.fromTo(q('.porthole__fish'), { xPercent: 0 }, { xPercent: -50, duration: LOOP / 2, ease: 'none', repeat: 1 }, 0);

  const depth = { v: 0 };
  const out = document.getElementById('hud-depth');
  tl.to(depth, {
    v: 2, duration: 4.5, yoyo: true, repeat: yoyoRepeat(9),
    onUpdate: () => { out.textContent = (3000 + Math.round(depth.v)).toLocaleString('pt-BR'); },
  }, 0);

  // Tubarão: entra 7s, sai 14s, fora de vista no resto do loop
  tl.fromTo(q('.porthole__shark'), { xPercent: -120 }, { xPercent: 260, duration: 7, ease: 'none' }, 7);

  // Robô bartender
  const rArm = q('.actor--robo .actor__arm');
  tl.to(rArm, { rotation: -8, duration: .75, yoyo: true, repeat: 3 }, 0);          // 0–3 limpa o balcão
  tl.to(rArm, { rotation: -30, duration: 1.5 }, 3);                                // 3–4.5 vai à torneira
  tl.fromTo(q('.robo__pour'), { scaleY: 0 }, { scaleY: 1, duration: .4 }, 4.5);    // enche
  tl.to(q('.robo__pour'), { scaleY: 0, duration: .4 }, 6.6);
  tl.to(rArm, { rotation: -55, y: -12, duration: 1.5 }, 7);                        // 7–8.5 ergue a caneca
  tl.to(q('.robo__eye'), { opacity: .15, duration: .15, yoyo: true, repeat: 5 }, 8); // pisca
  tl.to(rArm, { rotation: -30, y: 0, duration: 1.5 }, 10);                         // 10–11.5 pousa
  tl.to(rArm, { rotation: 0, duration: 1.5 }, 14);                                 // 14–15.5 volta
  tl.to(rArm, { rotation: -8, duration: .625, yoyo: true, repeat: 3 }, 15.5);      // 15.5–18 limpa → pose inicial

  // Cliente (Torak)
  const cArm = q('.actor--cliente .actor__arm');
  tl.to(cArm, { rotation: 4, duration: .75, yoyo: true, repeat: 3 }, 0);           // 0–3 gesticula
  tl.to(cArm, { rotation: -40, duration: 2 }, 3);                                  // 3–5 levanta a caneca
  tl.to(cArm, { rotation: -48, duration: .5, yoyo: true, repeat: 1 }, 7);          // 7–8 brinde
  tl.to(cArm, { rotation: -75, y: -6, duration: 1.5 }, 10);                        // 10–11.5 bebe
  tl.to(cArm, { rotation: 0, y: 0, duration: 2.5 }, 14);                           // 14–16.5 pousa
  tl.to(cArm, { rotation: 4, duration: .375, yoyo: true, repeat: 3 }, 16.5);       // 16.5–18 → pose inicial

  console.assert(Math.abs(tl.duration() - LOOP) < 1e-6, `loop com ${tl.duration()}s, esperado ${LOOP}s`);

  return {
    timeline: tl,
    setSpeed: n => gsap.to(tl, { timeScale: n, duration: .6, overwrite: true }),
  };
}

function spawnBubbles(el) {
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('span');
    b.style.setProperty('--i', i);
    el.append(b);
  }
}
```

- [ ] **Step 7: Verificar no navegador**

Console:
```js
const s = (await import('/js/scene.js')).initScene(document.getElementById('scene'));
s.timeline.duration();
```
Expected: `18`, sem `Assertion failed` no console. Lanternas pulsam, névoa corre, profundidade oscila 3.000–3.002. Depois `s.timeline.seek(17.99)` e `s.timeline.seek(0)`: as poses devem ser visualmente idênticas. (Com o placeholder, robô/cliente/tubarão ainda não aparecem — confirmar com a arte da Task 2 e ajustar as variáveis `--robo-*`/`--cliente-*`/`--porthole-*`.)

- [ ] **Step 8: Commit**

```bash
git add js/lib/loop.js tests/loop.test.js js/scene.js css/scene.css
git commit -m "feat: add layered tavern scene with seamless 18s GSAP loop"
```

---

### Task 12: Olhar em volta — parallax e mobile (P2)

**Files:**
- Create: `js/look.js`

**Interfaces:**
- Consumes: elementos com `data-depth` (camadas da Task 1 e hotspots da Task 9)
- Produces: `initLook(viewport, scene): void` — chamar **depois** de `renderHotspots`

- [ ] **Step 1: Implementar `js/look.js`**

```js
const MAX = 28;
const clamp = v => Math.max(-1, Math.min(1, v));

export function initLook(viewport, scene) {
  if (matchMedia('(hover: none)').matches) {
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layers = [...scene.querySelectorAll('[data-depth]')].map(el => ({
    depth: Number(el.dataset.depth),
    x: gsap.quickTo(el, 'x', { duration: .9, ease: 'power3.out' }),
    y: gsap.quickTo(el, 'y', { duration: .9, ease: 'power3.out' }),
  }));
  const look = (nx, ny) => layers.forEach(l => { l.x(-nx * l.depth * MAX); l.y(-ny * l.depth * MAX * .6); });

  window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    look((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
  });
  // ponytail: sem pedido de permissão do iOS (DeviceOrientationEvent.requestPermission); no iPhone fica só o arrasto
  window.addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    look(clamp(e.gamma / 30), clamp((e.beta - 45) / 30));
  });
}
```

- [ ] **Step 2: Verificar no navegador**

Console (com a cena e hotspots renderizados, como nas Tasks 9 e 11):
```js
(await import('/js/look.js')).initLook(document.getElementById('viewport'), document.getElementById('scene'));
```
Expected: mover o mouse desloca as camadas da frente mais que o fundo; os hotspots acompanham o objeto que marcam. DevTools em 375×812: dá para arrastar a cena na horizontal e ela começa centralizada.

- [ ] **Step 3: Commit**

```bash
git add js/look.js
git commit -m "feat: add head-look parallax and mobile look-around"
```

---

### Task 13: Boot dos óculos (P3)

**Files:**
- Create: `js/boot.js`
- Modify: `css/hud.css` (adicionar o bloco do boot no fim)

**Interfaces:**
- Consumes: classe `will-boot` no `<html>` (Task 1)
- Produces: `runBoot(): Promise<void>` — resolve quando o boot termina, é pulado ou não precisa rodar

- [ ] **Step 1: Implementar `js/boot.js`**

```js
const KEY = 'nautilus.booted';
const LINES = ['REDE NÁUTILUS · OS v3.0', 'Calibrando ótica ........ ok', 'Profundidade: 3.000 m', 'Sincronizando com a comunidade...'];

export function runBoot() {
  const root = document.documentElement;
  if (!root.classList.contains('will-boot')) return Promise.resolve();

  const boot = document.getElementById('boot');
  const log = boot.querySelector('.boot__log');
  const viewport = document.getElementById('viewport');

  return new Promise(resolve => {
    const finish = () => {
      gsap.set(viewport, { clearProps: 'filter' });
      root.classList.remove('will-boot');
      try { localStorage.setItem(KEY, '1'); } catch {}
      resolve();
    };
    const tl = gsap.timeline({ onComplete: finish });
    tl.set(viewport, { filter: 'blur(14px) brightness(.6)' });
    tl.from(boot.querySelector('.boot__line'), { scaleX: 0, duration: .4, ease: 'power2.out' });

    let done = '';
    for (const line of LINES) {
      const c = { n: 0 };
      tl.to(c, {
        n: line.length, duration: line.length * .018, ease: 'none',
        onUpdate: () => { log.textContent = done + line.slice(0, Math.round(c.n)); },
        onComplete: () => { done += line + '\n'; },
      });
      tl.to({}, { duration: .12 });
    }

    tl.to(boot.querySelector('.boot__screen'), { opacity: 0, duration: .25 });
    tl.to(boot.querySelector('.boot__lid--top'), { yPercent: -100, duration: .6, ease: 'power2.inOut' }, 'open');
    tl.to(boot.querySelector('.boot__lid--bottom'), { yPercent: 100, duration: .6, ease: 'power2.inOut' }, 'open');
    tl.to(viewport, { filter: 'blur(0px) brightness(1)', duration: .9, ease: 'power2.out' }, 'open+=.2');

    boot.querySelector('.boot__skip').addEventListener('click', () => tl.progress(1), { once: true });
  });
}
```

- [ ] **Step 2: Adicionar ao fim de `css/hud.css`**

```css
/* Boot */
.boot { position: fixed; inset: 0; z-index: 50; }
.boot__lid { position: absolute; left: 0; right: 0; height: 50%; background: #000; }
.boot__lid--top { top: 0; }
.boot__lid--bottom { bottom: 0; }
.boot__screen { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: var(--space-3); }
.boot__line { display: block; width: min(360px, 70vw); height: 2px; background: var(--cyan); box-shadow: var(--glow-cyan); }
.boot__log { margin: 0; min-height: 6.5em; color: var(--cyan); font: 500 .9rem/1.6 ui-monospace, Consolas, monospace; text-shadow: var(--glow-cyan); white-space: pre; }
.boot__skip { position: absolute; right: var(--space-4); bottom: var(--space-4); padding: .5rem 1rem; border: 1px solid var(--line); border-radius: 999px; background: transparent; color: var(--cyan); font: 600 .85rem var(--font-body); cursor: pointer; }
```

- [ ] **Step 3: Verificar no navegador**

Console: `localStorage.removeItem('nautilus.booted'); location.reload();` e, após o carregamento:
```js
document.documentElement.classList.add('will-boot');
await (await import('/js/boot.js')).runBoot();
```
Expected: linha ciano, 4 linhas digitadas, as pálpebras abrem e a cena sai do desfoque em ~3,5s. "Pular" encerra na hora. Com `localStorage['nautilus.booted']` presente, o `<html>` já carrega sem `will-boot` e o boot não aparece.

- [ ] **Step 4: Commit**

```bash
git add js/boot.js css/hud.css
git commit -m "feat: add smart-glasses boot sequence"
```

---

### Task 14: Integração (`main.js`) (P2)

**Files:**
- Modify: `js/main.js` (estava vazio)

**Interfaces:**
- Consumes: `renderHotspots`, `renderNav`, `revealHud` (Task 9); `initScene` (Task 11); `initLook` (Task 12); `runBoot` (Task 13); `initRouter` (Task 10)

- [ ] **Step 1: Escrever `js/main.js`**

```js
import { renderHotspots, renderNav, revealHud } from './hud.js';
import { initScene } from './scene.js';
import { initLook } from './look.js';
import { runBoot } from './boot.js';
import { initRouter } from './router.js';

const hotspots = await fetch('data/hotspots.json').then(r => r.json());
const viewport = document.getElementById('viewport');
const sceneEl = document.getElementById('scene');

renderHotspots(document.getElementById('hotspots'), hotspots);
renderNav(document.getElementById('hud-nav'), hotspots);
const scene = initScene(sceneEl);
initLook(viewport, sceneEl);

await runBoot();
revealHud();
initRouter({ hotspots, scene });
```

- [ ] **Step 2: Rodar testes**

Run: `npm test`
Expected: PASS (todos)

- [ ] **Step 3: Verificar o fluxo completo no navegador**

1. `localStorage.clear()` e recarregar `http://localhost:5173`: boot → taverna em loop → HUD encaixa → hotspots aparecem em sequência.
2. Recarregar: sem boot.
3. Clicar em cada hotspot e em cada item do menu: zoom + painel; ✕, `Esc`, clique fora e "Início" fecham.
4. Abrir `http://localhost:5173/#portal` direto: o painel abre depois do HUD.
5. Navegar só com o teclado (Tab/Enter/Esc): skip-link, hotspots, menu, painel com foco preso.
6. DevTools › Rendering › `prefers-reduced-motion: reduce`, recarregar: sem boot, cena parada, painéis abrem sem animação.
7. Console sem erros (fora 404 de arte ainda não entregue).

- [ ] **Step 4: Commit**

```bash
git add js/main.js
git commit -m "feat: wire boot, scene, HUD and router together"
```

---

### Task 15: Publicação e verificação final (todos, sexta 23/10)

**Files:**
- Create: `README.md`

- [ ] **Step 1: Escrever `README.md`**

````markdown
# Rede Náutilus — A comunidade de Atlântida

Portal da VR CODE ARENA (FIAP NEXT 2026). Você está na Taverna do Náutilus, a 3.000 m de profundidade, vendo tudo pelos óculos da Rede.

**Site:** https://defxico.github.io/atlantida-project/

## Rodar local
```bash
npm run dev   # http://localhost:5173
npm test
```

## Como mexer (CODE DROP)
- **Cores, fontes, espaços:** `css/tokens.css`
- **Conteúdo:** `data/*.json`
- **Nova área:** adicione uma entrada em `data/hotspots.json` (posição `x`/`y` em % da cena) e crie `js/areas/<id>.js` exportando `render(container)`. O menu e o hotspot aparecem sozinhos.
- **Animação da taverna:** `js/scene.js` (loop de 18s; períodos precisam dividir 18)
````

- [ ] **Step 2: Commit e push** (pedir confirmação ao usuário antes do push)

```bash
git add README.md
git commit -m "docs: add README with CODE DROP guide"
git push origin main
```

- [ ] **Step 3: Ativar o GitHub Pages** (pedir confirmação ao usuário: altera configuração do repositório)

```bash
gh api -X POST repos/defxico/atlantida-project/pages -f "source[branch]=main" -f "source[path]=/"
```
Expected: JSON com `"html_url": "https://defxico.github.io/atlantida-project/"`. Aguardar ~1 min.

- [ ] **Step 4: Checklist final na URL publicada**

- [ ] Loop: gravar 40s de tela (Win+Alt+R) e conferir que não há salto em 18s e 36s
- [ ] 5 áreas acessíveis pelo menu a partir de qualquer área
- [ ] Habitantes: 6 cards com retrato; Mural: 6 posts do mais recente ao mais antigo
- [ ] Form: cada obrigatório vazio mostra erro; envio válido mostra a confirmação
- [ ] 375px, 768px e 1920×1080 (telão) sem rolagem horizontal indesejada
- [ ] DevTools › Performance: ~60fps na taverna; Network: total < 8 MB
- [ ] Lighthouse › Acessibilidade ≥ 90
- [ ] Copiar a pasta do projeto + URL + link do repositório para o pen drive
- [ ] Ensaiar o pitch de 2 min com o site rodando na URL publicada

## Cortes se atrasar (nesta ordem)

1. Giroscópio: remover o listener `deviceorientation` em `js/look.js`
2. Tubarão: remover o tween do tubarão em `js/scene.js` e o `<img class="porthole__shark">`
3. Mapa interativo: trocar o `.map` em `js/areas/mundo.js` por uma lista simples dos setores
4. Boot: reduzir `LINES` em `js/boot.js` para 2 linhas
