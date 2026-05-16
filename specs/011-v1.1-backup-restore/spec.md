# Spec: Backup & Restore (V1.1)

> Feature ID: 011 — Status: **Deferred to V1.1 — Not in MVP sprints**
> PRD anchor: RF-OUT-03, §11.3
> Sprint: TBD

## 1. User story

**As a** user worried about losing data on device switch
**I want** to manually generate a backup file containing all my data + receipt photos
**So that** I can restore it on another install or device.

## 2. Acceptance criteria (draft)

- AC-1 — Configurações → "Backup" gera um arquivo `.zip` com `data.json` + `images/` + `manifest.json` (data, versão app, versão schema).
- AC-2 — Compartilhamento via share sheet (e-mail, drive, etc.).
- AC-3 — "Restaurar de backup" lê arquivo, valida manifest, aplica.
- AC-4 — Operação manual; sem agendamento na V1.

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| RF-OUT-03 | §5.6, §11.3 | Backup zip + restore |

## 4. Out of scope / open

- Cloud backup (V2.0).
- Auto-schedule.

## 5. Dependencies

- Depends on: 001 (DB), 006 (image paths).

## 6. Status

Plan and tasks are **TBD** — do NOT implement during V1.0 MVP.
