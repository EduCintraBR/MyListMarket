# Tasks: Reports & Analytics

> Feature ID: 008

## Data layer

- [x] T-10 — `reportsRepo.gastoPorPeriodo({ from, to, bucket })`.
- [x] T-11 — `reportsRepo.gastoPorMercado({ from, to })`.
- [x] T-12 — `reportsRepo.topProdutosFreq({ from, to, limit })`.
- [x] T-13 — `reportsRepo.topProdutosQtd({ from, to, limit })` — applies unit normalization.
- [x] T-14 — `reportsRepo.topProdutosValor({ from, to, limit })`.
- [x] T-15 — `reportsRepo.variacaoPreco({ produtoId, from, to })`.
- [x] T-16 — `reportsRepo.formasPagamento({ from, to })`.
- [x] T-17 — `reportsRepo.reconciliacao({ from, to })`.
- [x] T-18 — `reportsRepo.foraDaLista({ from, to })`.
- [x] T-19 — `reportsRepo.listasIncompletas({ from, to })`.
- [x] T-20 — `reportsRepo.ticketMedio({ from, to, mercadoId? })`.

## UI

- [x] T-30 — `RelatoriosScreen` host + scrollable card column.
- [x] T-31 — `PeriodPicker`.
- [x] T-32 — Each card component (10× — see plan). _Implemented as inline sections with `BarRow` + `Card` instead of Victory charts; chart lib deferred._

## Tests

- [x] T-40 — Unit: seed 3 months of compras, assert `gastoPorPeriodo` totals.
- [x] T-41 — Unit: `topProdutosQtd` w/ mixed kg/g rows → returns kg-normalized total.
- [x] T-42 — Unit: `reconciliacao` returns null when no `total_real` informed.
- [ ] T-43 — Manual QA: scroll all 9 cards on seeded device data.

## Polish

- [ ] T-50 — Chart a11y labels (Victory's `accessibilityLabel`). _Deferred — Victory Native not yet installed; `BarRow` carries text labels for now._
- [x] T-51 — Lazy-load card content (`useFocusEffect` + skeletons).

## Done when

All AC pass + cards render in <500 ms with 6-month seed.
