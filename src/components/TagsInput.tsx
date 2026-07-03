'use client';

import { useRef, useState } from 'react';

/**
 * Campo de tags: cada tag digitada vira uma badge. Confirma com vírgula ou Enter;
 * Backspace com o campo vazio remove a última. O valor é exposto como string
 * separada por vírgula, para casar com o restante do formulário.
 */
export default function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tags = value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const commit = (raw: string) => {
    const t = raw.trim().replace(/^,+|,+$/g, '').trim();
    if (!t) return;
    // Evita duplicatas (comparação sem diferenciar maiúsc./minúsc.).
    if (tags.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...tags, t].join(', '));
    setDraft('');
  };

  const removeAt = (i: number) => {
    onChange(tags.filter((_, idx) => idx !== i).join(', '));
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      e.preventDefault();
      removeAt(tags.length - 1);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 7,
        width: '100%',
        minHeight: 44,
        background: '#fbf6e6',
        border: `1px solid ${focused ? '#a98f5f' : '#cbb787'}`,
        borderRadius: 8,
        padding: '8px 10px',
        boxShadow: focused
          ? 'inset 0 1px 3px rgba(0,0,0,.12),0 0 0 3px rgba(169,143,95,.18)'
          : 'inset 0 1px 3px rgba(0,0,0,.12)',
        cursor: 'text',
        transition: 'box-shadow .12s,border-color .12s',
      }}
    >
      {tags.map((t, i) => (
        <span
          key={`${t}-${i}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            font: '700 11px var(--font-mono)',
            color: '#4a3a1c',
            background: 'linear-gradient(180deg,#efe6cd,#e3d5ad)',
            border: '1px solid #c6b17f',
            borderRadius: 20,
            padding: '4px 6px 4px 10px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6),0 1px 0 rgba(0,0,0,.08)',
          }}
        >
          {t}
          <button
            type="button"
            aria-label={`Remover ${t}`}
            onClick={(e) => {
              e.stopPropagation();
              removeAt(i);
            }}
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              font: '700 11px var(--font-mono)',
              lineHeight: 1,
              color: '#7a6a44',
              background: 'rgba(0,0,0,.08)',
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => {
          // Colar "a, b, c" confirma cada parte até a última vírgula.
          const v = e.target.value;
          if (v.includes(',')) {
            const parts = v.split(',');
            parts.slice(0, -1).forEach(commit);
            setDraft(parts[parts.length - 1]);
          } else {
            setDraft(v);
          }
        }}
        onKeyDown={onKeyDown}
        onBlur={() => {
          setFocused(false);
          commit(draft);
        }}
        onFocus={() => setFocused(true)}
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{
          flex: 1,
          minWidth: 120,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          font: '500 14px var(--font-archivo)',
          color: '#221c12',
          padding: '2px 0',
        }}
      />
    </div>
  );
}
