# Plan: Shopping Mode

> Feature ID: 005 — companion to `spec.md`
> Reference data model: `specs/_shared/data-model.md` (`listas`, `itens_lista`)

## 1. Approach summary

Introduce a dedicated `compraAtiva` Zustand slice. It holds the currently active `lista_id`, the de-normalized items array, the `mercado_id` (optional pre-checkout), and a memoized `totalParcial`. All mutations go through the slice (single source of truth), which persists to SQLite immediately. Total recompute is local + <100 ms (RN-10).

A boot-time check in `App.tsx` queries `listas WHERE status='em_compra'`. If found, deep-link into `CompraModeScreen` automatically.

## 2. Files / modules

| Path | Action | Purpose |
|------|--------|---------|
| `src/state/slices/compraAtiva.ts` | edit | full implementation |
| `src/db/repos/listaRepo.ts` | edit | `iniciarCompra(listaId)` w/ single-active guard (UNIQUE-style check inside a tx) |
| `src/db/repos/itemListaRepo.ts` | edit | `marcarComprado`, `desmarcar`, `addUnplanned` |
| `src/screens/CompraModeScreen.tsx` | new | the to-do view |
| `src/components/TotalParcialHeader.tsx` | new | sticky top |
| `src/components/MarcarItemSheet.tsx` | new | bottom sheet for qty + preço |
| `src/components/FiltroChips.tsx` | new | filter chip set |
| `src/components/AddItemEmCompraForm.tsx` | new | unplanned add |
| `src/lib/money.ts` | new | BRL formatter |
| `src/lib/total.ts` | new | pure total calc (testable) |
| `src/__tests__/total.test.ts` | new | C-7 perf + correctness |

## 3. Data-model deltas

None.

## 4. Navigation routes

- `Listas → ListaDetail → CompraMode({ listaId })` (push).
- App boot deep-link if any list in `em_compra`.

## 5. Third-party libs

None new. Bottom-sheet via RN Paper `Modal` (consistent with feature 003 decision).

## 6. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Total lags > 100 ms | Compute in memory from slice state, not via DB roundtrip; useMemo over items |
| Race when two lists try to enter `em_compra` | All status writes wrapped in SQLite tx + pre-check; UI offers conflict resolution |
| Data loss on crash | Each item write commits immediately (no batching) |

## 7. Test strategy

- Unit: `total.ts` — handles items with null qty/preço (excluded), float precision (2 decimals).
- Unit: `listaRepo.iniciarCompra` rejects when another list already `em_compra`.
- Component: mark + edit + remove flow; assert header total.
- Manual QA on device: real grocery run (golden path), kill app & reopen.

## 8. Rollout / flag

N/A.
