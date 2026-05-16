# Tasks: Planning Mode

> Feature ID: 004

## Data layer

- [x] T-10 — `listaRepo.list()` returns all non-deleted with item counts.
- [x] T-11 — `listaRepo.create({ nome? })` defaults via `listaNaming`.
- [x] T-12 — `listaRepo.update(id, patch)`.
- [x] T-13 — `listaRepo.encerrar(id)` — only from `planejamento`.
- [x] T-14 — `listaRepo.softDelete(id)`.
- [x] T-15 — `itemListaRepo.list(listaId)` ordered by `produto.nome COLLATE NOCASE`.
- [x] T-16 — `itemListaRepo.add(listaId, payload)` — calls `produtoRepo.getOrCreate`.
- [x] T-17 — `itemListaRepo.update(id, patch)`.
- [x] T-18 — `itemListaRepo.remove(id)` — physical delete (allowed while lista in `planejamento`).

## State

- [x] T-20 — Zustand `listas` slice w/ selectors `byStatus`, `byId`, item subselectors.

## UI

- [x] T-30 — `HomeListasScreen` — FlatList of lists w/ status badge + FAB "Nova lista".
- [x] T-31 — `ListaDetailScreen` — header (nome editável, encerrar), AddItemForm, FlatList items.
- [x] T-32 — `ItemListaRow` — tap to expand for edit; long-press → remove w/ confirm.
- [x] T-33 — `AddItemForm` — uses `ProdutoAutoComplete` + qty/unit/marca/modelo fields.
- [x] T-34 — `listaNaming.ts` — "Lista de DD/MM/YYYY".

## Tests

- [x] T-40 — Unit `listaNaming`.
- [x] T-41 — Unit `listaRepo` status transitions (encerrar from em_compra MUST fail).
- [x] T-42 — Component: add item → appears in alpha position.
- [ ] T-43 — Manual QA: edit a produto name from Catálogo, list reflects change — pending user.

## Polish

- [x] T-50 — A11y: row announce produto + qty + unidade.
- [ ] T-51 — Dark mode check — pending user.

## Done when

All AC pass.
