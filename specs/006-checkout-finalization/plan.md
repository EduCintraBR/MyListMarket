# Plan: Checkout & Finalization

> Feature ID: 006 — companion to `spec.md`
> Reference data model: `specs/_shared/data-model.md` (`compras`, `listas`, `itens_lista`)

## 1. Approach summary

Multi-step modal stack: **Confirm Pendentes** → **Checkout Form** → **Foto Cupom (opt)** → **Resumo** → **Destino Pendentes**. Each step writes to local state; only the Resumo "Concluir" button performs the atomic SQLite transaction that inserts the `compras` row, flips `listas.status` to `finalizada`, and optionally clones pendentes into a new lista. Photo capture uses `expo-image-picker` + `expo-image-manipulator` for resize/compression.

## 2. Files / modules

| Path | Action | Purpose |
|------|--------|---------|
| `src/db/repos/compraRepo.ts` | new | `create(payload)` in tx |
| `src/db/repos/listaRepo.ts` | edit | `finalizar(listaId)` |
| `src/screens/CheckoutFlow/index.tsx` | new | stack host |
| `src/screens/CheckoutFlow/ConfirmPendentes.tsx` | new | confirm dialog screen |
| `src/screens/CheckoutFlow/CheckoutForm.tsx` | new | mercado + forma_pagamento + total_real |
| `src/screens/CheckoutFlow/FotoCupom.tsx` | new | image picker + preview |
| `src/screens/CheckoutFlow/Resumo.tsx` | new | summary + commit button |
| `src/screens/CheckoutFlow/DestinoPendentes.tsx` | new | descartar / mover |
| `src/lib/image.ts` | new | resize + write to documentDirectory |
| `src/components/FormaPagamentoSelector.tsx` | new | 5-option radio chips |
| `src/__tests__/compraRepo.test.ts` | new | tx atomicity |

## 3. Data-model deltas

None — `compras` table already in 0001_init.

## 4. Navigation routes

- `CompraMode → CheckoutFlow (modal)` with internal stack of 5 screens.

## 5. Third-party libs

- `expo-image-picker` (already in stack).
- `expo-image-manipulator` (already in stack).
- `expo-file-system` (already in stack).

## 6. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Partial commit if app crashes mid-tx | Wrap in single SQLite tx; image write happens **before** tx (path stored on success) |
| Orphaned images if tx fails | On tx failure, delete the just-written image |
| Wrong final total if items mutated mid-checkout | Recompute `total_calculado` at commit time, not at flow start |

## 7. Test strategy

- Unit: `compraRepo.create` rolls back on bad input; happy path returns id.
- Unit: `lib/image.ts` produces file within size budget.
- Component: 5-step flow forward/back; cancel preserves no state.
- Manual QA: full grocery run end-to-end on iOS + Android.

## 8. Rollout / flag

N/A.
