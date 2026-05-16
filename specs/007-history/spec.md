# Spec: History

> Feature ID: 007 — Status: Ready
> PRD anchor: RF-OUT-02, RF-OUT-01 (viewing cupom)
> Sprint: **S5**

## 1. User story

**As a** user
**I want** to browse my past compras with full detail
**So that** I can revisit how much I spent, where, and on what.

## 2. Acceptance criteria

- **AC-1** — "Histórico" tab lists all non-deleted `compras` newest first, showing `data_hora`, `mercado.nome` (w/ "(arquivado)" if applicable), `total_calculado`, `forma_pagamento`.
- **AC-2** — Tapping a row opens detail: itens (qtd, preço, subtotal, origem), total_calculado, total_real, diferença, mercado, forma_pagamento, foto_cupom (tap to fullscreen if present).
- **AC-3** — Detail page supports soft-deleting the compra (with confirm) — entry vanishes from list and reports but remains in DB.
- **AC-4** — Search/filter by month (chip per recent month) and by mercado.
- **AC-5** — Empty state shown when no compras exist.

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| RF-OUT-02 | §5.6 | Histórico + detalhe |
| RF-OUT-01 | §5.6 | Visualizar cupom |

## 4. Edge cases

- Compra references soft-deleted mercado → still display name with archived tag.
- Foto file missing on disk (manual deletion) → show placeholder, no crash.
- Soft-deleting last compra of a mercado → mercado not affected.

## 5. Out of scope

- Editing past compras (V1 = immutable history).
- Restoring soft-deleted compras (no UI in V1; possible via Configurações in V1.1).

## 6. Dependencies

- Depends on: 006-checkout-finalization (data source).
- Used by: 008-reports-analytics (queries same `compras` table).

## 7. Open questions

- [ ] Should detail allow exporting a single compra to PDF? Moved to V1.1 feature 010.
