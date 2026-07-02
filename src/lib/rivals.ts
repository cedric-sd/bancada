import { getDb } from './db';
import { followingIds } from './follows';

export type RivalRow = {
  userId: number;
  name: string;
  handle: string; // sem @
  hasAvatar: boolean;
  votes: number; // votos recebidos (soma dos projetos)
  projects: number;
};

export type RivalEntry = RivalRow & { rank: number; isSelf: boolean };

/** Atribui posição e marca o próprio usuário. Puro (assume linhas já ordenadas). */
export function rankRivals(rows: RivalRow[], selfId: number): RivalEntry[] {
  return rows.map((r, i) => ({ ...r, rank: i + 1, isSelf: r.userId === selfId }));
}

type Raw = Omit<RivalRow, 'hasAvatar'> & { hasAvatar: number };

/**
 * Placar da rivalidade: o usuário e os devs que ele segue, ranqueados por votos
 * recebidos. Vazio quando ele não segue ninguém (rivalidade precisa de rivais).
 */
export function rivalLeaderboard(userId: number): RivalEntry[] {
  const ids = [userId, ...followingIds(userId)];
  if (ids.length <= 1) return [];

  const placeholders = ids.map(() => '?').join(',');
  const rows = getDb()
    .prepare(
      `SELECT u.id AS userId, u.name AS name, u.handle AS handle,
              (av.user_id IS NOT NULL) AS hasAvatar,
              COALESCE(SUM(p.votes), 0) AS votes,
              COUNT(p.id) AS projects
       FROM users u
       LEFT JOIN projects p ON p.owner_id = u.id
       LEFT JOIN user_avatars av ON av.user_id = u.id
       WHERE u.id IN (${placeholders})
       GROUP BY u.id
       ORDER BY votes DESC, projects DESC, u.id ASC`,
    )
    .all(...ids) as Raw[];

  return rankRivals(
    rows.map((r) => ({ ...r, hasAvatar: !!r.hasAvatar })),
    userId,
  );
}
