import 'server-only';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getDb } from './db';

export const SESSION_COOKIE = 'bancada_session';
const SESSION_DAYS = 30;

export type User = {
  id: number;
  handle: string; // com @, para exibição
  name: string;
  initials: string;
  hasAvatar: boolean;
};

type UserRow = {
  id: number;
  handle: string;
  name: string;
  password_hash: string;
  has_avatar?: number;
};

const withAt = (handle: string) => `@${handle.replace(/^@+/, '')}`;

export const cleanHandle = (handle: string) => handle.trim().replace(/^@+/, '').toLowerCase();

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    handle: withAt(row.handle),
    name: row.name,
    initials: initialsOf(row.name),
    hasAvatar: !!row.has_avatar,
  };
}

// --- senha (scrypt nativo, sem dependências externas) ---

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// --- usuários ---

export function getUserByHandle(handle: string): UserRow | undefined {
  return getDb()
    .prepare('SELECT id, handle, name, password_hash FROM users WHERE handle = ?')
    .get(cleanHandle(handle)) as UserRow | undefined;
}

// Handle único a partir de uma base (para logins via GitHub).
function uniqueUserHandle(base: string): string {
  const db = getDb();
  const exists = db.prepare('SELECT 1 FROM users WHERE handle = ?');
  const clean = cleanHandle(base).replace(/[^a-z0-9_]/g, '') || 'dev';
  let handle = clean;
  let n = 2;
  while (exists.get(handle)) handle = `${clean}${n++}`;
  return handle;
}

// --- login com GitHub ---

export function githubConfigured(): boolean {
  return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

export function getUserByGithubId(githubId: number): { id: number } | undefined {
  return getDb().prepare('SELECT id FROM users WHERE github_id = ?').get(githubId) as
    | { id: number }
    | undefined;
}

/**
 * Encontra o usuário pela conta do GitHub ou cria um novo (handle derivado do
 * login, sem senha). Retorna id e handle (sem @).
 */
export function findOrCreateGithubUser(profile: {
  githubId: number;
  login: string;
  name?: string | null;
}): { id: number; handle: string } {
  const db = getDb();
  const existing = db.prepare('SELECT id, handle FROM users WHERE github_id = ?').get(profile.githubId) as
    | { id: number; handle: string }
    | undefined;
  if (existing) {
    // Mantém o login do GitHub atualizado (usado para listar repositórios).
    db.prepare('UPDATE users SET github_login = ? WHERE id = ?').run(profile.login, existing.id);
    return existing;
  }

  const handle = uniqueUserHandle(profile.login);
  const name = (profile.name || profile.login).trim();
  const info = db
    .prepare("INSERT INTO users (handle, name, password_hash, github_id, github_login) VALUES (?, ?, '', ?, ?)")
    .run(handle, name, profile.githubId, profile.login);
  return { id: Number(info.lastInsertRowid), handle };
}

/** Login do GitHub vinculado à conta (ou null). */
export function getGithubLogin(userId: number): string | null {
  const row = getDb().prepare('SELECT github_login FROM users WHERE id = ?').get(userId) as
    | { github_login: string | null }
    | undefined;
  return row?.github_login ?? null;
}

export type CreateUserResult = { ok: true; user: User } | { ok: false; error: string };

export function createUser(name: string, handle: string, password: string): CreateUserResult {
  const h = cleanHandle(handle);
  if (getUserByHandle(h)) {
    return { ok: false, error: 'Esse handle já está em uso.' };
  }
  const info = getDb()
    .prepare('INSERT INTO users (handle, name, password_hash) VALUES (?, ?, ?)')
    .run(h, name.trim(), hashPassword(password));
  return {
    ok: true,
    user: {
      id: Number(info.lastInsertRowid),
      handle: withAt(h),
      name: name.trim(),
      initials: initialsOf(name),
      hasAvatar: false,
    },
  };
}

// --- perfil ---

export type Account = { id: number; handle: string; name: string; bio: string };

export function getAccount(userId: number): Account | undefined {
  const row = getDb()
    .prepare('SELECT id, handle, name, bio FROM users WHERE id = ?')
    .get(userId) as { id: number; handle: string; name: string; bio: string } | undefined;
  return row ? { ...row, handle: withAt(row.handle) } : undefined;
}

/**
 * Atualiza nome e bio do usuário. Ao mudar o nome, sincroniza o autor dos
 * projetos que ele possui (author é denormalizado em projects).
 */
export function updateUserProfile(userId: number, name: string, bio: string): void {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare('UPDATE users SET name = ?, bio = ? WHERE id = ?').run(name.trim(), bio.trim(), userId);
    db.prepare('UPDATE projects SET author = ? WHERE owner_id = ?').run(name.trim(), userId);
  });
  tx();
}

// --- sessões ---

export function createSession(userId: number): string {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  getDb()
    .prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .run(token, userId, expires);
  return token;
}

export function destroySession(token: string): void {
  getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

function userFromToken(token: string | undefined): User | null {
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.handle, u.name, u.password_hash,
              (av.user_id IS NOT NULL) AS has_avatar
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN user_avatars av ON av.user_id = u.id
       WHERE s.token = ? AND s.expires_at > datetime('now')`,
    )
    .get(token) as UserRow | undefined;
  return row ? toUser(row) : null;
}

// --- avatar ---

export function setUserAvatar(userId: number, mime: string, data: Buffer): void {
  getDb()
    .prepare(
      `INSERT INTO user_avatars (user_id, mime, data, updated_at)
       VALUES (@id, @mime, @data, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET mime = @mime, data = @data, updated_at = datetime('now')`,
    )
    .run({ id: userId, mime, data });
}

export function getUserAvatarByHandle(handle: string): { mime: string; data: Buffer } | undefined {
  return getDb()
    .prepare(
      `SELECT av.mime AS mime, av.data AS data
       FROM user_avatars av JOIN users u ON u.id = av.user_id
       WHERE u.handle = ?`,
    )
    .get(cleanHandle(handle)) as { mime: string; data: Buffer } | undefined;
}

export function userHasAvatar(handle: string): boolean {
  const row = getDb()
    .prepare(
      `SELECT 1 FROM user_avatars av JOIN users u ON u.id = av.user_id WHERE u.handle = ?`,
    )
    .get(cleanHandle(handle));
  return !!row;
}

export const SESSION_MAX_AGE = SESSION_DAYS * 864e2;

/** Usuário autenticado a partir do cookie de sessão (Server Components / rotas). */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  return userFromToken(store.get(SESSION_COOKIE)?.value);
}
