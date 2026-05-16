# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Offline-first React Native (Expo) shopping-list + grocery-tracking app, PT-BR target locale. Currently **pre-implementation**: PRD + spec-driven-development scaffold only. Source code starts landing during Sprint 1 (feature `001-project-foundation`).

## Source of truth — read these first

1. PRD (PT-BR): `docs/PRD_App_Lista_de_Compras.md` — product authority.
2. Constitution: `.specify/memory/constitution.md` — non-negotiable invariants (C-1..C-10).
3. **Directives & Standards: `.specify/memory/directives-and-standards.md` — coding rules, TDD-first workflow.**
4. Sprint plan: `SPRINTS.md` — what's being built when.
5. Per-feature: `specs/NNN-*/{spec,plan,tasks}.md`.
6. Shared data model: `specs/_shared/data-model.md` — Drizzle schema authority.

When PRD and a spec disagree, **PRD wins**. When constitution and a plan disagree, **constitution wins**.

## TDD is mandatory

**Always write a failing test FIRST, then make it pass, then refactor.** No production code is written without a failing test that justifies it. This rule has no exceptions for V1 features.

The workflow per task (Red → Green → Refactor):
1. **Red** — write the smallest test that fails for the right reason.
2. **Green** — write the minimum production code to pass.
3. **Refactor** — clean up production + test code, all tests stay green.

Allowed exemptions (must be justified in PR description):
- Pure scaffolding (folder/file creation w/ no logic).
- Configuration files (tsconfig, eslint, babel) where behaviour is asserted by build/lint.
- Throwaway spike branches — must be deleted, never merged.

UI screens follow the same rule via React Native Testing Library component tests before render code lands. Full rules + test pyramid in `.specify/memory/directives-and-standards.md`.

## Hard rules (Constitution highlights)

- **Offline-first.** No network calls in V1 flows.
- **No backend, no auth, no sync** in V1.
- **Soft delete everywhere** — every domain table has `excluido_em`. Selector queries filter it out; historical queries keep it.
- **Single active shopping list.** Only one `listas.status='em_compra'` at a time. Enforce at write time.
- **Implicit catalog.** Typing a new produto name creates the row automatically.
- **One forma_pagamento per compra.**
- **Unit normalization** (kg↔g, L↔mL) for analytics aggregation.
- **Locale pt-BR.** BRL currency, `dd/MM/yyyy` dates.
- **TypeScript strict.** No `any` without inline justification.
- **No raw `console.log`** — use `src/lib/log.ts`.
- **Soft-delete pattern**: every selector must `WHERE excluido_em IS NULL`.

## Stack (locked for V1)

Expo managed · TypeScript · expo-sqlite · Drizzle ORM · Zustand · React Navigation · React Native Paper · Victory Native · expo-image-picker · expo-image-manipulator.

Adding a runtime dep requires updating Constitution §3.

## Commands

Once Sprint 1 ships (no `package.json` exists yet), expected scripts:

```bash
npm install              # deps
npx expo start           # dev server (i=iOS, a=Android)
npm run typecheck        # tsc --noEmit
npm run lint             # eslint
npm test                 # jest
npm test -- path/to/file # single test
```

## Workflow

- Pick a feature folder under `specs/`. Read `spec.md` then `plan.md` then `tasks.md`.
- Implement tasks top-to-bottom, checking each box on merge.
- Every PR should map to a single feature folder and reference its NNN id.
- Data-model changes ship as numbered Drizzle migrations (`src/db/migrations/NNNN_*.sql`).

## What NOT to do without explicit user ask

- **Don't write production code before a failing test (TDD violation).**
- Don't add CI / EAS pipelines until Sprint 6.
- Don't introduce new runtime dependencies — propose first.
- Don't translate the PRD.
- Don't implement V1.1 features (010, 011) during MVP sprints.
- Don't hard-delete domain rows.
