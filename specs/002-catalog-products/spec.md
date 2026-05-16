# Spec: Catalog of Products

> Feature ID: 002 — Status: Ready
> PRD anchor: RF-CAT-01..04, RN-06, §11.4
> Sprint: **S2**

## 1. User story

**As a** user
**I want** every product I type into a list to be remembered and auto-suggested next time
**So that** I don't have to retype names, brands, or units, and can browse my known products in one place.

## 2. Acceptance criteria

- **AC-1** — When I type a product name in any add-item field and submit, a row appears in `produtos` if no soft-undeleted match exists (case-insensitive).
- **AC-2** — While typing in an add-item field, after 1+ char, the UI shows up to 8 catalog suggestions sorted by recent-use, filtering soft-deleted out.
- **AC-3** — Selecting a suggestion pre-fills `marca`, `modelo`, `unidade` with the **last** values used for that produto.
- **AC-4** — A "Catálogo" screen lists all non-deleted products, alphabetical, with search.
- **AC-5** — I can edit `nome`, `marca_padrao`, `modelo_padrao`, `unidade_padrao` for any product.
- **AC-6** — I can soft-delete a product. Soft-deleted products do NOT appear in selectors but DO appear in past compra details and reports.
- **AC-7** — Unit normalization helper exposes `normalize(items): { por_familia: {peso|volume|unitario: total} }` per §11.4 algorithm.
- **AC-8** — Producing a duplicate by typing an identical name (case/diacritics-insensitive) reuses the existing produto rather than creating a new row.

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| RF-CAT-01 | §5.4 | Implicit catalog |
| RF-CAT-02 | §5.4 | Auto-complete |
| RF-CAT-03 | §5.4 | Catalog CRUD |
| RF-CAT-04 | §5.4, §11.4 | Unit normalization |

## 4. Edge cases

- Two products named "Arroz" with different diacritics ("Arróz") — treat as same (normalize: lowercase + strip diacritics).
- Editing a produto's `unidade_padrao` does NOT rewrite historical `itens_lista.unidade`.
- Soft-deleting a produto used by an `em_compra` list: produto stays usable for that list but vanishes from new selectors.

## 5. Out of scope

- Bulk import/export.
- Categorization (categorias / departamentos) — V2.
- Tags.

## 6. Dependencies

- Depends on: 001-project-foundation.
- Used by: 004-planning-mode, 005-shopping-mode, 008-reports-analytics.

## 7. Open questions

- [ ] Recency = `MAX(item.criado_em)` per produto vs `produto.criado_em`? Default to last-use across `itens_lista`.
