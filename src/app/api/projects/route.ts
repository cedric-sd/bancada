import { NextResponse } from 'next/server';
import { createProject, listProjects, type CreateProjectInput } from '@/lib/projects';

// Rotas de dados sempre no runtime Node (better-sqlite3 é nativo) e dinâmicas.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/projects — lista todos os projetos, já ranqueados por votos.
export async function GET() {
  return NextResponse.json({ projects: listProjects() });
}

// POST /api/projects — publica um novo projeto.
export async function POST(request: Request) {
  let body: Partial<CreateProjectInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  if (!body.name?.trim()) errors.name = 'Nome é obrigatório.';
  if (!body.author?.trim()) errors.author = 'Autor é obrigatório.';
  if (!body.handle?.trim()) errors.handle = 'Handle é obrigatório.';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Dados inválidos.', fields: errors }, { status: 422 });
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.map((t) => String(t).trim()).filter(Boolean)
    : undefined;

  const project = createProject({
    name: body.name!,
    author: body.author!,
    handle: body.handle!,
    blurb: body.blurb,
    cat: body.cat,
    description: body.description,
    stars: body.stars,
    tags,
  });

  return NextResponse.json({ project }, { status: 201 });
}
