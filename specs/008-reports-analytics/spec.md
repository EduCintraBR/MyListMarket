# Spec: Reports & Analytics

> Feature ID: 008 — Status: Ready
> PRD anchor: RF-REL-01..09, RF-CAT-04, §11.4
> Sprint: **S6**

## 1. User story

**As a** user
**I want** dashboards that show how much I spent, where, on what, and how my estimates compare to reality
**So that** I can understand and adjust my consumption habits.

## 2. Acceptance criteria

For each report, the period selector supports: dia, semana, mês, ano, custom range. Default: current month.

- **AC-1 — Gasto por período (RF-REL-01)** — line/bar chart of `total_calculado` summed by chosen granularity.
- **AC-2 — Gasto por mercado (RF-REL-02)** — per-market: total, número de compras, ticket médio.
- **AC-3 — Produtos mais comprados (RF-REL-03)** — three rankings:
  - por frequência (count distinct compras).
  - por quantidade acumulada (com normalização de unidades).
  - por valor gasto.
- **AC-4 — Variação de preço (RF-REL-04)** — para um produto selecionado: linha histórica de `preco_unitario` ao longo do tempo + comparativo entre mercados.
- **AC-5 — Formas de pagamento (RF-REL-05)** — pie + tabela com % e R$ por forma_pagamento.
- **AC-6 — Reconciliação (RF-REL-06)** — média de diferença `total_real − total_calculado`; texto contextual ("você gasta em média 3% a mais no caixa").
- **AC-7 — Itens fora da lista (RF-REL-07)** — % valor e contagem de itens com `origem='compra'`.
- **AC-8 — Listas incompletas (RF-REL-08)** — quantas compras finalizaram com itens pendentes.
- **AC-9 — Ticket médio (RF-REL-09)** — geral e por mercado.
- **AC-10** — Soft-deleted compras NÃO contam em nenhum relatório. Soft-deleted mercados/produtos APARECEM em relatórios históricos quando referenciados, com tag "(arquivado)".

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| RF-REL-01..09 | §5.5 | All MVP reports |
| RF-CAT-04 | §5.4 | Unit normalization in RF-REL-03 |

## 4. Edge cases

- Period with zero compras → empty state per report.
- Single-mercado period → comparison views collapse gracefully.
- Mixed-family aggregation for same produto → split row per família.
- Performance with 1+ year of data → see Risks.

## 5. Out of scope

- CSV/PDF export (V1.1 → feature 010).
- Custom dashboard editing.
- Saved filters.

## 6. Dependencies

- Depends on: 002, 003, 006, 007.

## 7. Open questions

- [ ] Chart library: Victory Native vs `react-native-chart-kit`. Default: Victory Native per constitution §3.
