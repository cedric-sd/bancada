import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { githubConfigured } from '@/lib/auth';
import { resolveOrigin } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/auth/github?next=... — inicia o login com GitHub.
export async function GET(request: Request) {
  if (!githubConfigured()) {
    return NextResponse.json({ error: 'Login com GitHub não está configurado.' }, { status: 501 });
  }

  const url = new URL(request.url);
  const origin = resolveOrigin(request);
  const next = url.searchParams.get('next');
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${origin}/api/auth/github/callback`;
  const state = randomBytes(16).toString('hex');

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!);
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('scope', 'read:user');
  authorize.searchParams.set('state', state);

  const res = NextResponse.redirect(authorize.toString());
  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 600,
    secure: process.env.NODE_ENV === 'production',
  };
  res.cookies.set('gh_state', state, cookieOpts);
  res.cookies.set('gh_next', next && next.startsWith('/') ? next : '/', cookieOpts);
  return res;
}
