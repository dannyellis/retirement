import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ScenarioInputs, ProjectionResult, OptimizationResult } from '../types';
import { runProjection } from '../engines/projection';
import { optimizeCPPOAS } from '../engines/optimizer';

const defaultScenario = (id: string, label: string): ScenarioInputs => ({
  id,
  label,
  profile: {
    name: '',
    birthYear: 1965,
    province: 'ON',
    retirementAge: 62,
  },
  cpp: {
    estimatedMonthlyAt65: 900,
    startAge: 65,
  },
  oas: {
    startAge: 65,
    residencyYears: 40,
  },
  accounts: {
    rrsp: 400000,
    tfsa: 100000,
    nonReg: 50000,
    employerPension: 0,
    employerPensionStartAge: 65,
  },
  growthRates: {
    rrsp: 0.05,
    tfsa: 0.05,
    nonReg: 0.05,
    inflation: 0.025,
  },
  annualSpending: 60000,
  hasSpouse: false,
  spouse: {
    name: '',
    birthYear: 1965,
    retirementAge: 62,
  },
  spouseCPP: {
    estimatedMonthlyAt65: 700,
    startAge: 65,
  },
  spouseOAS: {
    startAge: 65,
    residencyYears: 40,
  },
  spouseAccounts: {
    rrsp: 200000,
    tfsa: 80000,
    nonReg: 0,
    employerPension: 0,
    employerPensionStartAge: 65,
  },
  pensionIncomeSplitting: true,
  meltdown: {
    enabled: false,
    targetIncome: 80000,
    spouseTargetIncome: 80000,
    reinvestInTFSA: true,
  },
});

interface AppState {
  scenarios: ScenarioInputs[];
  results: ProjectionResult[];
  optimizations: Record<string, OptimizationResult>;
  activeTab: 'inputs' | 'results';

  updateScenario: (id: string, updates: Partial<ScenarioInputs>) => void;
  addScenario: () => void;
  removeScenario: (id: string) => void;
  runProjections: () => void;
  runOptimization: (id: string) => void;
  applyOptimization: (id: string) => void;
  setActiveTab: (tab: 'inputs' | 'results') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      scenarios: [defaultScenario('a', 'Scenario A'), defaultScenario('b', 'Scenario B')],
      results: [],
      optimizations: {},
      activeTab: 'inputs',

      updateScenario: (id, updates) => {
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      addScenario: () => {
        const id = Math.random().toString(36).slice(2, 6);
        const label = `Scenario ${String.fromCharCode(65 + get().scenarios.length)}`;
        const scenarios = get().scenarios;
        const last = scenarios[scenarios.length - 1];
        const base = last ? { ...last, id, label } : defaultScenario(id, label);
        set((state) => ({
          scenarios: [...state.scenarios, base],
        }));
      },

      removeScenario: (id) => {
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
          results: state.results.filter((r) => r.scenarioId !== id),
        }));
      },

      runProjections: () => {
        const results = get().scenarios.map(runProjection);
        set({ results, activeTab: 'results' });
      },

      runOptimization: (id) => {
        const scenario = get().scenarios.find((s) => s.id === id);
        if (!scenario) return;
        const opt = optimizeCPPOAS(scenario);
        set((state) => ({
          optimizations: { ...state.optimizations, [id]: opt },
        }));
      },

      applyOptimization: (id) => {
        const opt = get().optimizations[id];
        if (!opt) return;
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id
              ? {
                  ...s,
                  cpp: { ...s.cpp, startAge: opt.bestCppStartAge },
                  oas: { ...s.oas, startAge: opt.bestOasStartAge },
                  spouseCPP: { ...s.spouseCPP, startAge: opt.bestSpouseCppStartAge },
                  spouseOAS: { ...s.spouseOAS, startAge: opt.bestSpouseOasStartAge },
                }
              : s
          ),
        }));
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    { name: 'retirement-planner-v5' }
  )
);
