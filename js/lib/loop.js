export const LOOP = 18;

export function cycles(period) {
  const n = LOOP / period;
  if (Math.abs(n - Math.round(n)) > 1e-9) throw new Error(`Período ${period}s não fecha em ${LOOP}s`);
  return Math.round(n);
}

// yoyo com meia-duração period/2: 2 passadas por ciclo, número par → termina no início
export function yoyoRepeat(period) {
  return cycles(period) * 2 - 1;
}
