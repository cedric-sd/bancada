import { NextResponse } from 'next/server';
import {
  deleteProject,
  getProjectBySlug,
  getProjectOwnerId,
  updateProject,
  type UpdateProjectInput,
} from '@/lib/projects';
import { getCurrentUser, type User } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Garante que o usuário atual é o dono do projeto. Retorna o usuário ou uma
// resposta de erro (401/403/404) pronta para devolver.
async function requireOwner(slug: string): Promise<User | NextResponse> {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });

  const ownerId = getProjectOwnerId(slug);
  if (ownerId === undefined) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  if (ownerId !== user.id) {
    return NextResponse.json({ error: 'Você não é o dono deste projeto.' }, { status: 403 });
  }
  return user;
}

// GET /api/projects/[slug]
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const project = getProjectBySlug(slug, user?.id);
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ project });
}

// PATCH /api/projects/[slug] — atualização parcial (apenas o dono).
export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guard = await requireOwner(slug);
  if (guard instanceof NextResponse) return guard;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  // Só campos editáveis pelo dono (autor/handle/votos não são alteráveis aqui).
  const patch: UpdateProjectInput = {};
  for (const key of ['name', 'blurb', 'cat', 'description', 'stars'] as const) {
    if (typeof body[key] === 'string') patch[key] = body[key] as string;
  }
  if (Array.isArray(body.tags)) {
    patch.tags = body.tags.map((t) => String(t).trim()).filter(Boolean);
  }

  const project = updateProject(slug, patch);
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ project });
}

// DELETE /api/projects/[slug] — apenas o dono.
export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guard = await requireOwner(slug);
  if (guard instanceof NextResponse) return guard;

  const removed = deleteProject(slug);
  if (!removed) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
