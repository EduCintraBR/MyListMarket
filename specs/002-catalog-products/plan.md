# Plan: Catalog of Products

> Feature ID: 002 — companion to `spec.md`
> Reference data model: `specs/_shared/data-model.md` (`produtos`, `itens_lista`)

## 1. Approach summary

Repository pattern over Drizzle for `produtos`. Implicit insert helper `getOrCreateProduto(nome)` normalizes the name (lowercase + strip diacritics) before lookup. A `useProdutoSuggestions(query)` hook returns ranked suggestions. Unit-normalization helper is a pure function in `src/lib/units.ts` (heavily unit-tested — feeds reports too).

## 2. Files / modules

| Path | Action | Purpose |
|------|--------|---------|
| `src/db/repos/produtoRepo.ts` | new | CRUD + getOrCreate |
| `src/lib/textNormalize.ts` | new | lowercase + strip diacritics |
| `src/lib/units.ts` | new | family map + normalize aggregator |
| `src/state/slices/produtos.ts` | edit | wire Zustand → repo |
| `src/screens/CatalogoScreen.tsx` | new | RF-CAT-03 list |
| `src/screens/EditProdutoScreen.tsx` | new | edit form |
| `src/components/ProdutoAutoComplete.tsx` | new | shared, used by features 004, 005 |
| `src/hooks/useProdutoSuggestions.ts` | new | ranked search |
| `src/__tests__/units.test.ts` | new | C-7 cases |
| `src/__tests__/produtoRepo.test.ts` | new | dedup, soft delete |

## 3. Data-model deltas

None — `produtos` already in 0001_init.

## 4. Navigation routes

- `RootTabs → Config → Catálogo` (push), or move to a dedicated tab — TBD with design. Default: nested under Config for V1.
- `Catálogo → EditProduto({ produtoId })`.

## 5. Third-party libs

None new. Diacritic strip via `String.prototype.normalize('NFD').replace(/[̀-ͯ]/g,'')`.

## 6. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Auto-complete latency w/ large catalog | LIKE query on `nome` w/ COLLATE NOCASE + LIMIT 8 + debounce 150ms |
| Diacritic mismatch | Store a `nome_normalizado` shadow column? **Decision:** compute at query-time for V1; revisit if perf bites |

## 7. Test strategy

- Unit: `units.ts` (kg+g, L+mL, mixed families, null unit).
- Unit: `produtoRepo.getOrCreate` dedup with diacritics.
- Component: `ProdutoAutoComplete` shows suggestions, fills brand/model on select.
- Manual QA: catalog grows as user adds items in lists.

## 8. Rollout / flag

N/A.
