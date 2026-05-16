import { formatBRL } from '@/lib/money';

describe('formatBRL', () => {
  it('formats zero with R$ prefix and two decimals', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
  });

  it('formats decimals with comma separator', () => {
    expect(formatBRL(12.5)).toBe('R$ 12,50');
    expect(formatBRL(1234.56)).toBe('R$ 1.234,56');
  });

  it('formats thousands with dot separator', () => {
    expect(formatBRL(1000)).toBe('R$ 1.000,00');
    expect(formatBRL(1000000)).toBe('R$ 1.000.000,00');
  });

  it('handles negatives (reconciliation case)', () => {
    expect(formatBRL(-5.5)).toBe('-R$ 5,50');
  });

  it('rounds to two decimals', () => {
    expect(formatBRL(1.005)).toBe('R$ 1,01');
    expect(formatBRL(1.004)).toBe('R$ 1,00');
  });
});
