# Tasks: Markets

> Feature ID: 003

## Data layer

- [x] T-10 — `mercadoRepo.list({ includeArchived })`.
- [x] T-11 — `mercadoRepo.byId(id)` returns archived too.
- [x] T-12 — `mercadoRepo.create({ nome, observacoes })`.
- [x] T-13 — `mercadoRepo.update(id, patch)`.
- [x] T-14 — `mercadoRepo.softDelete(id)` + `restore(id)`.

## State

- [x] T-20 — Zustand `mercados` slice w/ init + actions.

## UI

- [x] T-30 — `MercadosScreen` — search + archived toggle + FAB.
- [x] T-31 — `EditMercadoScreen` — nome + observações form.
- [x] T-32 — `MercadoPicker` — Modal + inline create.

## Tests

- [x] T-40 — Repo: soft delete excludes from list, byId still returns (`mercadoRepo.test.ts`).
- [x] T-41 — Component: inline-create flow (`MercadoPicker.test.tsx`).
- [ ] T-42 — Manual QA on device — pending user.

## Polish

- [x] T-50 — A11y on FAB + picker.

## Done when

All AC pass.
