import type { StateCreator } from 'zustand';

import type {
  ItemListaAdd,
  ItemListaPatch,
  ItemListaWithProduto,
  makeItemListaRepo,
} from '@/db/repos/itemListaRepo';
import type { Lista, makeListaRepo } from '@/db/repos/listaRepo';
import { computeTotal } from '@/lib/total';

export type ListaRepo = ReturnType<typeof makeListaRepo>;
export type ItemListaRepo = ReturnType<typeof makeItemListaRepo>;

export type CompraAtivaSlice = {
  compraAtivaListaId: string | null;
  compraAtivaMercadoId: string | null;
  compraAtivaItems: ItemListaWithProduto[];
  compraAtivaTotal: number;
  compraAtivaReady: boolean;
  _compraListaRepo: ListaRepo | null;
  _compraItemRepo: ItemListaRepo | null;

  initCompraAtiva: (listaRepo: ListaRepo, itemRepo: ItemListaRepo) => void;
  restoreCompraAtiva: () => string | null;
  iniciarCompraAtiva: (listaId: string) => Lista;
  setMercadoCompra: (mercadoId: string | null) => void;
  marcarItemCompra: (itemId: string, qtd: number, preco: number) => void;
  voltarItemCompra: (itemId: string) => void;
  adicionarUnplannedCompra: (payload: ItemListaAdd & {
    quantidadeComprada: number;
    precoUnitario: number;
  }) => void;
  removerUnplannedCompra: (itemId: string) => void;
  editarItemCompra: (itemId: string, patch: ItemListaPatch) => void;
  endCompraAtiva: () => void;
};

const requireRepo = <T>(repo: T | null, name: string): T => {
  if (!repo) throw new Error(`CompraAtivaSlice: ${name} not initialized — call initCompraAtiva first`);
  return repo;
};

const refreshFromRepo = (
  listaId: string,
  itemRepo: ItemListaRepo,
): { items: ItemListaWithProduto[]; total: number } => {
  const items = itemRepo.list(listaId);
  const total = computeTotal(items);
  return { items, total };
};

export const createCompraAtivaSlice: StateCreator<CompraAtivaSlice> = (set, get) => ({
  compraAtivaListaId: null,
  compraAtivaMercadoId: null,
  compraAtivaItems: [],
  compraAtivaTotal: 0,
  compraAtivaReady: false,
  _compraListaRepo: null,
  _compraItemRepo: null,

  initCompraAtiva: (listaRepo, itemRepo) => {
    set({
      _compraListaRepo: listaRepo,
      _compraItemRepo: itemRepo,
      compraAtivaReady: true,
    });
  },

  restoreCompraAtiva: () => {
    const listaRepo = requireRepo(get()._compraListaRepo, '_compraListaRepo');
    const itemRepo = requireRepo(get()._compraItemRepo, '_compraItemRepo');
    const id = listaRepo.activeCompraId();
    if (!id) {
      set({
        compraAtivaListaId: null,
        compraAtivaItems: [],
        compraAtivaTotal: 0,
        compraAtivaMercadoId: null,
      });
      return null;
    }
    const { items, total } = refreshFromRepo(id, itemRepo);
    set({
      compraAtivaListaId: id,
      compraAtivaItems: items,
      compraAtivaTotal: total,
    });
    return id;
  },

  iniciarCompraAtiva: (listaId) => {
    const listaRepo = requireRepo(get()._compraListaRepo, '_compraListaRepo');
    const itemRepo = requireRepo(get()._compraItemRepo, '_compraItemRepo');
    const lista = listaRepo.iniciarCompra(listaId);
    const { items, total } = refreshFromRepo(listaId, itemRepo);
    set({
      compraAtivaListaId: listaId,
      compraAtivaItems: items,
      compraAtivaTotal: total,
      compraAtivaMercadoId: null,
    });
    return lista;
  },

  setMercadoCompra: (mercadoId) => {
    set({ compraAtivaMercadoId: mercadoId });
  },

  marcarItemCompra: (itemId, qtd, preco) => {
    const itemRepo = requireRepo(get()._compraItemRepo, '_compraItemRepo');
    const listaId = get().compraAtivaListaId;
    if (!listaId) throw new Error('CompraAtivaSlice: no active lista');
    itemRepo.marcarComprado(itemId, { qtd, preco });
    const { items, total } = refreshFromRepo(listaId, itemRepo);
    set({ compraAtivaItems: items, compraAtivaTotal: total });
  },

  voltarItemCompra: (itemId) => {
    const itemRepo = requireRepo(get()._compraItemRepo, '_compraItemRepo');
    const listaId = get().compraAtivaListaId;
    if (!listaId) throw new Error('CompraAtivaSlice: no active lista');
    itemRepo.desmarcar(itemId);
    const { items, total } = refreshFromRepo(listaId, itemRepo);
    set({ compraAtivaItems: items, compraAtivaTotal: total });
  },

  adicionarUnplannedCompra: (payload) => {
    const itemRepo = requireRepo(get()._compraItemRepo, '_compraItemRepo');
    const listaId = get().compraAtivaListaId;
    if (!listaId) throw new Error('CompraAtivaSlice: no active lista');
    itemRepo.addUnplanned(listaId, payload);
    const { items, total } = refreshFromRepo(listaId, itemRepo);
    set({ compraAtivaItems: items, compraAtivaTotal: total });
  },

  removerUnplannedCompra: (itemId) => {
    const itemRepo = requireRepo(get()._compraItemRepo, '_compraItemRepo');
    const listaId = get().compraAtivaListaId;
    if (!listaId) throw new Error('CompraAtivaSlice: no active lista');
    itemRepo.removeUnplanned(itemId);
    const { items, total } = refreshFromRepo(listaId, itemRepo);
    set({ compraAtivaItems: items, compraAtivaTotal: total });
  },

  editarItemCompra: (itemId, patch) => {
    const itemRepo = requireRepo(get()._compraItemRepo, '_compraItemRepo');
    const listaId = get().compraAtivaListaId;
    if (!listaId) throw new Error('CompraAtivaSlice: no active lista');
    itemRepo.update(itemId, patch);
    const { items, total } = refreshFromRepo(listaId, itemRepo);
    set({ compraAtivaItems: items, compraAtivaTotal: total });
  },

  endCompraAtiva: () => {
    set({
      compraAtivaListaId: null,
      compraAtivaMercadoId: null,
      compraAtivaItems: [],
      compraAtivaTotal: 0,
    });
  },
});
