# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build
```

## Architecture

Single-page React + TypeScript app (Vite). All calculations are client-side — no backend. State is persisted to `localStorage` via Zustand's `persist` middleware.

### Data flow

1. User fills in `ScenarioInputs` (up to 4 scenarios side-by-side)
2. `runProjections()` in the store calls `runProjection()` for each scenario
3. Results render as summary cards + Recharts charts + a year-by-year table

### Engines (`src/engines/`)

Pure functions, no React dependencies.

| File | Purpose |
|------|---------|
| `cpp.ts` | CPP benefit with deferral adjustments (−0.6%/mo before 65, +0.7%/mo after) |
| `oas.ts` | OAS benefit with deferral (+0.6%/mo), residency proration, clawback |
| `tax.ts` | Federal + provincial income tax with age amount, pension income credit |
| `projection.ts` | Year-by-year simulation to age 95: grows accounts, sources income, calculates tax |
| `optimizer.ts` | Brute-force grid search (CPP age 60–70 × OAS age 65–70) to maximise lifetime after-tax income |

### Reference data (`src/data/taxBrackets.ts`)

2024 federal and all 13 provincial/territorial tax brackets, RRIF minimum withdrawal factors by age (CRA prescribed), TFSA annual room by year, OAS/CPP rate constants.

### Store (`src/store/useStore.ts`)

Zustand store managing `scenarios[]`, `results[]`, and `optimizations{}`. Key actions: `updateScenario`, `runProjections`, `runOptimization`, `applyOptimization`.

### Withdrawal logic (in `projection.ts`)

Each year: RRIF mandatory minimum drawn first (post-71), then non-registered, then TFSA fills any remaining spending gap. Additional RRSP draws happen pre-71 if needed. Non-registered withdrawals use 50% inclusion for capital gains.

### Tax calculation notes

- Pension income credit applies to RRIF withdrawals at age ≥ 65 and employer pension income
- OAS clawback: 15¢/dollar above ~$90,997 (2024) net income threshold
- Provincial basic personal amounts use the lowest bracket rate (not a flat credit rate)
