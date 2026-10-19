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
