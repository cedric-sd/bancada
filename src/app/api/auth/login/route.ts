import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSession,
  getUserByHandle,
  initialsOf,
  verifyPassword,
} from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: { handle?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const row = getUserByHandle(body.handle ?? '');
  // Mesma resposta para handle inexistente ou senha errada.
  if (!row || !verifyPassword(body.password ?? '', row.password_hash)) {
    return NextResponse.json({ error: 'Handle ou senha inválidos.' }, { status: 401 });
  }

  const token = createSession(row.id);
  const user = {
    id: row.id,
    handle: `@${row.handle}`,
    name: row.name,
    initials: initialsOf(row.name),
    hasAvatar: false,
  };
  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
