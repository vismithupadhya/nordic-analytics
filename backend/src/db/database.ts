/**
 * database.ts — sql.js adapter
 *
 * sql.js is a pure-JavaScript SQLite port (via WebAssembly).
 * NO native compilation needed — works on Windows/macOS/Linux with zero extra tooling.
 *
 * Trade-off vs better-sqlite3: we keep the DB in memory and flush to disk after
 * writes. Fine for this dataset size; production would use a native driver.
 */

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

let DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/nordic.db');

let _db: SqlJsDatabase | null = null;
let _wrapper: DB | null = null;

function persist(db: SqlJsDatabase): void {
  if (DB_PATH === ':memory:') return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export async function getDb(): Promise<SqlJsDatabase> {
  if (_db) return _db;

  const SQL = await initSqlJs();

  if (DB_PATH !== ':memory:') {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  }

  if (DB_PATH !== ':memory:' && fs.existsSync(DB_PATH)) {
    _db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    _db = new SQL.Database();
  }

  _db.run('PRAGMA foreign_keys = ON;');
  return _db;
}

/** Synchronous-style wrapper around the sql.js async API */
export class DB {
  constructor(private db: SqlJsDatabase) {}

  run(sql: string, params: (string | number | null)[] = []): void {
    this.db.run(sql, params);
  }

  get<T>(sql: string, params: (string | number | null)[] = []): T | undefined {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const found = stmt.step();
    const row = found ? (stmt.getAsObject() as T) : undefined;
    stmt.free();
    return row;
  }

  all<T>(sql: string, params: (string | number | null)[] = []): T[] {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const rows: T[] = [];
    while (stmt.step()) rows.push(stmt.getAsObject() as T);
    stmt.free();
    return rows;
  }

  transaction(fn: () => void): void {
    this.db.run('BEGIN;');
    try {
      fn();
      this.db.run('COMMIT;');
      persist(this.db);
    } catch (err) {
      this.db.run('ROLLBACK;');
      throw err;
    }
  }

  exec(sql: string): void {
    this.db.run(sql);
    persist(this.db);
  }
}

export async function getWrapper(): Promise<DB> {
  if (_wrapper) return _wrapper;
  const db = await getDb();
  _wrapper = new DB(db);
  return _wrapper;
}

export function resetForTests(inMemoryPath = ':memory:'): void {
  DB_PATH = inMemoryPath;
  _db = null;
  _wrapper = null;
}

export async function initDb(): Promise<void> {
  const db = await getWrapper();

  const schemaPath = path.join(__dirname, '../../schema.sql');

  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Execute full schema directly
  db.exec(schema);

  console.log('✓ Database schema initialised');
}
