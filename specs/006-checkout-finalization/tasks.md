# Tasks: Checkout & Finalization

> Feature ID: 006

## Data layer

- [x] T-10 — `compraRepo.create({ listaId, mercadoId, formaPagamento, totalReal?, fotoCupomPath? })` — in SQLite tx; on success updates `listas.status='finalizada'`, `listas.finalizada_em=now`.
- [x] T-11 — Helper to clone pendentes into a new lista (`listaRepo.clonarPendentes(listaId)`).

## Business logic

- [x] T-20 — Recompute `total_calculado` at commit time from `itens_lista` (source of truth).
- [x] T-21 — `src/lib/image.ts` — picks/captures, resizes max 1600px, q=0.8 JPEG, writes to `FileSystem.documentDirectory/cupons/<uuid>.jpg`.
- [x] T-22 — On tx failure: delete written image.

## UI

- [x] T-30 — `CheckoutFlow` stack navigator (modal).
- [x] T-31 — `ConfirmPendentes` — only shown if any item `status!='comprado'`.
- [x] T-32 — `CheckoutForm` — Mercado picker (inline-create) + `FormaPagamentoSelector` (5 chips) + `total_real` (decimal kbd, optional).
- [x] T-33 — `FormaPagamentoSelector` component.
- [x] T-34 — `FotoCupom` — buttons "Tirar foto" / "Escolher da galeria" / "Pular" / "Remover foto"; permission flow.
- [x] T-35 — `Resumo` — itens list + totais + diferença + mercado/payment.
- [x] T-36 — `DestinoPendentes` — only shown if unbought items exist; radio descartar/mover.

## Tests

- [x] T-40 — Unit: tx atomicity covered via compraRepo tests (create rolls into lista status).
- [x] T-41 — Unit: `clonarPendentes` keeps only `status!='comprado'` items.
- [x] T-42 — Component: FormaPagamentoSelector + slice flow covered.
- [ ] T-43 — Manual QA: complete a real compra w/ photo on iOS + Android — pending user.

## Polish

- [x] T-50 — A11y: announce step number (1/5, 2/5…) — `CheckoutStepHeader` with `accessibilityLiveRegion="polite"` on all 5 screens.
- [x] T-51 — Numeric/decimal keypad on preço + total_real.

## Done when

All AC pass.
