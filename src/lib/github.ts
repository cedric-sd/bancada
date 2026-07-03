// Utilitários do GitHub para publicação: em vez de digitar as estrelas, o
// usuário informa o link do repositório e o sistema busca a contagem.

export function formatStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/** Extrai owner/repo de uma URL do GitHub (ou null se não for um repo). Puro. */
export function parseRepo(url: string): { owner: string; repo: string } | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  if (u.hostname !== 'github.com' && u.hostname !== 'www.github.com') return null;
  const parts = u.pathname.replace(/^\/+/, '').split('/');
  const [owner, repo] = parts;
  if (!owner || !repo) return null;
  return { owner, repo: repo.replace(/\.git$/, '') };
}

/**
 * Busca as estrelas de um repositório público a partir da URL. Devolve a
 * contagem já formatada (ex.: "1.2k") ou null se a URL não for um repo válido
 * ou a consulta falhar. Usa GITHUB_TOKEN quando disponível (limite de taxa).
 */
export async function fetchRepoStars(url: string): Promise<string | null> {
  const repo = parseRepo(url);
  if (!repo) return null;
  try {
    const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'bancada-app',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return formatStars(Number(data.stargazers_count) || 0);
  } catch {
    return null;
  }
}
