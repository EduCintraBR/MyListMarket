import { aggregateQuantity, toBase } from '@/lib/units';

describe('toBase', () => {
  it('converts grams to kg (1000g = 1kg)', () => {
    expect(toBase(1000, 'g')).toEqual({ familia: 'peso', value: 1 });
  });

  it('keeps kg as kg', () => {
    expect(toBase(5, 'kg')).toEqual({ familia: 'peso', value: 5 });
  });

  it('converts mL to L', () => {
    expect(toBase(1500, 'mL')).toEqual({ familia: 'volume', value: 1.5 });
  });

  it('keeps L as L', () => {
    expect(toBase(2, 'L')).toEqual({ familia: 'volume', value: 2 });
  });

  it('treats un/pct/cx as unitario without conversion', () => {
    expect(toBase(3, 'un')).toEqual({ familia: 'unitario', value: 3 });
    expect(toBase(2, 'pct')).toEqual({ familia: 'unitario', value: 2 });
    expect(toBase(1, 'cx')).toEqual({ familia: 'unitario', value: 1 });
  });

  it('treats null unit as unitario', () => {
    expect(toBase(7, null)).toEqual({ familia: 'unitario', value: 7 });
  });
});

describe('aggregateQuantity', () => {
  it('PRD example — 3×5kg + 2×500g = 16kg', () => {
    const result = aggregateQuantity([
      { quantidade: 5, unidade: 'kg' },
      { quantidade: 5, unidade: 'kg' },
      { quantidade: 5, unidade: 'kg' },
      { quantidade: 500, unidade: 'g' },
      { quantidade: 500, unidade: 'g' },
    ]);
    expect(result).toEqual([{ familia: 'peso', total: 16, unidadeBase: 'kg' }]);
  });

  it('sums volume in L (1.5L + 500mL = 2L)', () => {
    const result = aggregateQuantity([
      { quantidade: 1.5, unidade: 'L' },
      { quantidade: 500, unidade: 'mL' },
    ]);
    expect(result).toEqual([{ familia: 'volume', total: 2, unidadeBase: 'L' }]);
  });

  it('splits mixed incompatible families into separate rows', () => {
    const result = aggregateQuantity([
      { quantidade: 2, unidade: 'kg' },
      { quantidade: 3, unidade: 'un' },
    ]);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ familia: 'peso', total: 2, unidadeBase: 'kg' });
    expect(result).toContainEqual({ familia: 'unitario', total: 3, unidadeBase: 'un' });
  });

  it('treats null unit as unitario in aggregation', () => {
    const result = aggregateQuantity([
      { quantidade: 4, unidade: null },
      { quantidade: 2, unidade: 'un' },
    ]);
    expect(result).toEqual([{ familia: 'unitario', total: 6, unidadeBase: 'un' }]);
  });

  it('ignores items with null/zero quantity', () => {
    const result = aggregateQuantity([
      { quantidade: 2, unidade: 'kg' },
      { quantidade: null, unidade: 'kg' },
      { quantidade: 0, unidade: 'kg' },
    ]);
    expect(result).toEqual([{ familia: 'peso', total: 2, unidadeBase: 'kg' }]);
  });

  it('returns empty array for empty input', () => {
    expect(aggregateQuantity([])).toEqual([]);
  });
});
