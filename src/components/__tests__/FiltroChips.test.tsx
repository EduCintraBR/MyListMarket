import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';
import { PaperProvider } from 'react-native-paper';

import FiltroChips, { type CompraFiltro } from '@/components/FiltroChips';
import { lightTheme } from '@/theme';

const Harness = ({ onChange }: { onChange?: (s: Set<CompraFiltro>) => void }): JSX.Element => {
  const [selected, setSelected] = useState<Set<CompraFiltro>>(new Set());
  return (
    <FiltroChips
      selected={selected}
      onToggle={(f) =>
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(f)) next.delete(f);
          else next.add(f);
          onChange?.(next);
          return next;
        })
      }
    />
  );
};

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <PaperProvider theme={lightTheme}>{ui}</PaperProvider>
);

describe('FiltroChips', () => {
  it('toggles a filter on and off', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(wrap(<Harness onChange={onChange} />));
    fireEvent.press(getByTestId('filtro-comprado'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['comprado']));
    fireEvent.press(getByTestId('filtro-comprado'));
    expect(onChange).toHaveBeenLastCalledWith(new Set());
  });

  it('combines multiple filters', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(wrap(<Harness onChange={onChange} />));
    fireEvent.press(getByTestId('filtro-comprado'));
    fireEvent.press(getByTestId('filtro-da_lista'));
    expect(onChange).toHaveBeenLastCalledWith(new Set(['comprado', 'da_lista']));
  });
});
