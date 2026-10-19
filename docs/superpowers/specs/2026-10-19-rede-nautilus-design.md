# Rede Náutilus — Design Spec

- **Data:** 2026-10-19
- **Evento:** FIAP NEXT — VR CODE ARENA, Fase 1 (Portal Base), 2026-10-24
- **Time:** 4 pessoas (P1–P4)
- **Referências:** `docs/referencia_inicial/` — `VR CODE ARENA - Atlantida.pptx` (requisitos), `conceito_01.png` (POV + HUD), `conceito_02.jpeg` (estética UI), `paleta_de_cores.jpeg` (cores/logo)

## 1. Conceito

Portal da comunidade de Atlântida visto **pelos olhos do usuário**, que usa óculos tecnológicos. A tela é o campo de visão em primeira pessoa; a UI dos óculos (HUD diegético) aponta os elementos da cena. A homepage é a taverna "O Náutilus", em motion contínuo com loop perfeito de 18s. Cada área do portal é um painel holográfico aberto pelos óculos sobre a cena.

## 2. Requisitos obrigatórios (FIAP)

- 5 áreas: Início, O Mundo, Habitantes, Mural da Comunidade, Fale com o Portal
- Início: nome + slogan, destaque visual, propósito, chamadas para as demais áreas
- O Mundo: origem, cotidiano, regras/limitações/desafios, por que o portal é necessário
- Habitantes: ≥6 cards (nome, imagem, função, descrição), papéis variados
- Mural: ≥5 posts em ordem cronológica (autor = habitante, data, texto), gerados de JSON
- Fale com o Portal: formulário coerente com o universo, validação de obrigatórios com mensagens claras, confirmação após envio
- Menu em todas as áreas; responsivo (celular, tablet, desktop); CSS com variáveis; blocos reaproveitáveis; menu fácil de expandir
- GitHub com commits de todos; publicado em GitHub Pages
- Código editável ao vivo no **CODE DROP** (~15 min) — prioridade de legibilidade

## 3. Stack

HTML + CSS + JS vanilla (ES modules) + **GSAP** (via CDN, versão fixa). Sem build. Fontes: Cinzel (títulos), Montserrat (texto), Google Fonts.

**Paleta (`tokens.css`):** `--abyss #080D2B` · `--deep #25256B` · `--violet #6846AB` · `--cyan #42D6D0` (HUD, bordas, foco) · `--gold #D8B45A` (CTAs, logo).

## 4. Arquitetura

Página única; rotas por hash (`#mundo`, `#habitantes`, `#mural`, `#portal`; vazio = Início).

```
index.html
css/  tokens.css  hud.css  scene.css  panel.css
js/   main.js  boot.js  scene.js  look.js  router.js
      areas/  mundo.js  habitantes.js  mural.js  portal.js
data/ hotspots.json  habitantes.json  mural.json  mundo.json
assets/img/
```

| Unidade | Responsabilidade | Depende de |
|---|---|---|
| `tokens.css` | variáveis de cor, fonte, espaçamento | — |
| `boot.js` | sequência de ligar os óculos | GSAP, `localStorage` |
| `scene.js` | timeline mestre do loop; expõe `setSpeed(n)` | GSAP |
| `look.js` | parallax por mouse/giroscópio/arrasto | DOM da cena |
| `router.js` | hash → zoom na região do hotspot + abre/fecha painel | `hotspots.json`, `scene.js`, `areas/*` |
| `areas/*.js` | cada um exporta `render(container)` lendo seu JSON | JSON da área |

**Extensão (CODE DROP):** nova área = 1 entrada em `hotspots.json` + 1 arquivo em `areas/` exportando `render`. Conteúdo só em JSON. Tema só em `tokens.css`.

Formato de `hotspots.json`:
```json
[{ "id": "habitantes", "label": "Habitantes", "x": 34, "y": 52, "zoom": { "scale": 1.6, "x": 34, "y": 55 } }]
```
`x`/`y` em % da cena.

## 5. Cena e loop (18s)

**Camadas (de trás para frente):** fundo da taverna vazio → vigia (cardume, tubarão, bolhas) → névoa traseira → cliente da mesa (corpo + braço) → robô bartender (corpo + braço) → névoa frontal → brilhos das lanternas → poeira/feixes → HUD.

**Regra do loop:** timeline GSAP mestre de 18s, `repeat: -1`. Todo tween de personagem termina no estado inicial em t=18. Efeitos cíclicos usam períodos divisores de 18 (1,5 · 2 · 3 · 6 · 9 · 18s).

| Tempo | Robô | Cliente | Vigia |
|---|---|---|---|
| 0–3s | limpa o balcão | gesticula | cardume contínuo |
| 3–7s | vira, enche caneca, espuma sobe | levanta caneca | — |
| 7–10s | ergue caneca, LED do olho pisca | brinde | tubarão entra (esq.) |
| 10–14s | pousa caneca, espuma baixa | bebe | tubarão sai (dir.) |
| 14–18s | volta a limpar → pose inicial | pousa, gesticula → pose inicial | — |

**Ambiente:** lanternas pulsando (1,5/2/3s defasados); névoa em 2 camadas SVG opostas (9s, 18s); bolhas e poeira; cena oscila 1–2px em 6s; HUD com scan line a cada 9s e profundidade `↓ 3.000 m` oscilando ±2 m.

**Personagens rigados:** braço como PNG separado com `transform-origin` no ombro; animação por rotação/translação.

## 6. HUD, boot e navegação

**Boot (~3s):** tela preta → traço ciano → texto digitado ("REDE NÁUTILUS · OS v3.0", "Calibrando ótica…", "Profundidade: 3.000 m", "Sincronizando…") → pálpebras abrem → taverna desfocada entra em foco → cantos do HUD encaixam → hotspots aparecem em sequência. Botão "Pular" desde o 1º frame. Só na 1ª visita (`localStorage`); depois começa nos cantos/hotspots. Sem áudio.

**HUD fixo:** cantos ciano; topo esquerdo com `↓ 3.000 m` + nome da área; `<nav>` com as 5 áreas, sempre visível. Hotspot = ponto pulsante + linha guia + label Cinzel; hover/foco fecha colchetes em volta do objeto.

**Transição:** clique em hotspot ou menu → `scene.setSpeed(0.3)` → zoom/translação até `hotspot.zoom` (0,8s) → cena desfoca/escurece → painel materializa (scan vertical, borda ciano). Fechar (X, `Esc`, "Início") reverte e volta a velocidade 1.

**Mobile (<768px):** cena mais larga que a tela; olhar em volta por arrasto ou giroscópio. Menu vira barra inferior. Painel em tela cheia com rolagem interna.

**Acessibilidade:** `prefers-reduced-motion` desliga loop, parallax e boot animado; hotspots e menu são `<a>`/`<button>` focáveis; foco preso no painel aberto, `Esc` fecha; contraste de texto mínimo AA sobre fundo `--abyss`.

## 7. Painéis

- **O Mundo:** abas História · Cotidiano · Regras e Desafios · Por que o Portal?; mapa dos 6 setores (Cúpula Central, Científico, Comercial, Residencial, Industrial, Exploração) com destaque no hover. Fonte `mundo.json`.
- **Habitantes:** 6 cards — Kael Vetra (Eng. de Sistemas), Lívia Maris (Médica), Torak Sulu (Explorador), Seren Velas (Mecânica), Darian Flux (Mensageiro), Nami Quel'thar (Pesquisadora). Hover: scan do retrato + ficha RPG (setor, especialidade). Os que aparecem na cena ganham tag "na taverna agora". Fonte `habitantes.json`.
- **Mural:** ≥6 posts, ordenados por data desc., gerados de `mural.json` (`autorId`, `data`, `categoria`, `texto`); filtro por categoria (Aviso, Pedido de ajuda, Oferta, Conhecimento, Amizade).
- **Fale com o Portal:** nome*, e-mail*, setor (select), tipo de mensagem*, mensagem*. Validação no `blur` e no submit, erro abaixo do campo, região `aria-live`. Sucesso: "Transmissão enviada pela Rede Náutilus" + animação de sinal; form reseta. Sem backend.

Conteúdo textual: escrito a partir do conceito_02, expandido para cobrir todos os itens obrigatórios.

## 8. Assets (Leonardo AI, plano free)

14 imagens, mesmo bloco de estilo no prompt + conceito_01 como referência de imagem; personagens/objetos com opção Transparency; limpeza no Photopea se preciso.

1. Fundo da taverna vazio (sem pessoas, vigia vazia/escura) — 16:9, maior resolução possível
2. Robô bartender corpo · 3. braço do robô com caneca
4. Cliente sentado corpo · 5. braço com caneca
6. Tubarão (perfil) · 7. cardume
8. Cidade de Atlântida (fundo do painel O Mundo)
9–14. Retratos dos 6 habitantes (busto, mesmo enquadramento)

Prompts prontos entram no plano de implementação.

## 9. Cronograma

| Dia | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| Seg 19 | assets Leonardo | esqueleto + tokens | HUD estático | JSONs |
| Ter 20 | assets/retratos + limpeza | camadas da cena | boot | Habitantes + Mural |
| Qua 21 | painel O Mundo | loop GSAP | router + transição | Fale com o Portal |
| Qui 22 | mapa setores | parallax + mobile | reduced-motion, teclado | responsivo painéis |
| Sex 23 | congelamento: teste 1920×1080, deploy, ensaio pitch, pen drive | | | |

**Cortes se atrasar, nesta ordem:** giroscópio → tubarão → mapa interativo (vira imagem) → boot 1,5s.
**Núcleo intocável:** cena com loop, hotspots, 4 painéis completos, menu.

## 10. Verificação

- Loop: gravar 40s de tela e conferir que t=0 e t=18 são idênticos (sem salto)
- Navegação: todas as rotas por clique, menu, URL direta e teclado
- Form: cada campo obrigatório vazio/inválido mostra erro; envio válido mostra confirmação
- Responsivo: 375px, 768px, 1920×1080
- Performance: 60fps em notebook comum; imagens WebP; total < 8 MB

## Fora de escopo

Áudio, backend, login, cenas ilustradas por área (exceto cidade), vídeo gerado por IA.
