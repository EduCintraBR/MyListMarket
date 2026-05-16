# Tasks: <Feature Name>

> Feature ID: NNN — companion to `spec.md` / `plan.md`
> Convention: each task ≤ ½ day, atomic, testable. Check the box when merged.
> **TDD rule (`directives-and-standards.md` §1):** write the failing test BEFORE the production code in each task. Test tasks listed here are scaffolding; per-task Red→Green→Refactor cycle is implicit and enforced at PR review.

## Setup

- [ ] T-01 — …

## Data layer

- [ ] T-10 — Add Drizzle schema + migration for …
- [ ] T-11 — Repository / query helpers for …

## Business logic

- [ ] T-20 — Zustand slice with actions …
- [ ] T-21 — Unit-normalization / total-calc logic …

## UI

- [ ] T-30 — Screen `<Name>` with components …
- [ ] T-31 — Wire navigation route …

## Tests

- [ ] T-40 — Unit tests for business logic.
- [ ] T-41 — Component tests for key UI.
- [ ] T-42 — Manual QA on iOS + Android device (golden path + edge cases).

## Polish

- [ ] T-50 — A11y labels + Dynamic Type review.
- [ ] T-51 — Dark mode review.

## Done when

All checkboxes ticked **and** every `spec.md` AC demonstrably passes.
