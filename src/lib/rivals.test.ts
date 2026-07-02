/**
 * @jest-environment node
 */
import { rankRivals, type RivalRow } from './rivals';

function row(userId: number, votes: number): RivalRow {
  return { userId, name: `Dev ${userId}`, handle: `dev${userId}`, hasAvatar: false, votes, projects: 1 };
}

describe('rankRivals', () => {
  it('atribui posição na ordem recebida e marca o próprio usuário', () => {
    const out = rankRivals([row(10, 500), row(7, 300), row(3, 100)], 7);
    expect(out.map((r) => r.rank)).toEqual([1, 2, 3]);
    expect(out.find((r) => r.userId === 7)?.isSelf).toBe(true);
    expect(out.filter((r) => r.isSelf)).toHaveLength(1);
  });

  it('ninguém é "self" quando o id não está na lista', () => {
    const out = rankRivals([row(1, 10), row(2, 5)], 99);
    expect(out.every((r) => !r.isSelf)).toBe(true);
  });

  it('lista vazia → vazio', () => {
    expect(rankRivals([], 1)).toEqual([]);
  });
});
