# Plan: History

> Feature ID: 007 — companion to `spec.md`
> Reference data model: `specs/_shared/data-model.md` (`compras`, joined with `mercados`, `listas`, `itens_lista`)

## 1. Approach summary

Read-only screens reading the `compras` table with joins. Detail screen reuses the same item-row component family used in Resumo (feature 006). Photo fullscreen uses RN Paper `Portal` + `Modal`.

## 2. Files / modules

| Path | Action | Purpose |
|------|--------|---------|
| `src/db/repos/compraRepo.ts` | edit | add `list`, `byId`, `softDelete` |
| `src/screens/HistoricoScreen.tsx` | edit | turn placeholder into list |
| `src/screens/CompraDetailScreen.tsx` | new | detail view |
| `src/components/MesFilterChips.tsx` | new | last N months |
| `src/components/CupomViewer.tsx` | new | thumbnail + fullscreen |

## 3. Data-model deltas

None.

## 4. Navigation routes

- `RootTabs → Histórico → HistoricoScreen → CompraDetail({ compraId })`.

## 5. Third-party libs

None new.

## 6. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Long history list perf | FlatList + windowing + paginated query (LIMIT 50, infinite scroll) |
| Missing cupom file | wrap `Image` with onError → placeholder |

## 7. Test strategy

- Unit: `compraRepo.list` filters soft-deleted, includes archived mercados.
- Component: detail renders all sections for a fixture compra.
- Manual QA: scroll through 100+ compras (use dev seed).

## 8. Rollout / flag

N/A.
