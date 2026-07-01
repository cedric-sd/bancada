'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DarkButton from '@/components/DarkButton';

const labelStyle = {
  font: '700 10px var(--font-mono)',
  letterSpacing: '.1em',
  color: 'rgba(40,30,10,.6)',
  marginBottom: 6,
  display: 'block',
} as const;

const fieldStyle = {
  width: '100%',
  font: '500 14px var(--font-archivo)',
  color: '#221c12',
  background: '#fbf6e6',
  border: '1px solid #cbb787',
  borderRadius: 8,
  padding: '10px 12px',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,.12)',
  outline: 'none',
} as const;

const MAX_BIO = 280;

/** Edição do próprio perfil (nome e bio). */
export default function ProfileForm({
  handle,
  initialName,
  initialBio,
}: {
  handle: string; // sem @
  initialName: string;
  initialBio: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setErrors({});

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setServerError(data.error ?? 'Não foi possível salvar.');
        setSubmitting(false);
        return;
      }
      router.push(`/dev/${handle}`);
      router.refresh();
    } catch {
      setServerError('Falha de rede. Tente novamente.');
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#f7efda',
        border: '1px solid #d8c79d',
        borderRadius: 10,
        boxShadow: '0 4px 0 rgba(0,0,0,.12),0 14px 30px rgba(0,0,0,.28)',
        padding: 24,
      }}
    >
      <h1
        style={{
          margin: 0,
          font: '900 26px/1 var(--font-archivo)',
          color: '#221c12',
          textShadow: '0 1px 0 rgba(255,255,255,.5)',
        }}
      >
        Editar perfil
      </h1>
      <p style={{ font: '400 14px/1.5 var(--font-news)', color: '#5a4f3c', margin: '8px 0 20px' }}>
        Atualize seu nome e uma bio curta. O handle <strong>@{handle}</strong> não muda.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>NOME</label>
          <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          {errors.name ? (
            <div style={{ font: '600 10px var(--font-mono)', color: '#b23a2a', marginTop: 5 }}>{errors.name}</div>
          ) : null}
        </div>

        <div>
          <label style={labelStyle}>BIO</label>
          <textarea
            style={{ ...fieldStyle, resize: 'vertical', minHeight: 84, font: '400 15px/1.5 var(--font-news)' }}
            value={bio}
            maxLength={MAX_BIO}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Uma linha sobre você e o que você constrói."
          />
          <div style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.5)', marginTop: 5 }}>
            {bio.length}/{MAX_BIO}
          </div>
          {errors.bio ? (
            <div style={{ font: '600 10px var(--font-mono)', color: '#b23a2a', marginTop: 3 }}>{errors.bio}</div>
          ) : null}
        </div>

        {serverError ? (
          <div
            style={{
              font: '600 12px var(--font-mono)',
              color: '#8a2318',
              background: '#f6dcd6',
              border: '1px solid #d99a8e',
              borderRadius: 8,
              padding: '10px 12px',
            }}
          >
            {serverError}
          </div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <DarkButton size="lg" type="submit" style={{ opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Salvando…' : 'Salvar perfil'}
          </DarkButton>
          <Link href={`/dev/${handle}`} style={{ font: '600 12px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
            cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
