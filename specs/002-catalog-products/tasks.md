# Tasks: Catalog of Products

> Feature ID: 002

## Data layer

- [x] T-10 — `produtoRepo.list({ includeDeleted })` ordered case-insensitive.
- [x] T-11 — `produtoRepo.search(query, limit=8)` diacritics-insensitive substring.
- [x] T-12 — `produtoRepo.getOrCreate(nome)` — diacritic-insensitive dedup.
- [x] T-13 — `produtoRepo.update(id, patch)`.
- [x] T-14 — `produtoRepo.softDelete(id)`.

## Business logic

- [x] T-20 — `src/lib/textNormalize.ts` exports `normalizeText(str)`.
- [x] T-21 — `src/lib/units.ts` exports `FAMILIA_DE`, `BASE_DE`, `toBase`, `aggregateQuantity`.
- [x] T-22 — Zustand `produtos` slice w/ init + actions.

## UI

- [x] T-30 — `ProdutoAutoComplete` w/ value/onChangeText/suggestions/onSelect.
- [x] T-31 — `CatalogoScreen` — Searchbar + FlatList + long-press archive + FAB new.
- [x] T-32 — `EditProdutoScreen` — nome/marca/modelo/unidade form.
- [x] T-33 — Navigation: Config tab → ConfigStack → Catalogo → EditProduto.

## Tests

- [x] T-40 — Units: pure peso, pure volume, mixed, null unit (`units.test.ts`).
- [x] T-41 — Repo: dedup "Arroz"/"Arróz"/"arroz" (`produtoRepo.test.ts`).
- [x] T-42 — Component: select suggestion (`ProdutoAutoComplete.test.tsx`).
- [ ] T-43 — Manual QA on device — pending user.

## Polish

- [x] T-50 — A11y labels on autocomplete input + suggestion buttons.
- [ ] T-51 — Dark mode visual check on device — pending user.

## Done when

All AC pass.
