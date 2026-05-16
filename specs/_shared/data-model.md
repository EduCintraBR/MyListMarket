# Shared Data Model — MyListMarket

> Canonical schema for V1.0. Source: PRD §9. Implemented in `src/db/schema.ts` via Drizzle ORM (SQLite).
>
> **Rule (Constitution C-3):** every entity carries `excluido_em TIMESTAMP NULL`. Selector queries MUST filter `excluido_em IS NULL`; historical joins ignore it.

---

## 1. Enums

```ts
export type FormaPagamento =
  | 'cartao_credito'
  | 'cartao_debito'
  | 'dinheiro'
  | 'pix'
  | 'vale_alimentacao';

export type UnidadeMedida =
  | 'un' | 'kg' | 'g' | 'L' | 'mL' | 'pct' | 'cx';

export type FamiliaUnidade = 'peso' | 'volume' | 'unitario';

export const FAMILIA_DE: Record<UnidadeMedida, FamiliaUnidade> = {
  kg: 'peso', g: 'peso',
  L:  'volume', mL: 'volume',
  un: 'unitario', pct: 'unitario', cx: 'unitario',
};

export type StatusLista =
  | 'planejamento' | 'em_compra' | 'finalizada' | 'encerrada';

export type StatusItem = 'a_comprar' | 'comprado' | 'nao_comprado';

export type OrigemItem = 'lista' | 'compra';
```

## 2. Tables (Drizzle sketch)

### `produtos`
| col | type | notes |
|-----|------|-------|
| `id` | TEXT PK | UUID v4 |
| `nome` | TEXT NOT NULL | indexed NOCASE |
| `marca_padrao` | TEXT NULL | |
| `modelo_padrao` | TEXT NULL | |
| `unidade_padrao` | TEXT NULL | `UnidadeMedida` |
| `criado_em` | INTEGER NOT NULL | epoch ms |
| `excluido_em` | INTEGER NULL | soft delete |

Indexes:
- `idx_produto_nome` ON `nome COLLATE NOCASE`

### `mercados`
| col | type | notes |
|-----|------|-------|
| `id` | TEXT PK | |
| `nome` | TEXT NOT NULL | |
| `observacoes` | TEXT NULL | |
| `criado_em` | INTEGER NOT NULL | |
| `excluido_em` | INTEGER NULL | |

### `listas`
| col | type | notes |
|-----|------|-------|
| `id` | TEXT PK | |
| `nome` | TEXT NULL | autogen default if null |
| `status` | TEXT NOT NULL | `StatusLista` |
| `criado_em` | INTEGER NOT NULL | |
| `finalizada_em` | INTEGER NULL | |
| `excluido_em` | INTEGER NULL | |

Constraint:
- App-level: **at most one row** with `status='em_compra'` AND `excluido_em IS NULL` (Constitution C-4).

### `itens_lista`
| col | type | notes |
|-----|------|-------|
| `id` | TEXT PK | |
| `lista_id` | TEXT FK→listas.id | |
| `produto_id` | TEXT FK→produtos.id | |
| `quantidade_planejada` | REAL NULL | |
| `marca` | TEXT NULL | |
| `modelo` | TEXT NULL | |
| `unidade` | TEXT NULL | `UnidadeMedida` |
| `origem` | TEXT NOT NULL | `OrigemItem` default `lista` |
| `status` | TEXT NOT NULL | `StatusItem` default `a_comprar` |
| `quantidade_comprada` | REAL NULL | |
| `preco_unitario` | REAL NULL | BRL, cents stored as REAL (2 decimals) |
| `criado_em` | INTEGER NOT NULL | |

Indexes:
- `idx_item_lista_id` ON `lista_id`
- `idx_item_produto_id` ON `produto_id`

(`itens_lista` is owned by its parent list; no soft delete — physical delete OK while list `status='planejamento'`. Once compra is finalized, items are immutable.)

### `compras`
| col | type | notes |
|-----|------|-------|
| `id` | TEXT PK | |
| `lista_id` | TEXT FK→listas.id | |
| `mercado_id` | TEXT FK→mercados.id | |
| `data_hora` | INTEGER NOT NULL | |
| `forma_pagamento` | TEXT NOT NULL | `FormaPagamento` |
| `total_calculado` | REAL NOT NULL | sum(qtd × preço) at finalize time |
| `total_real` | REAL NULL | optional caixa value |
| `foto_cupom_path` | TEXT NULL | relative path under `FileSystem.documentDirectory` |
| `criado_em` | INTEGER NOT NULL | |
| `excluido_em` | INTEGER NULL | |

## 3. Derived calculations

- **Subtotal item** = `quantidade_comprada × preco_unitario`.
- **Total parcial** = SUM(subtotal) over items with `status='comprado'` in the active list.
- **Reconciliação** = `total_real − total_calculado` (signed; null if `total_real` null).

## 4. Unit normalization (Constitution C-7)

```
peso:   kg = g / 1000
volume: L  = mL / 1000
unitario: no conversion; pct, cx, un counted as-is
```

Aggregation algorithm per (produto, periodo):
1. Group items by `FAMILIA_DE[unidade]`.
2. If all items in same family → sum normalized to base unit (`kg` or `L`).
3. Else → return list of `{ familia, total }` rows (UI shows separately).
4. `unidade NULL` → treated as `un` (unitario).

## 5. Migrations

- `drizzle/0001_init.sql` — creates all tables + indexes above.
- Future migrations numbered sequentially, owned by the feature introducing them.

## 6. Seed / fixtures

V1 ships with empty DB. Dev fixtures live in `src/db/dev-seed.ts` (loaded only when `__DEV__`).
