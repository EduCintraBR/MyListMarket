import { and, between, desc, eq, isNull } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import { compras, itensLista, listas, mercados, produtos } from '@/db/schema';
import * as schema from '@/db/schema';
import type { FormaPagamento } from '@/lib/domain';
import { newId } from '@/lib/id';
import { computeTotal } from '@/lib/total';

type DB = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export type Compra = typeof compras.$inferSelect;

export type CompraCreate = {
  listaId: string;
  mercadoId: string;
  formaPagamento: FormaPagamento;
  totalReal: number | null;
  fotoCupomPath: string | null;
};

export type CompraSummary = Compra & {
  mercadoNome: string;
  mercadoArquivado: boolean;
};

export type CompraItem = {
  id: string;
  produtoNome: string;
  quantidadeComprada: number | null;
  precoUnitario: number | null;
  origem: string;
  unidade: string | null;
};

export type CompraDetail = CompraSummary & {
  items: CompraItem[];
};

export type CompraListFilter = {
  mes?: string; // 'YYYY-MM'
  mercadoId?: string;
  limit?: number;
  offset?: number;
};

const monthRangeMs = (yyyyMm: string): [number, number] => {
  const [y, m] = yyyyMm.split('-').map(Number);
  if (!y || !m) throw new Error(`Invalid mes: ${yyyyMm}`);
  const start = new Date(y, m - 1, 1).getTime();
  const end = new Date(y, m, 1).getTime() - 1;
  return [start, end];
};

export const makeCompraRepo = (db: DB) => {
  const create = (payload: CompraCreate): Compra => {
    const items = db
      .select()
      .from(itensLista)
      .where(eq(itensLista.listaId, payload.listaId))
      .all();
    const lista = db.select().from(listas).where(eq(listas.id, payload.listaId)).get();
    if (!lista) throw new Error(`compraRepo.create: lista not found ${payload.listaId}`);
    if (lista.status !== 'em_compra') {
      throw new Error(`compraRepo.create: lista must be em_compra (current: ${lista.status})`);
    }

    const totalCalculado = computeTotal(
      items.map((it) => ({
        status: it.status,
        quantidadeComprada: it.quantidadeComprada,
        precoUnitario: it.precoUnitario,
      })),
    );

    const now = Date.now();
    const row: Compra = {
      id: newId(),
      listaId: payload.listaId,
      mercadoId: payload.mercadoId,
      dataHora: now,
      formaPagamento: payload.formaPagamento,
      totalCalculado,
      totalReal: payload.totalReal,
      fotoCupomPath: payload.fotoCupomPath,
      criadoEm: now,
      excluidoEm: null,
    };

    db.transaction((tx) => {
      tx.insert(compras).values(row).run();
      tx.update(listas)
        .set({ status: 'finalizada', finalizadaEm: now })
        .where(eq(listas.id, payload.listaId))
        .run();
    });

    return row;
  };

  const list = (filter: CompraListFilter): CompraSummary[] => {
    const conditions = [isNull(compras.excluidoEm)];
    if (filter.mercadoId) conditions.push(eq(compras.mercadoId, filter.mercadoId));
    if (filter.mes) {
      const [start, end] = monthRangeMs(filter.mes);
      conditions.push(between(compras.dataHora, start, end));
    }

    let q = db
      .select({ compra: compras, mercado: mercados })
      .from(compras)
      .innerJoin(mercados, eq(mercados.id, compras.mercadoId))
      .where(and(...conditions))
      .orderBy(desc(compras.dataHora))
      .$dynamic();

    if (filter.limit != null) q = q.limit(filter.limit);
    if (filter.offset != null) q = q.offset(filter.offset);

    const rows = q.all();
    return rows.map((r) => ({
      ...r.compra,
      mercadoNome: r.mercado.nome,
      mercadoArquivado: r.mercado.excluidoEm !== null,
    }));
  };

  const byId = (id: string): CompraDetail | undefined => {
    const row = db
      .select({ compra: compras, mercado: mercados })
      .from(compras)
      .innerJoin(mercados, eq(mercados.id, compras.mercadoId))
      .where(eq(compras.id, id))
      .get();
    if (!row) return undefined;

    const itemRows = db
      .select({ item: itensLista, produtoNome: produtos.nome })
      .from(itensLista)
      .innerJoin(produtos, eq(produtos.id, itensLista.produtoId))
      .where(eq(itensLista.listaId, row.compra.listaId))
      .all();

    return {
      ...row.compra,
      mercadoNome: row.mercado.nome,
      mercadoArquivado: row.mercado.excluidoEm !== null,
      items: itemRows.map((r) => ({
        id: r.item.id,
        produtoNome: r.produtoNome,
        quantidadeComprada: r.item.quantidadeComprada,
        precoUnitario: r.item.precoUnitario,
        origem: r.item.origem,
        unidade: r.item.unidade,
      })),
    };
  };

  const softDelete = (id: string): void => {
    db.update(compras).set({ excluidoEm: Date.now() }).where(eq(compras.id, id)).run();
  };

  return { create, list, byId, softDelete };
};

export type CompraRepo = ReturnType<typeof makeCompraRepo>;
