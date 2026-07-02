import { getDb } from './db';
import { grantXp } from './xp';
import { currentWeekKey } from './weekly';
import { weekBounds } from './week';

// Missões da semana: metas curtas que ensinam o loop e direcionam comportamento.
// O progresso vem das ações reais registradas em xp_events na semana corrente.
type MissionKind = 'vote' | 'review' | 'publish';

type MissionDef = {
  id: string;
  kind: MissionKind;
  target: number;
  reward: number;
  label: string;
};

const MISSIONS: MissionDef[] = [
  { id: 'vote3', kind: 'vote', target: 3, reward: 15, label: 'Vote em 3 projetos' },
  { id: 'review2', kind: 'review', target: 2, reward: 20, label: 'Avalie 2 projetos' },
  { id: 'publish1', kind: 'publish', target: 1, reward: 30, label: 'Publique 1 projeto' },
];

export type Mission = {
  id: string;
  label: string;
  kind: MissionKind;
  progress: number;
  target: number;
  reward: number;
  done: boolean;
};

/** Ações do usuário por tipo dentro da semana `[start, end)`. */
function weekActionCounts(userId: number, start: string, end: string): Record<string, number> {
  const rows = getDb()
    .prepare(
      `SELECT kind, COUNT(*) AS n FROM xp_events
       WHERE user_id = @userId AND kind IN ('vote','review','publish')
             AND created_at >= @start AND created_at < @end
       GROUP BY kind`,
    )
    .all({ userId, start, end }) as { kind: string; n: number }[];
  return Object.fromEntries(rows.map((r) => [r.kind, r.n]));
}

/**
 * Missões da semana do usuário, com progresso. Recompensa (idempotente, uma vez
 * por semana por missão via índice único de xp_events) quem já concluiu — de
 * forma preguiçosa na leitura, sem agendador.
 */
export function getWeeklyMissions(userId: number): Mission[] {
  const key = currentWeekKey();
  const { start, end } = weekBounds(key);
  const counts = weekActionCounts(userId, start, end);

  return MISSIONS.map((m) => {
    const progress = counts[m.kind] ?? 0;
    const done = progress >= m.target;
    // Ao concluir, credita o XP da recompensa (uma vez por semana).
    if (done) grantXp(userId, 'mission', `${m.id}:${key}`, m.reward);
    return {
      id: m.id,
      label: m.label,
      kind: m.kind,
      progress: Math.min(progress, m.target),
      target: m.target,
      reward: m.reward,
      done,
    };
  });
}
