import { makeItemListaRepo, type ItemListaRepo } from '@/db/repos/itemListaRepo';
import { makeListaRepo, type ListaRepo } from '@/db/repos/listaRepo';
import { makeProdutoRepo } from '@/db/repos/produtoRepo';
import { createTestDb, type TestDb } from '@/db/testDb';

describe('itemListaRepo', () => {
  let close: () => void;
  let db: TestDb;
  let listaRepo: ListaRepo;
  let repo: ItemListaRepo;
  let listaId: string;

  beforeEach(() => {
    const t = createTestDb();
    db = t.db;
    close = t.close;
    listaRepo = makeListaRepo(db);
    repo = makeItemListaRepo(db);
    const l = listaRepo.create({ nome: 'L' });
    listaId = l.id;
  });

  afterEach(() => close());

  it('add creates an item and calls produtoRepo.getOrCreate (dedupes by name)', () => {
    const a = repo.add(listaId, { nome: 'Arroz', quantidadePlanejada: 2, unidade: 'kg' });
    const b = repo.add(listaId, { nome: 'arroz', quantidadePlanejada: 1, unidade: 'kg' });
    expect(a.produtoId).toBe(b.produtoId); // same product, separate item rows
    expect(makeProdutoRepo(db).list()).toHaveLength(1);
  });

  it('add persists optional fields', () => {
    const it = repo.add(listaId, {
      nome: 'Açúcar',
      quantidadePlanejada: 1,
      marca: 'União',
      modelo: 'Cristal',
      unidade: 'kg',
    });
    expect(it.marca).toBe('União');
    expect(it.modelo).toBe('Cristal');
    expect(it.unidade).toBe('kg');
    expect(it.quantidadePlanejada).toBe(1);
    expect(it.origem).toBe('lista');
    expect(it.status).toBe('a_comprar');
  });

  it('list returns alphabetical by produto.nome (diacritic-insensitive)', () => {
    repo.add(listaId, { nome: 'Banana' });
    repo.add(listaId, { nome: 'Açúcar' });
    repo.add(listaId, { nome: 'arroz' });
    const items = repo.list(listaId);
    expect(items.map((i) => i.produtoNome)).toEqual(['Açúcar', 'arroz', 'Banana']);
  });

  it('update sets fields', () => {
    const it = repo.add(listaId, { nome: 'Pão' });
    const u = repo.update(it.id, { quantidadePlanejada: 5, marca: 'Padaria X' });
    expect(u.quantidadePlanejada).toBe(5);
    expect(u.marca).toBe('Padaria X');
  });

  it('remove deletes item when lista status is planejamento', () => {
    const it = repo.add(listaId, { nome: 'Pão' });
    repo.remove(it.id);
    expect(repo.list(listaId)).toHaveLength(0);
  });

  it('remove fails when lista is em_compra', () => {
    const it = repo.add(listaId, { nome: 'Pão' });
    listaRepo.update(listaId, { status: 'em_compra' });
    expect(() => repo.remove(it.id)).toThrow(/planejamento/);
  });

  describe('shopping-mode operations', () => {
    it('marcarComprado sets status + qtd + preco', () => {
      const it = repo.add(listaId, { nome: 'Pão', quantidadePlanejada: 1 });
      const m = repo.marcarComprado(it.id, { qtd: 2, preco: 3.5 });
      expect(m.status).toBe('comprado');
      expect(m.quantidadeComprada).toBe(2);
      expect(m.precoUnitario).toBe(3.5);
    });

    it('marcarComprado rejects invalid qtd/preco', () => {
      const it = repo.add(listaId, { nome: 'Pão' });
      expect(() => repo.marcarComprado(it.id, { qtd: 0, preco: 1 })).toThrow(/qtd/);
      expect(() => repo.marcarComprado(it.id, { qtd: 1, preco: -1 })).toThrow(/preco/);
    });

    it('desmarcar resets status and clears qtd/preco', () => {
      const it = repo.add(listaId, { nome: 'Pão' });
      repo.marcarComprado(it.id, { qtd: 1, preco: 1 });
      const d = repo.desmarcar(it.id);
      expect(d.status).toBe('a_comprar');
      expect(d.quantidadeComprada).toBeNull();
      expect(d.precoUnitario).toBeNull();
    });

    it('addUnplanned creates row with origem=compra and status=comprado', () => {
      const it = repo.addUnplanned(listaId, {
        nome: 'Refrigerante',
        precoUnitario: 8.5,
        quantidadeComprada: 1,
      });
      expect(it.origem).toBe('compra');
      expect(it.status).toBe('comprado');
      expect(it.precoUnitario).toBe(8.5);
      expect(it.quantidadeComprada).toBe(1);
    });

    it('removeUnplanned deletes only origem=compra items', () => {
      const planned = repo.add(listaId, { nome: 'Arroz' });
      const unplanned = repo.addUnplanned(listaId, {
        nome: 'Refri',
        precoUnitario: 5,
        quantidadeComprada: 1,
      });
      expect(() => repo.removeUnplanned(planned.id)).toThrow(/origem=compra/);
      repo.removeUnplanned(unplanned.id);
      expect(repo.byId(unplanned.id)).toBeUndefined();
    });
  });
});
