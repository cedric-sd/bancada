import { getDb } from './db';

// Ações de participação que rendem XP. Recompensar votar/avaliar/publicar (não
// só *receber* votos) mantém a bancada acolhedora para quem está começando.
export type XpKind = 'vote' | 'review' | 'publish';

export const XP_POINTS: Record<XpKind, number> = {
  vote: 2,
  review: 5,
  publish: 25,
};

export function pointsFor(kind: XpKind): number {
  return XP_POINTS[kind] ?? 0;
}

/**
 * Concede XP de participação a um usuário. Anti-farm: o índice único
 * (user_id, kind, ref) garante no máximo um ganho por alvo — um voto por
 * projeto, uma avaliação por projeto, um projeto publicado. Reverter e refazer
 * a ação não gera XP de novo. Retorna true se o XP foi concedido agora.
 */
export function awardXp(userId: number, kind: XpKind, ref: string | number): boolean {
  const info = getDb()
    .prepare(
      `INSERT OR IGNORE INTO xp_events (user_id, kind, points, ref)
       VALUES (@userId, @kind, @points, @ref)`,
    )
    .run({ userId, kind, points: pointsFor(kind), ref: String(ref) });
  return info.changes > 0;
}

/** Total de XP de participação acumulado pelo usuário. */
export function participationXp(userId: number): number {
  const row = getDb()
    .prepare('SELECT COALESCE(SUM(points), 0) AS xp FROM xp_events WHERE user_id = ?')
    .get(userId) as { xp: number };
  return row.xp;
}
