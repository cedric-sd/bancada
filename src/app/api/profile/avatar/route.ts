import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { getCurrentUser, setUserAvatar } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

// POST /api/profile/avatar — envia/atualiza o avatar do usuário logado.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Envio inválido.' }, { status: 400 });
  }

  const file = form.get('avatar');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo de imagem ausente.' }, { status: 422 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Formato inválido (use PNG, JPG, WebP ou GIF).' }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Imagem muito grande (máx. 3 MB).' }, { status: 422 });
  }

  const input = Buffer.from(await file.arrayBuffer());

  // Avatar quadrado 256×256 (recorte central) em WebP.
  let optimized: Buffer;
  try {
    optimized = await sharp(input)
      .rotate()
      .resize({ width: 256, height: 256, fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: 'Não foi possível processar a imagem.' }, { status: 422 });
  }

  setUserAvatar(user.id, 'image/webp', optimized);
  return NextResponse.json({ ok: true, hasAvatar: true });
}
