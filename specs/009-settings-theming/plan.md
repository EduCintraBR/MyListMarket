# Plan: Settings, Theming & Polish

> Feature ID: 009 — companion to `spec.md`

## 1. Approach summary

Build the Configurações screen and a `useThemeMode` hook backed by a tiny KV store. Conduct a sweep across every existing screen for: dark-mode contrast, touch target sizing, a11y labels, and Dynamic Type behavior. Add a perf checklist run on a low-end device.

## 2. Files / modules

| Path | Action | Purpose |
|------|--------|---------|
| `src/db/repos/kvRepo.ts` | new | minimal key-value store (single SQLite table `kv(k TEXT PK, v TEXT)`) |
| `src/db/migrations/0002_kv.sql` | new | adds `kv` table |
| `src/state/slices/settings.ts` | new | theme + future toggles |
| `src/hooks/useThemeMode.ts` | new | returns current mode + setter |
| `src/screens/ConfigScreen.tsx` | edit | full implementation |
| `src/screens/SobreScreen.tsx` | new | versão + créditos |
| ALL existing screens | edit | a11y + dark-mode review pass |

## 3. Data-model deltas

- New migration `0002_kv.sql` adds:
  ```sql
  CREATE TABLE IF NOT EXISTS kv (
    k TEXT PRIMARY KEY,
    v TEXT NOT NULL
  );
  ```

## 4. Navigation routes

- `RootTabs → Config → ConfigScreen`.
- `ConfigScreen → Catálogo / Mercados / Sobre`.

## 5. Third-party libs

None new (avoid `expo-secure-store` for plain preferences).

## 6. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Theme flash on cold start | Read theme synchronously before render in `App.tsx` |
| Missed a11y on dynamic content | Add a manual audit checklist as a task |

## 7. Test strategy

- Unit: `kvRepo.set` / `get` round-trip.
- Manual: VoiceOver + TalkBack walkthroughs (record screen).
- Manual: device with system font at XXL.

## 8. Rollout / flag

N/A.
