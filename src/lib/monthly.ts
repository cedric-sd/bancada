import { getDb } from './db';
import {
  addMonths,
  currentMonthKey,
  formatMonth,
  monthBounds,
  monthKey,
  startOfMonth,
  timeLeftLabel,
} from './month';
import { fromSqliteUtc } from './week';

/** Movimento de um projeto na disputa do mês vs. o mês passado. */
export type Move = { delta: number; isNew: boolean };

export type MonthlyEntry = {
  rank: number;
  slug: string;
  name: string;
  blurb: string;
  author: string;
  handle: string;
  hasImage: boolean;
  monthlyVotes: number;
  move?: Move;
};

export type Champion = {
  monthKey: string;
  range: string;
  slug: string;
  name: string;
  author: string;
  votes: number;
};

export type MonthlyRace = {
  key: string;
  range: string;
  endsIn: string;
  top: MonthlyEntry[];
  leader: MonthlyEntry | null;
};

type StandingRow = {
  slug: string;
  name: string;
  blurb: string;
  author: string;
  handle: string;
  has_image: number;
  mv: number;
};

export { currentMonthKey };

/**
 * Compara duas classificações (listas de slugs em ordem de rank) e devolve, por
 * projeto da classificação atual, o movimento em posições. `delta` positivo =
 * subiu; negativo = caiu; `isNew` = não estava no mês anterior. Puro.
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

/** Movimento de cada projeto na disputa deste mês vs. o mês passado. */
export function monthlyMovementMap(now: Date = new Date()): Record<string, Move> {
  const curKey = monthKey(now);
  const prevKey = monthKey(addMonths(startOfMonth(now), -1));
  const current = monthlyStandings(curKey).map((e) => e.slug);
  const previous = monthlyStandings(prevKey).map((e) => e.slug);
  return movementBetween(current, previous);
}

/** Projetos ordenados pelos votos recebidos dentro do mês `key` (YYYY-MM). */
export function monthlyStandings(key: string): MonthlyEntry[] {
  const { start, end } = monthBounds(key);
  const rows = getDb()
    .prepare(
      `SELECT p.slug AS slug, p.name AS name, p.blurb AS blurb, p.author AS author, p.handle AS handle,
              (pi.project_id IS NOT NULL) AS has_image,
              COUNT(uv.user_id) AS mv
       FROM projects p
       JOIN user_votes uv ON uv.project_id = p.id AND uv.created_at >= @start AND uv.created_at < @end
       LEFT JOIN project_images pi ON pi.project_id = p.id
       GROUP BY p.id
       ORDER BY mv DESC, p.votes DESC, p.id ASC`,
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
    monthlyVotes: r.mv,
  }));
}

/**
 * Encerra (registra o vencedor de) todo mês já concluído que ainda não foi
 * registrado. Idempotente — roda "preguiçosamente" na leitura, sem agendador.
 */
export function settlePastMonths(): void {
  const db = getDb();
  const first = db.prepare('SELECT MIN(created_at) AS m FROM user_votes').get() as { m: string | null };
  if (!first.m) return;

  const firstMonth = startOfMonth(fromSqliteUtc(first.m));
  const currentMonth = startOfMonth(new Date());
  const settled = new Set(
    (db.prepare('SELECT month_start FROM monthly_winners').all() as { month_start: string }[]).map(
      (r) => r.month_start,
    ),
  );
  const insert = db.prepare(
    `INSERT OR IGNORE INTO monthly_winners (month_start, project_id, slug, name, author, votes)
     VALUES (@month_start, @project_id, @slug, @name, @author, @votes)`,
  );

  const run = db.transaction(() => {
    let m = new Date(firstMonth);
    while (m < currentMonth) {
      const key = monthKey(m);
      if (!settled.has(key)) {
        const top = monthlyStandings(key)[0];
        if (top) {
          const proj = db.prepare('SELECT id FROM projects WHERE slug = ?').get(top.slug) as
            | { id: number }
            | undefined;
          insert.run({
            month_start: key,
            project_id: proj?.id ?? null,
            slug: top.slug,
            name: top.name,
            author: top.author,
            votes: top.monthlyVotes,
          });
        } else {
          insert.run({ month_start: key, project_id: null, slug: null, name: null, author: null, votes: 0 });
        }
      }
      m = addMonths(m, 1);
    }
  });
  run();
}

/** Campeões de meses passados (mais recentes primeiro). */
export function listChampions(): Champion[] {
  settlePastMonths();
  const rows = getDb()
    .prepare('SELECT month_start, slug, name, author, votes FROM monthly_winners WHERE slug IS NOT NULL ORDER BY month_start DESC')
    .all() as { month_start: string; slug: string; name: string; author: string; votes: number }[];
  return rows.map((r) => ({
    monthKey: r.month_start,
    range: formatMonth(r.month_start),
    slug: r.slug,
    name: r.name,
    author: r.author,
    votes: r.votes,
  }));
}

/** A disputa do mês atual: top do mês + quanto falta para encerrar. */
export function currentRace(): MonthlyRace {
  const key = currentMonthKey();
  const moves = monthlyMovementMap();
  const top = monthlyStandings(key)
    .slice(0, 3)
    .map((e) => ({ ...e, move: moves[e.slug] }));
  return {
    key,
    range: formatMonth(key),
    endsIn: timeLeftLabel(),
    top,
    leader: top[0] ?? null,
  };
}
