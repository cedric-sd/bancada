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
};

type UserRow = { id: number; handle: string; name: string; password_hash: string };

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
  return { id: row.id, handle: withAt(row.handle), name: row.name, initials: initialsOf(row.name) };
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
    user: { id: Number(info.lastInsertRowid), handle: withAt(h), name: name.trim(), initials: initialsOf(name) },
  };
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
      `SELECT u.id, u.handle, u.name, u.password_hash
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')`,
    )
    .get(token) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export const SESSION_MAX_AGE = SESSION_DAYS * 864e2;

/** Usuário autenticado a partir do cookie de sessão (Server Components / rotas). */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  return userFromToken(store.get(SESSION_COOKIE)?.value);
}
