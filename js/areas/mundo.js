import { renderMapa } from '../lib/holomapa.js';
export const bare = true; // sem moldura de página: só o holograma e elementos do HUD

export async function render(container) {
  const m = await fetch('data/mundo.json').then(r => r.json());
  renderMapa(container, {
    titulo: 'O Mundo — mapa holográfico de Atlântida',
    dica: 'Navegue pelos nomes dos setores',
    cabecalho: 'Atlântida · Mapa',
    video: m.video,
    poster: m.poster,
    pontos: m.setores,
    legenda: m.legenda,
  });
}
