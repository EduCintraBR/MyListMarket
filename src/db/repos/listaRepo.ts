import { and, eq, isNull, ne, sql } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import { itensLista, listas } from '@/db/schema';
import * as schema from '@/db/schema';
import { newId } from '@/lib/id';
import { defaultListaNome, pendentesListaNome } from '@/lib/listaNaming';

type DB = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export type Lista = typeof listas.$inferSelect;
export type ListaWithCount = Lista & { itemCount: number };
export type ListaCreate = { nome?: string | null };
export type ListaPatch = Partial<
  Pick<Lista, 'nome' | 'status' | 'finalizadaEm'>
>;

export const makeListaRepo = (db: DB) => {
  const create = (input: ListaCreate): Lista => {
    const trimmed = input.nome?.trim();
    const nome = trimmed && trimmed.length > 0 ? trimmed : defaultListaNome();
    const row: Lista = {
      id: newId(),
      nome,
      status: 'planejamento',
      criadoEm: Date.now(),
      finalizadaEm: null,
      excluidoEm: null,
    };
    db.insert(listas).values(row).run();
    return row;
  };

  const byId = (id: string): Lista | undefined =>
    db.select().from(listas).where(eq(listas.id, id)).get();

  const list = (opts: { includeDeleted?: boolean } = {}): ListaWithCount[] => {
    const rows = opts.includeDeleted
      ? db.select().from(listas).all()
      : db.select().from(listas).where(isNull(listas.excluidoEm)).all();

    const counts = db
      .select({
        listaId: itensLista.listaId,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(itensLista)
      .groupBy(itensLista.listaId)
      .all();
    const countMap = new Map(counts.map((c) => [c.listaId, c.count]));

    return rows
      .map((r) => ({ ...r, itemCount: countMap.get(r.id) ?? 0 }))
      .sort((a, b) => b.criadoEm - a.criadoEm);
  };

  const update = (id: string, patch: ListaPatch): Lista => {
    db.update(listas).set(patch).where(eq(listas.id, id)).run();
    const row = byId(id);
    if (!row) throw new Error(`listaRepo.update: id not found ${id}`);
    return row;
  };

  const encerrar = (id: string): Lista => {
    const current = byId(id);
    if (!current) throw new Error(`listaRepo.encerrar: id not found ${id}`);
    if (current.status !== 'planejamento') {
      throw new Error(
        `listaRepo.encerrar: only allowed from planejamento (current: ${current.status})`,
      );
    }
    return update(id, { status: 'encerrada', finalizadaEm: Date.now() });
  };

  const softDelete = (id: string): void => {
    db.update(listas).set({ excluidoEm: Date.now() }).where(eq(listas.id, id)).run();
  };

  const activeCompraId = (): string | null => {
    const row = db
      .select({ id: listas.id })
      .from(listas)
      .where(and(eq(listas.status, 'em_compra'), isNull(listas.excluidoEm)))
      .get();
    return row?.id ?? null;
  };

  const iniciarCompra = (id: string): Lista => {
    // Constitution C-4: at most one lista in em_compra.
    db.transaction((tx) => {
      const conflict = tx
        .select({ id: listas.id })
        .from(listas)
        .where(
          and(
            eq(listas.status, 'em_compra'),
            isNull(listas.excluidoEm),
            ne(listas.id, id),
          ),
        )
        .get();
      if (conflict) {
        throw new Error(
          `listaRepo.iniciarCompra: another lista already em_compra (${conflict.id})`,
        );
      }
      const current = tx.select().from(listas).where(eq(listas.id, id)).get();
      if (!current) throw new Error(`listaRepo.iniciarCompra: id not found ${id}`);
      if (current.status !== 'planejamento') {
        throw new Error(
          `listaRepo.iniciarCompra: requires planejamento (current: ${current.status})`,
        );
      }
      tx.update(listas).set({ status: 'em_compra' }).where(eq(listas.id, id)).run();
    });
    const row = byId(id);
    if (!row) throw new Error(`listaRepo.iniciarCompra: missing after update ${id}`);
    return row;
  };

  const clonarPendentes = (sourceListaId: string): Lista => {
    const items = db
      .select()
      .from(itensLista)
      .where(eq(itensLista.listaId, sourceListaId))
      .all();
    const pendentes = items.filter((i) => i.status !== 'comprado');

    const novaLista: Lista = {
      id: newId(),
      nome: pendentesListaNome(),
      status: 'planejamento',
      criadoEm: Date.now(),
      finalizadaEm: null,
      excluidoEm: null,
    };
    db.insert(listas).values(novaLista).run();

    for (const src of pendentes) {
      db.insert(itensLista)
        .values({
          id: newId(),
          listaId: novaLista.id,
          produtoId: src.produtoId,
          quantidadePlanejada: src.quantidadePlanejada,
          marca: src.marca,
          modelo: src.modelo,
          unidade: src.unidade,
          origem: 'lista',
          status: 'a_comprar',
          quantidadeComprada: null,
          precoUnitario: null,
          criadoEm: Date.now(),
        })
        .run();
    }
    return novaLista;
  };

  return {
    create,
    byId,
    list,
    update,
    encerrar,
    softDelete,
    activeCompraId,
    iniciarCompra,
    clonarPendentes,
  };
};

export type ListaRepo = ReturnType<typeof makeListaRepo>;
