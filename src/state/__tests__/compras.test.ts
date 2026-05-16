import { makeCompraRepo } from '@/db/repos/compraRepo';
import { makeItemListaRepo } from '@/db/repos/itemListaRepo';
import { makeListaRepo } from '@/db/repos/listaRepo';
import { makeMercadoRepo } from '@/db/repos/mercadoRepo';
import { makeProdutoRepo } from '@/db/repos/produtoRepo';
import { createTestDb, type TestDb } from '@/db/testDb';
import { useAppStore } from '@/state';

const resetStore = (): void => {
  useAppStore.setState({
    produtos: [],
    mercados: [],
    listas: [],
    itemsByLista: {},
    compras: [],
    comprasReady: false,
    compraAtivaListaId: null,
    compraAtivaMercadoId: null,
    compraAtivaItems: [],
    compraAtivaTotal: 0,
    compraAtivaReady: false,
    listasReady: false,
    produtosReady: false,
    mercadosReady: false,
    draftMercadoId: null,
    draftFormaPagamento: null,
    draftTotalReal: null,
    draftFotoCupomPath: null,
    _listaRepo: null,
    _itemListaRepo: null,
    _produtoRepo: null,
    _mercadoRepo: null,
    _compraListaRepo: null,
    _compraItemRepo: null,
    _compraRepo: null,
    _comprasListaRepo: null,
  });
};

const setup = (): {
  db: TestDb;
  close: () => void;
  listaId: string;
  mercadoId: string;
} => {
  const t = createTestDb();
  resetStore();
  const listaRepo = makeListaRepo(t.db);
  const itemRepo = makeItemListaRepo(t.db);
  const mercadoRepo = makeMercadoRepo(t.db);
  const compraRepo = makeCompraRepo(t.db);

  useAppStore.getState().initProdutos(makeProdutoRepo(t.db));
  useAppStore.getState().initMercados(mercadoRepo);
  useAppStore.getState().initListas(listaRepo, itemRepo);
  useAppStore.getState().initCompraAtiva(listaRepo, itemRepo);
  useAppStore.getState().initCompras(compraRepo, listaRepo);

  const l = useAppStore.getState().createLista({ nome: 'Test' });
  useAppStore.getState().addItem(l.id, { nome: 'Arroz' });
  useAppStore.getState().addItem(l.id, { nome: 'Pão' });
  const m = useAppStore.getState().createMercado({ nome: 'Carrefour' });

  useAppStore.getState().iniciarCompraAtiva(l.id);
  const live = useAppStore.getState().compraAtivaItems;
  for (const it of live) {
    useAppStore.getState().marcarItemCompra(it.id, 1, 2);
  }
  return { db: t.db, close: t.close, listaId: l.id, mercadoId: m.id };
};

describe('compras slice', () => {
  it('concluirCompra commits compra, updates history, ends compraAtiva, flips lista to finalizada', () => {
    const { close, listaId, mercadoId } = setup();

    useAppStore.getState().setDraftMercado(mercadoId);
    useAppStore.getState().setDraftFormaPagamento('pix');
    useAppStore.getState().setDraftTotalReal(5);

    const compra = useAppStore.getState().concluirCompra({
      mercadoId,
      formaPagamento: 'pix',
      totalReal: 5,
      fotoCupomPath: null,
    });

    const s = useAppStore.getState();
    expect(compra.totalCalculado).toBe(4); // 2 items * 1 * 2
    expect(s.compras).toHaveLength(1);
    expect(s.compraAtivaListaId).toBeNull();
    expect(s.listas.find((l) => l.id === listaId)?.status).toBe('finalizada');
    expect(s.draftMercadoId).toBeNull();
    expect(s.draftFormaPagamento).toBeNull();
    close();
  });

  it('softDeleteCompra hides from history', () => {
    const { close, mercadoId } = setup();
    const compra = useAppStore.getState().concluirCompra({
      mercadoId,
      formaPagamento: 'dinheiro',
      totalReal: null,
      fotoCupomPath: null,
    });
    expect(useAppStore.getState().compras).toHaveLength(1);
    useAppStore.getState().softDeleteCompra(compra.id);
    expect(useAppStore.getState().compras).toHaveLength(0);
    close();
  });

  it('clonarPendentesDraft creates a new lista with non-comprado items', () => {
    const t = createTestDb();
    resetStore();
    const listaRepo = makeListaRepo(t.db);
    const itemRepo = makeItemListaRepo(t.db);
    useAppStore.getState().initProdutos(makeProdutoRepo(t.db));
    useAppStore.getState().initMercados(makeMercadoRepo(t.db));
    useAppStore.getState().initListas(listaRepo, itemRepo);
    useAppStore.getState().initCompraAtiva(listaRepo, itemRepo);
    useAppStore.getState().initCompras(makeCompraRepo(t.db), listaRepo);

    const l = useAppStore.getState().createLista({ nome: 'Source' });
    useAppStore.getState().addItem(l.id, { nome: 'Arroz' });
    useAppStore.getState().addItem(l.id, { nome: 'Banana' });
    useAppStore.getState().iniciarCompraAtiva(l.id);
    const a = useAppStore.getState().compraAtivaItems[0];
    if (!a) throw new Error('expected item');
    useAppStore.getState().marcarItemCompra(a.id, 1, 1);

    const nova = useAppStore.getState().clonarPendentesDraft(l.id);
    expect(nova.status).toBe('planejamento');
    const novaInListas = useAppStore.getState().listas.find((x) => x.id === nova.id);
    expect(novaInListas?.itemCount).toBe(1);
    t.close();
  });

  it('draft setters and resetCheckoutDraft work', () => {
    const t = createTestDb();
    resetStore();
    const listaRepo = makeListaRepo(t.db);
    useAppStore.getState().initCompras(makeCompraRepo(t.db), listaRepo);
    useAppStore.getState().setDraftMercado('m1');
    useAppStore.getState().setDraftFormaPagamento('cartao_credito');
    useAppStore.getState().setDraftTotalReal(99);
    useAppStore.getState().setDraftFotoCupomPath('cupons/x.jpg');
    let s = useAppStore.getState();
    expect(s.draftMercadoId).toBe('m1');
    expect(s.draftFormaPagamento).toBe('cartao_credito');
    expect(s.draftTotalReal).toBe(99);
    expect(s.draftFotoCupomPath).toBe('cupons/x.jpg');
    useAppStore.getState().resetCheckoutDraft();
    s = useAppStore.getState();
    expect(s.draftMercadoId).toBeNull();
    expect(s.draftFormaPagamento).toBeNull();
    expect(s.draftTotalReal).toBeNull();
    expect(s.draftFotoCupomPath).toBeNull();
    t.close();
  });
});
