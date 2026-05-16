import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { makeItemListaRepo } from '@/db/repos/itemListaRepo';
import { makeListaRepo } from '@/db/repos/listaRepo';
import { createTestDb, type TestDb } from '@/db/testDb';
import HomeListasScreen from '@/screens/HomeListasScreen';
import { useAppStore } from '@/state';
import { lightTheme } from '@/theme';

const mockNavigate = jest.fn();

const nav = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: () => true,
  canGoBack: () => false,
  setOptions: jest.fn(),
  addListener: jest.fn(() => () => undefined),
  removeListener: jest.fn(),
} as unknown as React.ComponentProps<typeof HomeListasScreen>['navigation'];

const route = { key: 'k', name: 'HomeListas', params: undefined } as React.ComponentProps<
  typeof HomeListasScreen
>['route'];

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <PaperProvider theme={lightTheme}>{ui}</PaperProvider>
);

describe('HomeListasScreen', () => {
  let close: () => void;
  let db: TestDb;

  beforeEach(() => {
    mockNavigate.mockClear();
    const t = createTestDb();
    db = t.db;
    close = t.close;
    useAppStore.setState({
      listas: [],
      itemsByLista: {},
      listasReady: false,
      _listaRepo: null,
      _itemListaRepo: null,
    });
    useAppStore.getState().initListas(makeListaRepo(db), makeItemListaRepo(db));
  });

  afterEach(() => close());

  it('shows empty state when no listas', () => {
    const { getByText } = render(wrap(<HomeListasScreen navigation={nav} route={route} />));
    expect(getByText(/Nenhuma lista/)).toBeTruthy();
  });

  it('renders listas with item counts', () => {
    const l = useAppStore.getState().createLista({ nome: 'Semana' });
    useAppStore.getState().addItem(l.id, { nome: 'Arroz' });
    const { getByText } = render(wrap(<HomeListasScreen navigation={nav} route={route} />));
    expect(getByText('Semana')).toBeTruthy();
    expect(getByText('1 item')).toBeTruthy();
  });

  it('FAB creates a lista and navigates to detail', () => {
    const { getByTestId } = render(wrap(<HomeListasScreen navigation={nav} route={route} />));
    fireEvent.press(getByTestId('home-listas-fab'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'ListaDetail',
      expect.objectContaining({ listaId: expect.any(String) }),
    );
  });
});
