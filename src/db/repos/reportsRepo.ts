import { and, between, desc, eq, isNull, sql } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import { compras, itensLista, mercados, produtos } from '@/db/schema';
import * as schema from '@/db/schema';
import type { FamiliaUnidade, FormaPagamento, UnidadeMedida } from '@/lib/domain';
import { aggregateQuantity } from '@/lib/units';

type DB = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export type DateRange = { from: number; to: number };
export type BucketGranularity = 'day' | 'week' | 'month' | 'year';

export type GastoBucket = { bucket: string; total: number };
export type GastoPorMercadoRow = {
  mercadoId: string;
  mercadoNome: string;
  mercadoArquivado: boolean;
  total: number;
  numCompras: number;
  ticketMedio: number;
};
export type TopProdutoFreqRow = {
  produtoId: string;
  produtoNome: string;
  numCompras: number;
};
export type TopProdutoQtdRow = {
  produtoId: string;
  produtoNome: string;
  familia: FamiliaUnidade;
  total: number;
  unidadeBase: UnidadeMedida;
};
export type TopProdutoValorRow = {
  produtoId: string;
  produtoNome: string;
  total: number;
};
export type VariacaoPrecoRow = {
  dataHora: number;
  precoUnitario: number;
  quantidadeComprada: number;
  mercadoId: string;
  mercadoNome: string;
};
export type FormasPagamentoRow = {
  formaPagamento: FormaPagamento;
  total: number;
  numCompras: number;
  pct: number;
};
export type ReconciliacaoSummary = {
  avgDiff: number | null;
  avgPct: number | null;
  numCompras: number;
};
export type ForaDaListaSummary = {
  numItens: number;
  totalValor: number;
  pctValor: number;
};
export type ListasIncompletasSummary = {
  numCompras: number;
  totalCompras: number;
  pct: number;
};

const BUCKET_FMT: Record<BucketGranularity, string> = {
  day: '%Y-%m-%d',
  week: '%Y-%W',
  month: '%Y-%m',
  year: '%Y',
};

const rangeCondition = (r: DateRange) => between(compras.dataHora, r.from, r.to);
const liveCompras = (r: DateRange) => and(isNull(compras.excluidoEm), rangeCondition(r));

export const makeReportsRepo = (db: DB) => {
  const gastoPorPeriodo = (r: DateRange, bucket: BucketGranularity): GastoBucket[] => {
    const fmt = BUCKET_FMT[bucket];
    const rows = db
      .select({
        bucket: sql<string>`strftime(${fmt}, ${compras.dataHora} / 1000, 'unixepoch')`.as(
          'bucket',
        ),
        total: sql<number>`SUM(${compras.totalCalculado})`.as('total'),
      })
      .from(compras)
      .where(liveCompras(r))
      .groupBy(sql`bucket`)
      .orderBy(sql`bucket`)
      .all();
    return rows.map((row) => ({ bucket: row.bucket, total: row.total ?? 0 }));
  };

  const gastoPorMercado = (r: DateRange): GastoPorMercadoRow[] => {
    const rows = db
      .select({
        mercadoId: compras.mercadoId,
        mercadoNome: mercados.nome,
        mercadoArquivado: sql<number>`CASE WHEN ${mercados.excluidoEm} IS NULL THEN 0 ELSE 1 END`,
        total: sql<number>`SUM(${compras.totalCalculado})`,
        numCompras: sql<number>`COUNT(*)`,
      })
      .from(compras)
      .innerJoin(mercados, eq(mercados.id, compras.mercadoId))
      .where(liveCompras(r))
      .groupBy(compras.mercadoId)
      .all();
    return rows.map((row) => ({
      mercadoId: row.mercadoId,
      mercadoNome: row.mercadoNome,
      mercadoArquivado: row.mercadoArquivado === 1,
      total: row.total ?? 0,
      numCompras: row.numCompras,
      ticketMedio: row.numCompras > 0 ? (row.total ?? 0) / row.numCompras : 0,
    }));
  };

  const topProdutosFreq = (r: DateRange, limit = 10): TopProdutoFreqRow[] => {
    const rows = db
      .select({
        produtoId: itensLista.produtoId,
        produtoNome: produtos.nome,
        numCompras: sql<number>`COUNT(DISTINCT ${compras.id})`,
      })
      .from(compras)
      .innerJoin(itensLista, eq(itensLista.listaId, compras.listaId))
      .innerJoin(produtos, eq(produtos.id, itensLista.produtoId))
      .where(and(liveCompras(r), eq(itensLista.status, 'comprado')))
      .groupBy(itensLista.produtoId)
      .orderBy(desc(sql`COUNT(DISTINCT ${compras.id})`))
      .limit(limit)
      .all();
    return rows.map((row) => ({
      produtoId: row.produtoId,
      produtoNome: row.produtoNome,
      numCompras: row.numCompras,
    }));
  };

  const topProdutosQtd = (r: DateRange, limit = 10): TopProdutoQtdRow[] => {
    const rows = db
      .select({
        produtoId: itensLista.produtoId,
        produtoNome: produtos.nome,
        quantidadeComprada: itensLista.quantidadeComprada,
        unidade: itensLista.unidade,
      })
      .from(compras)
      .innerJoin(itensLista, eq(itensLista.listaId, compras.listaId))
      .innerJoin(produtos, eq(produtos.id, itensLista.produtoId))
      .where(and(liveCompras(r), eq(itensLista.status, 'comprado')))
      .all();

    const groups = new Map<
      string,
      { produtoNome: string; items: { quantidade: number | null; unidade: UnidadeMedida | null }[] }
    >();
    for (const r of rows) {
      const g = groups.get(r.produtoId) ?? { produtoNome: r.produtoNome, items: [] };
      g.items.push({ quantidade: r.quantidadeComprada, unidade: r.unidade });
      groups.set(r.produtoId, g);
    }

    const out: TopProdutoQtdRow[] = [];
    for (const [produtoId, g] of groups) {
      const agg = aggregateQuantity(g.items);
      for (const a of agg) {
        out.push({
          produtoId,
          produtoNome: g.produtoNome,
          familia: a.familia,
          total: a.total,
          unidadeBase: a.unidadeBase,
        });
      }
    }
    out.sort((a, b) => b.total - a.total);
    return out.slice(0, limit);
  };

  const topProdutosValor = (r: DateRange, limit = 10): TopProdutoValorRow[] => {
    const rows = db
      .select({
        produtoId: itensLista.produtoId,
        produtoNome: produtos.nome,
        total: sql<number>`SUM(${itensLista.quantidadeComprada} * ${itensLista.precoUnitario})`,
      })
      .from(compras)
      .innerJoin(itensLista, eq(itensLista.listaId, compras.listaId))
      .innerJoin(produtos, eq(produtos.id, itensLista.produtoId))
      .where(and(liveCompras(r), eq(itensLista.status, 'comprado')))
      .groupBy(itensLista.produtoId)
      .orderBy(desc(sql`SUM(${itensLista.quantidadeComprada} * ${itensLista.precoUnitario})`))
      .limit(limit)
      .all();
    return rows.map((row) => ({
      produtoId: row.produtoId,
      produtoNome: row.produtoNome,
      total: row.total ?? 0,
    }));
  };

  const variacaoPreco = (produtoId: string, r: DateRange): VariacaoPrecoRow[] => {
    const rows = db
      .select({
        dataHora: compras.dataHora,
        precoUnitario: itensLista.precoUnitario,
        quantidadeComprada: itensLista.quantidadeComprada,
        mercadoId: compras.mercadoId,
        mercadoNome: mercados.nome,
      })
      .from(compras)
      .innerJoin(itensLista, eq(itensLista.listaId, compras.listaId))
      .innerJoin(mercados, eq(mercados.id, compras.mercadoId))
      .where(
        and(
          liveCompras(r),
          eq(itensLista.status, 'comprado'),
          eq(itensLista.produtoId, produtoId),
        ),
      )
      .orderBy(compras.dataHora)
      .all();
    return rows
      .filter(
        (row): row is typeof row & { precoUnitario: number; quantidadeComprada: number } =>
          row.precoUnitario !== null && row.quantidadeComprada !== null,
      )
      .map((row) => ({
        dataHora: row.dataHora,
        precoUnitario: row.precoUnitario,
        quantidadeComprada: row.quantidadeComprada,
        mercadoId: row.mercadoId,
        mercadoNome: row.mercadoNome,
      }));
  };

  const formasPagamento = (r: DateRange): FormasPagamentoRow[] => {
    const rows = db
      .select({
        formaPagamento: compras.formaPagamento,
        total: sql<number>`SUM(${compras.totalCalculado})`,
        numCompras: sql<number>`COUNT(*)`,
      })
      .from(compras)
      .where(liveCompras(r))
      .groupBy(compras.formaPagamento)
      .all();

    const grandTotal = rows.reduce((acc, x) => acc + (x.total ?? 0), 0);
    return rows.map((row) => ({
      formaPagamento: row.formaPagamento as FormaPagamento,
      total: row.total ?? 0,
      numCompras: row.numCompras,
      pct: grandTotal > 0 ? (row.total ?? 0) / grandTotal : 0,
    }));
  };

  const reconciliacao = (r: DateRange): ReconciliacaoSummary => {
    const rows = db
      .select({
        totalCalculado: compras.totalCalculado,
        totalReal: compras.totalReal,
      })
      .from(compras)
      .where(liveCompras(r))
      .all();
    const withReal = rows.filter((x) => x.totalReal != null);
    if (withReal.length === 0) {
      return { avgDiff: null, avgPct: null, numCompras: 0 };
    }
    const diffs = withReal.map((x) => (x.totalReal as number) - x.totalCalculado);
    const pcts = withReal.map(
      (x) =>
        x.totalCalculado > 0
          ? ((x.totalReal as number) - x.totalCalculado) / x.totalCalculado
          : 0,
    );
    const avg = (arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length;
    return {
      avgDiff: avg(diffs),
      avgPct: avg(pcts),
      numCompras: withReal.length,
    };
  };

  const foraDaLista = (r: DateRange): ForaDaListaSummary => {
    const items = db
      .select({
        origem: itensLista.origem,
        quantidadeComprada: itensLista.quantidadeComprada,
        precoUnitario: itensLista.precoUnitario,
        status: itensLista.status,
      })
      .from(compras)
      .innerJoin(itensLista, eq(itensLista.listaId, compras.listaId))
      .where(and(liveCompras(r), eq(itensLista.status, 'comprado')))
      .all();

    let numItens = 0;
    let totalValor = 0;
    let grandTotal = 0;
    for (const it of items) {
      const valor = (it.quantidadeComprada ?? 0) * (it.precoUnitario ?? 0);
      grandTotal += valor;
      if (it.origem === 'compra') {
        numItens += 1;
        totalValor += valor;
      }
    }
    return {
      numItens,
      totalValor,
      pctValor: grandTotal > 0 ? totalValor / grandTotal : 0,
    };
  };

  const listasIncompletas = (r: DateRange): ListasIncompletasSummary => {
    const total = db
      .select({ id: compras.id, listaId: compras.listaId })
      .from(compras)
      .where(liveCompras(r))
      .all();
    let pendentes = 0;
    for (const c of total) {
      const hasPendente = db
        .select({ id: itensLista.id })
        .from(itensLista)
        .where(and(eq(itensLista.listaId, c.listaId), sql`${itensLista.status} != 'comprado'`))
        .get();
      if (hasPendente) pendentes += 1;
    }
    return {
      numCompras: pendentes,
      totalCompras: total.length,
      pct: total.length > 0 ? pendentes / total.length : 0,
    };
  };

  const ticketMedio = (
    r: DateRange,
    opts: { mercadoId?: string } = {},
  ): { ticketMedio: number; numCompras: number } => {
    const conds = [liveCompras(r)];
    if (opts.mercadoId) conds.push(eq(compras.mercadoId, opts.mercadoId));
    const rows = db
      .select({
        avg: sql<number>`AVG(${compras.totalCalculado})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(compras)
      .where(and(...conds))
      .all();
    const r0 = rows[0];
    return {
      ticketMedio: r0?.avg ?? 0,
      numCompras: r0?.count ?? 0,
    };
  };

  return {
    gastoPorPeriodo,
    gastoPorMercado,
    topProdutosFreq,
    topProdutosQtd,
    topProdutosValor,
    variacaoPreco,
    formasPagamento,
    reconciliacao,
    foraDaLista,
    listasIncompletas,
    ticketMedio,
  };
};

export type ReportsRepo = ReturnType<typeof makeReportsRepo>;
