'use client';

import { useState } from 'react';

const parse = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0;
const format = (n: number) => n.toLocaleString('pt-BR');

const lightFace = {
  background: 'linear-gradient(#f7f0dd,#e6d5ad)',
  border: '1px solid #c2aa78',
  color: '#2a2419',
} as const;

/**
 * Botão de voto físico. Incrementa localmente ao clicar (toggle),
 * com o "afundar" característico da bancada via classe .press.
 */
export default function VoteButton({
  votes,
  variant = 'column',
}: {
  votes: string;
  variant?: 'column' | 'pill' | 'detail' | 'lg';
}) {
  const base = parse(votes);
  const [voted, setVoted] = useState(false);
  const display = format(voted ? base + 1 : base);

  const toggle = () => setVoted((v) => !v);

  if (variant === 'pill') {
    return (
      <button
        className="press"
        onClick={toggle}
        aria-pressed={voted}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '6px 11px',
          borderRadius: 8,
          ...lightFace,
          boxShadow: '0 2px 0 #b1925e,inset 0 1px 0 rgba(255,255,255,.7)',
          font: '800 11px var(--font-mono)',
        }}
      >
        ▲ {display}
      </button>
    );
  }

  const dims =
    variant === 'lg'
      ? { width: 66, padding: '11px 0', radius: 11, arrow: 16, num: 13 }
      : variant === 'detail'
        ? { width: 66, padding: '11px 0', radius: 11, arrow: 16, num: 13 }
        : { width: 54, padding: '8px 0', radius: 9, arrow: 14, num: 11 };

  return (
    <button
      className="press"
      onClick={toggle}
      aria-pressed={voted}
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
      }}
    >
      <span style={{ fontSize: dims.arrow, lineHeight: 1 }}>▲</span>
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
