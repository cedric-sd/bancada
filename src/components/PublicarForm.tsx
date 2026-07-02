'use client';

import { useState } from 'react';
import ProjectForm, { type ProjectFormValues } from '@/components/ProjectForm';
import GithubRepoPicker from '@/components/GithubRepoPicker';

/**
 * Fluxo de publicação: opcionalmente importa um repositório público do GitHub
 * (pré-preenchendo o formulário) e publica o projeto.
 */
export default function PublicarForm({ hasGithub }: { hasGithub: boolean }) {
  const [initial, setInitial] = useState<Partial<ProjectFormValues> | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <>
      {hasGithub ? (
        <GithubRepoPicker
          onPick={(values, label) => {
            setInitial(values);
            setPicked(label);
            // Remonta o formulário para aplicar os valores importados.
            setFormKey((k) => k + 1);
          }}
        />
      ) : null}

      {picked ? (
        <div
          style={{
            font: '600 11px var(--font-mono)',
            color: '#557a38',
            background: '#e4ecca',
            border: '1px solid #b8cf8f',
            borderRadius: 8,
            padding: '9px 12px',
            marginBottom: 14,
          }}
        >
          Importado de <strong>{picked}</strong> — revise e publique.
        </div>
      ) : null}

      <ProjectForm key={formKey} mode="create" initial={initial} />
    </>
  );
}
