# Spec: Export CSV / PDF (V1.1)

> Feature ID: 010 — Status: **Deferred to V1.1 — Not in MVP sprints**
> PRD anchor: RF-REL-10
> Sprint: TBD

## 1. User story

**As a** user
**I want** to export reports and individual compra history as CSV or PDF
**So that** I can archive data outside the app or share with others (e.g. accountant).

## 2. Acceptance criteria (draft)

- AC-1 — From Relatórios, "Exportar CSV" produces a `.csv` matching displayed data.
- AC-2 — From Relatórios or Compra Detail, "Exportar PDF" produces a `.pdf` with chart snapshots + tables.
- AC-3 — Share sheet integration: user picks destination (e-mail, drive, etc.).

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| RF-REL-10 | §5.5 | Export CSV + PDF |

## 4. Out of scope / open

- Scheduled / automatic exports.
- Cloud sync export.

## 5. Dependencies

- Depends on: 008-reports-analytics, 007-history.

## 6. Status

Plan and tasks are **TBD** — do NOT implement during V1.0 MVP. See `SPRINTS.md` for cadence.
