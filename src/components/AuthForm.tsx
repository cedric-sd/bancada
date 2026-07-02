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

/**
 * Formulário de entrar/cadastrar. Envia para /api/auth e redireciona para o
 * destino (?next=...) ou para a home.
 */
export default function AuthForm({
  mode,
  next,
  githubEnabled = false,
  initialError,
}: {
  mode: 'login' | 'register';
  next?: string;
  githubEnabled?: boolean;
  initialError?: string;
}) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', handle: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(initialError ?? null);
  const [submitting, setSubmitting] = useState(false);

  const githubHref = `/api/auth/github${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setErrors({});

    try {
      const res = await fetch(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isRegister
            ? { name: form.name, handle: form.handle, password: form.password }
            : { handle: form.handle, password: form.password },
        ),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setServerError(data.error ?? 'Não foi possível continuar.');
        setSubmitting(false);
        return;
      }

      router.push(next && next.startsWith('/') ? next : '/');
      router.refresh();
    } catch {
      setServerError('Falha de rede. Tente novamente.');
      setSubmitting(false);
    }
  }

  const otherHref = isRegister ? '/entrar' : '/cadastrar';
  const otherLabel = isRegister ? 'Já tem conta? Entrar' : 'Criar uma conta';

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
        {isRegister ? 'Criar conta' : 'Entrar'}
      </h1>
      <p style={{ font: '400 14px/1.5 var(--font-news)', color: '#5a4f3c', margin: '8px 0 20px' }}>
        {isRegister
          ? 'Crie sua conta para publicar projetos e votar na bancada.'
          : 'Acesse sua conta para publicar e votar.'}
      </p>

      {githubEnabled ? (
        <>
          <a
            href={githubHref}
            className="press"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              width: '100%',
              font: '800 13px var(--font-archivo)',
              color: '#f1e7cd',
              padding: '12px 16px',
              borderRadius: 10,
              background: 'linear-gradient(#3a3022,#211a10)',
              border: '1px solid #120d07',
              boxShadow: '0 3px 0 #15100a,inset 0 1px 0 rgba(255,255,255,.12)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="#f1e7cd" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            {isRegister ? 'Cadastrar com GitHub' : 'Entrar com GitHub'}
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(60,45,20,.18)' }} />
            <span style={{ font: '600 9px var(--font-mono)', letterSpacing: '.1em', color: 'rgba(40,30,10,.45)' }}>
              OU COM HANDLE
            </span>
            <span style={{ flex: 1, height: 1, background: 'rgba(60,45,20,.18)' }} />
          </div>
        </>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isRegister ? (
          <Field label="NOME" error={errors.name}>
            <input style={fieldStyle} value={form.name} onChange={set('name')} placeholder="Ex.: Mara Klein" />
          </Field>
        ) : null}

        <Field label="HANDLE" error={errors.handle}>
          <input
            style={fieldStyle}
            value={form.handle}
            onChange={set('handle')}
            placeholder="marakt"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </Field>

        <Field label="SENHA" error={errors.password}>
          <input
            type="password"
            style={fieldStyle}
            value={form.password}
            onChange={set('password')}
            placeholder={isRegister ? 'ao menos 6 caracteres' : '••••••'}
          />
        </Field>

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
            {submitting ? 'Enviando…' : isRegister ? 'Criar conta' : 'Entrar'}
          </DarkButton>
          <Link href={otherHref} style={{ font: '600 12px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
            {otherLabel}
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error ? <div style={{ font: '600 10px var(--font-mono)', color: '#b23a2a', marginTop: 5 }}>{error}</div> : null}
    </div>
  );
}
