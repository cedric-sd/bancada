import { NextResponse } from 'next/server';
import { getUserAvatarByHandle } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/users/[handle]/avatar — serve o avatar (público).
export async function GET(_request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const img = getUserAvatarByHandle(handle);
  if (!img) {
    return NextResponse.json({ error: 'Sem avatar.' }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(img.data), {
    headers: { 'Content-Type': img.mime, 'Cache-Control': 'no-cache' },
  });
}
