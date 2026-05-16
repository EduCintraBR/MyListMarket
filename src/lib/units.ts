import { FAMILIA_DE, type FamiliaUnidade, type UnidadeMedida } from '@/lib/domain';

export const BASE_DE: Record<FamiliaUnidade, UnidadeMedida> = {
  peso: 'kg',
  volume: 'L',
  unitario: 'un',
};

export type ToBaseResult = { familia: FamiliaUnidade; value: number };

export const toBase = (qtd: number, unidade: UnidadeMedida | null): ToBaseResult => {
  if (unidade === null) return { familia: 'unitario', value: qtd };
  const familia = FAMILIA_DE[unidade];
  if (unidade === 'g') return { familia: 'peso', value: qtd / 1000 };
  if (unidade === 'mL') return { familia: 'volume', value: qtd / 1000 };
  return { familia, value: qtd };
};

export type AggregateInput = { quantidade: number | null; unidade: UnidadeMedida | null };

export type AggregateRow = {
  familia: FamiliaUnidade;
  total: number;
  unidadeBase: UnidadeMedida;
};

export const aggregateQuantity = (items: AggregateInput[]): AggregateRow[] => {
  const sums = new Map<FamiliaUnidade, number>();
  for (const it of items) {
    if (it.quantidade === null || it.quantidade === 0) continue;
    const { familia, value } = toBase(it.quantidade, it.unidade);
    sums.set(familia, (sums.get(familia) ?? 0) + value);
  }
  return Array.from(sums.entries()).map(([familia, total]) => ({
    familia,
    total,
    unidadeBase: BASE_DE[familia],
  }));
};
