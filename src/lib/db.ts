import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { seedProjects } from './data';
import { addWeeks, sqliteUtc, startOfWeek } from './week';

// Reaproveita a conexão entre hot-reloads no dev (evita abrir vários handles).
const globalForDb = globalThis as unknown as { __bancadaDb?: Database.Database };

const parseVotes = (v: string) => parseInt(v.replace(/\D/g, ''), 10) || 0;

function init(): Database.Database {
  const dir = path.join(process.cwd(), 'data');
  mkdirSync(dir, { recursive: true });

  const db = new Database(path.join(dir, 'bancada.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      slug          TEXT    UNIQUE NOT NULL,
      name          TEXT    NOT NULL,
      blurb         TEXT    NOT NULL DEFAULT '',
      author        TEXT    NOT NULL,
      handle        TEXT    NOT NULL,
      stars         TEXT    NOT NULL DEFAULT '0',
      votes         INTEGER NOT NULL DEFAULT 0,
      cat           TEXT    NOT NULL DEFAULT '',
      badge         TEXT    NOT NULL DEFAULT '',
      lvl           INTEGER NOT NULL DEFAULT 1,
      description   TEXT    NOT NULL DEFAULT '',
      tags          TEXT    NOT NULL DEFAULT '[]',
      forks         TEXT    NOT NULL DEFAULT '0',
      xp_for_author TEXT    NOT NULL DEFAULT '+0',
      owner_id      INTEGER,
      url           TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      handle        TEXT    UNIQUE NOT NULL,
      name          TEXT    NOT NULL,
      password_hash TEXT    NOT NULL,
      bio           TEXT    NOT NULL DEFAULT '',
      github_id     INTEGER,
      github_login  TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT    PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_votes (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, project_id)
    );

    -- Screenshot do projeto (um por projeto), guardado no próprio banco.
    CREATE TABLE IF NOT EXISTS project_images (
      project_id INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
      mime       TEXT    NOT NULL,
      data       BLOB    NOT NULL,
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Avatar do usuário (um por conta).
    CREATE TABLE IF NOT EXISTS user_avatars (
      user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      mime       TEXT    NOT NULL,
      data       BLOB    NOT NULL,
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Avaliações da comunidade (uma por usuário por projeto).
    CREATE TABLE IF NOT EXISTS reviews (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stars      INTEGER NOT NULL,
      text       TEXT    NOT NULL DEFAULT '',
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE (project_id, user_id)
    );

    -- Vencedores de semanas encerradas (snapshot para o Hall da Fama).
    CREATE TABLE IF NOT EXISTS weekly_winners (
      week_start TEXT    PRIMARY KEY,
      project_id INTEGER,
      slug       TEXT,
      name       TEXT,
      author     TEXT,
      votes      INTEGER NOT NULL DEFAULT 0,
      settled_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Notificações (feedback): eventos direcionados a um usuário (dono do projeto).
    CREATE TABLE IF NOT EXISTS notifications (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind         TEXT    NOT NULL,
      project_slug TEXT,
      project_name TEXT,
      actor        TEXT,
      meta         TEXT,
      read         INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
  `);

  // Migrações para bancos criados antes destas colunas.
  ensureColumn(db, 'projects', 'owner_id', 'INTEGER');
  ensureColumn(db, 'projects', 'url', 'TEXT');
  ensureColumn(db, 'users', 'bio', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, 'users', 'github_id', 'INTEGER');
  ensureColumn(db, 'users', 'github_login', 'TEXT');
  // Índice único parcial: um github_id por conta (permite vários NULL).
  db.exec(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL',
  );

  seedIfEmpty(db);
  return db;
}

/** Adiciona uma coluna se ela ainda não existir (migração idempotente). */
function ensureColumn(db: Database.Database, table: string, column: string, decl: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
  }
}

function seedIfEmpty(db: Database.Database) {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM projects').get() as {
    count: number;
  };
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO projects
      (slug, name, blurb, author, handle, stars, votes, cat, badge, lvl, description, tags, forks, xp_for_author)
    VALUES
      (@slug, @name, @blurb, @author, @handle, @stars, @votes, @cat, @badge, @lvl, @description, @tags, @forks, @xp_for_author)
  `);

  const seed = db.transaction((rows: typeof seedProjects) => {
    for (const p of rows) {
      insert.run({
        slug: p.slug,
        name: p.name,
        blurb: p.blurb,
        author: p.author,
        handle: p.handle,
        stars: p.stars,
        votes: parseVotes(p.votes),
        cat: p.cat,
        badge: p.badge,
        lvl: p.lvl,
        description: p.description,
        tags: JSON.stringify(p.tags),
        forks: p.forks,
        xp_for_author: p.xpForAuthor,
      });
    }
  });

  seed(seedProjects);
  seedWeeklyVotes(db);
}

// Semeia "eleitores" e votos distribuídos pelas últimas semanas — assim o
// placar da semana e o Hall da Fama já nascem com vida (e campeões variados).
function seedWeeklyVotes(db: Database.Database) {
  const voterNames = [
    'Théo Salles', 'Bia Ramos', 'Davi Lin', 'Ana Beltrão', 'Igor Pádua', 'Rê Couto',
    'Léo Maia', 'Nina Rocha', 'Caio Vidal', 'Sofia Nunes', 'Rui Castro', 'Lia Prado',
    'Gus Amaral', 'Vera Pinto', 'Ivo Barros', 'Mel Dantas', 'Zé Farias', 'Duda Reis',
    'Tom Aires', 'Paz Moura',
  ];
  const insUser = db.prepare("INSERT INTO users (handle, name, password_hash) VALUES (?, ?, '')");
  const voterIds = voterNames.map((n, i) => Number(insUser.run(`eleitor${i + 1}`, n).lastInsertRowid));

  const projectId = (slug: string) =>
    (db.prepare('SELECT id FROM projects WHERE slug = ?').get(slug) as { id: number }).id;

  const curWeek = startOfWeek(new Date());
  // [offset de semana, [ [slug, quantidade], ... ]]
  const plan: [number, [string, number][]][] = [
    [-3, [['quokka', 5], ['lumen', 2], ['refactr', 1]]],
    [-2, [['refactr', 5], ['markdownr', 3], ['lumen', 2]]],
    [-1, [['lumen', 6], ['stipple', 3], ['cronos', 2]]],
    [0, [['lumen', 5], ['markdownr', 3], ['pixelforge', 2], ['quokka', 2]]],
  ];

  const nextVoter: Record<string, number> = {}; // por projeto, para não repetir eleitor
  const insVote = db.prepare(
    'INSERT OR IGNORE INTO user_votes (user_id, project_id, created_at) VALUES (?, ?, ?)',
  );

  const run = db.transaction(() => {
    for (const [offset, list] of plan) {
      const wStart = addWeeks(curWeek, offset);
      for (const [slug, count] of list) {
        const pid = projectId(slug);
        for (let k = 0; k < count; k++) {
          const idx = nextVoter[slug] ?? 0;
          nextVoter[slug] = idx + 1;
          const userId = voterIds[idx];
          const dt = new Date(wStart);
          dt.setUTCDate(dt.getUTCDate() + Math.min(6, k)); // dentro da semana
          dt.setUTCHours(10, 0, 0, 0);
          insVote.run(userId, pid, sqliteUtc(dt));
        }
      }
    }
  });
  run();
}

export function getDb(): Database.Database {
  if (!globalForDb.__bancadaDb) {
    globalForDb.__bancadaDb = init();
  }
  return globalForDb.__bancadaDb;
}
