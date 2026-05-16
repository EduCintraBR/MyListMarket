# Plan: Planning Mode

> Feature ID: 004 — companion to `spec.md`
> Reference data model: `specs/_shared/data-model.md` (`listas`, `itens_lista`)

## 1. Approach summary

Lists screen (home tab) + list-detail screen for editing. Items live in Zustand keyed by `lista_id` with optimistic updates against `itens_lista` repo. The `ProdutoAutoComplete` from feature 002 is consumed directly. No reorder logic — purely server-side `ORDER BY produto.nome COLLATE NOCASE`.

## 2. Files / modules

| Path | Action | Purpose |
|------|--------|---------|
| `src/db/repos/listaRepo.ts` | new | CRUD + status transitions |
| `src/db/repos/itemListaRepo.ts` | new | CRUD scoped to a lista |
| `src/state/slices/listas.ts` | edit | wire repo |
| `src/screens/HomeListasScreen.tsx` | edit | turn placeholder into real list |
| `src/screens/ListaDetailScreen.tsx` | new | item editor |
| `src/components/ItemListaRow.tsx` | new | row with edit/remove |
| `src/components/AddItemForm.tsx` | new | nome (autocomplete) + qty/marca/modelo/unidade |
| `src/lib/listaNaming.ts` | new | default name from date |
| `src/__tests__/listaRepo.test.ts` | new | status transitions |

## 3. Data-model deltas

None.

## 4. Navigation routes

- `RootTabs → Listas → HomeListasScreen`.
- `HomeListasScreen → ListaDetail({ listaId })`.

## 5. Third-party libs

None new. Date formatting via `Intl.DateTimeFormat('pt-BR')`.

## 6. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Re-rendering long item lists | `FlatList` + memoized row + key by item id |
| Accidental delete | Confirmation `Alert.alert` |

## 7. Test strategy

- Unit: `listaNaming` produces "Lista de DD/MM/YYYY".
- Unit: `listaRepo.encerrar` only valid from `planejamento` (rejects `em_compra`).
- Component: add-item form + autocomplete integration.
- Manual QA: build 3 lists in parallel; verify counts on home.

## 8. Rollout / flag

N/A.
