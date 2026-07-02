import { getDb } from './db';
import { type Achievement, type Dev, type Project } from './data';
import { notifyProjectEvent } from './notifications';
import { awardXp, participationXp } from './xp';

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
  url: string | null;
  created_at: string;
  voted?: number;
  has_image?: number;
  rating?: number;
  review_count?: number;
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
  url?: string | null;
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
    hasImage: !!row.has_image,
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    url: row.url,
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

export type SortKey = 'top' | 'novos' | 'alta';

// Cláusula de ordenação por aba (chaves controladas, seguras para interpolar).
const ORDER_BY: Record<SortKey, string> = {
  top: 'p.votes DESC, p.created_at ASC, p.id ASC',
  novos: 'p.created_at DESC, p.id DESC',
  alta: 'recent DESC, p.votes DESC, p.id ASC',
};

export type ListOptions = { sort?: SortKey; cat?: string; q?: string };

/**
 * Lista os projetos numa ordem (aba): `top` (mais votados), `novos` (recentes)
 * ou `alta` (mais votos nos últimos 7 dias), com filtro opcional por categoria
 * (`cat`) e busca (`q` em nome/resumo/autor). O rank é a posição na ordem.
 * Se `userId` for informado, marca `voted` para os projetos votados por ele.
 */
export function listProjects(userId?: number | null, opts: ListOptions = {}): Project[] {
  const sort = opts.sort ?? 'top';
  const orderBy = ORDER_BY[sort] ?? ORDER_BY.top;

  const where: string[] = [];
  const bind: Record<string, unknown> = { userId: userId ?? -1 };

  const cat = opts.cat?.trim();
  if (cat && cat !== 'Todos') {
    where.push('p.cat = @cat');
    bind.cat = cat;
  }
  const q = opts.q?.trim();
  if (q) {
    where.push('(p.name LIKE @q OR p.blurb LIKE @q OR p.author LIKE @q)');
    bind.q = `%${q}%`;
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = getDb()
    .prepare(
      `SELECT p.*,
              (uv.user_id IS NOT NULL) AS voted,
              (pi.project_id IS NOT NULL) AS has_image,
              COALESCE(rv.avg, 0) AS rating,
              COALESCE(rv.cnt, 0) AS review_count,
              (SELECT COUNT(*) FROM user_votes v
                 WHERE v.project_id = p.id AND v.created_at > datetime('now', '-7 days')) AS recent
       FROM projects p
       LEFT JOIN user_votes uv ON uv.project_id = p.id AND uv.user_id = @userId
       LEFT JOIN project_images pi ON pi.project_id = p.id
       LEFT JOIN (SELECT project_id, AVG(stars) AS avg, COUNT(*) AS cnt FROM reviews GROUP BY project_id) rv
         ON rv.project_id = p.id
       ${whereSql}
       ORDER BY ${orderBy}`,
    )
    .all(bind) as Row[];
  return rows.map((row, i) => toProject(row, i + 1));
}

export function getProjectBySlug(slug: string, userId?: number | null): Project | undefined {
  return listProjects(userId).find((p) => p.slug === slug);
}

/** Projetos publicados por um usuário, mantendo o rank global do placar. */
export function listProjectsByOwner(userId: number): Project[] {
  return listProjects(userId).filter((p) => p.ownerId === userId);
}

export function createProject(input: CreateProjectInput): Project {
  const db = getDb();
  const name = input.name.trim();
  const slug = uniqueSlug(slugify(name));

  const info = db.prepare(`
    INSERT INTO projects
      (slug, name, blurb, author, handle, stars, votes, cat, badge, lvl, description, tags, forks, xp_for_author, owner_id, url)
    VALUES
      (@slug, @name, @blurb, @author, @handle, @stars, 0, @cat, 'NOVO', 1, @description, @tags, '0', '+0', @ownerId, @url)
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
    url: input.url?.trim() || null,
  });

  // XP de participação por publicar (uma vez por projeto).
  if (input.ownerId) awardXp(input.ownerId, 'publish', Number(info.lastInsertRowid));

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
    url: 'url',
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

/** Grava/atualiza o screenshot do projeto. Retorna false se o projeto não existe. */
export function setProjectImage(slug: string, mime: string, data: Buffer): boolean {
  const db = getDb();
  const proj = db.prepare('SELECT id FROM projects WHERE slug = ?').get(slug) as
    | { id: number }
    | undefined;
  if (!proj) return false;

  db.prepare(
    `INSERT INTO project_images (project_id, mime, data, updated_at)
     VALUES (@id, @mime, @data, datetime('now'))
     ON CONFLICT(project_id) DO UPDATE SET mime = @mime, data = @data, updated_at = datetime('now')`,
  ).run({ id: proj.id, mime, data });
  return true;
}

/** Lê o screenshot do projeto (mime + bytes), ou undefined se não houver. */
export function getProjectImage(slug: string): { mime: string; data: Buffer } | undefined {
  const row = getDb()
    .prepare(
      `SELECT pi.mime AS mime, pi.data AS data
       FROM project_images pi JOIN projects p ON p.id = pi.project_id
       WHERE p.slug = ?`,
    )
    .get(slug) as { mime: string; data: Buffer } | undefined;
  return row;
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

  let voted = false; // virou um voto novo? (para notificar só uma vez)
  const tx = db.transaction(() => {
    const has = db
      .prepare('SELECT 1 FROM user_votes WHERE user_id = ? AND project_id = ?')
      .get(userId, proj.id);

    if (delta > 0) {
      if (has) return; // já votou — idempotente
      db.prepare('INSERT INTO user_votes (user_id, project_id) VALUES (?, ?)').run(userId, proj.id);
      db.prepare('UPDATE projects SET votes = votes + 1 WHERE id = ?').run(proj.id);
      voted = true;
    } else {
      if (!has) return; // não havia voto
      db.prepare('DELETE FROM user_votes WHERE user_id = ? AND project_id = ?').run(userId, proj.id);
      db.prepare('UPDATE projects SET votes = MAX(0, votes - 1) WHERE id = ?').run(proj.id);
    }
  });
  tx();

  // Avisa o dono e concede XP de participação apenas em voto novo.
  if (voted) {
    notifyProjectEvent(proj.id, userId, 'vote');
    awardXp(userId, 'vote', proj.id);
  }

  return getProjectBySlug(slug, userId);
}

const votesOf = (p: Project) => parseInt(p.votes.replace(/\D/g, ''), 10) || 0;

// XP acumulado necessário para ESTAR no nível L: 50·(L-1)·L (0, 100, 300, 600, 1000…).
const xpThreshold = (level: number) => 50 * (level - 1) * level;

function levelForXp(xp: number): number {
  let level = 1;
  while (xpThreshold(level + 1) <= xp) level += 1;
  return level;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// Selo ao lado do nome, por nível alcançado.
function rankBadge(level: number): string {
  if (level >= 10) return 'OURO DEV';
  if (level >= 6) return 'PRATA DEV';
  if (level >= 3) return 'BRONZE DEV';
  return 'BUILDER';
}

// Conquistas derivadas de métricas reais (votos recebidos, projetos, melhor rank).
function buildAchievements(votes: number, projectCount: number, bestRank: number): Achievement[] {
  const out: Achievement[] = [];
  const rot = [-4, 3, -2, 2.5, -3, 2];
  const add = (label: string, color: string) =>
    out.push({ label, color, rotate: rot[out.length % rot.length] });

  if (bestRank === 1) add('TOP DA SEMANA', '#b23a2a');
  else if (bestRank <= 3) add('TOP 3', '#2f6d86');

  if (votes >= 1000) add('+1000 VOTOS', '#557a38');
  else if (votes >= 100) add('+100 VOTOS', '#557a38');

  if (projectCount >= 3) add('MARATONISTA', '#2f6d86');
  if (projectCount >= 1) add('PRIMEIRO PROJETO', '#9a6a1f');

  return out;
}

/**
 * Perfil REAL de um dev, calculado a partir dos projetos publicados e dos votos
 * recebidos. Reconhece também usuários cadastrados que ainda não publicaram.
 */
export function resolveDev(rawHandle: string): Dev | undefined {
  const key = rawHandle.replace(/^@/, '').toLowerCase();
  const authored = listProjects().filter((p) => p.handle.replace(/^@/, '').toLowerCase() === key);

  const account = getDb()
    .prepare(
      `SELECT u.id AS id, u.name AS name, u.handle AS handle, u.bio AS bio,
              (av.user_id IS NOT NULL) AS has_avatar
       FROM users u LEFT JOIN user_avatars av ON av.user_id = u.id
       WHERE u.handle = ?`,
    )
    .get(key) as { id: number; name: string; handle: string; bio: string; has_avatar: number } | undefined;

  if (authored.length === 0 && !account) return undefined;

  const name = account?.name ?? authored[0].author;
  const handle = account ? `@${account.handle}` : authored[0].handle;

  const votes = authored.reduce((acc, p) => acc + votesOf(p), 0);
  const projectCount = authored.length;
  const bestRank = projectCount > 0 ? Math.min(...authored.map((p) => p.rank)) : 0;

  // XP recompensa votos recebidos, projetos publicados (100 XP por projeto) e a
  // participação na plataforma (votar, avaliar, publicar — ver src/lib/xp.ts).
  const participation = account ? participationXp(account.id) : 0;
  const xp = votes + projectCount * 100 + participation;
  const level = levelForXp(xp);

  // Bio personalizada da conta tem prioridade; senão, é gerada das categorias.
  const cats = [...new Set(authored.map((p) => p.cat).filter(Boolean))];
  const generatedBio =
    projectCount === 0
      ? 'Ainda não publicou projetos na bancada.'
      : `Constrói ${cats.join(', ')} na bancada. ${projectCount} projeto${projectCount > 1 ? 's' : ''} publicado${projectCount > 1 ? 's' : ''}.`;
  const bio = account?.bio?.trim() ? account.bio.trim() : generatedBio;

  return {
    handle,
    name,
    initials: initialsOf(name),
    hasAvatar: !!account?.has_avatar,
    bio,
    level,
    xp,
    xpNext: xpThreshold(level + 1),
    badge: rankBadge(level),
    participation,
    stats: {
      projects: projectCount,
      votes: votes.toLocaleString('pt-BR'),
      bestRank: projectCount > 0 ? `#${bestRank}` : '—',
    },
    achievements: buildAchievements(votes, projectCount, bestRank),
    projectSlugs: authored.map((p) => p.slug),
  };
}
