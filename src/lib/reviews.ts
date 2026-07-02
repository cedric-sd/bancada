import { getDb } from './db';
import { notifyProjectEvent } from './notifications';
import { awardXp } from './xp';

export type ReviewView = {
  id: number;
  userId: number;
  name: string;
  handle: string; // com @
  initials: string;
  hasAvatar: boolean;
  stars: number;
  text: string;
};

export type ReviewStats = { count: number; average: number };

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

type Row = {
  id: number;
  user_id: number;
  name: string;
  handle: string;
  has_avatar: number;
  stars: number;
  text: string;
};

function projectIdBySlug(slug: string): number | undefined {
  const row = getDb().prepare('SELECT id FROM projects WHERE slug = ?').get(slug) as
    | { id: number }
    | undefined;
  return row?.id;
}

/** Avaliações de um projeto (mais recentes primeiro). */
export function listReviews(slug: string): ReviewView[] {
  const rows = getDb()
    .prepare(
      `SELECT r.id AS id, r.user_id AS user_id, u.name AS name, u.handle AS handle,
              (av.user_id IS NOT NULL) AS has_avatar, r.stars AS stars, r.text AS text
       FROM reviews r
       JOIN projects p ON p.id = r.project_id
       JOIN users u ON u.id = r.user_id
       LEFT JOIN user_avatars av ON av.user_id = u.id
       WHERE p.slug = ?
       ORDER BY r.updated_at DESC, r.id DESC`,
    )
    .all(slug) as Row[];

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    handle: `@${r.handle}`,
    initials: initialsOf(r.name),
    hasAvatar: !!r.has_avatar,
    stars: r.stars,
    text: r.text,
  }));
}

export function reviewStats(slug: string): ReviewStats {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS count, COALESCE(AVG(r.stars), 0) AS average
       FROM reviews r JOIN projects p ON p.id = r.project_id
       WHERE p.slug = ?`,
    )
    .get(slug) as { count: number; average: number };
  return { count: row.count, average: row.average };
}

/** Avaliação do usuário atual para o projeto (para pré-preencher o formulário). */
export function getUserReview(slug: string, userId: number): { stars: number; text: string } | undefined {
  return getDb()
    .prepare(
      `SELECT r.stars AS stars, r.text AS text
       FROM reviews r JOIN projects p ON p.id = r.project_id
       WHERE p.slug = ? AND r.user_id = ?`,
    )
    .get(slug, userId) as { stars: number; text: string } | undefined;
}

/** Cria ou atualiza a avaliação do usuário (uma por projeto). */
export function upsertReview(
  slug: string,
  userId: number,
  stars: number,
  text: string,
): 'ok' | 'not_found' {
  const db = getDb();
  const projectId = projectIdBySlug(slug);
  if (projectId === undefined) return 'not_found';

  // Detecta se é a primeira avaliação do usuário (para notificar só uma vez).
  const existed = db
    .prepare('SELECT 1 FROM reviews WHERE project_id = ? AND user_id = ?')
    .get(projectId, userId);

  db.prepare(
    `INSERT INTO reviews (project_id, user_id, stars, text, updated_at)
       VALUES (@projectId, @userId, @stars, @text, datetime('now'))
       ON CONFLICT(project_id, user_id)
       DO UPDATE SET stars = @stars, text = @text, updated_at = datetime('now')`,
  ).run({ projectId, userId, stars, text: text.trim() });

  // Avisa o dono e concede XP na primeira avaliação (edições não repetem).
  if (!existed) {
    notifyProjectEvent(projectId, userId, 'review', { stars });
    awardXp(userId, 'review', projectId);
  }
  return 'ok';
}

export function deleteReview(slug: string, userId: number): boolean {
  const projectId = projectIdBySlug(slug);
  if (projectId === undefined) return false;
  const info = getDb()
    .prepare('DELETE FROM reviews WHERE project_id = ? AND user_id = ?')
    .run(projectId, userId);
  return info.changes > 0;
}
