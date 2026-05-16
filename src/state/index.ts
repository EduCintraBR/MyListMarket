import { create } from 'zustand';

import { createCompraAtivaSlice, type CompraAtivaSlice } from './slices/compraAtiva';
import { createComprasSlice, type ComprasSlice } from './slices/compras';
import { createListasSlice, type ListasSlice } from './slices/listas';
import { createMercadosSlice, type MercadosSlice } from './slices/mercados';
import { createProdutosSlice, type ProdutosSlice } from './slices/produtos';
import { createSettingsSlice, type SettingsSlice } from './slices/settings';

export type AppState = ListasSlice &
  ProdutosSlice &
  MercadosSlice &
  CompraAtivaSlice &
  ComprasSlice &
  SettingsSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createListasSlice(...a),
  ...createProdutosSlice(...a),
  ...createMercadosSlice(...a),
  ...createCompraAtivaSlice(...a),
  ...createComprasSlice(...a),
  ...createSettingsSlice(...a),
}));
