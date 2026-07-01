'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const parse = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0;
const format = (n: number) => n.toLocaleString('pt-BR');

const lightFace = {
  background: 'linear-gradient(#f7f0dd,#e6d5ad)',
  border: '1px solid #c2aa78',
  color: '#2a2419',
} as const;

/**
 * Botão de voto físico e persistente. O voto é gravado no banco por usuário
 * (um por projeto). Sem login, leva à tela de entrar. Após votar, atualiza a
 * rota para reordenar o placar.
 */
export default function VoteButton({
  votes,
  slug,
  voted,
  authed,
  variant = 'column',
}: {
  votes: string;
  slug: string;
  voted: boolean;
  authed: boolean;
  variant?: 'column' | 'pill' | 'detail' | 'lg';
}) {
  const router = useRouter();
  // Estado local sincronizado com o servidor via padrão de reset por prop.
  const [count, setCount] = useState(parse(votes));
  const [isVoted, setIsVoted] = useState(voted);
  const [prev, setPrev] = useState({ votes, voted });
  const [pending, setPending] = useState(false);

  if (prev.votes !== votes || prev.voted !== voted) {
    setPrev({ votes, voted });
    setCount(parse(votes));
    setIsVoted(voted);
  }

  async function toggle(e: React.MouseEvent) {
    // Não navega quando o botão está dentro de um link (card do pódio).
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    if (!authed) {
      router.push(`/entrar?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const next = !isVoted;
    setPending(true);
    setIsVoted(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));

    try {
      const res = await fetch(`/api/projects/${slug}/vote`, { method: next ? 'POST' : 'DELETE' });
      if (!res.ok) throw new Error('falha ao votar');
      const data = await res.json();
      setCount(parse(data.project.votes));
      setIsVoted(data.project.voted);
      router.refresh();
    } catch {
      // Reverte a atualização otimista em caso de erro.
      setIsVoted(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
    } finally {
      setPending(false);
    }
  }

  const display = format(count);

  if (variant === 'pill') {
    return (
      <button
        className="press"
        onClick={toggle}
        aria-pressed={isVoted}
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
          ...(isVoted ? { boxShadow: '0 2px 0 #b1925e,inset 0 1px 0 rgba(255,255,255,.7),0 0 0 2px #b23a2a inset' } : null),
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
      aria-pressed={isVoted}
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
        boxShadow: isVoted
          ? '0 4px 0 #b1925e,0 6px 10px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.7),0 0 0 2px #b23a2a inset'
          : '0 4px 0 #b1925e,0 6px 10px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.7)',
        flex: 'none',
      }}
    >
      <span style={{ fontSize: dims.arrow, lineHeight: 1, color: isVoted ? '#b23a2a' : undefined }}>▲</span>
      <span style={{ font: `800 ${dims.num}px var(--font-mono)` }}>{display}</span>
      {variant === 'detail' ? (
        <span style={{ font: '500 8px var(--font-mono)', color: 'rgba(40,30,10,.55)', marginTop: 1 }}>
          {isVoted ? 'votado' : 'votar'}
        </span>
      ) : null}
    </button>
  );
}
