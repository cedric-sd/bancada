'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Justificativa: os efeitos abaixo sincronizam com fontes externas (prop do
// servidor e localStorage do cliente), onde setState é o padrão adequado.
/* eslint-disable react-hooks/set-state-in-effect */

const parse = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0;
const format = (n: number) => n.toLocaleString('pt-BR');
const storageKey = (slug: string) => `bancada:voted:${slug}`;

const lightFace = {
  background: 'linear-gradient(#f7f0dd,#e6d5ad)',
  border: '1px solid #c2aa78',
  color: '#2a2419',
} as const;

/**
 * Botão de voto físico e persistente. O voto é gravado no banco via API; o
 * estado "já votei" fica no localStorage (por dispositivo, sem login). Após
 * votar, atualiza a rota para reordenar o placar.
 */
export default function VoteButton({
  votes,
  slug,
  variant = 'column',
}: {
  votes: string;
  slug: string;
  variant?: 'column' | 'pill' | 'detail' | 'lg';
}) {
  const router = useRouter();
  const [count, setCount] = useState(parse(votes));
  const [voted, setVoted] = useState(false);
  const [pending, setPending] = useState(false);

  // Mantém a contagem em sincronia quando o servidor reordena/atualiza.
  useEffect(() => {
    setCount(parse(votes));
  }, [votes]);

  // Recupera o estado "votado" deste dispositivo.
  useEffect(() => {
    try {
      setVoted(localStorage.getItem(storageKey(slug)) === '1');
    } catch {
      // localStorage indisponível — segue sem estado persistido.
    }
  }, [slug]);

  async function toggle(e: React.MouseEvent) {
    // Não navega quando o botão está dentro de um link (card do pódio).
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    const next = !voted;
    setPending(true);
    // Atualização otimista.
    setVoted(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));

    try {
      const res = await fetch(`/api/projects/${slug}/vote`, {
        method: next ? 'POST' : 'DELETE',
      });
      if (!res.ok) throw new Error('falha ao votar');
      const data = await res.json();

      setCount(parse(data.project.votes));
      try {
        if (next) localStorage.setItem(storageKey(slug), '1');
        else localStorage.removeItem(storageKey(slug));
      } catch {
        // ignora indisponibilidade de localStorage
      }
      router.refresh();
    } catch {
      // Reverte a atualização otimista em caso de erro.
      setVoted(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
    } finally {
      setPending(false);
    }
  }

  const display = format(count);
  const activeRing = voted ? { boxShadow: '0 0 0 2px #b23a2a inset' } : null;

  if (variant === 'pill') {
    return (
      <button
        className="press"
        onClick={toggle}
        aria-pressed={voted}
        disabled={pending}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '6px 11px',
          borderRadius: 8,
          ...lightFace,
          boxShadow: '0 2px 0 #b1925e,inset 0 1px 0 rgba(255,255,255,.7)',
          font: '800 11px var(--font-mono)',
          ...activeRing,
        }}
      >
        ▲ {display}
      </button>
    );
  }

  const dims =
    variant === 'lg' || variant === 'detail'
      ? { width: 66, padding: '11px 0', radius: 11, arrow: 16, num: 13 }
      : { width: 54, padding: '8px 0', radius: 9, arrow: 14, num: 11 };

  return (
    <button
      className="press"
      onClick={toggle}
      aria-pressed={voted}
      disabled={pending}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        width: dims.width,
        padding: dims.padding,
        borderRadius: dims.radius,
        ...lightFace,
        boxShadow:
          '0 4px 0 #b1925e,0 6px 10px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.7)',
        flex: 'none',
        ...(voted ? { boxShadow: '0 4px 0 #b1925e,0 6px 10px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.7),0 0 0 2px #b23a2a inset' } : null),
      }}
    >
      <span style={{ fontSize: dims.arrow, lineHeight: 1, color: voted ? '#b23a2a' : undefined }}>▲</span>
      <span style={{ font: `800 ${dims.num}px var(--font-mono)` }}>{display}</span>
      {variant === 'detail' ? (
        <span
          style={{
            font: '500 8px var(--font-mono)',
            color: 'rgba(40,30,10,.55)',
            marginTop: 1,
          }}
        >
          {voted ? 'votado' : 'votar'}
        </span>
      ) : null}
    </button>
  );
}
