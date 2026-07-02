/**
 * @jest-environment node
 */
import {
  buildAchievements,
  earnedAchievements,
  upcomingAchievements,
  type Metrics,
} from './achievements';

function metrics(over: Partial<Metrics> = {}): Metrics {
  return {
    votesReceived: 0,
    projects: 0,
    bestRank: 0,
    votesCast: 0,
    reviewsGiven: 0,
    reviewsReceived: 0,
    ...over,
  };
}

const byId = (all: ReturnType<typeof buildAchievements>) =>
  Object.fromEntries(all.map((a) => [a.id, a]));

describe('buildAchievements', () => {
  it('perfil vazio não conquista nada (corrige o TOP 3 indevido)', () => {
    const a = byId(buildAchievements(metrics()));
    // bestRank 0 (sem projetos) NÃO pode dar TOP 3 nem TOP DA SEMANA.
    expect(a.top3.earned).toBe(false);
    expect(a.top1.earned).toBe(false);
    expect(a.first.earned).toBe(false);
    expect(earnedAchievements(buildAchievements(metrics()))).toHaveLength(0);
  });

  it('pódio: TOP 3 conquistado, TOP DA SEMANA só no #1', () => {
    expect(byId(buildAchievements(metrics({ projects: 1, bestRank: 2 }))).top3.earned).toBe(true);
    expect(byId(buildAchievements(metrics({ projects: 1, bestRank: 2 }))).top1.earned).toBe(false);
    expect(byId(buildAchievements(metrics({ projects: 1, bestRank: 1 }))).top1.earned).toBe(true);
  });

  it('marcos de votos recebidos', () => {
    const a = byId(buildAchievements(metrics({ votesReceived: 150 })));
    expect(a.votes100.earned).toBe(true);
    expect(a.votes1000.earned).toBe(false);
    expect(a.votes1000.current).toBe(150); // progresso rumo a 1000
  });

  it('conquistas de participação: curador, crítico, comentado', () => {
    const a = byId(buildAchievements(metrics({ votesCast: 10, reviewsGiven: 5, reviewsReceived: 5 })));
    expect(a.curator.earned).toBe(true);
    expect(a.critic.earned).toBe(true);
    expect(a.reviewed.earned).toBe(true);
  });

  it('current nunca passa do target', () => {
    const a = byId(buildAchievements(metrics({ votesCast: 999 })));
    expect(a.curator.current).toBe(10);
    expect(a.curator.target).toBe(10);
  });
});

describe('upcomingAchievements', () => {
  it('lista só metas contáveis não obtidas, das mais próximas para as distantes', () => {
    // 90/100 votos (perto), 2/10 votos dados (longe).
    const all = buildAchievements(metrics({ votesReceived: 90, votesCast: 2 }));
    const up = upcomingAchievements(all);
    expect(up.every((a) => !a.earned && a.kind === 'milestone')).toBe(true);
    // +100 VOTOS (0.9) deve vir antes de CURADOR (0.2).
    const votes100Idx = up.findIndex((a) => a.id === 'votes100');
    const curatorIdx = up.findIndex((a) => a.id === 'curator');
    expect(votes100Idx).toBeGreaterThanOrEqual(0);
    expect(votes100Idx).toBeLessThan(curatorIdx);
  });

  it('respeita o limite', () => {
    const all = buildAchievements(metrics());
    expect(upcomingAchievements(all, 3).length).toBeLessThanOrEqual(3);
  });
});
