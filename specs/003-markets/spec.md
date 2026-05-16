# Spec: Markets

> Feature ID: 003 — Status: Ready
> PRD anchor: RF-MERC-01..03, RN-07
> Sprint: **S2**

## 1. User story

**As a** user
**I want** to manage the list of supermarkets where I shop
**So that** I can attribute each compra to a market and compare prices/spending across them.

## 2. Acceptance criteria

- **AC-1** — A "Mercados" screen lists all non-archived markets alphabetical with search.
- **AC-2** — I can create a market with `nome` (required) + `observacoes` (optional).
- **AC-3** — I can edit any market's fields.
- **AC-4** — I can archive (soft delete) a market. Archived markets are hidden from selectors but remain joinable to past `compras` for reports.
- **AC-5** — I can un-archive a market.
- **AC-6** — A market picker component (`MercadoPicker`) is reusable in shopping-mode start and checkout flows, and supports inline create without leaving the picker.

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| RF-MERC-01 | §5.3 | Create |
| RF-MERC-02 | §5.3 | Edit + soft delete |
| RF-MERC-03 | §5.3 | Inline create |

## 4. Edge cases

- Duplicate name input → warn but allow (user judgment; e.g. two "Carrefour" of different locations).
- Archiving a market currently selected in an `em_compra` list → stays valid for that list; absent from new pickers.
- Reports must still display archived markets when they appear in historical data, with a small "(arquivado)" tag.

## 5. Out of scope

- Geolocation, address, opening hours.
- Per-market price tracking surface (covered by reports feature 008).

## 6. Dependencies

- Depends on: 001-project-foundation.
- Used by: 005-shopping-mode, 006-checkout-finalization, 008-reports-analytics.

## 7. Open questions

- [ ] Allow duplicate-name confirmation prompt? Default yes.
