// Test-only DB factory. Uses better-sqlite3 (Node) for fast in-memory integration tests.
// Production uses expo-sqlite (see client.ts).
//
// Both drizzle adapters expose the same query API typed against our schema.

// eslint-disable-next-line import/no-named-as-default
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { sql0001 } from './migrations/0001_init';
import { sql0002 } from './migrations/0002_kv';
import * as schema from './schema';

export type TestDb = ReturnType<typeof drizzle<typeof schema>>;

export const createTestDb = (): { db: TestDb; close: () => void } => {
  const raw = new Database(':memory:');
  raw.pragma('foreign_keys = ON');
  raw.exec(sql0001);
  raw.exec(sql0002);
  const db = drizzle(raw, { schema });
  return {
    db,
    close: (): void => {
      raw.close();
    },
  };
};
