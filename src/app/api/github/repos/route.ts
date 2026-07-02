import { NextResponse } from 'next/server';
import { getCurrentUser, getGithubLogin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  language: string | null;
  topics: string[];
  fork: boolean;
  updatedAt: string;
};

type ApiRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  updated_at: string;
};

// GET /api/github/repos — repositórios públicos do usuário logado (via GitHub).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });

  const login = getGithubLogin(user.id);
  if (!login) {
    return NextResponse.json(
      { error: 'Sua conta não está vinculada ao GitHub. Entre com GitHub para importar.' },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(login)}/repos?type=owner&sort=updated&per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'bancada-app',
          // Se um token estiver disponível no ambiente, aumenta o limite de taxa.
          ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
        },
        // repos mudam pouco; evita martelar a API do GitHub
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) {
      return NextResponse.json({ error: 'Não foi possível listar seus repositórios.' }, { status: 502 });
    }
    const raw = (await res.json()) as ApiRepo[];

    const repos: GithubRepo[] = raw
      .filter((r) => !r.fork && !r.archived)
      .map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description ?? '',
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        topics: r.topics ?? [],
        fork: r.fork,
        updatedAt: r.updated_at,
      }));

    return NextResponse.json({ repos });
  } catch {
    return NextResponse.json({ error: 'Erro ao consultar o GitHub.' }, { status: 502 });
  }
}
