import { NextResponse } from 'next/server';
import { cleanHandle, getCurrentUser, getUserByHandle } from '@/lib/auth';
import { followCounts, followUser, unfollowUser } from '@/lib/follows';
import { notify } from '@/lib/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function resolve(handle: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: 'Faça login para seguir.' }, { status: 401 }) };
  const target = getUserByHandle(handle);
  if (!target) return { error: NextResponse.json({ error: 'Dev não encontrado.' }, { status: 404 }) };
  if (target.id === user.id) {
    return { error: NextResponse.json({ error: 'Você não pode seguir a si mesmo.' }, { status: 400 }) };
  }
  return { user, target };
}

// POST /api/users/[handle]/follow — passa a seguir o dev.
export async function POST(_request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const r = await resolve(handle);
  if (r.error) return r.error;

  const isNew = followUser(r.user.id, r.target.id);
  if (isNew) {
    notify({
      userId: r.target.id,
      kind: 'follow',
      actor: r.user.name,
      meta: { handle: cleanHandle(r.user.handle) },
    });
  }
  return NextResponse.json({ following: true, counts: followCounts(r.target.id) });
}

// DELETE /api/users/[handle]/follow — deixa de seguir.
export async function DELETE(_request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const r = await resolve(handle);
  if (r.error) return r.error;

  unfollowUser(r.user.id, r.target.id);
  return NextResponse.json({ following: false, counts: followCounts(r.target.id) });
}
