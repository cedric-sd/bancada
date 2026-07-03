import { NextResponse } from 'next/server';
import { createProject, listProjects, type CreateProjectInput, type SortKey } from '@/lib/projects';
import { getCurrentUser } from '@/lib/auth';
import { fetchRepoStars } from '@/lib/github';

// Rotas de dados sempre no runtime Node (better-sqlite3 é nativo) e dinâmicas.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SORTS: SortKey[] = ['top', 'novos', 'alta'];

// GET /api/projects?ordem=&cat=&q= — lista com ordenação, filtro e busca.
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const ordem = sp.get('ordem');
  const sort: SortKey = SORTS.includes(ordem as SortKey) ? (ordem as SortKey) : 'top';
  const cat = sp.get('cat') ?? undefined;
  const q = sp.get('q') ?? undefined;
  const user = await getCurrentUser();
  return NextResponse.json({ projects: listProjects(user?.id, { sort, cat, q }) });
}

// POST /api/projects — publica um novo projeto (requer login).
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Faça login para publicar.' }, { status: 401 });
  }

  let body: Partial<CreateProjectInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: 'Dados inválidos.', fields: { name: 'Nome é obrigatório.' } },
      { status: 422 },
    );
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.map((t) => String(t).trim()).filter(Boolean)
    : undefined;

  // As estrelas vêm do GitHub (a partir do link do repo), não do cliente.
  const url = typeof body.url === 'string' ? body.url : undefined;
  const stars = (url ? await fetchRepoStars(url) : null) ?? '0';

  // Autor, handle e dono vêm sempre da conta autenticada.
  const project = createProject({
    name: body.name,
    author: user.name,
    handle: user.handle,
    ownerId: user.id,
    blurb: body.blurb,
    cat: body.cat,
    description: body.description,
    stars,
    tags,
    url,
  });

  return NextResponse.json({ project }, { status: 201 });
}
