import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider, Portal } from 'react-native-paper';

import MercadoPicker from '@/components/MercadoPicker';
import { makeMercadoRepo } from '@/db/repos/mercadoRepo';
import { createTestDb } from '@/db/testDb';
import { useAppStore } from '@/state';
import { lightTheme } from '@/theme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <PaperProvider theme={lightTheme}>
    <Portal.Host>{ui}</Portal.Host>
  </PaperProvider>
);

const initStore = (): (() => void) => {
  const t = createTestDb();
  useAppStore.setState({ mercados: [], mercadosReady: false, _mercadoRepo: null });
  useAppStore.getState().initMercados(makeMercadoRepo(t.db));
  return (): void => t.close();
};

describe('MercadoPicker', () => {
  it('lists existing mercados', () => {
    const close = initStore();
    useAppStore.getState().createMercado({ nome: 'Carrefour' });
    useAppStore.getState().createMercado({ nome: 'Pão de Açúcar' });

    const { getByText } = render(
      wrap(<MercadoPicker visible onDismiss={jest.fn()} onSelect={jest.fn()} />),
    );
    expect(getByText('Carrefour')).toBeTruthy();
    expect(getByText('Pão de Açúcar')).toBeTruthy();
    close();
  });

  it('calls onSelect when a mercado is tapped', () => {
    const close = initStore();
    const m = useAppStore.getState().createMercado({ nome: 'Carrefour' });
    const onSelect = jest.fn();

    const { getByText } = render(
      wrap(<MercadoPicker visible onDismiss={jest.fn()} onSelect={onSelect} />),
    );
    fireEvent.press(getByText('Carrefour'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: m.id, nome: 'Carrefour' }));
    close();
  });

  it('inline-creates a new mercado and selects it', () => {
    const close = initStore();
    const onSelect = jest.fn();

    const { getByText, getByTestId } = render(
      wrap(<MercadoPicker visible onDismiss={jest.fn()} onSelect={onSelect} />),
    );
    fireEvent.changeText(getByTestId('mercado-picker-input'), 'Novo Mercado');
    fireEvent.press(getByText('+ Criar "Novo Mercado"'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Novo Mercado' }));
    close();
  });
});
