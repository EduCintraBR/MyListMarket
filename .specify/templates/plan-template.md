# Plan: <Feature Name>

> Feature ID: NNN — companion to `spec.md`
> Reference data model: `specs/_shared/data-model.md`

## 1. Approach summary

One paragraph: what we build, why this way.

## 2. Files / modules

| Path | Action | Purpose |
|------|--------|---------|
| `src/screens/...` | new | … |
| `src/components/...` | new | … |
| `src/db/schema.ts` | edit | add column / table … |
| `src/state/...` | new | Zustand slice … |

## 3. Data-model deltas

Reference `specs/_shared/data-model.md`. List ONLY deltas:
- New table: …
- New column: …
- New migration file: `drizzle/NNNN_xxx.sql`

## 4. Navigation routes

- `Stack → ScreenName` — params: `{ ... }`

## 5. Third-party libs

- Any new dep beyond the constitution stack? Justify here.

## 6. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| … | … |

## 7. Test strategy

- Unit: …
- Integration: …
- Manual QA: device + flow checklist.

## 8. Rollout / flag

V1 ships as one binary, no flags. Note if migration backfill needed.
