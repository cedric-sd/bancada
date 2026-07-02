import { render, screen } from '@testing-library/react';
import type { Project } from '@/lib/data';
import type { User } from '@/lib/auth';
import Home from './page';

// next/navigation — usado pelos componentes client (controles, menu, voto).
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/',
}));

// Camada de dados e sessão — mockadas para não tocar SQLite nem cookies.
jest.mock('@/lib/auth', () => ({ getCurrentUser: jest.fn() }));
jest.mock('@/lib/projects', () => ({ listProjects: jest.fn() }));

import { getCurrentUser } from '@/lib/auth';
import { listProjects } from '@/lib/projects';

const mockedGetUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockedList = listProjects as jest.MockedFunction<typeof listProjects>;

function makeProject(over: Partial<Project> = {}): Project {
  return {
    rank: 1,
    slug: 'lumen',
    name: 'Lumen',
    blurb: 'Estúdio de temas para o terminal.',
    author: 'Mara Klein',
    handle: '@marakt',
    stars: '3.2k',
    votes: '1.428',
    cat: 'Terminal',
    badge: '',
    lvl: 14,
    description: '',
    tags: [],
    forks: '0',
    xpForAuthor: '+0',
    ownerId: null,
    voted: false,
    hasImage: false,
    rating: 0,
    reviewCount: 0,
    ...over,
  };
}

const sample = [
  makeProject({ slug: 'lumen', name: 'Lumen', rating: 4.5, reviewCount: 2 }),
  makeProject({ slug: 'quokka', name: 'Quokka', cat: 'Database' }),
  makeProject({ slug: 'refactr', name: 'Refactr', cat: 'IA' }),
  makeProject({ slug: 'markdownr', name: 'Markdownr', cat: 'Docs' }),
  makeProject({ slug: 'stipple', name: 'Stipple', cat: 'Design' }),
];

const me: User = { id: 7, handle: '@zoedev', name: 'Zoe Dev', initials: 'ZD', hasAvatar: false };

async function renderHome(params: Record<string, string> = {}) {
  const ui = await Home({ searchParams: Promise.resolve(params) });
  return render(ui);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Home (placar)', () => {
  it('mostra marca, controles e ações quando deslogado', async () => {
    mockedGetUser.mockResolvedValue(null);
    mockedList.mockReturnValue(sample);

    await renderHome();

    expect(screen.getByText('BANCADA')).toBeInTheDocument();
    // abas de ordenação
    expect(screen.getByRole('button', { name: 'Top' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Novos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Em alta' })).toBeInTheDocument();
    // busca
    expect(screen.getByPlaceholderText(/Buscar por nome/i)).toBeInTheDocument();
    // filtro por categoria
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Design' })).toBeInTheDocument();
    // ações de conta (deslogado)
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByText('+ Publicar')).toBeInTheDocument();
  });

  it('renderiza pódio (top 3) e o restante da lista na visão padrão', async () => {
    mockedGetUser.mockResolvedValue(null);
    mockedList.mockReturnValue(sample);

    await renderHome();

    // pódio + lista mostram todos os projetos
    for (const name of ['Lumen', 'Quokka', 'Refactr', 'Markdownr', 'Stipple']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    // carimbo do líder aparece no pódio
    expect(screen.getByText('TOP DA SEMANA')).toBeInTheDocument();
  });

  it('exibe a média de estrelas no card quando há avaliações', async () => {
    mockedGetUser.mockResolvedValue(null);
    mockedList.mockReturnValue(sample);

    await renderHome();

    // Lumen tem rating 4.5 com 2 avaliações
    expect(screen.getByTitle(/4\.5 de 5/)).toBeInTheDocument();
  });

  it('ao filtrar por categoria, mostra lista de resultados sem pódio', async () => {
    mockedGetUser.mockResolvedValue(null);
    mockedList.mockReturnValue([sample[4]]); // só Design

    await renderHome({ cat: 'Design' });

    // cabeçalho de resultados inclui a categoria filtrada
    expect(screen.getByText(/1 resultado.*Design/)).toBeInTheDocument();
    // sem pódio → sem carimbo do líder
    expect(screen.queryByText('TOP DA SEMANA')).not.toBeInTheDocument();
    expect(screen.getByText('Stipple')).toBeInTheDocument();
  });

  it('passa o userId do usuário logado para listProjects e mostra a conta', async () => {
    mockedGetUser.mockResolvedValue(me);
    mockedList.mockReturnValue(sample);

    await renderHome();

    expect(mockedList).toHaveBeenCalledWith(7, expect.objectContaining({ sort: 'top' }));
    expect(screen.getByText('Zoe Dev')).toBeInTheDocument();
    expect(screen.getByText('sair')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument();
  });

  it('resolve a ordenação a partir de ?ordem=', async () => {
    mockedGetUser.mockResolvedValue(null);
    mockedList.mockReturnValue(sample);

    await renderHome({ ordem: 'novos' });

    expect(mockedList).toHaveBeenCalledWith(undefined, expect.objectContaining({ sort: 'novos' }));
  });
});
