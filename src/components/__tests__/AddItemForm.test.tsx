import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import AddItemForm from '@/components/AddItemForm';
import { makeItemListaRepo } from '@/db/repos/itemListaRepo';
import { makeListaRepo } from '@/db/repos/listaRepo';
import { makeProdutoRepo } from '@/db/repos/produtoRepo';
import { createTestDb, type TestDb } from '@/db/testDb';
import { useAppStore } from '@/state';
import { lightTheme } from '@/theme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <PaperProvider theme={lightTheme}>{ui}</PaperProvider>
);

describe('AddItemForm', () => {
  let close: () => void;
  let db: TestDb;
  let listaId: string;

  beforeEach(() => {
    const t = createTestDb();
    db = t.db;
    close = t.close;
    useAppStore.setState({
      produtos: [],
      mercados: [],
      listas: [],
      itemsByLista: {},
      produtosReady: false,
      mercadosReady: false,
      listasReady: false,
      _produtoRepo: null,
      _mercadoRepo: null,
      _listaRepo: null,
      _itemListaRepo: null,
    });
    useAppStore.getState().initProdutos(makeProdutoRepo(db));
    useAppStore.getState().initListas(makeListaRepo(db), makeItemListaRepo(db));
    const l = useAppStore.getState().createLista({ nome: 'Test' });
    listaId = l.id;
  });

  afterEach(() => close());

  it('adds an item with name + qty to the lista', () => {
    const { getByTestId } = render(wrap(<AddItemForm listaId={listaId} />));
    fireEvent.changeText(getByTestId('produto-autocomplete-input'), 'Arroz');
    fireEvent.changeText(getByTestId('add-item-qty'), '2');
    fireEvent.press(getByTestId('add-item-submit'));

    const items = useAppStore.getState().itemsByLista[listaId] ?? [];
    expect(items).toHaveLength(1);
    expect(items[0]?.produtoNome).toBe('Arroz');
    expect(items[0]?.quantidadePlanejada).toBe(2);
  });

  it('disables submit when name is empty', () => {
    const { getByTestId } = render(wrap(<AddItemForm listaId={listaId} />));
    const button = getByTestId('add-item-submit');
    fireEvent.press(button);
    const items = useAppStore.getState().itemsByLista[listaId] ?? [];
    expect(items).toHaveLength(0);
  });

  it('selecting a suggestion prefills marca/modelo/unidade from produto defaults', () => {
    // Pre-seed a produto with defaults
    useAppStore.getState().getOrCreateProduto('Açúcar');
    const sugar = useAppStore.getState().produtos.find((p) => p.nome === 'Açúcar');
    if (!sugar) throw new Error('expected produto');
    useAppStore.getState().updateProduto(sugar.id, {
      marcaPadrao: 'União',
      unidadePadrao: 'kg',
    });

    const { getByTestId, getByText } = render(wrap(<AddItemForm listaId={listaId} />));
    fireEvent.changeText(getByTestId('produto-autocomplete-input'), 'açú');
    fireEvent.press(getByText('Açúcar'));
    fireEvent.press(getByTestId('add-item-submit'));

    const items = useAppStore.getState().itemsByLista[listaId] ?? [];
    expect(items[0]?.marca).toBe('União');
    expect(items[0]?.unidade).toBe('kg');
  });
});
