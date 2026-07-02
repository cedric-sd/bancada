import { getDb } from './db';

// Ações de participação que rendem XP. Recompensar votar/avaliar/publicar e a
// presença diária (não só *receber* votos) mantém a bancada acolhedora para
// quem está começando e cria motivo para voltar.
export type XpKind = 'vote' | 'review' | 'publish' | 'daily';

export const XP_POINTS: Record<XpKind, number> = {
  vote: 2,
  review: 5,
  publish: 25,
  daily: 3,
};

export function pointsFor(kind: XpKind): number {
  return XP_POINTS[kind] ?? 0;
}

/**
 * Concede `points` XP a um usuário sob um `kind`/`ref`. Anti-farm: o índice
 * único (user_id, kind, ref) garante no máximo um ganho por alvo — reverter e
 * refazer a ação não repete. Retorna true se o XP foi concedido agora.
 */
export function grantXp(userId: number, kind: string, ref: string, points: number): boolean {
  const info = getDb()
    .prepare(
      `INSERT OR IGNORE INTO xp_events (user_id, kind, points, ref)
       VALUES (@userId, @kind, @points, @ref)`,
    )
    .run({ userId, kind, points, ref });
  return info.changes > 0;
}

/** Concede o XP padrão de uma ação de participação (um voto por projeto, etc.). */
export function awardXp(userId: number, kind: XpKind, ref: string | number): boolean {
  return grantXp(userId, kind, String(ref), pointsFor(kind));
}

/** Total de XP de participação acumulado pelo usuário. */
export function participationXp(userId: number): number {
  const row = getDb()
    .prepare('SELECT COALESCE(SUM(points), 0) AS xp FROM xp_events WHERE user_id = ?')
    .get(userId) as { xp: number };
  return row.xp;
}
