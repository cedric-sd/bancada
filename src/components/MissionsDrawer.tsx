'use client';

import { useEffect, useRef, useState } from 'react';
import WeeklyMissions from './WeeklyMissions';
import type { Mission } from '@/lib/missions';

/**
 * Botão flutuante (ícone animado) que abre um drawer de baixo para cima com as
 * missões da semana. Arrastar a alça para baixo, tocar fora ou Esc fecham.
 */
export default function MissionsDrawer({ missions }: { missions: Mission[] }) {
  const [open, setOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  const remaining = missions.filter((m) => !m.done).length;
  const allDone = missions.length > 0 && remaining === 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDragY(Math.max(0, e.clientY - startY.current));
  }
  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragY > 90) setOpen(false);
    setDragY(0);
  }

  if (missions.length === 0) return null;

  return (
    <>
      {/* botão flutuante */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Missões da semana${allDone ? ' (todas concluídas)' : ` (${remaining} a fazer)`}`}
        className="press"
        style={{
          position: 'fixed',
          right: 22,
          bottom: 22,
          zIndex: 998,
          width: 58,
          height: 58,
          borderRadius: '50%',
          border: '1px solid #120d07',
          background: 'linear-gradient(#3a3022,#211a10)',
          boxShadow: '0 5px 0 #15100a,0 10px 22px rgba(0,0,0,.4)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {!allDone ? (
          <span
            aria-hidden
            className="mission-ring"
            style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #e8c869' }}
          />
        ) : null}
        <svg width="26" height="26" viewBox="0 0 24 24" className="mission-bob" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="none" stroke="#e8c869" strokeWidth="2" />
          <circle cx="12" cy="12" r="5" fill="none" stroke="#e8c869" strokeWidth="2" />
          <circle cx="12" cy="12" r="1.7" fill="#e8c869" />
        </svg>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 20,
            height: 20,
            padding: '0 5px',
            borderRadius: 10,
            background: allDone ? '#4f8a3a' : '#b23a2a',
            border: '2px solid #f3ead2',
            color: '#fff',
            font: '800 11px/16px var(--font-mono)',
            textAlign: 'center',
          }}
        >
          {allDone ? '✓' : remaining}
        </span>
      </button>

      {/* overlay */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          background: 'rgba(20,14,6,.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .3s ease',
        }}
      />

      {/* drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Missões da semana"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          maxHeight: '82vh',
          overflowY: 'auto',
          background: '#f3e8cd',
          borderTop: '1px solid #d8c79d',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -8px 30px rgba(0,0,0,.35)',
          padding: '8px 18px 28px',
          transform: open ? `translateY(${dragY}px)` : 'translateY(100%)',
          transition: dragging ? 'none' : 'transform .34s cubic-bezier(.32,.72,0,1)',
        }}
      >
        {/* alça (arrastar para baixo fecha) */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ padding: '6px 0 12px', cursor: 'grab', touchAction: 'none' }}
        >
          <div style={{ width: 44, height: 5, borderRadius: 3, background: '#cbb787', margin: '0 auto' }} />
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
            <span style={{ font: '700 12px var(--font-mono)', letterSpacing: '.14em', color: 'rgba(40,30,10,.65)' }}>
              MISSÕES DA SEMANA
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="press"
              style={{
                font: '700 12px var(--font-mono)',
                color: 'rgba(40,30,10,.6)',
                background: '#efe6cd',
                border: '1px solid #cbb787',
                borderRadius: 7,
                padding: '5px 9px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
          <WeeklyMissions missions={missions} />
        </div>
      </div>
    </>
  );
}
