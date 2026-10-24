# Explorar os Oceanos — Design Spec

- **Data:** 2026-10-24
- **Status:** aprovado; código só começa quando o time pedir (aguardando o desafio)
- **Base:** `docs/superpowers/specs/2026-10-19-rede-nautilus-design.md`

## 1. Conceito

Nova área do portal: um guia sobre os oceanos reais do planeta, dentro do storytelling de Atlântida. O conteúdo é um arquivo do Setor Científico ("Registros da superfície"), consultado pelos óculos da Rede. Dados reais, tom de Atlântida: quem fala vive a 3.000 m de profundidade e estuda o oceano que cerca a cidade.

Formato: mapa holográfico (planisfério) igual ao de O Mundo, com os 5 oceanos como botões HUD. Cada botão abre uma ficha ao lado do ponto clicado.

## 2. Entrada

- Novo hotspot `oceanos` em `data/hotspots.json`, rótulo "Explorar os Oceanos", nav "Oceanos".
- Posição sugerida: a vigia com peixes da taverna. `x`/`y`/`zoom` calibrados na cena na hora de codar.
- Menu e hotspot aparecem sozinhos (comportamento atual de `hud.js`).

## 3. Arquitetura

### 3.1 `js/lib/holomapa.js` (novo, extraído de `js/areas/mundo.js`)

`renderMapa(container, cfg)` monta o mapa e liga o comportamento. Toda a lógica que hoje vive em `mundo.js` vai para cá:

- fundo: `cfg.video` (com `poster`) **ou** `cfg.imagem`; ambos com `mix-blend-mode: screen` sobre preto
- pontos: `cfg.pontos[]` com `id`, `nome`, `x`, `y` (% do quadro), `estado` opcional (`fechado` = vermelho)
- `cfg.titulo` (h2 `#panel-title`, sr-only), `cfg.dica` (`.map__hint`), `cfg.cabecalho` (texto do head da caixa), `cfg.legenda` opcional
- `cfg.ficha(ponto)` devolve o HTML do corpo da caixa (escapado com `js/lib/html.js`); assim O Mundo mostra só região/título/texto e Oceanos mostra também dados e curiosidade
- mantém: caixa ao lado do ponto (não sobre ele), Escape fecha e devolve foco, `aria-expanded`, mobile (caixa em baixo), GSAP desligado com `prefers-reduced-motion`, vídeo só toca sem movimento reduzido
- classes CSS atuais (`.map`, `.map__node`, `.map__card`…) continuam as mesmas: nenhum CSS novo para o mapa

### 3.2 `js/areas/mundo.js`

Passa a ser ~10 linhas: `bare = true`, busca `data/mundo.json`, chama `renderMapa`. **Sem mudança visível.**

### 3.3 `js/areas/oceanos.js` + `data/oceanos.json`

`oceanos.js` (~10 linhas): `bare = true`, busca `data/oceanos.json`, chama `renderMapa` com `cfg.ficha` que mostra os dados.

Formato do JSON:

```json
{
  "imagem": "assets/img/oceanos-mapa.webp",
  "pontos": [
    {
      "id": "pacifico",
      "nome": "Pacífico",
      "x": 88, "y": 50,
      "regiao": "Registro 01 · Superfície",
      "titulo": "Oceano Pacífico",
      "texto": "…",
      "dados": [["Área", "…"], ["Profundidade média", "…"], ["Ponto mais fundo", "…"], ["Fauna", "…"]],
      "curiosidade": "…"
    }
  ]
}
```

Campos finais se ajustam aos requisitos do desafio.

### 3.4 Asset

Imagem estática `assets/img/oceanos-mapa.webp`, 16:9 (1920×1080), < 400 KB. Prompt sugerido (Leonardo AI):

> holographic world map, equirectangular projection, glowing cyan (#42D6D0) continent outlines and thin latitude/longitude grid on pure black background, subtle violet (#6846AB) ocean glow, sci-fi HUD style, no text, no labels, centered on the Atlantic, 16:9

Fundo preto puro é obrigatório (some com `screen`). Animação só via CSS já existente (scanlines/brilho da lente). Sem imagem, o mapa funciona com fundo preto e os botões.

## 4. Testes

- `tests/data.test.js`: `oceanos.json` com 5 pontos, ids únicos, todos os campos preenchidos, `x`/`y` entre 0 e 100, `dados` com 4 pares.
- `tests/hotspots.test.js` já valida o hotspot novo (conferir na hora).
- Verificação no navegador (Playwright): O Mundo idêntico ao atual (abrir/fechar setor, Escape, mobile) e Oceanos abrindo cada ficha.

## 5. Fora do escopo (YAGNI)

- Náutilos IA saber dos oceanos (prompt de `api/chat.js` e roteiro local). Entra só se o desafio pedir.
- Mergulho por profundidade, quiz, áudio.

## 6. Conteúdo (rascunho)

Valores arredondados ("cerca de"). **Conferir os números com uma fonte (NOAA, IBGE, National Geographic) antes do evento.**

Posições `x`/`y` pensadas para planisfério centrado no Atlântico; recalibrar com a imagem final.

### Pacífico (`pacifico`, x 88, y 50)
- **Texto:** O maior e mais profundo dos oceanos cobre quase um terço do planeta. Seu contorno é o Anel de Fogo, onde vulcões e terremotos desenham o fundo do mar. Os primeiros engenheiros de Atlântida estudaram suas fossas para aprender a viver sob pressão.
- **Área:** cerca de 165 milhões de km²
- **Profundidade média:** cerca de 4.000 m
- **Ponto mais fundo:** Depressão Challenger, Fossa das Marianas, cerca de 10.900 m
- **Fauna:** baleia-azul, peixe-caracol-das-Marianas
- **Curiosidade:** é maior que todas as terras emersas do planeta somadas.

### Atlântico (`atlantico`, x 40, y 45)
- **Texto:** O segundo maior oceano separa as Américas da Europa e da África. No meio dele corre a Dorsal Mesoatlântica, uma cordilheira submarina onde nasce fundo de mar novo. É o oceano das grandes travessias da superfície.
- **Área:** cerca de 106 milhões de km²
- **Profundidade média:** cerca de 3.600 m
- **Ponto mais fundo:** Fossa de Porto Rico, cerca de 8.400 m
- **Fauna:** tartaruga-de-couro, enguia-europeia (nasce no Mar dos Sargaços)
- **Curiosidade:** fica alguns centímetros mais largo a cada ano, porque as placas se afastam na dorsal.

### Índico (`indico`, x 66, y 60)
- **Texto:** O mais quente dos oceanos banha a África, a Ásia e a Oceania. Os ventos de monção invertem suas correntes duas vezes por ano e trazem as chuvas para bilhões de pessoas na superfície.
- **Área:** cerca de 70 milhões de km²
- **Profundidade média:** cerca de 3.700 m
- **Ponto mais fundo:** Fossa de Java (Sunda), cerca de 7.200 m
- **Fauna:** celacanto, dugongo
- **Curiosidade:** o celacanto, peixe que se julgava extinto havia milhões de anos, foi reencontrado vivo nas suas águas em 1938.

### Ártico (`artico`, x 50, y 8)
- **Texto:** O menor e mais raso dos oceanos fica no topo do mundo, coberto em boa parte por gelo marinho. Esse gelo encolhe a cada verão, e as cúpulas de Atlântida acompanham a mudança pelas correntes frias que chegam até a cidade.
- **Área:** cerca de 15 milhões de km²
- **Profundidade média:** cerca de 1.000 m
- **Ponto mais fundo:** Depressão Molloy, cerca de 5.500 m
- **Fauna:** narval, tubarão-da-groenlândia
- **Curiosidade:** o tubarão-da-groenlândia pode viver mais de 250 anos; é o vertebrado mais longevo que se conhece.

### Austral / Antártico (`austral`, x 50, y 92)
- **Texto:** Ele envolve a Antártida e foi o último oceano a ser reconhecido oficialmente. Ali corre a Corrente Circumpolar Antártica, a mais forte do planeta, que liga o Pacífico, o Atlântico e o Índico.
- **Área:** cerca de 22 milhões de km²
- **Profundidade média:** cerca de 3.300 m
- **Ponto mais fundo:** Fossa das Sandwich do Sul, cerca de 7.400 m
- **Fauna:** krill-antártico, pinguim-imperador
- **Curiosidade:** o krill, um crustáceo de poucos centímetros, sustenta quase toda a cadeia alimentar da região.

## 7. Ordem de implementação (quando liberado)

1. Ajustar este spec aos requisitos do desafio.
2. Extrair `holomapa.js` e migrar `mundo.js`; testes + Playwright: O Mundo igual.
3. `data/oceanos.json` + teste.
4. `js/areas/oceanos.js` + hotspot; calibrar posição na cena.
5. Imagem do mapa; recalibrar `x`/`y` dos oceanos.
6. `npm test`, verificação no navegador (desktop e mobile), commit, push.
