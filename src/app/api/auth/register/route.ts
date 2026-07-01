import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  cleanHandle,
  createSession,
  createUser,
} from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: { name?: string; handle?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const handle = cleanHandle(body.handle ?? '');
  const password = body.password ?? '';

  const fields: Record<string, string> = {};
  if (!name) fields.name = 'Informe seu nome.';
  if (!handle) fields.handle = 'Informe um handle.';
  else if (!/^[a-z0-9_]{2,30}$/.test(handle))
    fields.handle = 'Use 2–30 caracteres: letras, números ou _.';
  if (password.length < 6) fields.password = 'A senha precisa de ao menos 6 caracteres.';

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: 'Dados inválidos.', fields }, { status: 422 });
  }

  const result = createUser(name, handle, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, fields: { handle: result.error } }, { status: 409 });
  }

  const token = createSession(result.user.id);
  const res = NextResponse.json({ user: result.user }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
