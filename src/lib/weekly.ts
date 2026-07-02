import { getDb } from './db';
import {
  addWeeks,
  formatWeekRange,
  fromSqliteUtc,
  startOfWeek,
  timeLeftLabel,
  weekBounds,
  weekKey,
} from './week';

/** Movimento de um projeto na disputa da semana vs. a semana passada. */
export type Move = { delta: number; isNew: boolean };

export type WeeklyEntry = {
  rank: number;
  slug: string;
  name: string;
  blurb: string;
  author: string;
  handle: string;
  hasImage: boolean;
  weeklyVotes: number;
  move?: Move;
};

export type Champion = {
  weekKey: string;
  range: string;
  slug: string;
  name: string;
  author: string;
  votes: number;
};

export type WeeklyRace = {
  key: string;
  range: string;
  endsIn: string;
  top: WeeklyEntry[];
  leader: WeeklyEntry | null;
};

type StandingRow = {
  slug: string;
  name: string;
  blurb: string;
  author: string;
  handle: string;
  has_image: number;
  wv: number;
};

export function currentWeekKey(): string {
  return weekKey(new Date());
}

/**
 * Compara duas classificações (listas de slugs em ordem de rank) e devolve, por
 * projeto da classificação atual, o movimento em posições. `delta` positivo =
 * subiu; negativo = caiu; `isNew` = não estava na semana anterior. Puro.
 */
export function movementBetween(
  current: string[],
  previous: string[],
): Record<string, Move> {
  const prevRank = new Map<string, number>();
  previous.forEach((slug, i) => prevRank.set(slug, i + 1));

  const out: Record<string, Move> = {};
  current.forEach((slug, i) => {
    const pr = prevRank.get(slug);
    out[slug] = pr === undefined ? { delta: 0, isNew: true } : { delta: pr - (i + 1), isNew: false };
  });
  return out;
}

/** Movimento de cada projeto na disputa desta semana vs. a semana passada. */
export function weeklyMovementMap(now: Date = new Date()): Record<string, Move> {
  const curKey = weekKey(now);
  const prevKey = weekKey(addWeeks(startOfWeek(now), -1));
  const current = weeklyStandings(curKey).map((e) => e.slug);
  const previous = weeklyStandings(prevKey).map((e) => e.slug);
  return movementBetween(current, previous);
}

/** Projetos ordenados pelos votos recebidos dentro da semana `key`. */
export function weeklyStandings(key: string): WeeklyEntry[] {
  const { start, end } = weekBounds(key);
  const rows = getDb()
    .prepare(
      `SELECT p.slug AS slug, p.name AS name, p.blurb AS blurb, p.author AS author, p.handle AS handle,
              (pi.project_id IS NOT NULL) AS has_image,
              COUNT(uv.user_id) AS wv
       FROM projects p
       JOIN user_votes uv ON uv.project_id = p.id AND uv.created_at >= @start AND uv.created_at < @end
       LEFT JOIN project_images pi ON pi.project_id = p.id
       GROUP BY p.id
       ORDER BY wv DESC, p.votes DESC, p.id ASC`,
    )
    .all({ start, end }) as StandingRow[];
  return rows.map((r, i) => ({
    rank: i + 1,
    slug: r.slug,
    name: r.name,
    blurb: r.blurb,
    author: r.author,
    handle: r.handle,
    hasImage: !!r.has_image,
    weeklyVotes: r.wv,
  }));
}

/**
 * Encerra (registra o vencedor de) toda semana já concluída que ainda não foi
 * registrada. Idempotente — roda "preguiçosamente" na leitura, sem agendador.
 */
export function settlePastWeeks(): void {
  const db = getDb();
  const first = db.prepare('SELECT MIN(created_at) AS m FROM user_votes').get() as { m: string | null };
  if (!first.m) return;

  const firstWeek = startOfWeek(fromSqliteUtc(first.m));
  const currentWeek = startOfWeek(new Date());
  const settled = new Set(
    (db.prepare('SELECT week_start FROM weekly_winners').all() as { week_start: string }[]).map(
      (r) => r.week_start,
    ),
  );
  const insert = db.prepare(
    `INSERT OR IGNORE INTO weekly_winners (week_start, project_id, slug, name, author, votes)
     VALUES (@week_start, @project_id, @slug, @name, @author, @votes)`,
  );

  const run = db.transaction(() => {
    let w = new Date(firstWeek);
    while (w < currentWeek) {
      const key = weekKey(w);
      if (!settled.has(key)) {
        const top = weeklyStandings(key)[0];
        if (top) {
          const proj = db.prepare('SELECT id FROM projects WHERE slug = ?').get(top.slug) as
            | { id: number }
            | undefined;
          insert.run({
            week_start: key,
            project_id: proj?.id ?? null,
            slug: top.slug,
            name: top.name,
            author: top.author,
            votes: top.weeklyVotes,
          });
        } else {
          insert.run({ week_start: key, project_id: null, slug: null, name: null, author: null, votes: 0 });
        }
      }
      w = addWeeks(w, 1);
    }
  });
  run();
}

/** Campeões de semanas passadas (mais recentes primeiro). */
export function listChampions(): Champion[] {
  settlePastWeeks();
  const rows = getDb()
    .prepare('SELECT week_start, slug, name, author, votes FROM weekly_winners WHERE slug IS NOT NULL ORDER BY week_start DESC')
    .all() as { week_start: string; slug: string; name: string; author: string; votes: number }[];
  return rows.map((r) => ({
    weekKey: r.week_start,
    range: formatWeekRange(r.week_start),
    slug: r.slug,
    name: r.name,
    author: r.author,
    votes: r.votes,
  }));
}

/** A disputa da semana atual: top da semana + quanto falta para encerrar. */
export function currentRace(): WeeklyRace {
  const key = currentWeekKey();
  const moves = weeklyMovementMap();
  const top = weeklyStandings(key)
    .slice(0, 3)
    .map((e) => ({ ...e, move: moves[e.slug] }));
  return {
    key,
    range: formatWeekRange(key),
    endsIn: timeLeftLabel(),
    top,
    leader: top[0] ?? null,
  };
}
