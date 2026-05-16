# Spec: Shopping Mode

> Feature ID: 005 — Status: Ready
> PRD anchor: RF-COMP-01..09, RN-02, RN-04, RN-05, RN-10
> Sprint: **S4**

## 1. User story

**As a** user at the supermarket
**I want** a one-handed checkbox interface that auto-totals my cart as I shop
**So that** I don't forget items and I always know how much I've spent so far.

## 2. Acceptance criteria

- **AC-1** — From a list in `planejamento`, I tap "Iniciar Compra"; list flips to `em_compra`. (RN-02) No other list may be in `em_compra` simultaneously — the system blocks with a clear message if so.
- **AC-2** — Optionally I pick (or inline-create) a `mercado` at start; if skipped, it is required at checkout (feature 006).
- **AC-3** — Items render as checkbox rows with produto.nome + planned qty.
- **AC-4** — Tapping a row prompts `quantidade_comprada` and `preco_unitario`; if `quantidade_planejada` exists, it pre-fills `quantidade_comprada`. Saving sets `status='comprado'` and records both fields.
- **AC-5** — A fixed header at the top shows "Total: R$ X,XX" updating in <100 ms after any change. Total = SUM(qtd × preço) over `status='comprado'`.
- **AC-6** — I can re-tap a checked item to edit `quantidade_comprada` / `preco_unitario`; total re-computes.
- **AC-7** — I can remove a comprado item; user chooses "remover de vez" or "voltar para a comprar"; total updates.
- **AC-8** — I can add an unplanned item via "+ adicionar item"; row created with `origem='compra'`. Fields: nome, qty, preço (required), marca/modelo (optional).
- **AC-9** — Filter chips toggle: "A comprar / Comprados / Da lista / Adicionados em compra" — combinable.
- **AC-10** — A "+ novo mercado" inline create is available without leaving the screen.
- **AC-11** — Backgrounding the app preserves state; reopening restores `em_compra` view immediately.

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| RF-COMP-01 | §5.2 | Start, optional market |
| RF-COMP-02 | §5.2 | To-do view |
| RF-COMP-03 | §5.2 | Mark purchased |
| RF-COMP-04 | §5.2 | Live total |
| RF-COMP-05 | §5.2 | Edit while shopping |
| RF-COMP-06 | §5.2 | Remove while shopping |
| RF-COMP-07 | §5.2 | Unplanned item w/ origem='compra' |
| RF-COMP-08 | §5.2 | Filters |
| RF-COMP-09 | §5.2 | Inline market create |

## 4. Edge cases

- User force-closes app mid-shopping → on relaunch, the `em_compra` list opens directly.
- Tries to "Iniciar Compra" while another list is `em_compra` → error toast + offer to navigate.
- Marks then unmarks same item rapidly — total stays consistent (debounce or atomic write).
- Adds an unplanned item with same produto name as a planned one — they remain separate rows with different `origem`.

## 5. Out of scope

- Real-time barcode lookup.
- Price suggestion from history (could enrich autocomplete; deferred to V2 ideas).

## 6. Dependencies

- Depends on: 001, 002, 003, 004.
- Blocks: 006-checkout-finalization.

## 7. Open questions

- [ ] Should the prompt for qty/preço be a modal or inline expansion? Default: bottom-sheet modal for one-handed reach.
