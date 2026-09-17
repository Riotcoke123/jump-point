const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'jumppoint.sqlite');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS shows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  network TEXT,
  year_started INTEGER,
  year_ended INTEGER,
  genre TEXT,
  synopsis TEXT,
  slug TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS moments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  submitted_by TEXT DEFAULT 'Anonymous',
  season TEXT,
  episode TEXT,
  episode_title TEXT,
  argument TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_moments_show_id ON moments(show_id);
CREATE INDEX IF NOT EXISTS idx_shows_genre ON shows(genre);
`);

// node:sqlite has no built-in .transaction() helper like better-sqlite3,
// so this small wrapper gives the rest of the app the same shape:
// db.transaction(fn)() runs fn inside BEGIN/COMMIT, rolling back on error.
db.transaction = function transaction(fn) {
  return function runInTransaction(...args) {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };
};

module.exports = db;
