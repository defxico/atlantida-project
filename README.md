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
- **Animação da taverna:** `js/scene.js` (loop de 18s; períodos precisam dividir 18)
- **Arte (Leonardo AI):** `docs/assets-leonardo.md`

GSAP 3.12.5 está versionado em `js/vendor/gsap.min.js` (funciona sem internet).
