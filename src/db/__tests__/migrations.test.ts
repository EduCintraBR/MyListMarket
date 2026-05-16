import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line import/no-named-as-default
import Database from 'better-sqlite3';

import { sql0001 } from '@/db/migrations/0001_init';

const SQL_FILE_PATH = path.join(__dirname, '..', 'migrations', '0001_init.sql');

const EXPECTED_TABLES = ['produtos', 'mercados', 'listas', 'itens_lista', 'compras'];

describe('migration 0001_init', () => {
  it('creates all five domain tables on an empty database', () => {
    const db = new Database(':memory:');
    db.exec(sql0001);

    const rows = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    const names = rows.map((r) => r.name);

    for (const t of EXPECTED_TABLES) {
      expect(names).toContain(t);
    }
    db.close();
  });

  it('creates the produto name index', () => {
    const db = new Database(':memory:');
    db.exec(sql0001);
    const idx = db
      .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_produto_nome'")
      .get();
    expect(idx).toBeTruthy();
    db.close();
  });

  it('every soft-delete-bearing table has an excluido_em column', () => {
    const db = new Database(':memory:');
    db.exec(sql0001);
    const tables = ['produtos', 'mercados', 'listas', 'compras'];
    for (const t of tables) {
      const cols = db.prepare(`PRAGMA table_info(${t})`).all() as { name: string }[];
      const names = cols.map((c) => c.name);
      expect(names).toContain('excluido_em');
    }
    db.close();
  });

  it('itens_lista has origem and status defaults', () => {
    const db = new Database(':memory:');
    db.exec(sql0001);
    const cols = db.prepare('PRAGMA table_info(itens_lista)').all() as {
      name: string;
      dflt_value: unknown;
    }[];
    const origem = cols.find((c) => c.name === 'origem');
    const status = cols.find((c) => c.name === 'status');
    expect(String(origem?.dflt_value)).toContain('lista');
    expect(String(status?.dflt_value)).toContain('a_comprar');
    db.close();
  });

  it('foreign keys enforced (RESTRICT) — cannot delete a lista referenced by an item', () => {
    const db = new Database(':memory:');
    db.exec(sql0001);
    db.pragma('foreign_keys = ON');
    const now = Date.now();
    db.prepare(
      "INSERT INTO listas (id, nome, status, criado_em) VALUES ('L1', 'X', 'planejamento', ?)",
    ).run(now);
    db.prepare("INSERT INTO produtos (id, nome, criado_em) VALUES ('P1', 'Arroz', ?)").run(now);
    db.prepare(
      "INSERT INTO itens_lista (id, lista_id, produto_id, criado_em) VALUES ('I1', 'L1', 'P1', ?)",
    ).run(now);
    expect(() => db.prepare("DELETE FROM listas WHERE id='L1'").run()).toThrow();
    db.close();
  });

  it('canonical .sql file matches the TS mirror exactly (modulo header comments)', () => {
    const fromDisk = fs.readFileSync(SQL_FILE_PATH, 'utf-8').trim();
    const fromTs = sql0001
      .trim()
      .replace(/^-- .*$/gm, '')
      .trim();
    const fromDiskBody = fromDisk.replace(/^-- .*$/gm, '').trim();
    expect(fromTs).toEqual(fromDiskBody);
  });
});
