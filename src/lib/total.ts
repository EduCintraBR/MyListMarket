// Total parcial helper for shopping mode.
// PRD §11.3 — Total = SUM(qtd_comprada × preço_unitario) over status='comprado'.
// Constitution C-7 perf budget: must run under 100 ms for typical lists.

import type { StatusItem } from '@/lib/domain';

export type TotalInput = {
  status: StatusItem;
  quantidadeComprada: number | null;
  precoUnitario: number | null;
};

export const computeTotal = (items: readonly TotalInput[]): number => {
  let sum = 0;
  for (const it of items) {
    if (it.status !== 'comprado') continue;
    if (it.quantidadeComprada == null || it.precoUnitario == null) continue;
    sum += it.quantidadeComprada * it.precoUnitario;
  }
  return sum;
};
