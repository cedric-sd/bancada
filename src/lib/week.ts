// Utilitários de semana (ISO, começando na segunda-feira em UTC). Puros e
// testáveis. Hoje a "semana" é a unidade das MISSÕES (a disputa de líder virou
// mensal — ver src/lib/month.ts e src/lib/monthly.ts).

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

/** Chave da semana atual. */
export function currentWeekKey(): string {
  return weekKey(new Date());
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
