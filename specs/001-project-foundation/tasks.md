# Tasks: Project Foundation

> Feature ID: 001

## Setup

- [x] T-01 — Project scaffolded manually (Expo SDK 51, TypeScript blank-equivalent layout).
- [x] T-02 — TypeScript `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` set in `tsconfig.json`.
- [x] T-03 — ESLint (`eslint-config-expo` + `@typescript-eslint` + `import`) + Prettier; `lint`/`format` scripts.
- [x] T-04 — Runtime deps installed: `expo-sqlite`, `drizzle-orm`, `zustand`, `@react-navigation/{native,bottom-tabs}`, `react-native-paper`, `react-native-safe-area-context`, `react-native-screens`, `expo-crypto`, `react-native-gesture-handler`, `react-native-reanimated`.

## Data layer

- [x] T-10 — `src/db/schema.ts` matches shared data-model.
- [x] T-11 — `src/db/migrations/0001_init.sql` (canonical) + `0001_init.ts` (TS mirror, Metro/Jest-friendly).
- [x] T-12 — `src/db/client.ts` opens `mylistmarket.db` via `expo-sqlite` + Drizzle adapter.
- [x] T-13 — `src/db/runMigrations.ts` — idempotent runner w/ `_migrations` ledger.
- [x] T-14 — Smoke test: tables + indexes + soft-delete columns + FK enforcement (`migrations.test.ts`).

## State

- [x] T-20 — Root Zustand store w/ empty slices (`listas`, `produtos`, `mercados`, `compraAtiva`).

## UI scaffold

- [x] T-30 — `src/theme/index.ts` exports `lightTheme`, `darkTheme` (MD3, brand colors).
- [x] T-31 — `App.tsx` — `SafeAreaProvider` + `PaperProvider` w/ system color scheme + `NavigationContainer` + `RootTabs` + migration boot.
- [x] T-32 — Four placeholder screens (Listas, Histórico, Relatórios, Config) with titles.
- [x] T-33 — `src/lib/log.ts` w/ dev-only info/warn, always-on error.
- [x] T-34 — `src/lib/id.ts` UUID via `expo-crypto`.

## Tests

- [x] T-40 — Component test asserts `HomeListasScreen` renders the Listas header (proxy for tab labels).
- [ ] T-41 — Manual QA on iOS sim + Android emu — toggle system dark mode, theme follows. *(requires user with device — not executable by Claude)*

## Polish

- [x] T-50 — `no-console` ESLint rule active (`warn`/`error` allowed only).
- [x] T-51 — README run instructions present.

## Done when

All checkboxes ticked **and** AC-1..8 in `spec.md` pass.

### Status of AC

| AC | State | Note |
|----|-------|------|
| AC-1 boot iOS+Android | Pending manual QA | needs simulator/emulator |
| AC-2 typecheck strict | ✓ `npx tsc --noEmit` clean |
| AC-3 lint clean | ✓ `npx eslint .` clean |
| AC-4 DB + migration | ✓ asserted by `migrations.test.ts` |
| AC-5 dark/light theme follows system | Pending manual QA | code wired via `useColorScheme` |
| AC-6 bottom tabs render | Partial — `HomeListasScreen` covered by component test; full tab smoke pending device QA |
| AC-7 Zustand boots | ✓ `useAppStore` mounts in App via slices |
| AC-8 logger util / no raw console.log | ✓ enforced by lint rule |
