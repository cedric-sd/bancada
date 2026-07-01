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
export default function AuthForm({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', handle: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
