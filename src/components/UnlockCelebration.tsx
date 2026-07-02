'use client';

import { useEffect, useState } from 'react';
import { confettiBurst } from '@/lib/juice';

export type UnlockedItem = { label: string; color: string };

/**
 * Celebração ao abrir o perfil com conquistas recém-desbloqueadas: confete +
 * um toast que se dissolve sozinho. Dispara uma vez (o servidor já marcou as
 * conquistas como vistas).
 */
export default function UnlockCelebration({ items }: { items: UnlockedItem[] }) {
  const [open, setOpen] = useState(items.length > 0);

  useEffect(() => {
    if (items.length === 0) return;
    confettiBurst();
    const t = setTimeout(() => setOpen(false), 6000);
    return () => clearTimeout(t);
  }, [items.length]);

  if (!open || items.length === 0) return null;

  return (
    <div
      role="status"
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        cursor: 'pointer',
        maxWidth: 'calc(100vw - 32px)',
        background: '#2b2318',
        backgroundImage: 'repeating-linear-gradient(120deg,rgba(255,255,255,.03) 0 2px,transparent 2px 6px)',
        border: '1px solid #4a3c24',
        borderRadius: 12,
        boxShadow: '0 6px 0 rgba(0,0,0,.28),0 16px 34px rgba(0,0,0,.4)',
        padding: '13px 16px',
        animation: 'unlock-in .35s cubic-bezier(.2,.8,.3,1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: items.length ? 9 : 0 }}>
        <span style={{ fontSize: 15 }}>🎉</span>
        <span style={{ font: '800 10px var(--font-mono)', letterSpacing: '.16em', color: '#e8c869' }}>
          {items.length === 1 ? 'CONQUISTA DESBLOQUEADA' : `${items.length} CONQUISTAS DESBLOQUEADAS`}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((a) => (
          <span
            key={a.label}
            style={{
              font: '800 10px var(--font-archivo)',
              letterSpacing: '.06em',
              color: a.color,
              border: `2px solid ${a.color}`,
              borderRadius: 4,
              padding: '3px 7px',
              background: 'rgba(255,255,255,.06)',
              whiteSpace: 'nowrap',
            }}
          >
            {a.label}
          </span>
        ))}
      </div>
    </div>
  );
}
