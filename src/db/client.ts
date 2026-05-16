import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import * as schema from './schema';

export const DB_NAME = 'mylistmarket.db';

let _rawDb: SQLite.SQLiteDatabase | undefined;
let _drizzleDb: ReturnType<typeof drizzle<typeof schema>> | undefined;

export const getRawDb = (): SQLite.SQLiteDatabase => {
  if (!_rawDb) _rawDb = SQLite.openDatabaseSync(DB_NAME);
  return _rawDb;
};

export const db = (): ReturnType<typeof drizzle<typeof schema>> => {
  if (!_drizzleDb) _drizzleDb = drizzle(getRawDb(), { schema });
  return _drizzleDb;
};

export const __resetDbForTests = (): void => {
  _rawDb = undefined;
  _drizzleDb = undefined;
};
