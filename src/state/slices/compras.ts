import type { StateCreator } from 'zustand';

import type {
  Compra,
  CompraDetail,
  CompraSummary,
  makeCompraRepo,
} from '@/db/repos/compraRepo';
import type { Lista, makeListaRepo } from '@/db/repos/listaRepo';
import type { FormaPagamento } from '@/lib/domain';

import type { CompraAtivaSlice } from './compraAtiva';
import type { ListasSlice } from './listas';

export type CompraRepo = ReturnType<typeof makeCompraRepo>;
type ListaRepo = ReturnType<typeof makeListaRepo>;

export type ConcluirCompraInput = {
  mercadoId: string;
  formaPagamento: FormaPagamento;
  totalReal: number | null;
  fotoCupomPath: string | null;
};

export type ComprasSlice = {
  compras: CompraSummary[];
  comprasReady: boolean;

  draftMercadoId: string | null;
  draftFormaPagamento: FormaPagamento | null;
  draftTotalReal: number | null;
  draftFotoCupomPath: string | null;

  _compraRepo: CompraRepo | null;
  _comprasListaRepo: ListaRepo | null;

  initCompras: (compraRepo: CompraRepo, listaRepo: ListaRepo) => void;
  refreshCompras: () => void;
  softDeleteCompra: (id: string) => void;
  getCompraDetail: (id: string) => CompraDetail | undefined;

  setDraftMercado: (id: string | null) => void;
  setDraftFormaPagamento: (fp: FormaPagamento | null) => void;
  setDraftTotalReal: (n: number | null) => void;
  setDraftFotoCupomPath: (p: string | null) => void;
  resetCheckoutDraft: () => void;

  concluirCompra: (input: ConcluirCompraInput) => Compra;
  clonarPendentesDraft: (sourceListaId: string) => Lista;
};

const requireRepo = <T>(repo: T | null, name: string): T => {
  if (!repo) throw new Error(`ComprasSlice: ${name} not initialized — call initCompras first`);
  return repo;
};

type FullStore = ComprasSlice & ListasSlice & CompraAtivaSlice;

export const createComprasSlice: StateCreator<ComprasSlice> = (set, get) => ({
  compras: [],
  comprasReady: false,

  draftMercadoId: null,
  draftFormaPagamento: null,
  draftTotalReal: null,
  draftFotoCupomPath: null,

  _compraRepo: null,
  _comprasListaRepo: null,

  initCompras: (compraRepo, listaRepo) => {
    set({
      _compraRepo: compraRepo,
      _comprasListaRepo: listaRepo,
      compras: compraRepo.list({}),
      comprasReady: true,
    });
  },

  refreshCompras: () => {
    const repo = requireRepo(get()._compraRepo, '_compraRepo');
    set({ compras: repo.list({}) });
  },

  softDeleteCompra: (id) => {
    const repo = requireRepo(get()._compraRepo, '_compraRepo');
    repo.softDelete(id);
    set({ compras: repo.list({}) });
  },

  getCompraDetail: (id) => {
    const repo = requireRepo(get()._compraRepo, '_compraRepo');
    return repo.byId(id);
  },

  setDraftMercado: (id) => set({ draftMercadoId: id }),
  setDraftFormaPagamento: (fp) => set({ draftFormaPagamento: fp }),
  setDraftTotalReal: (n) => set({ draftTotalReal: n }),
  setDraftFotoCupomPath: (p) => set({ draftFotoCupomPath: p }),

  resetCheckoutDraft: () => {
    set({
      draftMercadoId: null,
      draftFormaPagamento: null,
      draftTotalReal: null,
      draftFotoCupomPath: null,
    });
  },

  concluirCompra: (input) => {
    const compraRepo = requireRepo(get()._compraRepo, '_compraRepo');
    const full = get() as unknown as FullStore;
    const listaId = full.compraAtivaListaId;
    if (!listaId) throw new Error('concluirCompra: no active lista');

    const compra = compraRepo.create({
      listaId,
      mercadoId: input.mercadoId,
      formaPagamento: input.formaPagamento,
      totalReal: input.totalReal,
      fotoCupomPath: input.fotoCupomPath,
    });

    const listaRepo = requireRepo(get()._comprasListaRepo, '_comprasListaRepo');
    set({
      compras: compraRepo.list({}),
      draftMercadoId: null,
      draftFormaPagamento: null,
      draftTotalReal: null,
      draftFotoCupomPath: null,
    });
    full.endCompraAtiva();
    // Refresh listas list since its status changed (cross-slice write).
    (set as unknown as (s: Partial<FullStore>) => void)({ listas: listaRepo.list() });

    return compra;
  },

  clonarPendentesDraft: (sourceListaId) => {
    const listaRepo = requireRepo(get()._comprasListaRepo, '_comprasListaRepo');
    const nova = listaRepo.clonarPendentes(sourceListaId);
    (set as unknown as (s: Partial<FullStore>) => void)({ listas: listaRepo.list() });
    return nova;
  },
});
