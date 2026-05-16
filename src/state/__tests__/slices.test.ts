import { makeItemListaRepo } from '@/db/repos/itemListaRepo';
import { makeListaRepo } from '@/db/repos/listaRepo';
import { makeMercadoRepo } from '@/db/repos/mercadoRepo';
import { makeProdutoRepo } from '@/db/repos/produtoRepo';
import { createTestDb } from '@/db/testDb';
import { useAppStore } from '@/state';

describe('produtos slice', () => {
  beforeEach(() => {
    useAppStore.setState({
      produtos: [],
      produtosReady: false,
      _produtoRepo: null,
    });
  });

  it('throws when actions called before init', () => {
    expect(() => useAppStore.getState().getOrCreateProduto('Arroz')).toThrow(/not initialized/);
  });

  it('initProdutos populates list and flips ready', () => {
    const t = createTestDb();
    const repo = makeProdutoRepo(t.db);
    repo.getOrCreate('Arroz');
    useAppStore.getState().initProdutos(repo);
    const s = useAppStore.getState();
    expect(s.produtosReady).toBe(true);
    expect(s.produtos.map((p) => p.nome)).toEqual(['Arroz']);
    t.close();
  });

  it('getOrCreateProduto syncs slice state', () => {
    const t = createTestDb();
    useAppStore.getState().initProdutos(makeProdutoRepo(t.db));
    useAppStore.getState().getOrCreateProduto('Banana');
    expect(useAppStore.getState().produtos.map((p) => p.nome)).toContain('Banana');
    t.close();
  });
});

describe('mercados slice', () => {
  beforeEach(() => {
    useAppStore.setState({
      mercados: [],
      mercadosReady: false,
      _mercadoRepo: null,
    });
  });

  it('createMercado then archive then restore reflects in slice', () => {
    const t = createTestDb();
    useAppStore.getState().initMercados(makeMercadoRepo(t.db));
    const m = useAppStore.getState().createMercado({ nome: 'Carrefour' });
    expect(useAppStore.getState().mercados.map((x) => x.id)).toContain(m.id);

    useAppStore.getState().archiveMercado(m.id);
    expect(useAppStore.getState().mercados.map((x) => x.id)).not.toContain(m.id);

    useAppStore.getState().restoreMercado(m.id);
    expect(useAppStore.getState().mercados.map((x) => x.id)).toContain(m.id);
    t.close();
  });
});

describe('listas slice', () => {
  beforeEach(() => {
    useAppStore.setState({
      listas: [],
      itemsByLista: {},
      listasReady: false,
      _listaRepo: null,
      _itemListaRepo: null,
    });
  });

  it('throws when actions called before init', () => {
    expect(() => useAppStore.getState().createLista({})).toThrow(/not initialized/);
    expect(() => useAppStore.getState().addItem('x', { nome: 'A' })).toThrow(/not initialized/);
  });

  it('createLista + addItem syncs both lista count and items map', () => {
    const t = createTestDb();
    useAppStore.getState().initListas(makeListaRepo(t.db), makeItemListaRepo(t.db));
    const l = useAppStore.getState().createLista({ nome: 'Semana' });
    useAppStore.getState().addItem(l.id, { nome: 'Arroz' });
    useAppStore.getState().addItem(l.id, { nome: 'Banana' });
    const s = useAppStore.getState();
    const itemsForLista = s.itemsByLista[l.id] ?? [];
    expect(itemsForLista.map((i) => i.produtoNome)).toEqual(['Arroz', 'Banana']);
    expect(s.listas.find((x) => x.id === l.id)?.itemCount).toBe(2);
    t.close();
  });

  it('encerrarLista flips status and removeItem updates counts', () => {
    const t = createTestDb();
    useAppStore.getState().initListas(makeListaRepo(t.db), makeItemListaRepo(t.db));
    const l = useAppStore.getState().createLista({ nome: 'X' });
    useAppStore.getState().addItem(l.id, { nome: 'Arroz' });
    const itemBefore = (useAppStore.getState().itemsByLista[l.id] ?? [])[0];
    if (!itemBefore) throw new Error('expected item');
    useAppStore.getState().removeItem(l.id, itemBefore.id);
    expect(useAppStore.getState().itemsByLista[l.id]).toEqual([]);
    expect(useAppStore.getState().listas.find((x) => x.id === l.id)?.itemCount).toBe(0);

    const encerrada = useAppStore.getState().encerrarLista(l.id);
    expect(encerrada.status).toBe('encerrada');
    t.close();
  });
});
