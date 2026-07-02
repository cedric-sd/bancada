// Conquistas: derivadas de métricas reais. Puras e testáveis — a UI só desenha.
// 'badge' = binária (aparece quando conquistada). 'milestone' = contável (mostra
// progresso enquanto falta: "faltam N para ...").

export type Metrics = {
  votesReceived: number; // votos recebidos nos projetos
  projects: number; // projetos publicados
  bestRank: number; // melhor posição no placar (0 = sem projetos)
  votesCast: number; // votos dados (curador)
  reviewsGiven: number; // avaliações feitas (crítico)
  reviewsReceived: number; // avaliações recebidas (comentado)
};

export type AchievementView = {
  id: string;
  label: string;
  desc: string;
  color: string;
  kind: 'badge' | 'milestone';
  earned: boolean;
  current: number;
  target: number;
  unit: string;
};

type Def = {
  id: string;
  label: string;
  desc: string;
  color: string;
  kind: 'badge' | 'milestone';
  target: number;
  unit: string;
  value: (m: Metrics) => number;
};

const DEFS: Def[] = [
  // Binárias (só quando conquistadas).
  {
    id: 'first',
    label: 'PRIMEIRO PROJETO',
    desc: 'Publicou o primeiro projeto',
    color: '#9a6a1f',
    kind: 'badge',
    target: 1,
    unit: 'projeto',
    value: (m) => m.projects,
  },
  {
    id: 'top1',
    label: 'TOP DA SEMANA',
    desc: 'Liderou o placar',
    color: '#b23a2a',
    kind: 'badge',
    target: 1,
    unit: '',
    value: (m) => (m.bestRank === 1 ? 1 : 0),
  },
  {
    id: 'top3',
    label: 'TOP 3',
    desc: 'Chegou ao pódio do placar',
    color: '#2f6d86',
    kind: 'badge',
    target: 1,
    unit: '',
    // Só conta com projeto no pódio (bestRank 0 = sem projetos → não conquista).
    value: (m) => (m.bestRank >= 1 && m.bestRank <= 3 ? 1 : 0),
  },
  // Contáveis (mostram progresso enquanto falta).
  {
    id: 'marathon',
    label: 'MARATONISTA',
    desc: 'Publique 3 projetos',
    color: '#2f6d86',
    kind: 'milestone',
    target: 3,
    unit: 'projetos',
    value: (m) => m.projects,
  },
  {
    id: 'votes100',
    label: '+100 VOTOS',
    desc: 'Receba 100 votos',
    color: '#557a38',
    kind: 'milestone',
    target: 100,
    unit: 'votos',
    value: (m) => m.votesReceived,
  },
  {
    id: 'votes1000',
    label: '+1000 VOTOS',
    desc: 'Receba 1000 votos',
    color: '#557a38',
    kind: 'milestone',
    target: 1000,
    unit: 'votos',
    value: (m) => m.votesReceived,
  },
  {
    id: 'curator',
    label: 'CURADOR',
    desc: 'Vote em 10 projetos',
    color: '#7a5aa0',
    kind: 'milestone',
    target: 10,
    unit: 'votos dados',
    value: (m) => m.votesCast,
  },
  {
    id: 'critic',
    label: 'CRÍTICO',
    desc: 'Avalie 5 projetos',
    color: '#a0623a',
    kind: 'milestone',
    target: 5,
    unit: 'avaliações',
    value: (m) => m.reviewsGiven,
  },
  {
    id: 'reviewed',
    label: 'COMENTADO',
    desc: 'Receba 5 avaliações',
    color: '#3a6ea0',
    kind: 'milestone',
    target: 5,
    unit: 'avaliações',
    value: (m) => m.reviewsReceived,
  },
];

/** Todas as conquistas com estado (conquistada) e progresso, a partir das métricas. */
export function buildAchievements(m: Metrics): AchievementView[] {
  return DEFS.map((d) => {
    const raw = d.value(m);
    return {
      id: d.id,
      label: d.label,
      desc: d.desc,
      color: d.color,
      kind: d.kind,
      earned: raw >= d.target,
      current: Math.min(raw, d.target),
      target: d.target,
      unit: d.unit,
    };
  });
}

/** Conquistas já obtidas (para exibir como carimbos). */
export function earnedAchievements(all: AchievementView[]): AchievementView[] {
  return all.filter((a) => a.earned);
}

/**
 * Próximas conquistas (metas contáveis ainda não obtidas), das mais próximas
 * para as mais distantes — para mostrar "faltam N para ...".
 */
export function upcomingAchievements(all: AchievementView[], limit = 4): AchievementView[] {
  return all
    .filter((a) => !a.earned && a.kind === 'milestone')
    .sort((x, y) => y.current / y.target - x.current / x.target)
    .slice(0, limit);
}
