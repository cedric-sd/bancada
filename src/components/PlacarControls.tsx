'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const SORTS = [
  { key: 'top', label: 'Top' },
  { key: 'novos', label: 'Novos' },
  { key: 'alta', label: 'Em alta' },
];

/**
 * Controles do placar: abas de ordenação, filtro por categoria e busca.
 * Cada controle preserva os parâmetros dos outros na URL.
 */
export default function PlacarControls({ categories }: { categories: string[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const ordem = sp.get('ordem') ?? 'top';
  const cat = sp.get('cat') ?? 'Todos';
  const q = sp.get('q') ?? '';
  const [term, setTerm] = useState(q);

  function go(next: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      const isDefault = (k === 'ordem' && v === 'top') || (k === 'cat' && v === 'Todos') || v === '';
      if (isDefault) params.delete(k);
      else params.set(k, v);
    }
    const s = params.toString();
    router.push(s ? `/?${s}` : '/');
  }

  const cats = ['Todos', ...categories];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
      {/* ordenação */}
      <div
        style={{
          display: 'inline-flex',
          background: '#cdb486',
          border: '1px solid #a98f5f',
          borderRadius: 9,
          padding: 3,
          gap: 2,
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,.3),0 1px 0 rgba(255,255,255,.25)',
        }}
      >
        {SORTS.map((t) => {
          const on = t.key === ordem;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => go({ ordem: t.key })}
              style={{
                appearance: 'none',
                cursor: 'pointer',
                font: '700 11px/1 var(--font-mono)',
                padding: '7px 13px',
                borderRadius: 6,
                border: 'none',
                color: on ? '#2a2419' : 'rgba(40,30,10,.55)',
                background: on ? 'linear-gradient(#f6efdc,#e6d6b0)' : 'transparent',
                boxShadow: on ? '0 1px 0 rgba(0,0,0,.18)' : 'none',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* busca */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go({ q: term.trim() });
        }}
        style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 420 }}
      >
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar por nome, resumo ou autor…"
          style={{
            flex: 1,
            font: '500 12px var(--font-mono)',
            color: '#221c12',
            background: '#f6eed8',
            border: '1px solid #bfa873',
            borderRadius: 8,
            padding: '9px 12px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,.14)',
            outline: 'none',
          }}
        />
        {q ? (
          <button
            type="button"
            onClick={() => {
              setTerm('');
              go({ q: '' });
            }}
            className="press"
            style={{
              font: '700 11px var(--font-mono)',
              color: 'rgba(40,30,10,.6)',
              background: '#efe6cd',
              border: '1px solid #bfa873',
              borderRadius: 8,
              padding: '0 12px',
            }}
          >
            limpar
          </button>
        ) : (
          <button
            type="submit"
            className="press"
            style={{
              font: '800 11px var(--font-mono)',
              color: '#f1e7cd',
              background: 'linear-gradient(#3a3022,#211a10)',
              border: '1px solid #120d07',
              borderRadius: 8,
              padding: '0 14px',
              boxShadow: '0 2px 0 #15100a,inset 0 1px 0 rgba(255,255,255,.12)',
            }}
          >
            buscar
          </button>
        )}
      </form>

      {/* categorias */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
        {cats.map((c) => {
          const on = c === cat;
          return (
            <button
              key={c}
              type="button"
              onClick={() => go({ cat: c })}
              style={{
                appearance: 'none',
                cursor: 'pointer',
                font: '600 10px var(--font-mono)',
                letterSpacing: '.04em',
                padding: '5px 10px',
                borderRadius: 20,
                border: on ? '1px solid #8f6e3e' : '1px solid #bfa873',
                color: on ? '#f3ead3' : 'rgba(40,30,10,.65)',
                background: on ? 'linear-gradient(#6f5326,#54401d)' : '#efe6cd',
                boxShadow: on ? 'inset 0 1px 0 rgba(255,255,255,.15)' : 'inset 0 1px 0 rgba(255,255,255,.5)',
              }}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
