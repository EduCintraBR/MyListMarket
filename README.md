# MyListMarket

Offline-first mobile app (iOS + Android) for planning, executing and analyzing supermarket purchases.
React Native + Expo, TypeScript, SQLite (Drizzle ORM), Zustand, React Native Paper.

## Documentation

- **PRD (source of truth, PT-BR):** [`docs/PRD_App_Lista_de_Compras.md`](docs/PRD_App_Lista_de_Compras.md)
- **Project Constitution (invariants):** [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
- **Sprint plan (V1.0 MVP, 6 × 2 weeks):** [`SPRINTS.md`](SPRINTS.md)
- **Feature specs:** [`specs/`](specs/) — each `NNN-*` folder contains `spec.md` (what), `plan.md` (how), `tasks.md` (do).
- **Shared data model:** [`specs/_shared/data-model.md`](specs/_shared/data-model.md)
- **Onboarding for Claude Code:** [`CLAUDE.md`](CLAUDE.md)

## Status

V1.0 MVP — pre-implementation. Sprint 1 (Foundation) is next; source code does not yet exist.

## Run (once Sprint 1 lands)

```bash
npm install
npx expo start
```

iOS: `i` in the Expo CLI / Android: `a`.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo (managed) |
| Language | TypeScript (strict) |
| DB | expo-sqlite + Drizzle ORM |
| State | Zustand |
| Nav | React Navigation |
| UI | React Native Paper |
| Charts | Victory Native |
| Imagens | expo-image-picker + expo-image-manipulator |

Full stack rationale in the Constitution.

## License

Private / personal project — no license granted.
