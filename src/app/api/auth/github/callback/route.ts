import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sharp from 'sharp';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSession,
  findOrCreateGithubUser,
  githubConfigured,
  getUserByGithubId,
  setUserAvatar,
} from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Redireciona para /entrar com uma mensagem de erro.
function fail(origin: string, reason: string) {
  return NextResponse.redirect(`${origin}/entrar?erro=${encodeURIComponent(reason)}`);
}

// GET /api/auth/github/callback — conclui o login com GitHub.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  if (!githubConfigured()) return fail(origin, 'GitHub não configurado.');

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const store = await cookies();
  const savedState = store.get('gh_state')?.value;
  const next = store.get('gh_next')?.value || '/';

  if (!code || !state || !savedState || state !== savedState) {
    return fail(origin, 'Falha na verificação do login.');
  }

  try {
    // 1) troca o code por access_token
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${origin}/api/auth/github/callback`;
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) return fail(origin, 'Não foi possível autenticar com o GitHub.');

    // 2) busca o perfil
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'bancada-app',
      },
    });
    if (!userRes.ok) return fail(origin, 'Não foi possível ler o perfil do GitHub.');
    const gh = (await userRes.json()) as {
      id: number;
      login: string;
      name?: string | null;
      avatar_url?: string;
    };

    // 3) encontra ou cria o usuário local
    const isNew = !getUserByGithubId(gh.id);
    const user = findOrCreateGithubUser({ githubId: gh.id, login: gh.login, name: gh.name });

    // 4) avatar do GitHub (best-effort) apenas ao criar a conta
    if (isNew && gh.avatar_url) {
      try {
        const imgRes = await fetch(gh.avatar_url);
        if (imgRes.ok) {
          const input = Buffer.from(await imgRes.arrayBuffer());
          const webp = await sharp(input)
            .rotate()
            .resize({ width: 256, height: 256, fit: 'cover', position: 'centre' })
            .webp({ quality: 82 })
            .toBuffer();
          setUserAvatar(user.id, 'image/webp', webp);
        }
      } catch {
        // ignora falha de avatar
      }
    }

    // 5) cria a sessão e limpa os cookies temporários
    const token = createSession(user.id);
    const res = NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/'}`);
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookies.set('gh_state', '', { path: '/', maxAge: 0 });
    res.cookies.set('gh_next', '', { path: '/', maxAge: 0 });
    return res;
  } catch {
    return fail(origin, 'Erro inesperado no login com GitHub.');
  }
}
