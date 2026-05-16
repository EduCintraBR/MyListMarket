# SPRINTS — MyListMarket V1.0 MVP

> Cadence: **6 sprints × 2 weeks** (12 weeks total). One developer.
> Source PRD: `docs/PRD_App_Lista_de_Compras.md`
> Constitution: `.specify/memory/constitution.md`
> Feature specs live under `specs/NNN-*/`.

A feature is **done** only when:
1. Every checkbox in its `tasks.md` is ticked, AND
2. Every Acceptance Criterion in its `spec.md` passes manual verification on iOS + Android, AND
3. The feature respects all Constitution invariants (C-1..C-10).

---

## Sprint overview

| Sprint | Weeks | Features | Theme |
|--------|-------|----------|-------|
| **S1** | 1–2   | 001                  | Foundation |
| **S2** | 3–4   | 002, 003             | Catalog + Markets |
| **S3** | 5–6   | 004                  | Planning Mode |
| **S4** | 7–8   | 005                  | Shopping Mode |
| **S5** | 9–10  | 006, 007             | Checkout + History |
| **S6** | 11–12 | 008, 009             | Reports + Polish + Release |

Out of MVP: features 010 (export), 011 (backup) — V1.1 backlog.

---

## S1 — Foundation (Weeks 1–2)

**Goal:** working Expo project skeleton everyone can build on.

**Scope:** feature `001-project-foundation`.

**Definition of Done (S1):**
- App boots on iOS Simulator + Android Emulator.
- TypeScript strict + ESLint + Prettier configured, all green.
- expo-sqlite + Drizzle + baseline migration `0001_init.sql` applied at boot.
- RN Paper light/dark theme follows system color scheme.
- Bottom tab nav with 4 placeholder screens.
- Zustand store scaffold mounted.
- Smoke Jest test renders App.

**Deliverable:** Tagged release `v0.0.1-scaffold`.

---

## S2 — Catalog & Markets (Weeks 3–4)

**Goal:** stand up the two reference-data domains used by every later feature.

**Scope:** features `002-catalog-products`, `003-markets`.

**Definition of Done (S2):**
- Produto repo + implicit `getOrCreate` + auto-complete component.
- Catálogo CRUD screen + edit.
- Mercado CRUD + soft delete + `MercadoPicker` w/ inline create.
- Unit normalization helper (`src/lib/units.ts`) unit-tested for all PRD cases.

**Risks to watch:** auto-complete latency, diacritic dedup correctness.

---

## S3 — Planning Mode (Weeks 5–6)

**Goal:** users can build and edit shopping lists.

**Scope:** feature `004-planning-mode`.

**Definition of Done (S3):**
- Home tab shows lists w/ status + counts.
- Multiple planejamento lists may coexist.
- Add/edit/remove items w/ auto-complete + brand/model/unit pre-fill.
- Alphabetical sort.
- "Encerrar lista" manual close works (status → `encerrada`).

---

## S4 — Shopping Mode (Weeks 7–8)

**Goal:** the centerpiece — real-time totals at the supermarket.

**Scope:** feature `005-shopping-mode`.

**Definition of Done (S4):**
- "Iniciar Compra" enforces single-active rule.
- To-do view with checkbox rows, qty + preço bottom sheet.
- Sticky `TotalParcial` recomputing < 100 ms.
- Unplanned items (`origem='compra'`).
- Filter chips (a comprar / comprados / da lista / em compra).
- Inline mercado create from header.
- App relaunch deep-links to active compra.

**Manual QA:** real grocery store run.

---

## S5 — Checkout & History (Weeks 9–10)

**Goal:** close the loop — finalize compras and browse the history.

**Scope:** features `006-checkout-finalization`, `007-history`.

**Definition of Done (S5):**
- Full checkout flow: confirm pendentes → mercado + forma_pagamento + total_real → foto cupom (opt) → resumo → destino pendentes.
- Atomic SQLite tx on commit, list → `finalizada`.
- Histórico tab w/ filter by month + mercado.
- Compra detail w/ cupom fullscreen viewer.
- Soft-delete compra works and is excluded from later reports.

---

## S6 — Reports & Polish (Weeks 11–12)

**Goal:** insights + release-quality polish.

**Scope:** features `008-reports-analytics`, `009-settings-theming`.

**Definition of Done (S6):**
- All 9 report cards (RF-REL-01..09) render with correct aggregations.
- Unit normalization applied to product quantity rankings.
- Configurações screen w/ theme persistence.
- A11y audit pass on every screen (VoiceOver + TalkBack).
- Performance budgets met on low-end device.
- EAS Build produces signed iOS + Android artifacts.
- Release tag `v1.0.0-mvp`.

---

## V1.1 Backlog (post-MVP, no sprint commitment)

- `010-v1.1-export-csv-pdf`
- `011-v1.1-backup-restore`
- UX refinements from real-world V1 usage.

## V2.0 (roadmap only)

Per PRD §14: cloud sync, multi-user, barcode, smart notifications, NF-e, cloud backup.
