# Canadian Retirement Planner

A client-side retirement planning tool for Canadians. Models CPP, OAS, RRSP/RRIF, TFSA, and non-registered accounts with real 2026 federal and provincial tax rates.

## Features

- **Accumulation tool** — project current savings + annual contributions forward to retirement, then apply the results as starting balances
- **Up to 4 side-by-side scenarios** for comparison
- **Year-by-year retirement projection** from retirement age to 95, with account drawdown sequencing (RRIF minimums → non-registered → TFSA)
- **RRSP meltdown strategy** — deliberately draw RRSP before age 71 to fill lower tax brackets, with optional TFSA reinvestment
- **CPP/OAS optimizer** — brute-force grid search over start ages (CPP 60–70, OAS 65–70) to maximize lifetime after-tax income
- **Pension income splitting (T1032)** — optimizes the split fraction automatically
- **Spouse support** — separate accounts, CPP/OAS, and retirement ages
- **OAS clawback** — calculated at 15¢/dollar above the 2026 threshold ($95,323)
- **All 13 provinces/territories** — correct bracket rates and basic personal amounts
- State persisted to `localStorage` — no account or backend required

## Usage

```bash
npm install
npm run dev      # http://localhost:5173/retirement/
npm run build    # TypeScript check + production build
npm run preview  # Preview production build
```

## Workflow

1. **Accumulation tab** — enter current balances and annual contributions to see what you'll have at retirement; click *Use These Balances* to populate the Inputs tab
2. **Inputs tab** — fill in CPP/OAS estimates, employer pension, spending target, and growth rate assumptions; run the optimizer if you're unsure about CPP/OAS start ages
3. **Results tab** — review summary cards, income/balance/tax charts, and the full year-by-year table

## Architecture

Single-page React + TypeScript app (Vite). All calculations run in the browser — no data leaves your machine.

```
src/
  engines/
    accumulation.ts   # Pre-retirement balance projection
    projection.ts     # Year-by-year retirement drawdown simulation
    cpp.ts            # CPP benefit with deferral adjustments
    oas.ts            # OAS benefit, deferral, residency proration, clawback
    tax.ts            # Federal + provincial income tax, credits
    optimizer.ts      # Grid search over CPP/OAS start ages
  data/
    taxBrackets.ts    # 2026 federal + all 13 provincial brackets, RRIF factors, TFSA room
  store/
    useStore.ts       # Zustand store with localStorage persistence
  components/
    accumulation/     # Pre-retirement accumulation panels
    inputs/           # Scenario input forms (profile, income, accounts, spouse)
    results/          # Summary cards, projection table
    charts/           # Income, balance, and tax charts (Recharts)
  types/
    index.ts          # All shared TypeScript interfaces
```
