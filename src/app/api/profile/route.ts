import { NextResponse } from 'next/server';
import { getAccount, getCurrentUser, updateUserProfile } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BIO = 280;

// GET /api/profile — dados da conta autenticada (nome, bio, handle).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  return NextResponse.json({ account: getAccount(user.id) });
}

// PATCH /api/profile — atualiza nome e bio do usuário logado.
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });

  let body: { name?: string; bio?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const bio = (body.bio ?? '').trim();

  const fields: Record<string, string> = {};
  if (!name) fields.name = 'Informe seu nome.';
  else if (name.length > 60) fields.name = 'Nome muito longo (máx. 60).';
  if (bio.length > MAX_BIO) fields.bio = `Bio muito longa (máx. ${MAX_BIO}).`;

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: 'Dados inválidos.', fields }, { status: 422 });
  }

  updateUserProfile(user.id, name, bio);
  return NextResponse.json({ account: getAccount(user.id) });
}
