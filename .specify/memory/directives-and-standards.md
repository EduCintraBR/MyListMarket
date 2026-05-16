# Directives & Standards — MyListMarket

> Version: 1.0.0 — Established: 2026-05-15
> Companion to `constitution.md`. Constitution = product/architectural invariants. This doc = engineering process + coding standards.
> Order of precedence on conflict: PRD > Constitution > This doc > Per-feature spec/plan.

---

## 1. Test-Driven Development (NON-NEGOTIABLE)

### 1.1 The rule

**No production code is written without a failing test that justifies it.**

Workflow per task — **Red → Green → Refactor**:

1. **Red** — write the smallest test that fails for the right reason (target behavior absent or wrong).
2. **Green** — write the minimum production code to pass. Resist gold-plating.
3. **Refactor** — improve production AND test code with all tests green between each refactor step.

### 1.2 Why TDD here

- App logic (total calc, unit normalization, soft-delete filters) is high-leverage business code where regressions hurt user trust.
- Offline-first SQLite + Drizzle makes integration tests cheap and fast (no network).
- Manual QA at the supermarket is expensive and slow. Tests catch regressions in seconds.

### 1.3 Order of writing inside a feature

For every feature in `specs/NNN-*/`, the `tasks.md` MUST be executed in this order:

1. **Test scaffolding tasks first** (e.g. fixtures, in-memory DB harness).
2. For each behavior task `T-XX`:
   - 2a. Write the failing test (commit OPTIONAL but encouraged: `test: red — <description>`).
   - 2b. Write production code to pass.
   - 2c. Refactor.
   - 2d. Tick the box.

A PR whose diff shows production code with no corresponding test diff will be rejected on review.

### 1.4 Test pyramid

| Layer | What | Tooling | Speed budget |
|-------|------|---------|--------------|
| **Unit** | Pure functions (`lib/units.ts`, `lib/total.ts`, `lib/textNormalize.ts`, `lib/listaNaming.ts`, repos w/ mocked DB), Zustand slice actions | Jest | < 50 ms each |
| **Integration (DB)** | Repos against in-memory SQLite (better-sqlite3 in tests) + real Drizzle queries + migrations | Jest + in-memory adapter | < 200 ms each |
| **Component** | Single screen / component behavior | React Native Testing Library + Jest | < 500 ms each |
| **Manual QA** | End-to-end flows on real device (golden path + edge cases) | iOS + Android device checklist per feature | n/a |

### 1.5 Allowed exemptions (rare, justified in PR description)

- Pure scaffolding (folder/file/asset creation with no logic).
- Configuration files (`tsconfig.json`, `.eslintrc`, `babel.config.js`) — behaviour asserted by build/lint instead.
- Generated code (Drizzle migrations from `drizzle-kit generate`) — checked in but not test-authored.
- Throwaway spike branches — MUST be deleted, never merged.

UI styling-only edits still need a snapshot or visual-regression coverage if behavior changes.

### 1.6 Coverage targets

- `src/lib/**` — **100% branch coverage**. These are the rules of the universe.
- `src/db/repos/**` — **≥ 90% line coverage**.
- `src/state/**` — **≥ 90% line coverage**.
- `src/screens/**` and `src/components/**` — **≥ 70% line coverage**, with critical paths (mark item, total recompute, checkout commit, soft-delete) at **100%**.

CI enforces these via `jest --coverage` thresholds in `jest.config.js`.

### 1.7 Test naming

- Files: `<unit-under-test>.test.ts(x)` colocated under `src/__tests__/` mirroring source path (or alongside source — pick one and stick to it; default colocated).
- `describe('<unit>', () => { it('does X when Y', ...) })`.
- Names describe behavior, not implementation. ✅ `it('rejects iniciarCompra when another list is em_compra')`. ❌ `it('throws Error')`.

### 1.8 What MUST be tested before merging a feature

Minimum bar pulled from constitution invariants:

- Soft-delete: every repo with `excluido_em` has a test asserting deleted rows are filtered from `list()` but visible via `byId()`.
- Single-active-list (C-4): integration test asserts second `iniciarCompra` rejects.
- Implicit catalog (C-5): test asserts typing a known produto name reuses row.
- Unit normalization (C-7): test all PRD examples (3×5kg + 2×500g = 16kg).
- Total recompute (RN-10): test mixed marked/unmarked items, edits, removals.
- Forma_pagamento required (C-6): checkout repo test asserts insert fails without it.
- Item origin preserved (C-8): test items added during compra carry `origem='compra'`.

---

## 2. Coding Standards

### 2.1 TypeScript

- `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.
- No `any`. If unavoidable, inline comment `// any: <reason>` and a follow-up TODO.
- No `// @ts-ignore` without a one-line justification on the same line.
- Prefer `type` aliases for unions/primitives, `interface` for object shapes with potential extension.
- Discriminated unions for state machines (`StatusLista`, `StatusItem`).
- All enums modelled as string literal unions (NOT TS `enum`).

### 2.2 Imports

- Absolute imports via `@/*` path alias mapped to `src/*`.
- Order: node built-ins → external → `@/...` → relative. ESLint `import/order` enforces.
- No barrel files (`index.ts` re-exports) deeper than 1 level — keeps Metro bundle lean.

### 2.3 Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Files | `kebab-case.ts` for libs, `PascalCase.tsx` for components/screens | `units.ts`, `MercadoPicker.tsx` |
| Components | `PascalCase` | `TotalParcialHeader` |
| Hooks | `useCamelCase` | `useProdutoSuggestions` |
| Repos | `<entity>Repo` | `produtoRepo` |
| Slices | lowercase noun | `listas`, `produtos` |
| Domain terms | **PT-BR preserved** in code (mercados, listas, itens_lista, compras, forma_pagamento) | `iniciarCompra`, `marcarComprado` |
| Test files | `<source>.test.ts(x)` | `total.test.ts` |

### 2.4 React Native specifics

- One default export per file (the component); named exports for helpers.
- Props typed via `type Props = { ... }` above component.
- `StyleSheet.create` at bottom of file; no inline styles for non-trivial blocks.
- No `console.*` in committed code — use `src/lib/log.ts` (`info`, `warn`, `error`).
- Avoid `useEffect` for derived state; prefer `useMemo` or Zustand selectors.
- Memoize FlatList rows (`React.memo` + stable `keyExtractor`).

### 2.5 SQLite / Drizzle

- All schema changes go through versioned migrations under `src/db/migrations/NNNN_*.sql` (and matching Drizzle Kit snapshot).
- Soft delete filter is the **default** — repos expose `includeDeleted` opt-in (never opt-out by default).
- Every multi-statement mutation wraps in `db.transaction(...)`.
- Money stored as `REAL` with 2 decimals (BRL). Use `Math.round(x * 100) / 100` at write boundaries — never trust JS float concatenation.
- Timestamps stored as `INTEGER` (epoch ms via `Date.now()`).

### 2.6 State (Zustand)

- One slice per domain (`listas`, `produtos`, `mercados`, `compraAtiva`, `settings`).
- Slices expose actions; UI never calls repos directly.
- Selectors live next to slice and are memoized.
- No async actions silently swallowing errors — surface to UI via slice-local `error` state.

### 2.7 Error handling

- Throw `Error` subclasses (`ValidationError`, `ConstraintError`) — never plain strings.
- Repos translate DB exceptions to domain errors (e.g. `unique constraint failed` → `DuplicateError`).
- UI shows user-friendly PT-BR messages; technical details go to `log.error`.

### 2.8 Linting & formatting

- ESLint config: `eslint-config-expo` + `@typescript-eslint/recommended` + `eslint-plugin-import` + `eslint-plugin-react-native`.
- Prettier defaults: single quotes, no semis? **Decision:** semis on, single quotes, trailing comma `all`, 100-char line.
- Pre-commit hook (Husky + lint-staged) runs `prettier --write` + `eslint --fix` + `tsc --noEmit` + `jest --findRelatedTests`.

---

## 3. Git & PR Workflow

### 3.1 Branches

- Trunk: `main`.
- Feature branches: `feat/NNN-<slug>` mapping 1:1 to a `specs/NNN-*` folder.
- Hotfix: `fix/<short-slug>`.

### 3.2 Commits

Conventional Commits, English:

```
feat(NNN): short imperative subject
fix(NNN): ...
test(NNN): red — failing test for X
refactor(NNN): ...
chore: ...
docs: ...
```

- Subject ≤ 72 chars.
- Body explains *why* if non-obvious.
- One logical change per commit. Mixing test + impl in one commit is OK only inside a TDD cycle (red→green collapsed).

### 3.3 Pull Requests

- Title: `[NNN] <feature name> — <slice>`.
- Description MUST include:
  - Spec ID + AC numbers covered.
  - Constitution invariants exercised.
  - Test summary (count of unit / integration / component tests added).
  - Manual QA steps performed.
- Self-review checklist:
  - [ ] Tests added before production code (verified via commit history).
  - [ ] Coverage thresholds respected.
  - [ ] No `any`, no raw `console.*`, no `@ts-ignore` w/o justification.
  - [ ] Soft-delete invariant preserved.
  - [ ] PT-BR strings for user-facing text.
- Squash-merge into `main` w/ Conventional Commit message.

### 3.4 Code review focus

Reviewers explicitly check:
1. Tests exist and fail without the production change (run `git diff` for test-only commits).
2. PRD/spec/constitution alignment.
3. Performance budgets respected.
4. A11y labels present on new interactive elements.

---

## 4. Definition of Done (per task / per feature)

### 4.1 Per task

- [ ] Failing test exists in commit history before the production change.
- [ ] All tests green (`npm test`).
- [ ] `npm run typecheck` clean.
- [ ] `npm run lint` clean.
- [ ] Coverage thresholds met for affected files.

### 4.2 Per feature

In addition to per-task DoD:

- [ ] Every AC in `spec.md` has at least one test asserting it.
- [ ] Manual QA pass on iOS + Android documented in PR.
- [ ] A11y labels reviewed.
- [ ] Dark mode reviewed.
- [ ] Performance budgets (Constitution §4.1) verified for new screens.

---

## 5. Tooling Reference

| Tool | Purpose |
|------|---------|
| `jest` + `jest-expo` | Test runner |
| `@testing-library/react-native` | Component tests |
| `better-sqlite3` (dev only) | In-memory DB for integration tests |
| `husky` + `lint-staged` | Pre-commit gates |
| `drizzle-kit` | Migration generation |
| `eslint`, `prettier` | Static analysis + formatting |
| `expo-doctor` | Project health check |

---

## 6. Amending This Document

PRs touching this file MUST:
1. Bump `Version` (semver).
2. Append a `## Changelog` entry.
3. Justify the change with reference to PRD / Constitution / observed pain.

## Changelog

- **1.0.0 — 2026-05-15** — Initial directives. TDD made mandatory, coding standards established, PR workflow defined.
