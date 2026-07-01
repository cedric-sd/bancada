'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const linkStyle = {
  font: '600 11px var(--font-mono)',
  color: 'rgba(40,30,10,.6)',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
} as const;

/**
 * Exclui o projeto via DELETE na API, com confirmação inline (dois passos).
 */
export default function DeleteProjectButton({
  slug,
  name,
  redirectTo = '/',
}: {
  slug: string;
  name: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('falha');
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Não foi possível excluir. Tente novamente.');
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <button type="button" style={{ ...linkStyle, color: '#b23a2a' }} onClick={() => setConfirming(true)}>
        excluir
      </button>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ font: '600 11px var(--font-mono)', color: '#8a2318' }}>
        {error ?? `Excluir “${name}”?`}
      </span>
      <button
        type="button"
        className="press"
        onClick={remove}
        disabled={deleting}
        style={{
          font: '800 10px var(--font-mono)',
          color: '#f1e7cd',
          background: 'linear-gradient(#b23a2a,#8a2318)',
          border: '1px solid #6f1c12',
          borderRadius: 7,
          padding: '5px 10px',
          boxShadow: '0 2px 0 #6f1c12,inset 0 1px 0 rgba(255,255,255,.15)',
        }}
      >
        {deleting ? 'excluindo…' : 'confirmar'}
      </button>
      <button type="button" style={linkStyle} onClick={() => setConfirming(false)} disabled={deleting}>
        cancelar
      </button>
    </span>
  );
}
