# Spec: Planning Mode

> Feature ID: 004 — Status: Ready
> PRD anchor: RF-PLAN-01..07, RN-01, RN-03, RN-06
> Sprint: **S3**

## 1. User story

**As a** user
**I want** to build one or more shopping lists incrementally over time
**So that** I arrive at the market with everything I need already captured.

## 2. Acceptance criteria

- **AC-1** — I can create a new list. If I leave the name blank, a default like "Lista de 15/05/2026" is generated from today's date.
- **AC-2** — Multiple lists may coexist in `status='planejamento'`.
- **AC-3** — On the home screen I see all non-deleted lists with status + item count + last-edit date.
- **AC-4** — Inside a list I can add an item: required `nome` (product); optional `quantidade_planejada`, `marca`, `modelo`, `unidade`.
- **AC-5** — While typing the product name, `ProdutoAutoComplete` from feature 002 fires; selecting a suggestion pre-fills brand/model/unit from last use.
- **AC-6** — Items are displayed alphabetical by produto.nome.
- **AC-7** — I can edit any item field while the list is in `planejamento`.
- **AC-8** — I can remove an item (with confirmation).
- **AC-9** — I can "Encerrar lista" without shopping — list flips to `encerrada`, items frozen.
- **AC-10** — Soft-deleted (archived) lists never appear on home; they remain joinable from any historical reference.

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| RF-PLAN-01 | §5.1 | Create list (auto-name) |
| RF-PLAN-02 | §5.1 | Multiple lists |
| RF-PLAN-03 | §5.1 | Add item w/ auto-complete |
| RF-PLAN-04 | §5.1 | Edit item |
| RF-PLAN-05 | §5.1 | Remove item w/ confirm |
| RF-PLAN-06 | §5.1 | Alphabetical sort |
| RF-PLAN-07 | §5.1 | Encerrar sem comprar |

## 4. Edge cases

- Adding the same produto twice in one list → second add becomes a separate `item_lista` row (PRD does not forbid; sum at report time).
- Editing a produto's name from another screen → list view reflects new name on next render.
- Removing the last item from a list does not auto-close it.

## 5. Out of scope

- Drag-to-reorder (V1 = alphabetical only).
- Categories or sections inside a list.
- Sharing.

## 6. Dependencies

- Depends on: 001, 002.
- Blocks: 005, 006.

## 7. Open questions

- [ ] Should default list name include time of day? Default: no, just date.
