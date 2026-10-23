# Rede Náutilus — A comunidade de Atlântida

Portal da VR CODE ARENA (FIAP NEXT 2026). Você está na Taverna do Náutilus, a 3.000 m de profundidade, vendo tudo pelos óculos da Rede.

**Site:** https://defxico.github.io/atlantida-project/

## Rodar local

```bash
npm run dev   # http://localhost:5173
npm test
```

Abrir `index.html` direto (`file://`) não funciona: módulos ES e `fetch` exigem servidor local.

## Áreas

- **O Mundo:** só o holograma; cada setor é um botão HUD que abre uma caixa ao lado do domo (`data/mundo.json`).
- **Habitantes:** uma ficha por vez, com retrato (`data/habitantes.json`).
- **Mural da Comunidade:** *Missões* (tripulações com vagas, reputação e formulário de nova missão, `data/missoes.json`) e *Recados* (avisos, personalidades do mês e mensagens de visitantes, `data/mural.json`).
- **Fale com o Portal:** chat com o Náutilos IA (círculo pulsante) e registro de novo habitante.

Visitantes, missões criadas, embarques e registros ficam no `localStorage` de cada navegador (site estático, sem banco). Para compartilhar entre aparelhos é preciso um backend.

## Como mexer (CODE DROP)

- **Cores, fontes, espaços:** `css/tokens.css`
- **Conteúdo:** `data/*.json`
- **Nova área:** adicione uma entrada em `data/hotspots.json` (posição `x`/`y` em % da cena) e crie `js/areas/<id>.js` exportando `render(container)`. O menu e o hotspot aparecem sozinhos.
- **Cena da home:** vídeo em loop de 20 s em 1080p (`assets/video/taverna-loop.mp4`, Kling Keyframes com primeiro e último quadro = `docs/referencia_inicial/the-nautilus-contraste-suave-3840x2160.png`). A abertura (mãos colocando os óculos, 5 s) é `assets/video/intro-oculos.mp4`; `LENS_AT` em `js/boot.js` marca o segundo em que as lentes passam pelo olho e o HUD começa a ligar (`revealHud` em `js/hud.js`). Os masters sem compressão ficam em `media-src/` (fora do git). Para trocar a cena, troque o vídeo e ajuste `x`/`y` em `data/hotspots.json` (% do quadro).
- **Mapa de O Mundo:** vídeo holográfico (`assets/video/holograma-o-mundo.mp4`, fundo preto + `mix-blend-mode: screen`) com os 9 setores como botões em cima; posições `x`/`y` (% do quadro), estado (`aberto`/`fechado`) e descrições em `data/mundo.json`. Master em `media-src/`.
- **HUD / lente dos óculos:** `css/hud.css` (moldura, vinheta, reflexo, scanlines, bússola, telemetria). Abertura: `js/boot.js`.
- **Logo:** `assets/brand/` (`logo-mono.svg` vetorizado, cor via CSS `mask`; `logo-navy.svg`; `logo-dourada.png`). Originais em `docs/referencia_inicial/logo_*`.
- **Retratos e cidade (Leonardo AI):** `docs/assets-leonardo.md`

GSAP 3.12.5 está versionado em `js/vendor/gsap.min.js` (funciona sem internet).

## Publicar no Vercel e ligar a IA (Náutilos)

O site continua estático; o Vercel só acrescenta a função `api/chat.js`, que guarda as chaves e conversa com a IA (Claude primeiro, OpenAI como reserva). Sem chaves ou sem internet, o Náutilos responde com o roteiro local de `js/lib/nautilos.js`.

1. Em vercel.com, **Add New > Project** e importe o repositório do GitHub (Framework: *Other*; sem build). Cada push em `main` publica sozinho.
2. Em **Settings > Environment Variables**, crie `ANTHROPIC_API_KEY` (e, se quiser reserva, `OPENAI_API_KEY`). Opcionais: `CLAUDE_MODEL`, `OPENAI_MODEL`, `ALLOWED_ORIGINS` (ex.: `https://defxico.github.io`). Modelo de exemplo em `.env.example`.
3. Defina um **limite de gasto** nos painéis do Claude e da OpenAI. A função já limita 12 mensagens por minuto por visitante e respostas curtas.
4. Em `js/lib/nautilos.js`, preencha `VERCEL_URL` com o endereço do projeto (ex.: `https://atlantida-project.vercel.app`) para o GitHub Pages e o pen drive (localhost) também usarem a IA. No próprio `*.vercel.app` ele usa `/api/chat`.

Nunca coloque chaves no código nem no repositório. Rodando em `localhost` com `VERCEL_URL` preenchido, o chat usa a API de produção (consome crédito).

## Pen drive / HD externo (sem internet)

```bash
npm run pendrive   # gera dist-pendrive/Nautilus (cerca de 17 MB)
```

Copie a pasta `Nautilus` para o pen drive. No Windows, dois cliques em `Iniciar Nautilus.bat` sobem um servidor local feito só com o PowerShell (sem instalar nada, com suporte a vídeo) e abrem o navegador em `http://localhost:5173`. Mac/Linux: `sh iniciar.sh` (python3). O kit fica em `pendrive-kit/`; as instruções para o dia estão em `LEIA-ME.txt`.

Tudo funciona offline: o site, os vídeos e as fontes (`assets/fonts`, `css/fonts.css`). Sem internet o Náutilos usa o roteiro local; com internet ele chama a IA pelo Vercel (tempo limite de 15 s, depois volta ao roteiro).

## Antes do evento

- Teste o `.bat` no computador do evento (ou num parecido), com e sem wifi.
- `docs/` é publicado junto com o site no GitHub Pages; remova de lá o que não deve ficar público.
