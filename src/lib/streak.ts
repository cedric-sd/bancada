import { getDb } from './db';
import { awardXp } from './xp';

// Cache por processo: evita reescrever a presença do dia a cada requisição.
const lastTouched = new Map<number, string>();

/** Data de "hoje" em UTC (YYYY-MM-DD), alinhada ao datetime('now') do SQLite. */
function today(): string {
  return (getDb().prepare("SELECT date('now') AS d").get() as { d: string }).d;
}

/**
 * Registra que o usuário esteve ativo hoje e concede o XP de presença diária
 * (uma vez por dia — anti-farm pelo índice único de xp_events). Barato: no
 * máximo uma escrita por usuário por dia por processo. Nunca lança.
 */
export function touchActivity(userId: number): void {
  try {
    const d = today();
    if (lastTouched.get(userId) === d) return;
    lastTouched.set(userId, d);
    awardXp(userId, 'daily', d);
  } catch {
    // Presença é acessório — não pode quebrar a autenticação.
  }
}

/**
 * Conta dias consecutivos de presença terminando em `today` (ou ontem, se o
 * usuário ainda não apareceu hoje). Quebra o streak se o último dia ativo for
 * anterior a ontem. Puro e testável.
 */
export function streakFromDays(days: string[], todayKey: string): number {
  const DAY = 86_400_000;
  const toUtc = (s: string) => Date.parse(`${s}T00:00:00Z`);
  const uniq = Array.from(new Set(days)).map(toUtc).sort((a, b) => b - a);
  if (uniq.length === 0) return 0;

  const t = toUtc(todayKey);
  const latest = uniq[0];
  // Só há streak "vivo" se o último dia ativo foi hoje ou ontem.
  if (latest !== t && latest !== t - DAY) return 0;

  let expected = latest;
  let count = 0;
  for (const day of uniq) {
    if (day === expected) {
      count += 1;
      expected -= DAY;
    } else if (day < expected) {
      break; // buraco na sequência
    }
  }
  return count;
}

/** Streak atual (dias consecutivos ativos) do usuário. */
export function currentStreak(userId: number): number {
  const db = getDb();
  const rows = db
    .prepare("SELECT DISTINCT ref AS day FROM xp_events WHERE user_id = ? AND kind = 'daily'")
    .all(userId) as { day: string }[];
  return streakFromDays(
    rows.map((r) => r.day),
    today(),
  );
}
