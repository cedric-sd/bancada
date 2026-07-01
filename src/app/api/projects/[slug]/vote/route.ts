import { NextResponse } from 'next/server';
import { voteProject } from '@/lib/projects';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/projects/[slug]/vote — registra um voto (+1).
export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = voteProject(slug, 1);
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ project });
}

// DELETE /api/projects/[slug]/vote — desfaz o voto (-1).
export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = voteProject(slug, -1);
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ project });
}
