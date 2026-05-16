# Spec: Project Foundation

> Feature ID: 001 — Status: Ready
> PRD anchor: PRD §11 (stack), §6 (NFR), §2 (escopo)
> Sprint: **S1**

## 1. User story

**As a** developer
**I want** a working Expo + TypeScript + Drizzle + RN Paper project skeleton
**So that** subsequent feature work can plug into a stable foundation without re-deciding stack choices.

## 2. Acceptance criteria

- **AC-1** — `npx expo start` boots the app on iOS Simulator and Android Emulator showing a "Hello MyListMarket" home screen.
- **AC-2** — `npm run typecheck` exits 0 with TypeScript `strict: true`.
- **AC-3** — `npm run lint` exits 0 with the agreed ESLint config.
- **AC-4** — Opening the app twice in a row produces a SQLite DB file at `FileSystem.documentDirectory`, with all tables from `specs/_shared/data-model.md` created via Drizzle migration `0001_init`.
- **AC-5** — RN Paper theme switches between light and dark following system `useColorScheme`.
- **AC-6** — Navigation skeleton (bottom tabs: Listas, Histórico, Relatórios, Config) renders, each tab is a placeholder screen.
- **AC-7** — Global Zustand store boots with empty slices for `listas`, `produtos`, `mercados`, `compraAtiva`.
- **AC-8** — A logger util (`src/lib/log.ts`) wraps console; no raw `console.log` allowed by lint.

## 3. Functional requirements covered

| FR ID | PRD ref | Note |
|-------|---------|------|
| (infra) | §11.1 | Stack lock-in materialized |
| (infra) | §6.3 | SQLite storage path established |
| (infra) | §6.4 | Dark mode framework in place |

## 4. Edge cases

- First launch with no DB: migration creates schema cleanly.
- App killed mid-migration: Drizzle should re-run on next boot idempotently.
- iOS simulator vs Android emulator path differences for `documentDirectory`.

## 5. Out of scope

- No business screens (lists, items, etc.) — placeholders only.
- No EAS pipeline yet (deferred to S6 release prep).
- No PT-BR i18n library yet (strings inline; i18n added when needed).

## 6. Dependencies

- Blocks all other features.

## 7. Open questions

- [ ] Decide on UUID lib: `react-native-get-random-values` + `uuid` v9 vs `expo-crypto`.
- [ ] Choose Jest config: `jest-expo` preset.
