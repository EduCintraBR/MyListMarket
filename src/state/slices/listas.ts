import type { StateCreator } from 'zustand';

import type {
  ItemListaAdd,
  ItemListaPatch,
  ItemListaWithProduto,
  makeItemListaRepo,
} from '@/db/repos/itemListaRepo';
import type {
  Lista,
  ListaCreate,
  ListaPatch,
  ListaWithCount,
  makeListaRepo,
} from '@/db/repos/listaRepo';

export type ListaRepo = ReturnType<typeof makeListaRepo>;
export type ItemListaRepo = ReturnType<typeof makeItemListaRepo>;

export type ListasSlice = {
  listas: ListaWithCount[];
  itemsByLista: Record<string, ItemListaWithProduto[]>;
  listasReady: boolean;
  _listaRepo: ListaRepo | null;
  _itemListaRepo: ItemListaRepo | null;
  initListas: (listaRepo: ListaRepo, itemListaRepo: ItemListaRepo) => void;
  refreshListas: () => void;
  createLista: (input: ListaCreate) => Lista;
  updateLista: (id: string, patch: ListaPatch) => Lista;
  encerrarLista: (id: string) => Lista;
  softDeleteLista: (id: string) => void;
  refreshItems: (listaId: string) => void;
  addItem: (listaId: string, payload: ItemListaAdd) => void;
  updateItem: (listaId: string, itemId: string, patch: ItemListaPatch) => void;
  removeItem: (listaId: string, itemId: string) => void;
};

const requireRepo = <T>(repo: T | null, name: string): T => {
  if (!repo) throw new Error(`ListasSlice: ${name} not initialized — call initListas first`);
  return repo;
};

export const createListasSlice: StateCreator<ListasSlice> = (set, get) => ({
  listas: [],
  itemsByLista: {},
  listasReady: false,
  _listaRepo: null,
  _itemListaRepo: null,

  initListas: (listaRepo, itemListaRepo) => {
    set({
      _listaRepo: listaRepo,
      _itemListaRepo: itemListaRepo,
      listas: listaRepo.list(),
      listasReady: true,
    });
  },

  refreshListas: () => {
    const repo = requireRepo(get()._listaRepo, '_listaRepo');
    set({ listas: repo.list() });
  },

  createLista: (input) => {
    const repo = requireRepo(get()._listaRepo, '_listaRepo');
    const l = repo.create(input);
    set({ listas: repo.list() });
    return l;
  },

  updateLista: (id, patch) => {
    const repo = requireRepo(get()._listaRepo, '_listaRepo');
    const l = repo.update(id, patch);
    set({ listas: repo.list() });
    return l;
  },

  encerrarLista: (id) => {
    const repo = requireRepo(get()._listaRepo, '_listaRepo');
    const l = repo.encerrar(id);
    set({ listas: repo.list() });
    return l;
  },

  softDeleteLista: (id) => {
    const repo = requireRepo(get()._listaRepo, '_listaRepo');
    repo.softDelete(id);
    set({ listas: repo.list() });
  },

  refreshItems: (listaId) => {
    const repo = requireRepo(get()._itemListaRepo, '_itemListaRepo');
    set((s) => ({ itemsByLista: { ...s.itemsByLista, [listaId]: repo.list(listaId) } }));
  },

  addItem: (listaId, payload) => {
    const itemRepo = requireRepo(get()._itemListaRepo, '_itemListaRepo');
    const listaRepo = requireRepo(get()._listaRepo, '_listaRepo');
    itemRepo.add(listaId, payload);
    set((s) => ({
      itemsByLista: { ...s.itemsByLista, [listaId]: itemRepo.list(listaId) },
      listas: listaRepo.list(),
    }));
  },

  updateItem: (listaId, itemId, patch) => {
    const itemRepo = requireRepo(get()._itemListaRepo, '_itemListaRepo');
    itemRepo.update(itemId, patch);
    set((s) => ({
      itemsByLista: { ...s.itemsByLista, [listaId]: itemRepo.list(listaId) },
    }));
  },

  removeItem: (listaId, itemId) => {
    const itemRepo = requireRepo(get()._itemListaRepo, '_itemListaRepo');
    const listaRepo = requireRepo(get()._listaRepo, '_listaRepo');
    itemRepo.remove(itemId);
    set((s) => ({
      itemsByLista: { ...s.itemsByLista, [listaId]: itemRepo.list(listaId) },
      listas: listaRepo.list(),
    }));
  },
});
