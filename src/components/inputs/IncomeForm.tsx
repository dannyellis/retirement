
import { ScenarioInputs } from '../../types';
import { useStore } from '../../store/useStore';

interface Props {
  scenario: ScenarioInputs;
  onChange: (updates: Partial<ScenarioInputs>) => void;
}

export function IncomeForm({ scenario, onChange }: Props) {
  const { cpp, oas, accounts } = scenario;
  const runOptimization = useStore((s) => s.runOptimization);
  const applyOptimization = useStore((s) => s.applyOptimization);
  const optimizations = useStore((s) => s.optimizations);
  const opt = optimizations[scenario.id];

  return (
    <div className="space-y-6">
      {/* CPP */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">CPP</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Estimated Monthly Benefit at 65 ($)</label>
            <input
              className="input"
              type="number"
              value={cpp.estimatedMonthlyAt65}
              min={0}
              max={1364}
              onChange={(e) =>
                onChange({ cpp: { ...cpp, estimatedMonthlyAt65: Number(e.target.value) } })
              }
            />
            <p className="text-xs text-gray-400 mt-1">From your Service Canada My Account statement. Max 2024: $1,364/mo</p>
          </div>
          <div>
            <label className="label">CPP Start Age</label>
            <input
              className="input"
              type="number"
              value={cpp.startAge}
              min={60}
              max={70}
              onChange={(e) =>
                onChange({ cpp: { ...cpp, startAge: Number(e.target.value) } })
              }
            />
            <p className="text-xs text-gray-400 mt-1">60–70 · −0.6%/mo before 65 · +0.7%/mo after 65</p>
          </div>
        </div>
      </div>

      {/* OAS */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">OAS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">OAS Start Age</label>
            <input
              className="input"
              type="number"
              value={oas.startAge}
              min={65}
              max={70}
              onChange={(e) =>
                onChange({ oas: { ...oas, startAge: Number(e.target.value) } })
              }
            />
            <p className="text-xs text-gray-400 mt-1">65–70 · +0.6%/mo after 65 · base $713/mo (2024)</p>
          </div>
          <div>
            <label className="label">Years of Canadian Residency</label>
            <input
              className="input"
              type="number"
              value={oas.residencyYears}
              min={10}
              max={40}
              onChange={(e) =>
                onChange({ oas: { ...oas, residencyYears: Number(e.target.value) } })
              }
            />
            <p className="text-xs text-gray-400 mt-1">40 years = full OAS benefit</p>
          </div>
        </div>
      </div>

      {/* Optimizer */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-blue-800 text-sm">CPP/OAS Optimizer</span>
          <button
            className="btn-secondary text-sm"
            onClick={() => runOptimization(scenario.id)}
          >
            Find Best Start Ages
          </button>
        </div>
        {opt && (
          <div className="space-y-2">
            <p className="text-sm text-blue-700">
              Best: CPP at <strong>{opt.bestCppStartAge}</strong>, OAS at <strong>{opt.bestOasStartAge}</strong>
              {scenario.hasSpouse && (
                <> · Spouse CPP at <strong>{opt.bestSpouseCppStartAge}</strong>, OAS at <strong>{opt.bestSpouseOasStartAge}</strong></>
              )}
              {' '}→ lifetime household after-tax income{' '}
              <strong>${Math.round(opt.lifetimeAfterTaxIncome / 1000).toLocaleString()}k</strong>
            </p>
            <button
              className="btn-primary text-sm"
              onClick={() => applyOptimization(scenario.id)}
            >
              Apply These Ages
            </button>
          </div>
        )}
      </div>

      {/* Employer Pension */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Employer Pension (DB/DC)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Monthly Pension Amount ($)</label>
            <input
              className="input"
              type="number"
              value={accounts.employerPension}
              min={0}
              onChange={(e) =>
                onChange({ accounts: { ...accounts, employerPension: Number(e.target.value) } })
              }
            />
          </div>
          <div>
            <label className="label">Pension Start Age</label>
            <input
              className="input"
              type="number"
              value={accounts.employerPensionStartAge}
              min={55}
              max={75}
              onChange={(e) =>
                onChange({
                  accounts: { ...accounts, employerPensionStartAge: Number(e.target.value) },
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
