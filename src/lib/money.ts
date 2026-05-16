// pt-BR BRL formatter. Manual implementation to avoid Intl dependence on Hermes.
// Constitution C-9: locale = pt-BR.

const pad2 = (n: number): string => String(n).padStart(2, '0');

export const formatBRL = (raw: number): string => {
  const value = Math.abs(raw);
  const sign = raw < 0 ? '-' : '';
  // Two-stage round avoids 1.005 → 1.00 drift caused by binary representation.
  const rounded = Math.round(Math.round(value * 1e9) / 1e7);
  const reais = Math.trunc(rounded / 100);
  const centavos = rounded % 100;
  const reaisStr = reais.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}R$ ${reaisStr},${pad2(centavos)}`;
};
