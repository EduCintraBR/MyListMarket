import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import MarcarItemSheet from '@/components/MarcarItemSheet';
import { lightTheme } from '@/theme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <PaperProvider theme={lightTheme}>{ui}</PaperProvider>
);

describe('MarcarItemSheet', () => {
  it('confirms with parsed qty and preço (comma → dot)', () => {
    const onConfirm = jest.fn();
    const { getByTestId } = render(
      wrap(
        <MarcarItemSheet
          visible
          onDismiss={jest.fn()}
          produtoNome="Arroz"
          initialQtd={null}
          initialPreco={null}
          onConfirm={onConfirm}
        />,
      ),
    );
    fireEvent.changeText(getByTestId('marcar-qtd'), '2');
    fireEvent.changeText(getByTestId('marcar-preco'), '3,50');
    fireEvent.press(getByTestId('marcar-confirm'));
    expect(onConfirm).toHaveBeenCalledWith(2, 3.5);
  });

  it('pre-fills inputs from initial values when opening', () => {
    const { getByTestId } = render(
      wrap(
        <MarcarItemSheet
          visible
          onDismiss={jest.fn()}
          produtoNome="Arroz"
          initialQtd={5}
          initialPreco={4.25}
          onConfirm={jest.fn()}
        />,
      ),
    );
    expect(getByTestId('marcar-qtd').props.value).toBe('5');
    expect(getByTestId('marcar-preco').props.value).toBe('4.25');
  });

  it('disables confirm until valid', () => {
    const onConfirm = jest.fn();
    const { getByTestId } = render(
      wrap(
        <MarcarItemSheet
          visible
          onDismiss={jest.fn()}
          produtoNome="Arroz"
          initialQtd={null}
          initialPreco={null}
          onConfirm={onConfirm}
        />,
      ),
    );
    fireEvent.press(getByTestId('marcar-confirm'));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
