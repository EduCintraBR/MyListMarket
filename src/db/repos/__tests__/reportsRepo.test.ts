import { eq } from 'drizzle-orm';

import { makeCompraRepo } from '@/db/repos/compraRepo';
import { makeItemListaRepo } from '@/db/repos/itemListaRepo';
import { makeListaRepo } from '@/db/repos/listaRepo';
import { makeMercadoRepo } from '@/db/repos/mercadoRepo';
import { makeReportsRepo, type ReportsRepo } from '@/db/repos/reportsRepo';
import { compras as comprasTable } from '@/db/schema';
import { createTestDb, type TestDb } from '@/db/testDb';

type Seeded = {
  db: TestDb;
  close: () => void;
  reports: ReportsRepo;
  mercadoA: string;
  mercadoB: string;
  produtoArroz: string;
  produtoBanana: string;
  range: { from: number; to: number };
};

const seed = (): Seeded => {
  const t = createTestDb();
  const listaRepo = makeListaRepo(t.db);
  const itemRepo = makeItemListaRepo(t.db);
  const mercadoRepo = makeMercadoRepo(t.db);
  const compraRepo = makeCompraRepo(t.db);
  const reports = makeReportsRepo(t.db);

  const mercadoA = mercadoRepo.create({ nome: 'Mercado A' });
  const mercadoB = mercadoRepo.create({ nome: 'Mercado B' });

  // Compra 1 — Mercado A, pix, total = 2 * 5 + 1 * 3 = 13, totalReal = 14
  const l1 = listaRepo.create({ nome: 'L1' });
  const a1 = itemRepo.add(l1.id, { nome: 'Arroz', unidade: 'kg' });
  const b1 = itemRepo.add(l1.id, { nome: 'Banana', unidade: 'un' });
  itemRepo.marcarComprado(a1.id, { qtd: 2, preco: 5 });
  itemRepo.marcarComprado(b1.id, { qtd: 1, preco: 3 });
  listaRepo.iniciarCompra(l1.id);
  const c1 = compraRepo.create({
    listaId: l1.id,
    mercadoId: mercadoA.id,
    formaPagamento: 'pix',
    totalReal: 14,
    fotoCupomPath: null,
  });

  // Compra 2 — Mercado B, dinheiro, total = 1 * 4 + unplanned (origem=compra) 1 * 2 = 6, no totalReal
  const l2 = listaRepo.create({ nome: 'L2' });
  const a2 = itemRepo.add(l2.id, { nome: 'Arroz', unidade: 'kg' });
  itemRepo.marcarComprado(a2.id, { qtd: 1, preco: 4 });
  listaRepo.iniciarCompra(l2.id);
  itemRepo.addUnplanned(l2.id, {
    nome: 'Refrigerante',
    quantidadeComprada: 1,
    precoUnitario: 2,
  });
  const c2 = compraRepo.create({
    listaId: l2.id,
    mercadoId: mercadoB.id,
    formaPagamento: 'dinheiro',
    totalReal: null,
    fotoCupomPath: null,
  });

  // Compra 3 — Mercado A, pix, total = 0.5 * 8 = 4. Lista has one pendente (incomplete).
  const l3 = listaRepo.create({ nome: 'L3' });
  const a3 = itemRepo.add(l3.id, { nome: 'Arroz', unidade: 'g' });
  itemRepo.add(l3.id, { nome: 'Banana', unidade: 'un' }); // left pendente
  itemRepo.marcarComprado(a3.id, { qtd: 500, preco: 0.008 }); // 500g * 0.008 = 4
  listaRepo.iniciarCompra(l3.id);
  const c3 = compraRepo.create({
    listaId: l3.id,
    mercadoId: mercadoA.id,
    formaPagamento: 'pix',
    totalReal: 9,
    fotoCupomPath: null,
  });

  // Backdate compras so we can test month/period filters.
  // c1 = 2 months ago, c2 = 1 month ago, c3 = today.
  const now = Date.now();
  const month = 30 * 24 * 60 * 60 * 1000;
  const stamp = (id: string, when: number): void => {
    t.db.update(comprasTable).set({ dataHora: when }).where(eq(comprasTable.id, id)).run();
  };
  stamp(c1.id, now - 2 * month);
  stamp(c2.id, now - 1 * month);
  stamp(c3.id, now);

  return {
    db: t.db,
    close: t.close,
    reports,
    mercadoA: mercadoA.id,
    mercadoB: mercadoB.id,
    produtoArroz: a1.produtoId,
    produtoBanana: b1.produtoId,
    range: { from: 0, to: now + month },
  };
};

describe('reportsRepo', () => {
  it('gastoPorPeriodo (month) returns one bucket per distinct month with summed totals', () => {
    const s = seed();
    const buckets = s.reports.gastoPorPeriodo(s.range, 'month');
    const totalSum = buckets.reduce((a, b) => a + b.total, 0);
    expect(totalSum).toBeCloseTo(13 + 6 + 4, 5);
    expect(buckets.length).toBeGreaterThanOrEqual(2);
    s.close();
  });

  it('gastoPorMercado returns per-market totals + tickets', () => {
    const s = seed();
    const rows = s.reports.gastoPorMercado(s.range);
    const byId = Object.fromEntries(rows.map((r) => [r.mercadoId, r]));
    expect(byId[s.mercadoA]?.total).toBeCloseTo(17); // 13 + 4
    expect(byId[s.mercadoA]?.numCompras).toBe(2);
    expect(byId[s.mercadoA]?.ticketMedio).toBeCloseTo(8.5);
    expect(byId[s.mercadoB]?.total).toBeCloseTo(6);
    s.close();
  });

  it('topProdutosFreq counts distinct compras per produto', () => {
    const s = seed();
    const rows = s.reports.topProdutosFreq(s.range);
    const arroz = rows.find((r) => r.produtoId === s.produtoArroz);
    const banana = rows.find((r) => r.produtoId === s.produtoBanana);
    expect(arroz?.numCompras).toBe(3); // Arroz comprado em 3 compras
    expect(banana?.numCompras).toBe(1); // Banana comprado em 1 (a3 left it pendente)
    s.close();
  });

  it('topProdutosQtd aggregates with unit normalization (kg + g → kg)', () => {
    const s = seed();
    const rows = s.reports.topProdutosQtd(s.range);
    const arrozPeso = rows.find(
      (r) => r.produtoId === s.produtoArroz && r.familia === 'peso',
    );
    expect(arrozPeso?.total).toBeCloseTo(2 + 1 + 0.5, 5); // 2kg + 1kg + 500g
    expect(arrozPeso?.unidadeBase).toBe('kg');
    s.close();
  });

  it('topProdutosValor sums qty * preço per produto', () => {
    const s = seed();
    const rows = s.reports.topProdutosValor(s.range);
    const arroz = rows.find((r) => r.produtoId === s.produtoArroz);
    expect(arroz?.total).toBeCloseTo(2 * 5 + 1 * 4 + 500 * 0.008, 5);
    s.close();
  });

  it('variacaoPreco returns sorted price history per produto', () => {
    const s = seed();
    const rows = s.reports.variacaoPreco(s.produtoArroz, s.range);
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.dataHora)).toEqual([...rows.map((r) => r.dataHora)].sort());
    expect(rows.map((r) => r.precoUnitario)).toEqual([5, 4, 0.008]);
    s.close();
  });

  it('formasPagamento returns pie data with pct', () => {
    const s = seed();
    const rows = s.reports.formasPagamento(s.range);
    const pix = rows.find((r) => r.formaPagamento === 'pix');
    const dinheiro = rows.find((r) => r.formaPagamento === 'dinheiro');
    expect(pix?.total).toBeCloseTo(13 + 4);
    expect(dinheiro?.total).toBeCloseTo(6);
    expect(rows.reduce((a, x) => a + x.pct, 0)).toBeCloseTo(1, 5);
    s.close();
  });

  it('reconciliacao averages diff/pct over compras with totalReal', () => {
    const s = seed();
    const rec = s.reports.reconciliacao(s.range);
    expect(rec.numCompras).toBe(2); // c1 and c3
    expect(rec.avgDiff).toBeCloseTo(((14 - 13) + (9 - 4)) / 2, 5); // 3
    s.close();
  });

  it('reconciliacao returns nulls when no totalReal informed', () => {
    const t = createTestDb();
    const reports = makeReportsRepo(t.db);
    const rec = reports.reconciliacao({ from: 0, to: Date.now() });
    expect(rec.avgDiff).toBeNull();
    expect(rec.avgPct).toBeNull();
    expect(rec.numCompras).toBe(0);
    t.close();
  });

  it('foraDaLista counts items with origem=compra and their value share', () => {
    const s = seed();
    const f = s.reports.foraDaLista(s.range);
    expect(f.numItens).toBe(1); // refrigerante
    expect(f.totalValor).toBeCloseTo(2);
    expect(f.pctValor).toBeCloseTo(2 / (13 + 6 + 4), 5);
    s.close();
  });

  it('listasIncompletas counts compras with pendentes', () => {
    const s = seed();
    const li = s.reports.listasIncompletas(s.range);
    expect(li.totalCompras).toBe(3);
    expect(li.numCompras).toBe(1); // só c3 ficou incompleta
    expect(li.pct).toBeCloseTo(1 / 3, 5);
    s.close();
  });

  it('ticketMedio: overall and per mercado', () => {
    const s = seed();
    const overall = s.reports.ticketMedio(s.range);
    expect(overall.ticketMedio).toBeCloseTo((13 + 6 + 4) / 3, 5);
    expect(overall.numCompras).toBe(3);

    const mA = s.reports.ticketMedio(s.range, { mercadoId: s.mercadoA });
    expect(mA.ticketMedio).toBeCloseTo(8.5, 5);
    expect(mA.numCompras).toBe(2);
    s.close();
  });

  it('excludes soft-deleted compras from all reports', () => {
    const s = seed();
    // Soft-delete c1 (mercado A 13)
    const compraRepo = makeCompraRepo(s.db);
    const compraList = compraRepo.list({});
    const target = compraList.find((c) => c.totalCalculado === 13);
    if (!target) throw new Error('expected c1');
    compraRepo.softDelete(target.id);

    const buckets = s.reports.gastoPorPeriodo(s.range, 'month');
    const total = buckets.reduce((a, b) => a + b.total, 0);
    expect(total).toBeCloseTo(6 + 4); // c1 gone

    const rec = s.reports.reconciliacao(s.range);
    expect(rec.numCompras).toBe(1); // only c3 left with totalReal
    s.close();
  });
});
