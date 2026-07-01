import { NextResponse } from 'next/server';
import { voteProject } from '@/lib/projects';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handle(slug: string, delta: 1 | -1) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Faça login para votar.' }, { status: 401 });
  }
  const project = voteProject(slug, user.id, delta);
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ project });
}

// POST /api/projects/[slug]/vote — registra um voto (+1) do usuário.
export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return handle(slug, 1);
}

// DELETE /api/projects/[slug]/vote — desfaz o voto (-1) do usuário.
export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return handle(slug, -1);
}
