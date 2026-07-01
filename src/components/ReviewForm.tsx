'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MAX_TEXT = 500;

/**
 * Formulário de avaliação (1–5 estrelas + texto). Cria ou edita a avaliação
 * do usuário no projeto; permite remover a própria.
 */
export default function ReviewForm({
  slug,
  initialStars,
  initialText,
  hasReview,
}: {
  slug: string;
  initialStars: number;
  initialText: string;
  hasReview: boolean;
}) {
  const router = useRouter();
  const [stars, setStars] = useState(initialStars);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (stars < 1) {
      setError('Escolha de 1 a 5 estrelas.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars, text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Não foi possível salvar.');
        setPending(false);
        return;
      }
      router.refresh();
    } catch {
      setError('Falha de rede. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${slug}/reviews`, { method: 'DELETE' });
      if (!res.ok) throw new Error('falha');
      setStars(0);
      setText('');
      router.refresh();
    } catch {
      setError('Não foi possível remover.');
    } finally {
      setPending(false);
    }
  }

  const shown = hover || stars;

  return (
    <form
      onSubmit={submit}
      style={{
        background: '#f7efda',
        border: '1px solid #d8c79d',
        borderRadius: 8,
        padding: 16,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)',
      }}
    >
      <div style={{ font: '700 10px var(--font-mono)', letterSpacing: '.1em', color: 'rgba(40,30,10,.6)', marginBottom: 8 }}>
        {hasReview ? 'SUA AVALIAÇÃO' : 'DEIXE SUA AVALIAÇÃO'}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }} onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
            style={{
              appearance: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontSize: 24,
              lineHeight: 1,
              color: n <= shown ? '#c8951f' : 'rgba(40,30,10,.25)',
            }}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={text}
        maxLength={MAX_TEXT}
        onChange={(e) => setText(e.target.value)}
        placeholder="O que você achou? (opcional)"
        style={{
          width: '100%',
          minHeight: 68,
          resize: 'vertical',
          font: '400 14px/1.5 var(--font-news)',
          color: '#221c12',
          background: '#fbf6e6',
          border: '1px solid #cbb787',
          borderRadius: 8,
          padding: '10px 12px',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,.12)',
          outline: 'none',
        }}
      />

      {error ? (
        <div style={{ font: '600 11px var(--font-mono)', color: '#b23a2a', marginTop: 8 }}>{error}</div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
        <button
          type="submit"
          className="press"
          disabled={pending}
          style={{
            font: '800 11px var(--font-mono)',
            color: '#f1e7cd',
            padding: '9px 14px',
            borderRadius: 9,
            background: 'linear-gradient(#3a3022,#211a10)',
            border: '1px solid #120d07',
            boxShadow: '0 3px 0 #15100a,inset 0 1px 0 rgba(255,255,255,.12)',
          }}
        >
          {pending ? 'salvando…' : hasReview ? 'atualizar' : 'publicar avaliação'}
        </button>
        {hasReview ? (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            style={{ appearance: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: '600 11px var(--font-mono)', color: '#b23a2a' }}
          >
            remover
          </button>
        ) : null}
      </div>
    </form>
  );
}
