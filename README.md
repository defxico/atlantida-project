# Rede Náutilus — A comunidade de Atlântida

Portal da VR CODE ARENA (FIAP NEXT 2026). Você está na Taverna do Náutilus, a 3.000 m de profundidade, vendo tudo pelos óculos da Rede.

**Site:** https://defxico.github.io/atlantida-project/

## Rodar local

```bash
npm run dev   # http://localhost:5173
npm test
```

Abrir `index.html` direto (`file://`) não funciona: módulos ES e `fetch` exigem servidor local.

## Como mexer (CODE DROP)

- **Cores, fontes, espaços:** `css/tokens.css`
- **Conteúdo:** `data/*.json`
- **Nova área:** adicione uma entrada em `data/hotspots.json` (posição `x`/`y` em % da cena) e crie `js/areas/<id>.js` exportando `render(container)`. O menu e o hotspot aparecem sozinhos.
- **Cena da home:** vídeo em loop de 20 s em 1080p (`assets/video/taverna-loop.mp4`, Kling Keyframes com primeiro e último quadro = `docs/referencia_inicial/the-nautilus-contraste-suave-3840x2160.png`). A abertura (mãos colocando os óculos, 5 s) é `assets/video/intro-oculos.mp4`; `LENS_AT` em `js/boot.js` marca o segundo em que as lentes passam pelo olho e o HUD começa a ligar (`revealHud` em `js/hud.js`). Os masters sem compressão ficam em `media-src/` (fora do git). Para trocar a cena, troque o vídeo e ajuste `x`/`y` em `data/hotspots.json` (% do quadro).
- **HUD / lente dos óculos:** `css/hud.css` (moldura, vinheta, reflexo, scanlines, bússola, telemetria). Abertura: `js/boot.js`.
- **Logo:** `assets/brand/` (`logo-mono.svg` vetorizado, cor via CSS `mask`; `logo-navy.svg`; `logo-dourada.png`). Originais em `docs/referencia_inicial/logo_*`.
- **Retratos e cidade (Leonardo AI):** `docs/assets-leonardo.md`

GSAP 3.12.5 está versionado em `js/vendor/gsap.min.js` (funciona sem internet).
