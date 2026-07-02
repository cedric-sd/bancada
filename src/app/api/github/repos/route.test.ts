/**
 * @jest-environment node
 */
import { GET } from './route';

jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
  getGithubLogin: jest.fn(),
}));

import { getCurrentUser, getGithubLogin } from '@/lib/auth';

const mockedUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockedLogin = getGithubLogin as jest.MockedFunction<typeof getGithubLogin>;

const user = { id: 1, handle: '@dev', name: 'Dev', initials: 'DV', hasAvatar: false };

afterEach(() => {
  jest.clearAllMocks();
  (global.fetch as unknown as jest.Mock)?.mockReset?.();
});

describe('GET /api/github/repos', () => {
  it('401 quando não autenticado', async () => {
    mockedUser.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('400 quando a conta não tem GitHub vinculado', async () => {
    mockedUser.mockResolvedValue(user);
    mockedLogin.mockReturnValue(null);
    const res = await GET();
    expect(res.status).toBe(400);
  });

  it('lista os repositórios públicos, ignorando forks e arquivados', async () => {
    mockedUser.mockResolvedValue(user);
    mockedLogin.mockReturnValue('devgh');

    const apiRepos = [
      {
        id: 1,
        name: 'lumen',
        full_name: 'devgh/lumen',
        description: 'temas de terminal',
        html_url: 'https://github.com/devgh/lumen',
        stargazers_count: 1200,
        language: 'Rust',
        topics: ['cli', 'terminal'],
        fork: false,
        archived: false,
        updated_at: '2026-01-01T00:00:00Z',
      },
      { id: 2, name: 'forkado', full_name: 'devgh/forkado', description: '', html_url: 'x', stargazers_count: 0, language: null, topics: [], fork: true, archived: false, updated_at: '2026-01-01T00:00:00Z' },
      { id: 3, name: 'velho', full_name: 'devgh/velho', description: '', html_url: 'y', stargazers_count: 0, language: null, topics: [], fork: false, archived: true, updated_at: '2026-01-01T00:00:00Z' },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => apiRepos,
    }) as unknown as typeof fetch;

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.repos).toHaveLength(1);
    expect(data.repos[0]).toMatchObject({
      name: 'lumen',
      url: 'https://github.com/devgh/lumen',
      stars: 1200,
      language: 'Rust',
      topics: ['cli', 'terminal'],
    });
    // chamou a API pública do usuário
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.github.com/users/devgh/repos'),
      expect.any(Object),
    );
  });

  it('502 quando o GitHub responde erro', async () => {
    mockedUser.mockResolvedValue(user);
    mockedLogin.mockReturnValue('devgh');
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) }) as unknown as typeof fetch;
    const res = await GET();
    expect(res.status).toBe(502);
  });
});
