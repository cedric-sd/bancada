import { getDb } from './db';
import { devs, type Dev, type Project } from './data';

type Row = {
  id: number;
  slug: string;
  name: string;
  blurb: string;
  author: string;
  handle: string;
  stars: string;
  votes: number;
  cat: string;
  badge: string;
  lvl: number;
  description: string;
  tags: string;
  forks: string;
  xp_for_author: string;
  owner_id: number | null;
  created_at: string;
  voted?: number;
};

export type CreateProjectInput = {
  name: string;
  author: string;
  handle: string;
  ownerId?: number | null;
  blurb?: string;
  cat?: string;
  description?: string;
  tags?: string[];
  stars?: string;
};

export type UpdateProjectInput = Partial<
  Omit<CreateProjectInput, 'name'> & { name: string; badge: string; votes: number; lvl: number }
>;

const formatVotes = (n: number) => n.toLocaleString('pt-BR');

/** Converte uma linha do banco em Project, com o rank já calculado. */
function toProject(row: Row, rank: number): Project {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags);
  } catch {
    tags = [];
  }
  return {
    rank,
    slug: row.slug,
    name: row.name,
    blurb: row.blurb,
    author: row.author,
    handle: row.handle,
    stars: row.stars,
    votes: formatVotes(row.votes),
    cat: row.cat,
    badge: row.badge,
    lvl: row.lvl,
    description: row.description,
    tags,
    forks: row.forks,
    xpForAuthor: row.xp_for_author,
    ownerId: row.owner_id,
    voted: !!row.voted,
  };
}

export function normalizeHandle(handle: string): string {
  const clean = handle.trim().replace(/^@+/, '');
  return `@${clean}`;
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueSlug(base: string): string {
  const db = getDb();
  const exists = db.prepare('SELECT 1 FROM projects WHERE slug = ?');
  let slug = base || 'projeto';
  let n = 2;
  while (exists.get(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

/**
 * Lista todos os projetos ordenados por votos (rank 1..n). Se `userId` for
 * informado, marca `voted` para cada projeto votado por esse usuário.
 */
export function listProjects(userId?: number | null): Project[] {
  const rows = getDb()
    .prepare(
      `SELECT p.*, (uv.user_id IS NOT NULL) AS voted
       FROM projects p
       LEFT JOIN user_votes uv ON uv.project_id = p.id AND uv.user_id = @userId
       ORDER BY p.votes DESC, p.created_at ASC, p.id ASC`,
    )
    .all({ userId: userId ?? -1 }) as Row[];
  return rows.map((row, i) => toProject(row, i + 1));
}

export function getProjectBySlug(slug: string, userId?: number | null): Project | undefined {
  return listProjects(userId).find((p) => p.slug === slug);
}

export function createProject(input: CreateProjectInput): Project {
  const db = getDb();
  const name = input.name.trim();
  const slug = uniqueSlug(slugify(name));

  db.prepare(`
    INSERT INTO projects
      (slug, name, blurb, author, handle, stars, votes, cat, badge, lvl, description, tags, forks, xp_for_author, owner_id)
    VALUES
      (@slug, @name, @blurb, @author, @handle, @stars, 0, @cat, 'NOVO', 1, @description, @tags, '0', '+0', @ownerId)
  `).run({
    slug,
    name,
    blurb: (input.blurb ?? '').trim(),
    author: input.author.trim(),
    handle: normalizeHandle(input.handle),
    stars: (input.stars ?? '0').trim() || '0',
    cat: (input.cat ?? 'Outros').trim() || 'Outros',
    description: (input.description ?? '').trim(),
    tags: JSON.stringify(input.tags ?? []),
    ownerId: input.ownerId ?? null,
  });

  return getProjectBySlug(slug)!;
}

export function updateProject(slug: string, patch: UpdateProjectInput): Project | undefined {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as Row | undefined;
  if (!existing) return undefined;

  const map: Record<string, string> = {
    name: 'name',
    blurb: 'blurb',
    author: 'author',
    cat: 'cat',
    description: 'description',
    stars: 'stars',
    badge: 'badge',
    votes: 'votes',
    lvl: 'lvl',
  };

  const sets: string[] = [];
  const values: Record<string, unknown> = { slug };
  for (const [key, column] of Object.entries(map)) {
    const value = (patch as Record<string, unknown>)[key];
    if (value === undefined) continue;
    sets.push(`${column} = @${key}`);
    values[key] = value;
  }
  if (patch.handle !== undefined) {
    sets.push('handle = @handle');
    values.handle = normalizeHandle(patch.handle);
  }
  if (patch.tags !== undefined) {
    sets.push('tags = @tags');
    values.tags = JSON.stringify(patch.tags);
  }

  if (sets.length > 0) {
    db.prepare(`UPDATE projects SET ${sets.join(', ')} WHERE slug = @slug`).run(values);
  }
  return getProjectBySlug(slug);
}

export function deleteProject(slug: string): boolean {
  const info = getDb().prepare('DELETE FROM projects WHERE slug = ?').run(slug);
  return info.changes > 0;
}

/** owner_id de um projeto (ou undefined se o projeto não existe). */
export function getProjectOwnerId(slug: string): number | null | undefined {
  const row = getDb().prepare('SELECT owner_id FROM projects WHERE slug = ?').get(slug) as
    | { owner_id: number | null }
    | undefined;
  return row ? row.owner_id : undefined;
}

/**
 * Registra (+1) ou desfaz (-1) o voto de um usuário, com no máximo um voto por
 * projeto. A contagem `votes` é mantida em sincronia numa transação.
 * Retorna o projeto atualizado (rank recalculado) ou undefined se não existe.
 */
export function voteProject(slug: string, userId: number, delta: 1 | -1): Project | undefined {
  const db = getDb();
  const proj = db.prepare('SELECT id FROM projects WHERE slug = ?').get(slug) as
    | { id: number }
    | undefined;
  if (!proj) return undefined;

  const tx = db.transaction(() => {
    const has = db
      .prepare('SELECT 1 FROM user_votes WHERE user_id = ? AND project_id = ?')
      .get(userId, proj.id);

    if (delta > 0) {
      if (has) return; // já votou — idempotente
      db.prepare('INSERT INTO user_votes (user_id, project_id) VALUES (?, ?)').run(userId, proj.id);
      db.prepare('UPDATE projects SET votes = votes + 1 WHERE id = ?').run(proj.id);
    } else {
      if (!has) return; // não havia voto
      db.prepare('DELETE FROM user_votes WHERE user_id = ? AND project_id = ?').run(userId, proj.id);
      db.prepare('UPDATE projects SET votes = MAX(0, votes - 1) WHERE id = ?').run(proj.id);
    }
  });
  tx();

  return getProjectBySlug(slug, userId);
}

// Soma de votos exibidos ("1.428" + "655" → "2.083"), separador pt-BR.
const sumVotes = (list: Project[]) =>
  list
    .reduce((acc, p) => acc + (parseInt(p.votes.replace(/\D/g, ''), 10) || 0), 0)
    .toLocaleString('pt-BR');

/**
 * Resolve o perfil de um dev pelo handle. Perfis ricos vêm de `devs`; para os
 * demais autores, monta um perfil a partir dos projetos publicados no banco.
 */
export function resolveDev(rawHandle: string): Dev | undefined {
  const key = rawHandle.replace(/^@/, '');
  if (devs[key]) {
    const rich = devs[key];
    // Mantém a lista de projetos publicados sincronizada com o banco.
    const authored = listProjects().filter((p) => p.handle.replace(/^@/, '') === key);
    return authored.length > 0
      ? { ...rich, projectSlugs: authored.map((p) => p.slug) }
      : rich;
  }

  const authored = listProjects().filter((p) => p.handle.replace(/^@/, '') === key);
  if (authored.length === 0) {
    // Usuário cadastrado que ainda não publicou nada: perfil mínimo.
    const u = getDb()
      .prepare('SELECT name, handle FROM users WHERE handle = ?')
      .get(key.toLowerCase()) as { name: string; handle: string } | undefined;
    if (!u) return undefined;

    const inits = u.name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return {
      handle: `@${u.handle}`,
      name: u.name,
      initials: inits,
      bio: 'Ainda não publicou projetos na bancada.',
      level: 1,
      xp: 0,
      xpNext: 200,
      badge: 'BUILDER',
      stats: { projects: 0, votes: '0', bestRank: '—' },
      achievements: [],
      projectSlugs: [],
    };
  }

  const main = authored[0];
  const level = Math.max(...authored.map((p) => p.lvl));
  const initials = main.author
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const bestRank = Math.min(...authored.map((p) => p.rank));

  return {
    handle: main.handle,
    name: main.author,
    initials,
    bio: 'Builder na bancada. Publica ferramentas para a comunidade.',
    level,
    xp: level * 200,
    xpNext: (level + 1) * 200,
    badge: bestRank <= 3 ? 'DESTAQUE' : 'BUILDER',
    stats: { projects: authored.length, votes: sumVotes(authored), bestRank: `#${bestRank}` },
    achievements: [
      { label: 'EARLY BUILDER', color: '#9a6a1f', rotate: -3 },
      ...(bestRank <= 3 ? [{ label: 'TOP 3', color: '#b23a2a', rotate: 3 }] : []),
    ],
    projectSlugs: authored.map((p) => p.slug),
  };
}
