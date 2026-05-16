# Plan: Project Foundation

> Feature ID: 001 — companion to `spec.md`
> Reference data model: `specs/_shared/data-model.md`

## 1. Approach summary

Bootstrap an Expo (managed) TypeScript app, wire Drizzle ORM against `expo-sqlite`, run the v1 baseline migration on boot, and stand up RN Paper theming + React Navigation skeleton + Zustand store. No business logic yet — pure scaffold.

## 2. Files / modules

| Path | Action | Purpose |
|------|--------|---------|
| `package.json` | new | deps + scripts |
| `tsconfig.json` | new | strict TS |
| `app.json` / `app.config.ts` | new | Expo config |
| `babel.config.js` | new | Expo + Reanimated preset |
| `metro.config.js` | new | default Expo |
| `.eslintrc.cjs`, `.prettierrc` | new | lint/format |
| `src/App.tsx` | new | root, theme + nav + DB init |
| `src/db/client.ts` | new | open expo-sqlite + Drizzle |
| `src/db/schema.ts` | new | Drizzle tables per shared data-model |
| `src/db/migrations/0001_init.sql` | new | baseline schema |
| `src/db/runMigrations.ts` | new | idempotent migration runner |
| `src/state/index.ts` | new | Zustand root store |
| `src/state/slices/{listas,produtos,mercados,compraAtiva}.ts` | new | empty slices |
| `src/navigation/RootTabs.tsx` | new | bottom tabs (Listas, Histórico, Relatórios, Config) |
| `src/screens/HomeListasScreen.tsx` | new | placeholder |
| `src/screens/HistoricoScreen.tsx` | new | placeholder |
| `src/screens/RelatoriosScreen.tsx` | new | placeholder |
| `src/screens/ConfigScreen.tsx` | new | placeholder |
| `src/theme/index.ts` | new | RN Paper light + dark themes |
| `src/lib/log.ts` | new | logger wrapper |
| `src/lib/id.ts` | new | UUID factory |
| `jest.config.js`, `src/__tests__/smoke.test.ts` | new | smoke test |

## 3. Data-model deltas

Full v1 baseline. See `specs/_shared/data-model.md`. Migration: `0001_init.sql`.

## 4. Navigation routes

```
RootTabs
├─ Listas       → HomeListasScreen
├─ Histórico    → HistoricoScreen
├─ Relatórios   → RelatoriosScreen
└─ Config       → ConfigScreen
```

## 5. Third-party libs

Aligned with constitution §3 — no new libs added.

## 6. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Drizzle + expo-sqlite API churn | Pin minor versions; re-run smoke test on bump |
| iOS/Android path differences for SQLite file | Use `expo-sqlite` default location, do not hardcode paths |
| Reanimated babel plugin order bugs | Follow Expo docs exactly |

## 7. Test strategy

- Unit: `src/lib/id.ts` produces v4 UUIDs.
- Integration: Jest spec opens DB, runs migrations, asserts `produtos` table exists.
- Manual QA: launch on iOS sim + Android emu, verify theme follows system.

## 8. Rollout / flag

N/A — initial commit.
