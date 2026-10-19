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
- **Cena da home:** é um vídeo em loop (`assets/video/taverna-loop.mp4`, gerado no Kling a partir de `docs/referencia_inicial/conceito_01_sem_ui.png`) e a abertura `assets/video/intro-oculos.mp4`. Para trocar a cena, troque o vídeo e ajuste `x`/`y` em `data/hotspots.json` (% do quadro).
- **HUD / lente dos óculos:** `css/hud.css` (moldura, vinheta, reflexo, scanlines, bússola, telemetria). Abertura: `js/boot.js`.
- **Retratos e cidade (Leonardo AI):** `docs/assets-leonardo.md`

GSAP 3.12.5 está versionado em `js/vendor/gsap.min.js` (funciona sem internet).
