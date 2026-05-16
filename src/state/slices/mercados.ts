import type { StateCreator } from 'zustand';

import type {
  Mercado,
  MercadoCreate,
  MercadoPatch,
  makeMercadoRepo,
} from '@/db/repos/mercadoRepo';

export type MercadoRepo = ReturnType<typeof makeMercadoRepo>;

export type MercadosSlice = {
  mercados: Mercado[];
  mercadosReady: boolean;
  _mercadoRepo: MercadoRepo | null;
  initMercados: (repo: MercadoRepo) => void;
  refreshMercados: () => void;
  createMercado: (input: MercadoCreate) => Mercado;
  updateMercado: (id: string, patch: MercadoPatch) => Mercado;
  archiveMercado: (id: string) => void;
  restoreMercado: (id: string) => void;
};

const requireRepo = (repo: MercadoRepo | null): MercadoRepo => {
  if (!repo) throw new Error('MercadosSlice: repo not initialized — call initMercados first');
  return repo;
};

export const createMercadosSlice: StateCreator<MercadosSlice> = (set, get) => ({
  mercados: [],
  mercadosReady: false,
  _mercadoRepo: null,
  initMercados: (repo) => {
    set({ _mercadoRepo: repo, mercados: repo.list(), mercadosReady: true });
  },
  refreshMercados: () => {
    const repo = requireRepo(get()._mercadoRepo);
    set({ mercados: repo.list() });
  },
  createMercado: (input) => {
    const repo = requireRepo(get()._mercadoRepo);
    const m = repo.create(input);
    set({ mercados: repo.list() });
    return m;
  },
  updateMercado: (id, patch) => {
    const repo = requireRepo(get()._mercadoRepo);
    const m = repo.update(id, patch);
    set({ mercados: repo.list() });
    return m;
  },
  archiveMercado: (id) => {
    const repo = requireRepo(get()._mercadoRepo);
    repo.softDelete(id);
    set({ mercados: repo.list() });
  },
  restoreMercado: (id) => {
    const repo = requireRepo(get()._mercadoRepo);
    repo.restore(id);
    set({ mercados: repo.list() });
  },
});
