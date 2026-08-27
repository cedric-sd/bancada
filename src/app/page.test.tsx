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
jest.mock('@/lib/monthly', () => ({ currentRace: jest.fn(), monthlyMovementMap: jest.fn(() => ({})) }));
// NotificationsBell (no header do usuário logado) lê a contagem de não-lidas.
jest.mock('@/lib/notifications', () => ({ unreadCount: jest.fn(() => 3) }));
// Missões da semana (só logado).
jest.mock('@/lib/missions', () => ({ getWeeklyMissions: jest.fn(() => []) }));

import { getCurrentUser } from '@/lib/auth';
import { listProjects } from '@/lib/projects';
import { currentRace, type MonthlyRace } from '@/lib/monthly';
import { getWeeklyMissions } from '@/lib/missions';

const mockedGetUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockedList = listProjects as jest.MockedFunction<typeof listProjects>;
const mockedRace = currentRace as jest.MockedFunction<typeof currentRace>;
const mockedMissions = getWeeklyMissions as jest.MockedFunction<typeof getWeeklyMissions>;

const leaderEntry = {
  rank: 1,
  slug: 'aurora',
  name: 'Aurora',
  blurb: '',
  author: 'Mara Klein',
  handle: '@marakt',
  hasImage: false,
  monthlyVotes: 12,
};
const race: MonthlyRace = {
  key: '2026-07',
  range: 'julho 2026',
  endsIn: '12d',
  top: [leaderEntry],
  leader: leaderEntry,
};

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
    url: null,
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
  mockedRace.mockReturnValue(race);
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
    // botão do GitHub no header
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/cedric-sd');
  });

  it('mostra a faixa do ciclo mensal com o líder e atalho para o Hall da Fama', async () => {
    mockedGetUser.mockResolvedValue(null);
    mockedList.mockReturnValue(sample);

    await renderHome();

    expect(screen.getByText('EM DISPUTA')).toBeInTheDocument();
    expect(screen.getByText('LÍDER DO MÊS')).toBeInTheDocument();
    expect(screen.getByText('▲ 12')).toBeInTheDocument();
    const hall = screen.getByRole('link', { name: /HALL DA FAMA/ });
    expect(hall).toHaveAttribute('href', '/hall-da-fama');
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
    expect(screen.getByText('TOP DO MÊS')).toBeInTheDocument();
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
    expect(screen.queryByText('TOP DO MÊS')).not.toBeInTheDocument();
    expect(screen.getByText('Stipple')).toBeInTheDocument();
  });

  it('passa o userId do usuário logado para listProjects e mostra a conta', async () => {
    mockedGetUser.mockResolvedValue(me);
    mockedList.mockReturnValue(sample);
    mockedMissions.mockReturnValue([
      { id: 'vote3', label: 'Vote em 3 projetos', kind: 'vote', progress: 1, target: 3, reward: 15, done: false },
    ]);

    await renderHome();

    expect(mockedList).toHaveBeenCalledWith(7, expect.objectContaining({ sort: 'top' }));
    expect(screen.getByText('Zoe Dev')).toBeInTheDocument();
    expect(screen.getByText('sair')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument();
    // sino de notificações com selo de não-lidas
    expect(screen.getByRole('link', { name: /Notificações \(3 não lidas\)/ })).toBeInTheDocument();
    // missões da semana aparecem para quem está logado
    expect(screen.getByText('MISSÕES DA SEMANA')).toBeInTheDocument();
    expect(screen.getByText('Vote em 3 projetos')).toBeInTheDocument();
  });

  it('resolve a ordenação a partir de ?ordem=', async () => {
    mockedGetUser.mockResolvedValue(null);
    mockedList.mockReturnValue(sample);

    await renderHome({ ordem: 'novos' });

    expect(mockedList).toHaveBeenCalledWith(undefined, expect.objectContaining({ sort: 'novos' }));
  });

  it('mostra a versão do app no rodapé quando APP_VERSION está definida', async () => {
    const prev = process.env.APP_VERSION;
    process.env.APP_VERSION = '9.9.9';
    mockedGetUser.mockResolvedValue(null);
    mockedList.mockReturnValue(sample);

    await renderHome();

    expect(screen.getByText('v9.9.9')).toBeInTheDocument();
    process.env.APP_VERSION = prev;
  });
});
