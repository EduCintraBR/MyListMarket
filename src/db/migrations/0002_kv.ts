// Mirror of 0002_kv.sql. See 0001_init.ts for rationale.

export const sql0002 = `
CREATE TABLE IF NOT EXISTS kv (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);
`;
