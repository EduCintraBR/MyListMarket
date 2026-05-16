# Spec: Checkout & Finalization

> Feature ID: 006 — Status: Ready
> PRD anchor: RF-COMP-10..13, RF-OUT-01, RN-08, RN-09, RN-01
> Sprint: **S5**

## 1. User story

**As a** user finishing my purchase
**I want** to wrap up the compra with mercado, forma de pagamento, real total, and an optional receipt photo
**So that** my history is complete and I can later reconcile what I spent.

## 2. Acceptance criteria

- **AC-1** — Tapping "Concluir Compra" with unbought items shows a confirmation dialog summarizing missing items; I can go back or proceed.
- **AC-2** — Checkout requires `mercado` (with inline-create option) and `forma_pagamento` (one of: cartao_credito, cartao_debito, dinheiro, pix, vale_alimentacao). Forms cannot submit without these.
- **AC-3** — I may optionally input `total_real` (BRL numeric keypad).
- **AC-4** — I may optionally attach a cupom photo: camera or library; image resized to max 1600 px on longest side, JPEG quality 80, stored under `FileSystem.documentDirectory/cupons/`.
- **AC-5** — On submit, a `compras` row is inserted with `total_calculado` = current `totalParcial`, `data_hora` = now, and the list transitions to `finalizada`.
- **AC-6** — A summary screen shows: itens comprados (qtd, preço, subtotal), total calculado, total real (if given), diferença com indicador (maior/menor/igual), mercado, forma_pagamento, data_hora, lista de itens NÃO comprados.
- **AC-7** — If unbought items exist, user is asked: (a) descartar e encerrar lista, or (b) mover para uma nova lista (ou manter na atual) em `planejamento` para próxima compra. Implemented via radio prompt before navigation away.
- **AC-8** — Lista só é encerrada quando (a) todos os itens marcados e checkout finalizado, ou (b) usuário acionou "Encerrar lista" manualmente (handled in feature 004).
- **AC-9** — Foto do cupom é consultável na summary screen e na tela de histórico (feature 007).
- **AC-10** — Camera permission is requested only when user taps "Tirar foto". Denying does not block checkout.

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| RF-COMP-10 | §5.2 | Finalization flow |
| RF-COMP-11 | §5.2 | Summary screen |
| RF-COMP-12 | §5.2 | Destino itens não comprados |
| RF-COMP-13 | §5.2 | Encerramento da lista |
| RF-OUT-01 | §5.6 | Foto cupom |

## 4. Edge cases

- User cancels checkout dialog mid-way — partial inputs preserved on screen, list stays `em_compra`.
- Photo capture interrupted — temp file cleaned up.
- Network is offline — no impact, all local (C-1).
- Mercado archived between `iniciar` and `concluir` — still valid; UI shows "(arquivado)" tag in summary.
- Negative or zero `total_real` — disallowed by validation.

## 5. Out of scope

- OCR of cupom.
- Multiple receipts per compra.
- Splitting payment methods (RN-08 forbids).

## 6. Dependencies

- Depends on: 003, 005.
- Blocks: 007-history (history reads `compras`), 008-reports (reconciliação).

## 7. Open questions

- [ ] Where to store unbought items when user picks "mover para nova lista"? Default: clone into a fresh `lista` with `nome = "Pendências de <data>"`.
