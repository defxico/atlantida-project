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
