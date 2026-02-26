import Database from 'better-sqlite3';
import path from 'path';
import { runMigrations } from './migrations';

const DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'migraine.db')
  : path.join(process.cwd(), 'data', 'migraine.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    // Ensure data directory exists
    const fs = require('fs') as typeof import('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    runMigrations(_db);
  }
  return _db;
}
