// Domain enums — string literal unions per Directives §2.1
// Source: specs/_shared/data-model.md

export type FormaPagamento =
  | 'cartao_credito'
  | 'cartao_debito'
  | 'dinheiro'
  | 'pix'
  | 'vale_alimentacao';

export type UnidadeMedida = 'un' | 'kg' | 'g' | 'L' | 'mL' | 'pct' | 'cx';

export type FamiliaUnidade = 'peso' | 'volume' | 'unitario';

export const FAMILIA_DE: Record<UnidadeMedida, FamiliaUnidade> = {
  kg: 'peso',
  g: 'peso',
  L: 'volume',
  mL: 'volume',
  un: 'unitario',
  pct: 'unitario',
  cx: 'unitario',
};

export type StatusLista = 'planejamento' | 'em_compra' | 'finalizada' | 'encerrada';

export type StatusItem = 'a_comprar' | 'comprado' | 'nao_comprado';

export type OrigemItem = 'lista' | 'compra';
