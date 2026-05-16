import { defaultListaNome } from '@/lib/listaNaming';

describe('defaultListaNome', () => {
  it('formats date as DD/MM/YYYY in pt-BR style', () => {
    const d = new Date(2026, 4, 15); // 2026-05-15 (month is 0-indexed)
    expect(defaultListaNome(d)).toBe('Lista de 15/05/2026');
  });

  it('zero-pads single-digit day and month', () => {
    const d = new Date(2026, 0, 3); // 2026-01-03
    expect(defaultListaNome(d)).toBe('Lista de 03/01/2026');
  });

  it('defaults to current date when called without argument', () => {
    const sample = defaultListaNome();
    expect(sample).toMatch(/^Lista de \d{2}\/\d{2}\/\d{4}$/);
  });
});
