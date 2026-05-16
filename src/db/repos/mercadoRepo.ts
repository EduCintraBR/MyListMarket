import { eq, isNull } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import { mercados } from '@/db/schema';
import * as schema from '@/db/schema';
import { newId } from '@/lib/id';

type DB = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export type Mercado = typeof mercados.$inferSelect;
export type MercadoCreate = { nome: string; observacoes?: string | null };
export type MercadoPatch = Partial<Pick<Mercado, 'nome' | 'observacoes'>>;

export const makeMercadoRepo = (db: DB) => {
  const create = (input: MercadoCreate): Mercado => {
    const nome = input.nome.trim();
    if (nome.length === 0) throw new Error('mercadoRepo.create: nome vazio');
    const row: Mercado = {
      id: newId(),
      nome,
      observacoes: input.observacoes ?? null,
      criadoEm: Date.now(),
      excluidoEm: null,
    };
    db.insert(mercados).values(row).run();
    return row;
  };

  const list = (opts: { includeArchived?: boolean } = {}): Mercado[] => {
    const rows = opts.includeArchived
      ? db.select().from(mercados).all()
      : db.select().from(mercados).where(isNull(mercados.excluidoEm)).all();
    return rows.sort((a, b) => a.nome.toLowerCase().localeCompare(b.nome.toLowerCase()));
  };

  const byId = (id: string): Mercado | undefined =>
    db.select().from(mercados).where(eq(mercados.id, id)).get();

  const update = (id: string, patch: MercadoPatch): Mercado => {
    if (patch.nome !== undefined && patch.nome.trim().length === 0) {
      throw new Error('mercadoRepo.update: nome vazio');
    }
    db.update(mercados).set(patch).where(eq(mercados.id, id)).run();
    const row = byId(id);
    if (!row) throw new Error(`mercadoRepo.update: id not found ${id}`);
    return row;
  };

  const softDelete = (id: string): void => {
    db.update(mercados).set({ excluidoEm: Date.now() }).where(eq(mercados.id, id)).run();
  };

  const restore = (id: string): void => {
    db.update(mercados).set({ excluidoEm: null }).where(eq(mercados.id, id)).run();
  };

  return { create, list, byId, update, softDelete, restore };
};
