import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { seedProjects } from './data';

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
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      handle        TEXT    UNIQUE NOT NULL,
      name          TEXT    NOT NULL,
      password_hash TEXT    NOT NULL,
      bio           TEXT    NOT NULL DEFAULT '',
      github_id     INTEGER,
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
  `);

  // Migrações para bancos criados antes destas colunas.
  ensureColumn(db, 'projects', 'owner_id', 'INTEGER');
  ensureColumn(db, 'users', 'bio', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, 'users', 'github_id', 'INTEGER');
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
}

export function getDb(): Database.Database {
  if (!globalForDb.__bancadaDb) {
    globalForDb.__bancadaDb = init();
  }
  return globalForDb.__bancadaDb;
}
