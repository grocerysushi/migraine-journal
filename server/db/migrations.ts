import type Database from 'better-sqlite3';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS migrations (
    id         INTEGER PRIMARY KEY,
    name       TEXT    NOT NULL UNIQUE,
    applied_at TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS migraine_entries (
    id               TEXT    PRIMARY KEY,
    date_time_start  TEXT    NOT NULL,
    date_time_end    TEXT,
    pain_intensity   INTEGER NOT NULL,
    notes            TEXT    NOT NULL DEFAULT '',
    created_at       TEXT    NOT NULL,
    updated_at       TEXT    NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_entries_start
    ON migraine_entries(date_time_start DESC);

  CREATE TABLE IF NOT EXISTS entry_locations (
    entry_id TEXT NOT NULL,
    location TEXT NOT NULL,
    PRIMARY KEY (entry_id, location),
    FOREIGN KEY (entry_id) REFERENCES migraine_entries(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS entry_symptoms (
    entry_id TEXT NOT NULL,
    symptom  TEXT NOT NULL,
    PRIMARY KEY (entry_id, symptom),
    FOREIGN KEY (entry_id) REFERENCES migraine_entries(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS entry_triggers (
    entry_id   TEXT NOT NULL,
    trigger    TEXT NOT NULL,
    other_text TEXT,
    PRIMARY KEY (entry_id, trigger),
    FOREIGN KEY (entry_id) REFERENCES migraine_entries(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS entry_meds (
    id         TEXT    PRIMARY KEY,
    entry_id   TEXT    NOT NULL,
    name       TEXT    NOT NULL,
    dose       TEXT    NOT NULL DEFAULT '',
    time_taken TEXT    NOT NULL,
    relief     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (entry_id) REFERENCES migraine_entries(id) ON DELETE CASCADE
  );
`;

interface Migration {
  id: number;
  name: string;
  sql: string;
}

const MIGRATIONS: Migration[] = [
  { id: 1, name: 'initial_schema', sql: SCHEMA },
];

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    (db.prepare('SELECT name FROM migrations').all() as { name: string }[]).map(
      (r) => r.name,
    ),
  );

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.name)) continue;
    db.transaction(() => {
      db.exec(migration.sql);
      db.prepare('INSERT INTO migrations (id, name, applied_at) VALUES (?, ?, ?)').run(
        migration.id, migration.name, new Date().toISOString(),
      );
    })();
  }
}
