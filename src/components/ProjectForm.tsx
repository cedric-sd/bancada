'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DarkButton from '@/components/DarkButton';
import TagsInput from '@/components/TagsInput';
import { categories } from '@/lib/data';

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

type Fields = Record<string, string>;

export type ProjectFormValues = {
  name: string;
  cat: string;
  blurb: string;
  description: string;
  tags: string;
  url: string;
};

const empty: ProjectFormValues = {
  name: '',
  cat: categories[0],
  blurb: '',
  description: '',
  tags: '',
  url: '',
};

/**
 * Formulário de projeto reaproveitado na publicação (POST) e na edição (PATCH).
 */
export default function ProjectForm({
  mode,
  slug,
  initial,
  hasImage = false,
}: {
  mode: 'create' | 'edit';
  slug?: string;
  initial?: Partial<ProjectFormValues>;
  hasImage?: boolean;
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const [form, setForm] = useState<ProjectFormValues>({ ...empty, ...initial });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Fields>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set =
    (key: keyof ProjectFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setErrors({});

    const payload = {
      name: form.name,
      cat: form.cat,
      blurb: form.blurb,
      description: form.description,
      url: form.url,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch(isEdit ? `/api/projects/${slug}` : '/api/projects', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setServerError(data.error ?? 'Não foi possível salvar.');
        setSubmitting(false);
        return;
      }

      // Envia o screenshot (se escolhido) depois de criar/atualizar o projeto.
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        const up = await fetch(`/api/projects/${data.project.slug}/image`, {
          method: 'POST',
          body: fd,
        });
        if (!up.ok) {
          const upErr = await up.json().catch(() => ({}));
          setServerError(
            `Projeto salvo, mas a imagem falhou: ${upErr.error ?? 'tente reenviar na edição.'}`,
          );
          setSubmitting(false);
          router.refresh();
          return;
        }
      }

      router.push(`/project/${data.project.slug}`);
      router.refresh();
    } catch {
      setServerError('Falha de rede. Tente novamente.');
      setSubmitting(false);
    }
  }

  const cancelHref = isEdit ? `/project/${slug}` : '/';

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
        {isEdit ? 'Editar projeto' : 'Publicar projeto'}
      </h1>
      <p style={{ font: '400 14px/1.5 var(--font-news)', color: '#5a4f3c', margin: '8px 0 20px' }}>
        {isEdit ? (
          'Atualize as informações do projeto. O endereço (slug) permanece o mesmo.'
        ) : (
          <>
            Coloque seu side project na bancada. Ele entra no placar com 0 votos e o
            carimbo <strong>NOVO</strong>.
          </>
        )}
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="NOME DO PROJETO *" error={errors.name}>
          <input style={fieldStyle} value={form.name} onChange={set('name')} placeholder="Ex.: Lumen" />
        </Field>

        <Field label="CATEGORIA">
          <select style={fieldStyle} value={form.cat} onChange={set('cat')}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="LINK DO REPOSITÓRIO (GITHUB)">
          <input
            style={fieldStyle}
            value={form.url}
            onChange={set('url')}
            placeholder="https://github.com/voce/projeto"
            inputMode="url"
          />
          <div style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.5)', marginTop: 6 }}>
            As <strong>estrelas</strong> são buscadas automaticamente do GitHub a partir do link.
          </div>
        </Field>

        <Field label="RESUMO (UMA LINHA)">
          <input style={fieldStyle} value={form.blurb} onChange={set('blurb')} placeholder="O que ele faz, em uma frase." />
        </Field>

        <Field label="DESCRIÇÃO">
          <textarea
            style={{ ...fieldStyle, resize: 'vertical', minHeight: 96, font: '400 15px/1.5 var(--font-news)' }}
            value={form.description}
            onChange={set('description')}
            placeholder="Conte com mais detalhes o que o projeto resolve."
          />
        </Field>

        <Field label="TAGS (VÍRGULA OU ENTER CRIA UMA BADGE)">
          <TagsInput
            value={form.tags}
            onChange={(tags) => setForm((f) => ({ ...f, tags }))}
            placeholder="#cli, #terminal, #rust"
          />
        </Field>

        <Field label="SCREENSHOT (PNG, JPG, WEBP OU GIF · ATÉ 3 MB)">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ ...fieldStyle, padding: '8px 12px', font: '500 12px var(--font-mono)' }}
          />
          <div style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.5)', marginTop: 6 }}>
            {file
              ? `selecionado: ${file.name}`
              : isEdit && hasImage
                ? 'já tem uma imagem — escolha outra para substituir.'
                : 'opcional: uma imagem de preview do projeto.'}
          </div>
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
            {submitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Publicar na bancada'}
          </DarkButton>
          <Link href={cancelHref} style={{ font: '600 12px var(--font-mono)', color: 'rgba(40,30,10,.6)' }}>
            cancelar
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
