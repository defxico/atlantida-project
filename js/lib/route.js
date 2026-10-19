export function parseHash(hash, ids) {
  let id;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return null; }
  return ids.includes(id) ? id : null;
}
