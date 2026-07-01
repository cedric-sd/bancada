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
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedIfEmpty(db);
  return db;
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
