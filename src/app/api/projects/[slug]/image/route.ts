import { NextResponse } from 'next/server';
import { getProjectImage, getProjectOwnerId, setProjectImage } from '@/lib/projects';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

// GET /api/projects/[slug]/image — serve o screenshot (público).
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const img = getProjectImage(slug);
  if (!img) {
    return NextResponse.json({ error: 'Sem imagem.' }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(img.data), {
    headers: {
      'Content-Type': img.mime,
      'Cache-Control': 'no-cache',
    },
  });
}

// POST /api/projects/[slug]/image — envia/atualiza o screenshot (só o dono).
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });

  const ownerId = getProjectOwnerId(slug);
  if (ownerId === undefined) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }
  if (ownerId !== user.id) {
    return NextResponse.json({ error: 'Você não é o dono deste projeto.' }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Envio inválido.' }, { status: 400 });
  }

  const file = form.get('image');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo de imagem ausente.' }, { status: 422 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Formato inválido (use PNG, JPG, WebP ou GIF).' }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Imagem muito grande (máx. 3 MB).' }, { status: 422 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  setProjectImage(slug, file.type, buffer);
  return NextResponse.json({ ok: true, hasImage: true });
}
