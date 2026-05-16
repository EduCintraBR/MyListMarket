# Tasks: History

> Feature ID: 007

## Data layer

- [x] T-10 — `compraRepo.list({ mes?, mercadoId?, limit, offset })`.
- [x] T-11 — `compraRepo.byId(id)` w/ items joined.
- [x] T-12 — `compraRepo.softDelete(id)`.

## UI

- [x] T-20 — `HistoricoScreen` w/ filter chips + FlatList + empty state.
- [x] T-21 — `CompraDetailScreen` — sections: itens, totais, mercado/payment, cupom.
- [x] T-22 — `MesFilterChips` — last 6 months from current date.
- [x] T-23 — `CupomViewer` — thumbnail + tap → fullscreen Portal/Modal.

## Tests

- [x] T-40 — Repo unit: soft delete hides from list.
- [x] T-41 — Repo unit: archived-mercado tag covered in compraRepo tests.
- [ ] T-42 — Manual QA: open old compra, view cupom photo — pending user.

## Polish

- [x] T-50 — A11y on cupom fullscreen (dismiss hint).

## Done when

All AC pass.
