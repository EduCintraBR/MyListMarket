import { normalizeText } from '@/lib/textNormalize';

describe('normalizeText', () => {
  it('lowercases the input', () => {
    expect(normalizeText('Arroz')).toBe('arroz');
  });

  it('strips diacritics (PT-BR examples)', () => {
    expect(normalizeText('Arróz')).toBe('arroz');
    expect(normalizeText('Açúcar')).toBe('acucar');
    expect(normalizeText('Pão de Açúcar')).toBe('pao de acucar');
    expect(normalizeText('Não-comprar')).toBe('nao-comprar');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeText('  Café  ')).toBe('cafe');
  });

  it('collapses internal whitespace to single spaces', () => {
    expect(normalizeText('arroz    branco')).toBe('arroz branco');
  });

  it('treats "Arróz" and "Arroz" as equal', () => {
    expect(normalizeText('Arróz')).toEqual(normalizeText('Arroz'));
  });

  it('returns empty string for empty input', () => {
    expect(normalizeText('')).toBe('');
    expect(normalizeText('   ')).toBe('');
  });
});
