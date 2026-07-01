'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Encerra a sessão via /api/auth/logout e atualiza a UI.
 */
export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      style={{
        appearance: 'none',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
        font: '600 10px var(--font-mono)',
        color: 'rgba(40,30,10,.55)',
      }}
    >
      {pending ? 'saindo…' : 'sair'}
    </button>
  );
}
