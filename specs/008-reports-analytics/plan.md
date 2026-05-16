# Plan: Reports & Analytics

> Feature ID: 008 — companion to `spec.md`
> Reference data model: `specs/_shared/data-model.md` (`compras`, `itens_lista`, `produtos`, `mercados`)

## 1. Approach summary

Single Relatórios screen with a horizontal scroller of report cards. Each card is a self-contained component that queries `compraRepo` / `itemListaRepo` joined views. Heavy aggregations run as SQL queries (not in-memory) for V1 reasonable dataset sizes; if performance becomes an issue, pre-aggregate into materialized snapshot tables (deferred until measured).

Unit normalization comes from `src/lib/units.ts` (feature 002).

## 2. Files / modules

| Path | Action | Purpose |
|------|--------|---------|
| `src/db/repos/reportsRepo.ts` | new | aggregated query helpers |
| `src/screens/RelatoriosScreen.tsx` | edit | cards layout + period selector |
| `src/components/reports/PeriodPicker.tsx` | new | dia/sem/mês/ano/custom |
| `src/components/reports/GastoPorPeriodoChart.tsx` | new | AC-1 |
| `src/components/reports/GastoPorMercadoCard.tsx` | new | AC-2 |
| `src/components/reports/TopProdutosCard.tsx` | new | AC-3 (3 tabs) |
| `src/components/reports/VariacaoPrecoCard.tsx` | new | AC-4 |
| `src/components/reports/FormasPagamentoCard.tsx` | new | AC-5 |
| `src/components/reports/ReconciliacaoCard.tsx` | new | AC-6 |
| `src/components/reports/ForaDaListaCard.tsx` | new | AC-7 |
| `src/components/reports/ListasIncompletasCard.tsx` | new | AC-8 |
| `src/components/reports/TicketMedioCard.tsx` | new | AC-9 |
| `src/__tests__/reportsRepo.test.ts` | new | aggregation correctness |

## 3. Data-model deltas

None. Possible future migration 0002 to add materialized aggregates — out of V1 scope.

## 4. Navigation routes

- `RootTabs → Relatórios → RelatoriosScreen`.

## 5. Third-party libs

- `victory-native` + `react-native-svg`.

## 6. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Aggregation slow with months of data | SQL-side aggregation w/ proper indexes; lazy-render cards as scrolled in |
| Chart bundle weight | Tree-shake to used Victory components only |
| Locale-aware month grouping | Use date-fns w/ pt-BR locale or pure `Intl` API |

## 7. Test strategy

- Unit: each aggregation function w/ seeded fixtures (Jest + in-memory SQLite via better-sqlite3 in tests).
- Unit: unit normalization in `TopProdutosCard` queries.
- Manual QA: load 6 months of seeded data, verify charts render <500 ms.

## 8. Rollout / flag

N/A.
