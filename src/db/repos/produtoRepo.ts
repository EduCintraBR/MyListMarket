import { eq, isNull } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import { produtos } from '@/db/schema';
import * as schema from '@/db/schema';
import { newId } from '@/lib/id';
import { normalizeText } from '@/lib/textNormalize';

type DB = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export type Produto = typeof produtos.$inferSelect;
export type ProdutoPatch = Partial<Omit<Produto, 'id' | 'criadoEm'>>;

export const makeProdutoRepo = (db: DB) => {
  const findByNormalizedName = (name: string): Produto | undefined => {
    const target = normalizeText(name);
    if (target.length === 0) return undefined;
    const rows = db
      .select()
      .from(produtos)
      .where(isNull(produtos.excluidoEm))
      .all();
    return rows.find((r) => normalizeText(r.nome) === target);
  };

  const getOrCreate = (rawName: string): Produto => {
    const normalized = normalizeText(rawName);
    if (normalized.length === 0) {
      throw new Error('produtoRepo.getOrCreate: nome vazio');
    }
    const existing = findByNormalizedName(rawName);
    if (existing) return existing;
    const trimmed = rawName.trim().replace(/\s+/g, ' ');
    const row: Produto = {
      id: newId(),
      nome: trimmed,
      marcaPadrao: null,
      modeloPadrao: null,
      unidadePadrao: null,
      criadoEm: Date.now(),
      excluidoEm: null,
    };
    db.insert(produtos).values(row).run();
    return row;
  };

  const list = (opts: { includeDeleted?: boolean } = {}): Produto[] => {
    const where = opts.includeDeleted ? undefined : isNull(produtos.excluidoEm);
    const rows = where
      ? db.select().from(produtos).where(where).all()
      : db.select().from(produtos).all();
    return rows.sort((a, b) => a.nome.toLowerCase().localeCompare(b.nome.toLowerCase()));
  };

  const search = (query: string, limit = 8): Produto[] => {
    const normQuery = normalizeText(query);
    if (normQuery.length === 0) return [];
    const rows = db.select().from(produtos).where(isNull(produtos.excluidoEm)).all();
    return rows
      .filter((r) => normalizeText(r.nome).includes(normQuery))
      .sort((a, b) => a.nome.toLowerCase().localeCompare(b.nome.toLowerCase()))
      .slice(0, limit);
  };

  const update = (id: string, patch: ProdutoPatch): Produto => {
    db.update(produtos).set(patch).where(eq(produtos.id, id)).run();
    const row = db.select().from(produtos).where(eq(produtos.id, id)).get();
    if (!row) throw new Error(`produtoRepo.update: id not found ${id}`);
    return row;
  };

  const softDelete = (id: string): void => {
    db.update(produtos).set({ excluidoEm: Date.now() }).where(eq(produtos.id, id)).run();
  };

  return { getOrCreate, list, search, update, softDelete };
};
