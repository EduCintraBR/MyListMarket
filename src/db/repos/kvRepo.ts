import { eq, sql } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import { kv } from '@/db/schema';
import * as schema from '@/db/schema';

type DB = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export const makeKvRepo = (db: DB) => {
  const get = (key: string): string | null => {
    const row = db.select().from(kv).where(eq(kv.k, key)).get();
    return row?.v ?? null;
  };

  const set = (key: string, value: string): void => {
    db.insert(kv)
      .values({ k: key, v: value })
      .onConflictDoUpdate({ target: kv.k, set: { v: sql`excluded.v` } })
      .run();
  };

  const remove = (key: string): void => {
    db.delete(kv).where(eq(kv.k, key)).run();
  };

  return { get, set, remove };
};

export type KvRepo = ReturnType<typeof makeKvRepo>;
