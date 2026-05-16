import { makeItemListaRepo } from '@/db/repos/itemListaRepo';
import { makeListaRepo } from '@/db/repos/listaRepo';
import { makeProdutoRepo } from '@/db/repos/produtoRepo';
import { createTestDb, type TestDb } from '@/db/testDb';
import { useAppStore } from '@/state';

const resetStore = (): void => {
  useAppStore.setState({
    produtos: [],
    listas: [],
    itemsByLista: {},
    compraAtivaListaId: null,
    compraAtivaMercadoId: null,
    compraAtivaItems: [],
    compraAtivaTotal: 0,
    compraAtivaReady: false,
    listasReady: false,
    produtosReady: false,
    _listaRepo: null,
    _itemListaRepo: null,
    _produtoRepo: null,
    _compraListaRepo: null,
    _compraItemRepo: null,
  });
};

describe('compraAtiva slice', () => {
  let db: TestDb;
  let close: () => void;
  let listaId: string;

  beforeEach(() => {
    const t = createTestDb();
    db = t.db;
    close = t.close;
    resetStore();
    const listaRepo = makeListaRepo(db);
    const itemRepo = makeItemListaRepo(db);
    useAppStore.getState().initProdutos(makeProdutoRepo(db));
    useAppStore.getState().initListas(listaRepo, itemRepo);
    useAppStore.getState().initCompraAtiva(listaRepo, itemRepo);
    const l = useAppStore.getState().createLista({ nome: 'Test' });
    useAppStore.getState().addItem(l.id, { nome: 'Arroz', quantidadePlanejada: 1, unidade: 'kg' });
    useAppStore.getState().addItem(l.id, { nome: 'Banana', quantidadePlanejada: 6, unidade: 'un' });
    listaId = l.id;
  });

  afterEach(() => close());

  it('iniciarCompraAtiva loads items + zero total', () => {
    useAppStore.getState().iniciarCompraAtiva(listaId);
    const s = useAppStore.getState();
    expect(s.compraAtivaListaId).toBe(listaId);
    expect(s.compraAtivaItems.map((i) => i.produtoNome)).toEqual(['Arroz', 'Banana']);
    expect(s.compraAtivaTotal).toBe(0);
  });

  it('marcarItem updates total', () => {
    useAppStore.getState().iniciarCompraAtiva(listaId);
    const item = useAppStore.getState().compraAtivaItems[0];
    if (!item) throw new Error('expected item');
    useAppStore.getState().marcarItemCompra(item.id, 2, 3.5);
    expect(useAppStore.getState().compraAtivaTotal).toBe(7);
  });

  it('voltarItem clears qty/preco and reduces total', () => {
    useAppStore.getState().iniciarCompraAtiva(listaId);
    const item = useAppStore.getState().compraAtivaItems[0];
    if (!item) throw new Error('expected item');
    useAppStore.getState().marcarItemCompra(item.id, 2, 3.5);
    useAppStore.getState().voltarItemCompra(item.id);
    expect(useAppStore.getState().compraAtivaTotal).toBe(0);
    const updated = useAppStore.getState().compraAtivaItems.find((i) => i.id === item.id);
    expect(updated?.status).toBe('a_comprar');
    expect(updated?.quantidadeComprada).toBeNull();
  });

  it('adicionarUnplanned adds row + increases total', () => {
    useAppStore.getState().iniciarCompraAtiva(listaId);
    useAppStore.getState().adicionarUnplannedCompra({
      nome: 'Refrigerante',
      quantidadeComprada: 1,
      precoUnitario: 8.5,
    });
    const items = useAppStore.getState().compraAtivaItems;
    const refri = items.find((i) => i.produtoNome === 'Refrigerante');
    expect(refri?.origem).toBe('compra');
    expect(useAppStore.getState().compraAtivaTotal).toBe(8.5);
  });

  it('removerUnplanned deletes only origem=compra', () => {
    useAppStore.getState().iniciarCompraAtiva(listaId);
    useAppStore.getState().adicionarUnplannedCompra({
      nome: 'Refri',
      quantidadeComprada: 1,
      precoUnitario: 5,
    });
    const refri = useAppStore
      .getState()
      .compraAtivaItems.find((i) => i.produtoNome === 'Refri');
    if (!refri) throw new Error('expected refri');
    const planned = useAppStore
      .getState()
      .compraAtivaItems.find((i) => i.produtoNome === 'Arroz');
    if (!planned) throw new Error('expected planned');

    expect(() => useAppStore.getState().removerUnplannedCompra(planned.id)).toThrow(
      /origem=compra/,
    );

    useAppStore.getState().removerUnplannedCompra(refri.id);
    expect(
      useAppStore.getState().compraAtivaItems.find((i) => i.id === refri.id),
    ).toBeUndefined();
  });

  it('restoreCompraAtiva re-hydrates state on boot when a lista is em_compra', () => {
    useAppStore.getState().iniciarCompraAtiva(listaId);
    const item = useAppStore.getState().compraAtivaItems[0];
    if (!item) throw new Error('expected item');
    useAppStore.getState().marcarItemCompra(item.id, 1, 4);

    // Simulate boot: clear slice state but keep repos initialized
    useAppStore.setState({
      compraAtivaListaId: null,
      compraAtivaItems: [],
      compraAtivaTotal: 0,
    });
    const restored = useAppStore.getState().restoreCompraAtiva();
    expect(restored).toBe(listaId);
    expect(useAppStore.getState().compraAtivaTotal).toBe(4);
  });

  it('setMercadoCompra stores mercadoId locally', () => {
    useAppStore.getState().iniciarCompraAtiva(listaId);
    useAppStore.getState().setMercadoCompra('merc-1');
    expect(useAppStore.getState().compraAtivaMercadoId).toBe('merc-1');
  });

  it('endCompraAtiva clears all slice fields', () => {
    useAppStore.getState().iniciarCompraAtiva(listaId);
    useAppStore.getState().setMercadoCompra('merc-1');
    useAppStore.getState().endCompraAtiva();
    const s = useAppStore.getState();
    expect(s.compraAtivaListaId).toBeNull();
    expect(s.compraAtivaMercadoId).toBeNull();
    expect(s.compraAtivaItems).toEqual([]);
    expect(s.compraAtivaTotal).toBe(0);
  });
});
