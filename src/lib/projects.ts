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
  created_at: string;
};

export type CreateProjectInput = {
  name: string;
  author: string;
  handle: string;
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

/** Lista todos os projetos ordenados por votos (rank 1..n). */
export function listProjects(): Project[] {
  const rows = getDb()
    .prepare('SELECT * FROM projects ORDER BY votes DESC, created_at ASC, id ASC')
    .all() as Row[];
  return rows.map((row, i) => toProject(row, i + 1));
}

export function getProjectBySlug(slug: string): Project | undefined {
  return listProjects().find((p) => p.slug === slug);
}

export function createProject(input: CreateProjectInput): Project {
  const db = getDb();
  const name = input.name.trim();
  const slug = uniqueSlug(slugify(name));

  db.prepare(`
    INSERT INTO projects
      (slug, name, blurb, author, handle, stars, votes, cat, badge, lvl, description, tags, forks, xp_for_author)
    VALUES
      (@slug, @name, @blurb, @author, @handle, @stars, 0, @cat, 'NOVO', 1, @description, @tags, '0', '+0')
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
  if (authored.length === 0) return undefined;

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
