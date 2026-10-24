// Oceano com mais escolhas; no empate vence o escolhido por último entre os empatados.
export function resultado(escolhas) {
  const votos = {};
  for (const id of escolhas) votos[id] = (votos[id] ?? 0) + 1;
  const max = Math.max(...Object.values(votos));
  return escolhas.findLast(id => votos[id] === max) ?? null;
}
