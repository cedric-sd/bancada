'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ProjectFormValues } from '@/components/ProjectForm';
import type { GithubRepo } from '@/app/api/github/repos/route';

const formatStars = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

// Deriva os campos do formulário a partir de um repositório do GitHub.
function toFormValues(repo: GithubRepo): Partial<ProjectFormValues> {
  const topics = repo.topics.slice(0, 5).map((t) => `#${t}`);
  const tags = topics.length
    ? topics
    : repo.language
      ? [`#${repo.language.toLowerCase()}`]
      : [];
  return {
    name: repo.name,
    blurb: repo.description.slice(0, 120),
    description: repo.description,
    tags: tags.join(', '),
    url: repo.url,
  };
}

/**
 * Lista os repositórios públicos do usuário (via /api/github/repos) para
 * importar um deles no formulário de publicação.
 */
export default function GithubRepoPicker({
  onPick,
}: {
  onPick: (values: Partial<ProjectFormValues>, label: string) => void;
}) {
  const [repos, setRepos] = useState<GithubRepo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [pickedId, setPickedId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/github/repos');
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(data.error ?? 'Não foi possível carregar seus repositórios.');
        } else {
          setRepos(data.repos as GithubRepo[]);
        }
      } catch {
        if (active) setError('Falha de rede ao consultar o GitHub.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!repos) return [];
    const term = q.trim().toLowerCase();
    if (!term) return repos;
    return repos.filter(
      (r) => r.name.toLowerCase().includes(term) || r.description.toLowerCase().includes(term),
    );
  }, [repos, q]);

  return (
    <div
      style={{
        backgroundColor: '#f7efda',
        border: '1px solid #d8c79d',
        borderRadius: 10,
        boxShadow: '0 4px 0 rgba(0,0,0,.12),0 14px 30px rgba(0,0,0,.28)',
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="#221c12" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span style={{ font: '700 11px var(--font-mono)', letterSpacing: '.1em', color: 'rgba(40,30,10,.65)' }}>
          IMPORTAR DE UM REPOSITÓRIO PÚBLICO
        </span>
      </div>

      {loading ? (
        <div style={{ font: '400 14px var(--font-news)', color: '#5a4f3c' }}>Carregando seus repositórios…</div>
      ) : error ? (
        <div style={{ font: '600 12px var(--font-mono)', color: '#8a2318' }}>{error}</div>
      ) : repos && repos.length === 0 ? (
        <div style={{ font: '400 14px var(--font-news)', color: '#5a4f3c' }}>
          Nenhum repositório público encontrado na sua conta.
        </div>
      ) : (
        <>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrar repositórios…"
            style={{
              width: '100%',
              font: '500 12px var(--font-mono)',
              color: '#221c12',
              background: '#fbf6e6',
              border: '1px solid #cbb787',
              borderRadius: 8,
              padding: '8px 12px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,.12)',
              outline: 'none',
              margin: '4px 0 12px',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
            {filtered.map((repo) => {
              const on = pickedId === repo.id;
              return (
                <button
                  key={repo.id}
                  type="button"
                  onClick={() => {
                    setPickedId(repo.id);
                    onPick(toFormValues(repo), repo.name);
                  }}
                  style={{
                    appearance: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: on ? '#efe6cd' : '#fbf6e6',
                    border: on ? '1px solid #8f6e3e' : '1px solid #e0d2a8',
                    boxShadow: on ? 'inset 0 0 0 1px #cbb066' : 'none',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ font: '800 13px var(--font-archivo)', color: '#221c12' }}>{repo.name}</span>
                      {repo.language ? (
                        <span style={{ font: '500 9px var(--font-mono)', color: 'rgba(40,30,10,.55)' }}>
                          {repo.language}
                        </span>
                      ) : null}
                    </div>
                    {repo.description ? (
                      <div
                        style={{
                          font: '400 12px/1.35 var(--font-news)',
                          color: '#5a4f3c',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {repo.description}
                      </div>
                    ) : null}
                  </div>
                  <span style={{ font: '700 11px var(--font-mono)', color: '#221c12', flex: 'none' }}>
                    ★ {formatStars(repo.stars)}
                  </span>
                  <span style={{ font: '700 10px var(--font-mono)', color: on ? '#4f8a3a' : '#9a6a1f', flex: 'none' }}>
                    {on ? '✓ importado' : 'importar'}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <div style={{ font: '400 13px var(--font-news)', color: '#5a4f3c' }}>Nenhum repositório com esse filtro.</div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
