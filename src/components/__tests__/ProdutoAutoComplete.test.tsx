import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import ProdutoAutoComplete from '@/components/ProdutoAutoComplete';
import type { Produto } from '@/db/repos/produtoRepo';
import { lightTheme } from '@/theme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <PaperProvider theme={lightTheme}>{ui}</PaperProvider>
);

const sampleSuggestions: Produto[] = [
  {
    id: '1',
    nome: 'Arroz Branco',
    marcaPadrao: 'Tio João',
    modeloPadrao: null,
    unidadePadrao: 'kg',
    criadoEm: 0,
    excluidoEm: null,
  },
  {
    id: '2',
    nome: 'Arroz Integral',
    marcaPadrao: null,
    modeloPadrao: null,
    unidadePadrao: null,
    criadoEm: 0,
    excluidoEm: null,
  },
];

describe('ProdutoAutoComplete', () => {
  it('renders the label text', () => {
    const { getAllByText } = render(
      wrap(
        <ProdutoAutoComplete
          value=""
          onChangeText={jest.fn()}
          suggestions={[]}
          onSelect={jest.fn()}
          label="Produto"
        />,
      ),
    );
    expect(getAllByText('Produto').length).toBeGreaterThan(0);
  });

  it('calls onChangeText when user types', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      wrap(
        <ProdutoAutoComplete
          value=""
          onChangeText={onChangeText}
          suggestions={[]}
          onSelect={jest.fn()}
        />,
      ),
    );
    fireEvent.changeText(getByTestId('produto-autocomplete-input'), 'arr');
    expect(onChangeText).toHaveBeenCalledWith('arr');
  });

  it('shows suggestions when value is non-empty', () => {
    const { getByText } = render(
      wrap(
        <ProdutoAutoComplete
          value="arr"
          onChangeText={jest.fn()}
          suggestions={sampleSuggestions}
          onSelect={jest.fn()}
        />,
      ),
    );
    expect(getByText('Arroz Branco')).toBeTruthy();
    expect(getByText('Arroz Integral')).toBeTruthy();
  });

  it('hides suggestions when value is empty', () => {
    const { queryByText } = render(
      wrap(
        <ProdutoAutoComplete
          value=""
          onChangeText={jest.fn()}
          suggestions={sampleSuggestions}
          onSelect={jest.fn()}
        />,
      ),
    );
    expect(queryByText('Arroz Branco')).toBeNull();
  });

  it('invokes onSelect with the picked produto', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      wrap(
        <ProdutoAutoComplete
          value="arr"
          onChangeText={jest.fn()}
          suggestions={sampleSuggestions}
          onSelect={onSelect}
        />,
      ),
    );
    fireEvent.press(getByText('Arroz Integral'));
    expect(onSelect).toHaveBeenCalledWith(sampleSuggestions[1]);
  });
});
