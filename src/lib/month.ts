// Utilitários de mês (calendário, UTC). Puros e testáveis; o "mês" é a unidade
// do ciclo da disputa de líder (placar mensal + Hall da Fama).
import { sqliteUtc } from './week';

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/** Dia 1º 00:00:00 UTC do mês que contém `d`. */
export function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

/** Chave do mês no formato YYYY-MM. */
export function monthKey(d: Date): string {
  return startOfMonth(d).toISOString().slice(0, 7);
}

/** Chave do mês atual. */
export function currentMonthKey(): string {
  return monthKey(new Date());
}

/** Soma `n` meses ao 1º do mês (aceita negativos). */
export function addMonths(monthStart: Date, n: number): Date {
  return new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + n, 1));
}

/** Limites [start, end) de um mês, prontos para comparar com `created_at`. */
export function monthBounds(key: string): {
  start: string;
  end: string;
  startDate: Date;
  endDate: Date;
} {
  const startDate = new Date(`${key}-01T00:00:00Z`);
  const endDate = addMonths(startDate, 1);
  return { start: sqliteUtc(startDate), end: sqliteUtc(endDate), startDate, endDate };
}

/** "julho 2026" para o mês da `key` (YYYY-MM). */
export function formatMonth(key: string): string {
  const { startDate } = monthBounds(key);
  return `${MESES[startDate.getUTCMonth()]} ${startDate.getUTCFullYear()}`;
}

/** Quanto falta para o mês atual acabar (ex.: "12d", "5h", "agora"). */
export function timeLeftLabel(now: Date = new Date()): string {
  const { endDate } = monthBounds(monthKey(now));
  const ms = endDate.getTime() - now.getTime();
  if (ms <= 0) return 'agora';
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days}d`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(1, Math.floor(ms / 60_000))}min`;
}
