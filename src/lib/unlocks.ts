import { getDb } from './db';

/** Ids conquistados que ainda não estão registrados (recém-desbloqueados). Puro. */
export function newUnlocks(earnedIds: string[], recorded: Set<string>): string[] {
  return earnedIds.filter((id) => !recorded.has(id));
}

/**
 * Registra as conquistas recém-obtidas do usuário e devolve as que acabaram de
 * ser desbloqueadas (para celebrar uma única vez). Idempotente. Deve ser chamado
 * só quando o próprio dono vê o seu perfil.
 */
export function settleUnlocks(userId: number, earnedIds: string[]): string[] {
  const db = getDb();
  const recorded = new Set(
    (db.prepare('SELECT achievement_id AS id FROM achievement_unlocks WHERE user_id = ?').all(userId) as {
      id: string;
    }[]).map((r) => r.id),
  );
  const fresh = newUnlocks(earnedIds, recorded);
  if (fresh.length === 0) return [];

  const insert = db.prepare(
    'INSERT OR IGNORE INTO achievement_unlocks (user_id, achievement_id) VALUES (?, ?)',
  );
  const tx = db.transaction(() => {
    for (const id of fresh) insert.run(userId, id);
  });
  tx();
  return fresh;
}
