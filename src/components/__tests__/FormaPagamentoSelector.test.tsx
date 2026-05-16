import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';
import { PaperProvider } from 'react-native-paper';

import FormaPagamentoSelector from '@/components/FormaPagamentoSelector';
import type { FormaPagamento } from '@/lib/domain';
import { lightTheme } from '@/theme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <PaperProvider theme={lightTheme}>{ui}</PaperProvider>
);

const Harness = ({ onChange }: { onChange?: (v: FormaPagamento) => void }): JSX.Element => {
  const [v, setV] = useState<FormaPagamento | null>(null);
  return (
    <FormaPagamentoSelector
      value={v}
      onChange={(x) => {
        setV(x);
        onChange?.(x);
      }}
    />
  );
};

describe('FormaPagamentoSelector', () => {
  it('selects and emits change', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(wrap(<Harness onChange={onChange} />));
    fireEvent.press(getByTestId('pagamento-pix'));
    expect(onChange).toHaveBeenLastCalledWith('pix');
  });

  it('all five options render', () => {
    const { getByTestId } = render(wrap(<Harness />));
    [
      'pagamento-dinheiro',
      'pagamento-pix',
      'pagamento-cartao_debito',
      'pagamento-cartao_credito',
      'pagamento-vale_alimentacao',
    ].forEach((id) => expect(getByTestId(id)).toBeTruthy());
  });
});
