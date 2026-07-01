import { NextResponse } from 'next/server';
import {
  deleteProject,
  getProjectBySlug,
  updateProject,
  type UpdateProjectInput,
} from '@/lib/projects';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/projects/[slug]
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ project });
}

// PATCH /api/projects/[slug] — atualização parcial.
export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let body: UpdateProjectInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const project = updateProject(slug, body);
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ project });
}

// DELETE /api/projects/[slug]
export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const removed = deleteProject(slug);
  if (!removed) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
