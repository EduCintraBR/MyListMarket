import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';
import { PaperProvider } from 'react-native-paper';

import PeriodPicker, { rangeForPeriod, type Period } from '@/components/reports/PeriodPicker';
import { lightTheme } from '@/theme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <PaperProvider theme={lightTheme}>{ui}</PaperProvider>
);

const Harness = ({ onChange }: { onChange?: (p: Period) => void }): JSX.Element => {
  const [v, setV] = useState<Period>('month');
  return (
    <PeriodPicker
      value={v}
      onChange={(p) => {
        setV(p);
        onChange?.(p);
      }}
    />
  );
};

describe('PeriodPicker', () => {
  it('switches between periods', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(wrap(<Harness onChange={onChange} />));
    fireEvent.press(getByTestId('period-week'));
    expect(onChange).toHaveBeenLastCalledWith('week');
  });
});

describe('rangeForPeriod', () => {
  const now = new Date(2026, 4, 15, 12, 0, 0); // 2026-05-15 noon

  it('day range covers today', () => {
    const r = rangeForPeriod('day', now);
    expect(new Date(r.from).getDate()).toBe(15);
    expect(r.to - r.from).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(r.bucket).toBe('day');
  });

  it('month range covers full month', () => {
    const r = rangeForPeriod('month', now);
    expect(new Date(r.from).getDate()).toBe(1);
    expect(new Date(r.from).getMonth()).toBe(4);
    expect(new Date(r.to).getMonth()).toBe(4);
  });

  it('year range uses month bucket', () => {
    const r = rangeForPeriod('year', now);
    expect(r.bucket).toBe('month');
    expect(new Date(r.from).getMonth()).toBe(0);
    expect(new Date(r.to).getFullYear()).toBe(2026);
  });
});
