// Utilitários de semana (ISO, começando na segunda-feira em UTC). Puros e
// testáveis; a "semana" é a unidade do ciclo do placar.

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Segunda-feira 00:00:00 UTC da semana que contém `d`. */
export function startOfWeek(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const mondayOffset = (date.getUTCDay() + 6) % 7; // 0 = segunda
  date.setUTCDate(date.getUTCDate() - mondayOffset);
  return date;
}

/** Chave da semana no formato YYYY-MM-DD (a segunda-feira). */
export function weekKey(d: Date): string {
  return startOfWeek(d).toISOString().slice(0, 10);
}

export function addWeeks(weekStart: Date, n: number): Date {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + n * 7);
  return d;
}

/** Data no formato do SQLite (`datetime('now')` → 'YYYY-MM-DD HH:MM:SS', UTC). */
export function sqliteUtc(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/** Interpreta um timestamp do SQLite (UTC) como Date. */
export function fromSqliteUtc(s: string): Date {
  return new Date(`${s.replace(' ', 'T')}Z`);
}

/** Limites [start, end) de uma semana, prontos para comparar com `created_at`. */
export function weekBounds(key: string): {
  start: string;
  end: string;
  startDate: Date;
  endDate: Date;
} {
  const startDate = new Date(`${key}T00:00:00Z`);
  const endDate = addWeeks(startDate, 1);
  return { start: sqliteUtc(startDate), end: sqliteUtc(endDate), startDate, endDate };
}

/** "29 jun – 5 jul" para a semana da `key`. */
export function formatWeekRange(key: string): string {
  const { startDate, endDate } = weekBounds(key);
  const sunday = new Date(endDate);
  sunday.setUTCDate(sunday.getUTCDate() - 1);
  const f = (d: Date) => `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`;
  return `${f(startDate)} – ${f(sunday)}`;
}

/** Quanto falta para a semana atual acabar (ex.: "2d", "5h", "agora"). */
export function timeLeftLabel(now: Date = new Date()): string {
  const { endDate } = weekBounds(weekKey(now));
  const ms = endDate.getTime() - now.getTime();
  if (ms <= 0) return 'agora';
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days}d`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(1, Math.floor(ms / 60_000))}min`;
}
