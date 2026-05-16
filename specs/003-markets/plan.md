# Plan: Markets

> Feature ID: 003 — companion to `spec.md`
> Reference data model: `specs/_shared/data-model.md` (`mercados`)

## 1. Approach summary

Mirror of 002 in shape but simpler (no auto-complete on usage frequency required). Shared `MercadoPicker` component is the linchpin — reused by features 005 and 006.

## 2. Files / modules

| Path | Action | Purpose |
|------|--------|---------|
| `src/db/repos/mercadoRepo.ts` | new | CRUD + soft delete |
| `src/state/slices/mercados.ts` | edit | wire to repo |
| `src/screens/MercadosScreen.tsx` | new | RF-MERC-01/02 list |
| `src/screens/EditMercadoScreen.tsx` | new | form |
| `src/components/MercadoPicker.tsx` | new | bottom-sheet picker w/ "+ novo" |
| `src/__tests__/mercadoRepo.test.ts` | new | soft delete behavior |

## 3. Data-model deltas

None — `mercados` already in 0001_init.

## 4. Navigation routes

- `Config → Mercados → EditMercado({ mercadoId? })`.

## 5. Third-party libs

None new. Bottom sheet via `@gorhom/bottom-sheet`? **Decision:** use RN Paper `Modal` for V1 to avoid extra dep.

## 6. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Inline-create UX coupling with checkout | Encapsulate in `MercadoPicker` so checkout doesn't navigate away |

## 7. Test strategy

- Unit: repo soft-delete excludes from list, includes in `byId`.
- Component: `MercadoPicker` inline-create flow.
- Manual QA: archive a market mid-compra; ensure no crash.

## 8. Rollout / flag

N/A.
