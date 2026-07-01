import { NextResponse } from 'next/server';
import { deleteReview, listReviews, reviewStats, upsertReview } from '@/lib/reviews';
import { getCurrentUser } from '@/lib/auth';
import { getProjectOwnerId } from '@/lib/projects';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_TEXT = 500;

// GET /api/projects/[slug]/reviews — lista avaliações + resumo (público).
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return NextResponse.json({ reviews: listReviews(slug), stats: reviewStats(slug) });
}

// POST /api/projects/[slug]/reviews — cria/atualiza a própria avaliação.
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Faça login para avaliar.' }, { status: 401 });

  const ownerId = getProjectOwnerId(slug);
  if (ownerId === undefined) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  if (ownerId === user.id) {
    return NextResponse.json({ error: 'Você não pode avaliar o próprio projeto.' }, { status: 403 });
  }

  let body: { stars?: number; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const stars = Number(body.stars);
  const text = (body.text ?? '').toString();

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json(
      { error: 'Dados inválidos.', fields: { stars: 'Escolha de 1 a 5 estrelas.' } },
      { status: 422 },
    );
  }
  if (text.length > MAX_TEXT) {
    return NextResponse.json(
      { error: 'Dados inválidos.', fields: { text: `Texto muito longo (máx. ${MAX_TEXT}).` } },
      { status: 422 },
    );
  }

  const result = upsertReview(slug, user.id, stars, text);
  if (result === 'not_found') {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ reviews: listReviews(slug), stats: reviewStats(slug) }, { status: 201 });
}

// DELETE /api/projects/[slug]/reviews — remove a própria avaliação.
export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });

  const removed = deleteReview(slug, user.id);
  if (!removed) return NextResponse.json({ error: 'Você não avaliou este projeto.' }, { status: 404 });
  return NextResponse.json({ reviews: listReviews(slug), stats: reviewStats(slug) });
}
