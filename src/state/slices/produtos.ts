import type { StateCreator } from 'zustand';

import type { Produto, ProdutoPatch, makeProdutoRepo } from '@/db/repos/produtoRepo';

export type ProdutoRepo = ReturnType<typeof makeProdutoRepo>;

export type ProdutosSlice = {
  produtos: Produto[];
  produtosReady: boolean;
  _produtoRepo: ProdutoRepo | null;
  initProdutos: (repo: ProdutoRepo) => void;
  refreshProdutos: () => void;
  getOrCreateProduto: (nome: string) => Produto;
  updateProduto: (id: string, patch: ProdutoPatch) => Produto;
  archiveProduto: (id: string) => void;
};

const requireRepo = (repo: ProdutoRepo | null): ProdutoRepo => {
  if (!repo) throw new Error('ProdutosSlice: repo not initialized — call initProdutos first');
  return repo;
};

export const createProdutosSlice: StateCreator<ProdutosSlice> = (set, get) => ({
  produtos: [],
  produtosReady: false,
  _produtoRepo: null,
  initProdutos: (repo) => {
    set({ _produtoRepo: repo, produtos: repo.list(), produtosReady: true });
  },
  refreshProdutos: () => {
    const repo = requireRepo(get()._produtoRepo);
    set({ produtos: repo.list() });
  },
  getOrCreateProduto: (nome) => {
    const repo = requireRepo(get()._produtoRepo);
    const p = repo.getOrCreate(nome);
    set({ produtos: repo.list() });
    return p;
  },
  updateProduto: (id, patch) => {
    const repo = requireRepo(get()._produtoRepo);
    const p = repo.update(id, patch);
    set({ produtos: repo.list() });
    return p;
  },
  archiveProduto: (id) => {
    const repo = requireRepo(get()._produtoRepo);
    repo.softDelete(id);
    set({ produtos: repo.list() });
  },
});
