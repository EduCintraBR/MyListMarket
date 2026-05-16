# Spec: <Feature Name>

> Feature ID: NNN — Status: Draft | Ready | In Progress | Done
> PRD anchor: PRD §X.Y, RF-XXX-NN
> Sprint: SN (see `SPRINTS.md`)

## 1. User story

**As a** <user role>
**I want** <capability>
**So that** <outcome>

## 2. Acceptance criteria

Use Given/When/Then. Each criterion MUST be independently verifiable.

- **AC-1** — Given …, when …, then ….
- **AC-2** — Given …, when …, then ….

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| RF-XXX-01 | PRD §5.x | … |

## 4. Edge cases

- Empty state.
- Soft-deleted dependency (e.g. mercado archived after used in a compra).
- Conflicting state (e.g. two lists racing to `em_compra`).
- Offline / app killed mid-flow.

## 5. Out of scope (for this feature)

- …

## 6. Dependencies

- Depends on feature: NNN-…
- Blocks feature: NNN-…

## 7. Open questions

- [ ] …
