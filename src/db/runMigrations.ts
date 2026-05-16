import { log } from '@/lib/log';

import { getRawDb } from './client';
import { sql0001 } from './migrations/0001_init';
import { sql0002 } from './migrations/0002_kv';

const MIGRATIONS: { id: number; name: string; sql: string }[] = [
  { id: 1, name: '0001_init', sql: sql0001 },
  { id: 2, name: '0002_kv', sql: sql0002 },
];

const ensureLedger = (): void => {
  const db = getRawDb();
  db.execSync(`CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at INTEGER NOT NULL
  );`);
};

export const runMigrations = (): void => {
  ensureLedger();
  const db = getRawDb();
  const appliedRows = db.getAllSync<{ id: number }>('SELECT id FROM _migrations');
  const applied = new Set(appliedRows.map((r) => r.id));

  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    log.info(`[db] applying migration ${m.name}`);
    db.execSync(m.sql);
    db.runSync('INSERT INTO _migrations (id, name, applied_at) VALUES (?, ?, ?)', [
      m.id,
      m.name,
      Date.now(),
    ]);
  }
};
