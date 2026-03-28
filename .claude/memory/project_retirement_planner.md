---
name: Retirement Planner Project
description: Canadian retirement planning webapp being built from scratch
type: project
---

Building a Canadian retirement planning webapp (React + TypeScript + Vite). Key decisions made:

- Pure frontend, no backend — all calculations client-side
- Zustand for state (persisted to localStorage)
- Recharts for charts, Tailwind v3 for styling
- Up to 4 side-by-side scenario comparison
- CPP/OAS optimizer runs brute-force grid search

**Why:** User wants to help people plan retirement in Canada with CPP, OAS, RRSP/RRIF, TFSA, non-registered accounts, and provincial taxes.

**How to apply:** This is the primary project in /home/danny/retirement. All features build on this foundation.

Deferred features (not yet built):
- Spouse/partner support
- Income splitting between spouses
- GIS (Guaranteed Income Supplement) details
