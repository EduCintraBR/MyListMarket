# Spec: Settings, Theming & Polish

> Feature ID: 009 — Status: Ready
> PRD anchor: §6.4 dark mode, §6.5 a11y, RF-OUT-03 stub, RF-REL-10 stub
> Sprint: **S6**

## 1. User story

**As a** user
**I want** a Configurações screen plus consistent dark/light mode and accessible interactions
**So that** the app respects my device preferences and is usable one-handed at the market.

## 2. Acceptance criteria

- **AC-1** — Configurações screen lists: Tema (Sistema / Claro / Escuro), Catálogo, Mercados, Sobre (versão, link PRD), placeholders for Backup (V1.1) and Exportar (V1.1) disabled with "em breve" badge.
- **AC-2** — Theme choice persists via `expo-secure-store` (or AsyncStorage) and survives app restart.
- **AC-3** — Dark mode is visually polished across ALL screens (no white flashes, contrast ≥ AA).
- **AC-4** — Every interactive element has an `accessibilityLabel`; VoiceOver/TalkBack reads the screen end-to-end coherently.
- **AC-5** — Touch targets ≥ 44pt iOS / 48dp Android verified via audit checklist.
- **AC-6** — Dynamic Type / font scaling respected up to system XL.
- **AC-7** — Performance audit: cold start <2 s, interaction <200 ms, total recompute <100 ms (Constitution §4.1).

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| (NFR) | §6.4 | Dark mode |
| (NFR) | §6.5 | A11y |
| (cross-cutting) | — | Final polish pass |

## 4. Edge cases

- User toggles theme mid-flow (e.g. inside CompraMode) — no remount, smooth transition.
- System font set to XXL — layouts wrap, no clipping.
- Reduced motion enabled — disable non-essential animations.

## 5. Out of scope

- Internationalization (V2).
- Per-feature settings (V2).

## 6. Dependencies

- Depends on: 001 (theme scaffold), 002, 003.

## 7. Open questions

- [ ] Storage choice for theme preference: `expo-secure-store` is overkill; default to AsyncStorage if available, else fallback to a dedicated SQLite `kv` table.
