import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import { makeProdutoRepo } from '@/db/repos/produtoRepo';
import { itensLista, listas, produtos } from '@/db/schema';
import * as schema from '@/db/schema';
import type { OrigemItem, StatusItem, UnidadeMedida } from '@/lib/domain';
import { newId } from '@/lib/id';
import { normalizeText } from '@/lib/textNormalize';

type DB = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export type ItemLista = typeof itensLista.$inferSelect;
export type ItemListaWithProduto = ItemLista & { produtoNome: string };

export type ItemListaAdd = {
  nome: string;
  quantidadePlanejada?: number | null;
  marca?: string | null;
  modelo?: string | null;
  unidade?: UnidadeMedida | null;
  origem?: OrigemItem;
  status?: StatusItem;
  quantidadeComprada?: number | null;
  precoUnitario?: number | null;
};

export type ItemListaPatch = Partial<
  Pick<
    ItemLista,
    | 'quantidadePlanejada'
    | 'marca'
    | 'modelo'
    | 'unidade'
    | 'status'
    | 'quantidadeComprada'
    | 'precoUnitario'
  >
>;

const requireLista = (db: DB, listaId: string): typeof listas.$inferSelect => {
  const lista = db.select().from(listas).where(eq(listas.id, listaId)).get();
  if (!lista) throw new Error(`itemListaRepo: lista not found ${listaId}`);
  return lista;
};

export const makeItemListaRepo = (db: DB) => {
  const produtoRepo = makeProdutoRepo(db);

  const add = (listaId: string, payload: ItemListaAdd): ItemLista => {
    requireLista(db, listaId);
    const produto = produtoRepo.getOrCreate(payload.nome);
    const row: ItemLista = {
      id: newId(),
      listaId,
      produtoId: produto.id,
      quantidadePlanejada: payload.quantidadePlanejada ?? null,
      marca: payload.marca ?? null,
      modelo: payload.modelo ?? null,
      unidade: payload.unidade ?? null,
      origem: payload.origem ?? 'lista',
      status: payload.status ?? 'a_comprar',
      quantidadeComprada: payload.quantidadeComprada ?? null,
      precoUnitario: payload.precoUnitario ?? null,
      criadoEm: Date.now(),
    };
    db.insert(itensLista).values(row).run();
    return row;
  };

  const list = (listaId: string): ItemListaWithProduto[] => {
    const rows = db
      .select({
        item: itensLista,
        produtoNome: produtos.nome,
      })
      .from(itensLista)
      .innerJoin(produtos, eq(produtos.id, itensLista.produtoId))
      .where(eq(itensLista.listaId, listaId))
      .all();
    return rows
      .map((r) => ({ ...r.item, produtoNome: r.produtoNome }))
      .sort((a, b) => normalizeText(a.produtoNome).localeCompare(normalizeText(b.produtoNome)));
  };

  const byId = (id: string): ItemLista | undefined =>
    db.select().from(itensLista).where(eq(itensLista.id, id)).get();

  const update = (id: string, patch: ItemListaPatch): ItemLista => {
    db.update(itensLista).set(patch).where(eq(itensLista.id, id)).run();
    const row = byId(id);
    if (!row) throw new Error(`itemListaRepo.update: id not found ${id}`);
    return row;
  };

  const remove = (id: string): void => {
    const item = byId(id);
    if (!item) throw new Error(`itemListaRepo.remove: id not found ${id}`);
    const lista = requireLista(db, item.listaId);
    if (lista.status !== 'planejamento') {
      throw new Error(
        `itemListaRepo.remove: only allowed while lista in planejamento (current: ${lista.status})`,
      );
    }
    db.delete(itensLista).where(eq(itensLista.id, id)).run();
  };

  const marcarComprado = (
    id: string,
    { qtd, preco }: { qtd: number; preco: number },
  ): ItemLista => {
    if (!(qtd > 0)) throw new Error('itemListaRepo.marcarComprado: qtd must be > 0');
    if (!(preco >= 0)) throw new Error('itemListaRepo.marcarComprado: preco must be >= 0');
    return update(id, {
      status: 'comprado',
      quantidadeComprada: qtd,
      precoUnitario: preco,
    });
  };

  const desmarcar = (id: string): ItemLista =>
    update(id, {
      status: 'a_comprar',
      quantidadeComprada: null,
      precoUnitario: null,
    });

  const addUnplanned = (
    listaId: string,
    payload: ItemListaAdd & { precoUnitario: number; quantidadeComprada: number },
  ): ItemLista =>
    add(listaId, {
      ...payload,
      origem: 'compra',
      status: 'comprado',
    });

  const removeUnplanned = (id: string): void => {
    const item = byId(id);
    if (!item) throw new Error(`itemListaRepo.removeUnplanned: id not found ${id}`);
    if (item.origem !== 'compra') {
      throw new Error('itemListaRepo.removeUnplanned: only allowed for origem=compra');
    }
    db.delete(itensLista).where(eq(itensLista.id, id)).run();
  };

  return {
    add,
    list,
    byId,
    update,
    remove,
    marcarComprado,
    desmarcar,
    addUnplanned,
    removeUnplanned,
  };
};

export type ItemListaRepo = ReturnType<typeof makeItemListaRepo>;
