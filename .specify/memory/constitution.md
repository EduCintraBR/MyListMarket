# MyListMarket — Project Constitution

> Project-wide invariants. Every spec, plan, task, and PR MUST comply.
> Source of truth: `docs/PRD_App_Lista_de_Compras.md` (PT-BR). When in doubt, the PRD wins.

Version: 1.0.0 — Established: 2026-05-15

---

## 1. Product Identity

- **Name**: MyListMarket
- **Type**: Offline-first mobile app (iOS + Android)
- **Users (V1)**: single individual, single device, no auth, no sync.
- **Mission**: never forget a grocery item, see live cart total, capture full purchase history, derive spending insights.

## 2. Architectural Invariants (NON-NEGOTIABLE)

| # | Invariant | Source |
|---|-----------|--------|
| C-1 | **Offline-first.** 100% of features MUST work without network. No call out to any server during V1 flows. | PRD §2.2, §6.2 |
| C-2 | **No backend.** No remote API, no cloud DB, no auth in V1. | PRD §2.2 |
| C-3 | **Soft delete everywhere.** Every domain table carries `excluido_em TIMESTAMP NULL`. Hard deletes forbidden. | PRD RN-07 |
| C-4 | **Single active shopping list.** Only one list MAY be in status `em_compra` at any time. Enforced at write-time. | PRD RN-02 |
| C-5 | **Implicit catalog.** Typing a new product name in any list automatically creates a `produto` row. | PRD RN-06 |
| C-6 | **One payment method per compra.** `forma_pagamento` required and singular. | PRD RN-08 |
| C-7 | **Unit normalization.** Aggregations across same-family units (peso → kg, volume → L) MUST normalize. Mixed incompatible families displayed separately. | PRD RF-CAT-04, §11.4 |
| C-8 | **Item origin preserved.** Every `item_lista` carries `origem ∈ {lista, compra}`; used by analytics. | PRD RN-05 |
| C-9 | **Schema migrations versioned.** All DB changes ship as numbered Drizzle Kit migrations. Never mutate prod schema without one. | PRD §13.1 |
| C-10 | **Locale pt-BR (V1).** All user-facing strings PT-BR. Money formatted as BRL (`R$`), date `dd/MM/yyyy`. | PRD §6.4 |

## 3. Technology Stack (LOCKED for V1)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Expo (managed)** | Faster iteration, EAS Build, OTA updates, simpler SQLite story |
| Language | **TypeScript (strict)** | `"strict": true`, `noUncheckedIndexedAccess: true` |
| Persistence | **expo-sqlite** + **Drizzle ORM** | Type-safe queries, codegen migrations |
| State | **Zustand** | Lightweight, no boilerplate |
| Navigation | **React Navigation v6+** | Native stack + bottom tabs |
| UI kit | **React Native Paper** | Material, dark mode, a11y baked in |
| Charts | **Victory Native** | Reports / analytics |
| Images | **expo-image-picker** + **expo-image-manipulator** | Cupom photo capture + resize/compress |
| Files | **expo-file-system** | Local image storage |
| Testing | **Jest** + **React Native Testing Library** | Unit + component |
| Lint/format | **ESLint** + **Prettier** | TypeScript ruleset |
| Build | **EAS Build** | iOS + Android CI builds |

Adding a new runtime dependency requires updating this table.

## 4. Quality Bars

> Engineering process + TDD workflow + coding standards live in `directives-and-standards.md`. **TDD is mandatory** — no production code without a failing test first.

### 4.1 Performance budgets
- User interaction (tap → visible response): **< 200 ms** local ops.
- Shopping-mode total recalculation: **< 100 ms**.
- App cold start to interactive: **< 2 s** on iPhone 12 / Pixel 4a class device.

### 4.2 Accessibility (WCAG AA)
- VoiceOver (iOS) + TalkBack (Android) labels on every interactive element.
- Dynamic Type / system font scaling supported.
- Touch targets ≥ 44pt iOS, ≥ 48dp Android.
- Color contrast ≥ 4.5:1 for text.

### 4.3 Code health
- TypeScript strict; no `any` without inline justification comment.
- ESLint clean before merge.
- Zero `console.log` in committed code (use a logger util).
- Unit tests for business rules (unit normalization, total calc, soft-delete query helpers).

## 5. Data Model Discipline

- Single canonical schema lives in `specs/_shared/data-model.md` and is implemented in `src/db/schema.ts`.
- Every entity carries: `id` (TEXT UUID), `criado_em`, `excluido_em` nullable.
- Soft-deleted rows MUST be filtered out of all selector queries (e.g. produto picker, mercado picker). They MUST remain joinable for historical reports.
- FK constraints `ON DELETE RESTRICT` (soft delete is the only delete).

## 6. Sprint Discipline

- 6 sprints × 2 weeks for V1.0 MVP — see `SPRINTS.md`.
- Each feature folder in `specs/NNN-*/` is the unit of work; PRs reference its number.
- A feature is "done" only when its `tasks.md` checkboxes are all ticked AND its `spec.md` acceptance criteria are demonstrably passing.

## 7. Out of Scope (V1)

Listed for clarity, do NOT plan or implement before V1.0 ships:

- Multi-user, multi-device, account auth.
- Cloud sync or cloud backup (manual local backup = V1.1).
- Push notifications, reminders.
- Barcode scanning.
- NF-e / fiscal-receipt parsing.
- Shared/family lists.
- CSV / PDF export (V1.1 stub in `specs/010-*`).

## 8. Roadmap Snapshot

- **V1.0 (MVP)** — sprints 1–6, features 001–009.
- **V1.1** — features 010 (export), 011 (backup/restore). No sprint commitment yet.
- **V2.0** — cloud sync, multi-user, barcode, smart notifications, NF-e. Out of constitution scope.

## 9. Amending This Constitution

Any change here is a meta-decision. PRs touching this file MUST:
1. Update `Version` (semver: MAJOR for breaking invariant changes).
2. Add a `## Changelog` entry below.
3. Cross-link the PRD section justifying the change.

---

## Changelog

- **1.0.0 — 2026-05-15** — Initial constitution derived from PRD v1.0.
