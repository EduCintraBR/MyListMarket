import { makeCompraRepo, type CompraRepo } from '@/db/repos/compraRepo';
import { makeItemListaRepo } from '@/db/repos/itemListaRepo';
import { makeListaRepo, type ListaRepo } from '@/db/repos/listaRepo';
import { makeMercadoRepo } from '@/db/repos/mercadoRepo';
import { mercados as mercadosTable } from '@/db/schema';
import { createTestDb, type TestDb } from '@/db/testDb';

const setup = (): {
  db: TestDb;
  close: () => void;
  listaRepo: ListaRepo;
  compraRepo: CompraRepo;
} => {
  const t = createTestDb();
  const listaRepo = makeListaRepo(t.db);
  const itemRepo = makeItemListaRepo(t.db);
  const mercadoRepo = makeMercadoRepo(t.db);
  const compraRepo = makeCompraRepo(t.db);

  // Seed lista in em_compra with two comprado items, total = 2*3.5 + 1*4 = 11.
  const l = listaRepo.create({ nome: 'Compra Teste' });
  const a = itemRepo.add(l.id, { nome: 'Arroz' });
  const b = itemRepo.add(l.id, { nome: 'Pão' });
  itemRepo.marcarComprado(a.id, { qtd: 2, preco: 3.5 });
  itemRepo.marcarComprado(b.id, { qtd: 1, preco: 4 });
  listaRepo.iniciarCompra(l.id);

  // Seed mercado
  const m = mercadoRepo.create({ nome: 'Carrefour' });
  void m;

  return { db: t.db, close: t.close, listaRepo, compraRepo };
};

describe('compraRepo', () => {
  it('create persists compra row + total_calculado from current items + flips lista to finalizada', () => {
    const { close, listaRepo, compraRepo, db } = setup();
    const lista = listaRepo.list({ includeDeleted: true })[0];
    const mercado = db.select().from(mercadosTable).all()[0] as { id: string };
    if (!lista || !mercado) throw new Error('seed bug');

    const compra = compraRepo.create({
      listaId: lista.id,
      mercadoId: mercado.id,
      formaPagamento: 'pix',
      totalReal: 12.5,
      fotoCupomPath: null,
    });

    expect(compra.totalCalculado).toBe(11);
    expect(compra.totalReal).toBe(12.5);
    expect(compra.formaPagamento).toBe('pix');
    expect(compra.dataHora).toBeGreaterThan(0);

    const refreshed = listaRepo.byId(lista.id);
    expect(refreshed?.status).toBe('finalizada');
    expect(refreshed?.finalizadaEm).not.toBeNull();
    close();
  });

  it('create fails when lista not in em_compra', () => {
    const { close, listaRepo, compraRepo, db } = setup();
    const lista = listaRepo.list()[0];
    const mercado = db.select().from(mercadosTable).all()[0] as { id: string };
    if (!lista || !mercado) throw new Error('seed bug');

    // Force lista back to planejamento
    listaRepo.update(lista.id, { status: 'planejamento' });

    expect(() =>
      compraRepo.create({
        listaId: lista.id,
        mercadoId: mercado.id,
        formaPagamento: 'pix',
        totalReal: null,
        fotoCupomPath: null,
      }),
    ).toThrow(/em_compra/);
    close();
  });

  it('list returns compras newest-first w/ mercadoNome and excludes soft-deleted', () => {
    const { close, listaRepo, compraRepo, db } = setup();
    const lista = listaRepo.list()[0];
    const mercado = db.select().from(mercadosTable).all()[0] as { id: string };
    if (!lista || !mercado) throw new Error('seed bug');

    const c = compraRepo.create({
      listaId: lista.id,
      mercadoId: mercado.id,
      formaPagamento: 'dinheiro',
      totalReal: null,
      fotoCupomPath: null,
    });

    const rows = compraRepo.list({});
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(c.id);
    expect(rows[0]?.mercadoNome).toBe('Carrefour');
    expect(rows[0]?.mercadoArquivado).toBe(false);

    compraRepo.softDelete(c.id);
    expect(compraRepo.list({})).toHaveLength(0);
    close();
  });

  it('list filters by mercadoId and by month (YYYY-MM)', () => {
    const { close, listaRepo, compraRepo, db } = setup();
    const lista = listaRepo.list()[0];
    const mercado = db.select().from(mercadosTable).all()[0] as { id: string };
    if (!lista || !mercado) throw new Error('seed bug');

    const c = compraRepo.create({
      listaId: lista.id,
      mercadoId: mercado.id,
      formaPagamento: 'cartao_credito',
      totalReal: null,
      fotoCupomPath: null,
    });

    const ym = new Date(c.dataHora).toISOString().slice(0, 7);
    expect(compraRepo.list({ mes: ym })).toHaveLength(1);
    expect(compraRepo.list({ mes: '1999-01' })).toHaveLength(0);
    expect(compraRepo.list({ mercadoId: mercado.id })).toHaveLength(1);
    expect(compraRepo.list({ mercadoId: 'unknown' })).toHaveLength(0);
    close();
  });

  it('byId returns compra + items + mercadoNome (archived mercado marked)', () => {
    const { close, listaRepo, compraRepo, db } = setup();
    const lista = listaRepo.list()[0];
    const mercado = db.select().from(mercadosTable).all()[0] as { id: string };
    if (!lista || !mercado) throw new Error('seed bug');

    const c = compraRepo.create({
      listaId: lista.id,
      mercadoId: mercado.id,
      formaPagamento: 'vale_alimentacao',
      totalReal: 12,
      fotoCupomPath: 'cupons/abc.jpg',
    });

    const mercadoRepo = makeMercadoRepo(db);
    mercadoRepo.softDelete(mercado.id);

    const detail = compraRepo.byId(c.id);
    expect(detail?.id).toBe(c.id);
    expect(detail?.mercadoNome).toBe('Carrefour');
    expect(detail?.mercadoArquivado).toBe(true);
    expect(detail?.items.length).toBe(2);
    expect(detail?.items.map((i) => i.produtoNome).sort()).toEqual(['Arroz', 'Pão']);
    expect(detail?.fotoCupomPath).toBe('cupons/abc.jpg');
    close();
  });
});
