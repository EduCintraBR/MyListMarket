# Tasks: Settings, Theming & Polish

> Feature ID: 009

## Data layer

- [x] T-10 — Migration `0002_kv.sql`.
- [x] T-11 — `kvRepo.get(k)` / `set(k,v)`.

## State

- [x] T-20 — `settings` Zustand slice w/ `themeMode` ∈ `system|light|dark`.
- [x] T-21 — `useThemeMode` hook + sync init in `App.tsx`. _Wired via `useAppStore` selector inside `App.tsx`; no dedicated hook._

## UI

- [x] T-30 — `ConfigScreen` — sections: Tema, Catálogo, Mercados, Sobre, V1.1 placeholders.
- [x] T-31 — `SobreScreen` — versão (from `expo-constants`), link to PRD. _Version shown via `Constants.expoConfig?.version`; PRD lives outside the app bundle so it's referenced in copy rather than linked._

## A11y + polish sweep (per screen)

- [ ] T-40 — Audit Listas + Detalhe (a11y, touch targets, dark mode).
- [ ] T-41 — Audit Compra Mode.
- [ ] T-42 — Audit Checkout Flow.
- [ ] T-43 — Audit Histórico + Detalhe.
- [ ] T-44 — Audit Relatórios.
- [ ] T-45 — Audit Catálogo + Mercados.

## Performance

- [ ] T-50 — Measure cold start, interactions, total recompute on low-end device. Capture results in `docs/perf-report.md`.

## Tests

- [x] T-60 — Unit: `kvRepo` round-trip.
- [ ] T-61 — Manual: VoiceOver iOS pass.
- [ ] T-62 — Manual: TalkBack Android pass.
- [ ] T-63 — Manual: Dynamic Type XXL.

## Done when

All AC pass + perf report shows budgets met.
