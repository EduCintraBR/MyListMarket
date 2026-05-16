import { computeTotal } from '@/lib/total';

type Sample = Parameters<typeof computeTotal>[0][number];

const item = (s: Partial<Sample>): Sample => ({
  status: 'comprado',
  quantidadeComprada: null,
  precoUnitario: null,
  ...s,
});

describe('computeTotal', () => {
  it('returns 0 for empty list', () => {
    expect(computeTotal([])).toBe(0);
  });

  it('sums qty × preço only for items with status comprado', () => {
    expect(
      computeTotal([
        item({ status: 'comprado', quantidadeComprada: 2, precoUnitario: 3.5 }),
        item({ status: 'comprado', quantidadeComprada: 1, precoUnitario: 1 }),
        item({ status: 'a_comprar', quantidadeComprada: 99, precoUnitario: 99 }),
      ]),
    ).toBe(8);
  });

  it('ignores items missing qty or preço', () => {
    expect(
      computeTotal([
        item({ quantidadeComprada: null, precoUnitario: 5 }),
        item({ quantidadeComprada: 2, precoUnitario: null }),
        item({ quantidadeComprada: 1, precoUnitario: 4 }),
      ]),
    ).toBe(4);
  });

  it('handles realistic decimals (no floating-point drift visible at 2 dp)', () => {
    const total = computeTotal([
      item({ quantidadeComprada: 1.5, precoUnitario: 2.99 }),
      item({ quantidadeComprada: 0.5, precoUnitario: 7.5 }),
    ]);
    expect(Math.round(total * 100) / 100).toBe(8.24);
  });

  it('computes 1000 items in under 100 ms (perf budget §6.2)', () => {
    const big: Sample[] = Array.from({ length: 1000 }, (_, i) =>
      item({
        status: 'comprado',
        quantidadeComprada: 1,
        precoUnitario: i % 10,
      }),
    );
    const t0 = performance.now();
    const sum = computeTotal(big);
    const dt = performance.now() - t0;
    expect(sum).toBeGreaterThan(0);
    expect(dt).toBeLessThan(100);
  });
});
