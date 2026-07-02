'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Botão de seguir/deixar de seguir um dev. Persistente por usuário. Sem login,
 * leva à tela de entrar. Atualiza a rota para refletir a contagem.
 */
export default function FollowButton({
  handle,
  authed,
  initialFollowing,
}: {
  handle: string; // sem @
  authed: boolean;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    if (!authed) {
      router.push(`/entrar?next=${encodeURIComponent(`/dev/${handle}`)}`);
      return;
    }
    const next = !following;
    setPending(true);
    setFollowing(next);
    try {
      const res = await fetch(`/api/users/${handle}/follow`, { method: next ? 'POST' : 'DELETE' });
      if (!res.ok) throw new Error('falha');
      router.refresh();
    } catch {
      setFollowing(!next); // reverte
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className="press"
      onClick={toggle}
      disabled={pending}
      aria-pressed={following}
      style={{
        font: '800 11px var(--font-mono)',
        letterSpacing: '.04em',
        padding: '8px 14px',
        borderRadius: 9,
        cursor: 'pointer',
        ...(following
          ? {
              color: '#557a38',
              background: '#e4ecca',
              border: '1px solid #b8cf8f',
              boxShadow: '0 2px 0 #a9c187,inset 0 1px 0 rgba(255,255,255,.5)',
            }
          : {
              color: '#f1e7cd',
              background: 'linear-gradient(#3a3022,#211a10)',
              border: '1px solid #120d07',
              boxShadow: '0 3px 0 #15100a,inset 0 1px 0 rgba(255,255,255,.12)',
            }),
      }}
    >
      {following ? '✓ Seguindo' : '+ Seguir'}
    </button>
  );
}
