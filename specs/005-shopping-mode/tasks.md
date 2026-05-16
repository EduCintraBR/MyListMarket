# Tasks: Shopping Mode

> Feature ID: 005

## Data layer

- [x] T-10 — `listaRepo.iniciarCompra(listaId)` — tx-guarded, single-active rule.
- [x] T-11 — `listaRepo.activeCompraId()` — convenience selector.
- [x] T-12 — `itemListaRepo.marcarComprado(itemId, { qtd, preco })`.
- [x] T-13 — `itemListaRepo.desmarcar(itemId)` — back to `a_comprar`, clears qtd_comprada/preco.
- [x] T-14 — `itemListaRepo.addUnplanned(listaId, payload)` — `origem='compra'`, `status='comprado'`.
- [x] T-15 — `itemListaRepo.removeUnplanned(itemId)` — physical delete (only origem='compra').

## Business logic

- [x] T-20 — `src/lib/total.ts` `computeTotal(items): number`.
- [x] T-21 — `src/lib/money.ts` `formatBRL(n)`.
- [x] T-22 — `compraAtiva` Zustand slice with `start`, `setMercado`, `marcar`, `editar`, `remover`, `addUnplanned`, derived `totalParcial`.
- [x] T-23 — App boot deep-link to `CompraMode` if active compra exists.

## UI

- [x] T-30 — `CompraModeScreen` — sticky header + filter chips + FlatList.
- [x] T-31 — `TotalParcialHeader` — large BRL text.
- [x] T-32 — `MarcarItemSheet` — qty (numeric kbd) + preço (decimal kbd).
- [x] T-33 — `FiltroChips` — combinable filters.
- [x] T-34 — `AddItemEmCompraForm` — uses `ProdutoAutoComplete`.
- [x] T-35 — Inline `MercadoPicker` invocation at header.

## Tests

- [x] T-40 — Unit: `total.ts` correctness + perf (>1000 items computed <100ms).
- [x] T-41 — Unit: `iniciarCompra` conflict rejection.
- [x] T-42 — Component: mark item → total updates.
- [x] T-43 — Component: filter chips combine.
- [ ] T-44 — Manual QA: real-world shopping run on iOS + Android — pending user.

## Polish

- [x] T-50 — A11y: announce total on change (live region).
- [x] T-51 — Large touch targets ≥ 48dp for all chips & checkboxes.

## Done when

All AC pass + total recompute <100 ms verified.
