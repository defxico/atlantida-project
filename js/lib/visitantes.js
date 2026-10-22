// mensagens dos visitantes ficam neste navegador (site estático, sem servidor)
const STORE = 'nautilus.visitantes';

export const loadVisitantes = () => {
  try { return JSON.parse(localStorage.getItem(STORE)) ?? []; } catch { return []; }
};
export const saveVisitantes = list => {
  try { localStorage.setItem(STORE, JSON.stringify(list)); } catch { /* sem armazenamento: vale só nesta sessão */ }
};
