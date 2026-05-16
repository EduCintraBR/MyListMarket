import { makeItemListaRepo } from '@/db/repos/itemListaRepo';
import { makeListaRepo, type ListaRepo } from '@/db/repos/listaRepo';
import { itensLista, produtos } from '@/db/schema';
import { createTestDb, type TestDb } from '@/db/testDb';
import { newId } from '@/lib/id';

const insertProduto = (db: TestDb, nome: string): string => {
  const id = newId();
  db.insert(produtos)
    .values({
      id,
      nome,
      marcaPadrao: null,
      modeloPadrao: null,
      unidadePadrao: null,
      criadoEm: Date.now(),
      excluidoEm: null,
    })
    .run();
  return id;
};

const insertItem = (db: TestDb, listaId: string, produtoId: string): void => {
  db.insert(itensLista)
    .values({
      id: newId(),
      listaId,
      produtoId,
      quantidadePlanejada: null,
      marca: null,
      modelo: null,
      unidade: null,
      origem: 'lista',
      status: 'a_comprar',
      quantidadeComprada: null,
      precoUnitario: null,
      criadoEm: Date.now(),
    })
    .run();
};

describe('listaRepo', () => {
  let close: () => void;
  let repo: ListaRepo;
  let db: TestDb;

  beforeEach(() => {
    const t = createTestDb();
    db = t.db;
    close = t.close;
    repo = makeListaRepo(db);
  });

  afterEach(() => close());

  it('creates a lista with explicit name', () => {
    const l = repo.create({ nome: 'Compras de maio' });
    expect(l.nome).toBe('Compras de maio');
    expect(l.status).toBe('planejamento');
    expect(l.criadoEm).toBeGreaterThan(0);
  });

  it('auto-names lista when nome blank or undefined', () => {
    const a = repo.create({});
    const b = repo.create({ nome: '   ' });
    expect(a.nome).toMatch(/^Lista de \d{2}\/\d{2}\/\d{4}$/);
    expect(b.nome).toMatch(/^Lista de \d{2}\/\d{2}\/\d{4}$/);
  });

  it('lists non-deleted listas with item counts', () => {
    const l1 = repo.create({ nome: 'A' });
    const l2 = repo.create({ nome: 'B' });
    const p = insertProduto(db, 'Arroz');
    insertItem(db, l1.id, p);
    insertItem(db, l1.id, p);
    insertItem(db, l2.id, p);

    const rows = repo.list();
    const byId = new Map(rows.map((r) => [r.id, r]));
    expect(byId.get(l1.id)?.itemCount).toBe(2);
    expect(byId.get(l2.id)?.itemCount).toBe(1);
  });

  it('excludes soft-deleted listas by default', () => {
    const l = repo.create({ nome: 'X' });
    repo.softDelete(l.id);
    expect(repo.list()).toHaveLength(0);
    expect(repo.list({ includeDeleted: true })).toHaveLength(1);
  });

  it('byId returns archived listas too', () => {
    const l = repo.create({ nome: 'X' });
    repo.softDelete(l.id);
    expect(repo.byId(l.id)?.id).toBe(l.id);
  });

  it('updates name', () => {
    const l = repo.create({ nome: 'Old' });
    const updated = repo.update(l.id, { nome: 'New' });
    expect(updated.nome).toBe('New');
  });

  it('encerrar from planejamento → encerrada + finalizadaEm set', () => {
    const l = repo.create({ nome: 'X' });
    const encerrada = repo.encerrar(l.id);
    expect(encerrada.status).toBe('encerrada');
    expect(encerrada.finalizadaEm).not.toBeNull();
  });

  it('encerrar fails when lista already em_compra', () => {
    const l = repo.create({ nome: 'X' });
    repo.update(l.id, { status: 'em_compra' });
    expect(() => repo.encerrar(l.id)).toThrow(/em_compra/);
  });

  describe('clonarPendentes', () => {
    it('creates new lista in planejamento with only non-comprado items', () => {
      const l = repo.create({ nome: 'Origem' });
      const itemRepo = makeItemListaRepo(db);
      const a = itemRepo.add(l.id, { nome: 'Arroz' });
      const b = itemRepo.add(l.id, { nome: 'Banana' });
      const c = itemRepo.add(l.id, { nome: 'Café' });
      itemRepo.marcarComprado(a.id, { qtd: 1, preco: 1 });
      // b and c left as a_comprar

      const nova = repo.clonarPendentes(l.id);
      expect(nova.status).toBe('planejamento');
      expect(nova.nome).toMatch(/^Pendências de/);

      const novaItems = itemRepo.list(nova.id);
      expect(novaItems.map((it: { produtoNome: string }) => it.produtoNome).sort()).toEqual([
        'Banana',
        'Café',
      ]);
      void b;
      void c;
    });

    it('returns empty new lista when all items comprado', () => {
      const l = repo.create({ nome: 'Tudo Compra' });
      const itemRepo = makeItemListaRepo(db);
      const a = itemRepo.add(l.id, { nome: 'Arroz' });
      itemRepo.marcarComprado(a.id, { qtd: 1, preco: 1 });
      const nova = repo.clonarPendentes(l.id);
      expect(itemRepo.list(nova.id)).toHaveLength(0);
    });
  });

  describe('iniciarCompra (single-active rule)', () => {
    it('flips status to em_compra and activeCompraId returns id', () => {
      const l = repo.create({ nome: 'X' });
      expect(repo.activeCompraId()).toBeNull();
      const inCompra = repo.iniciarCompra(l.id);
      expect(inCompra.status).toBe('em_compra');
      expect(repo.activeCompraId()).toBe(l.id);
    });

    it('fails when another lista is already em_compra', () => {
      const a = repo.create({ nome: 'A' });
      const b = repo.create({ nome: 'B' });
      repo.iniciarCompra(a.id);
      expect(() => repo.iniciarCompra(b.id)).toThrow(/already em_compra/);
    });

    it('fails when lista not in planejamento', () => {
      const l = repo.create({ nome: 'X' });
      repo.encerrar(l.id);
      expect(() => repo.iniciarCompra(l.id)).toThrow(/planejamento/);
    });
  });
});
