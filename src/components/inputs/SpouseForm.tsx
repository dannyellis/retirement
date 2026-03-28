import { ScenarioInputs } from '../../types';

interface Props {
  scenario: ScenarioInputs;
  onChange: (updates: Partial<ScenarioInputs>) => void;
}

export function SpouseForm({ scenario, onChange }: Props) {
  const { spouse, spouseCPP, spouseOAS, spouseAccounts, pensionIncomeSplitting } = scenario;

  return (
    <div className="space-y-6">
      {/* Spouse Profile */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Spouse / Partner Profile</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={spouse.name}
              onChange={(e) => onChange({ spouse: { ...spouse, name: e.target.value } })}
              placeholder="Spouse name"
            />
          </div>
          <div>
            <label className="label">Birth Year</label>
            <input
              className="input"
              type="number"
              value={spouse.birthYear}
              min={1940}
              max={2000}
              onChange={(e) => onChange({ spouse: { ...spouse, birthYear: Number(e.target.value) } })}
            />
          </div>
          <div>
            <label className="label">Retirement Age</label>
            <input
              className="input"
              type="number"
              value={spouse.retirementAge}
              min={55}
              max={75}
              onChange={(e) => onChange({ spouse: { ...spouse, retirementAge: Number(e.target.value) } })}
            />
          </div>
        </div>
      </div>

      {/* Spouse CPP */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Spouse CPP</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Estimated Monthly Benefit at 65 ($)</label>
            <input
              className="input"
              type="number"
              value={spouseCPP.estimatedMonthlyAt65}
              min={0}
              max={1364}
              onChange={(e) =>
                onChange({ spouseCPP: { ...spouseCPP, estimatedMonthlyAt65: Number(e.target.value) } })
              }
            />
          </div>
          <div>
            <label className="label">CPP Start Age</label>
            <input
              className="input"
              type="number"
              value={spouseCPP.startAge}
              min={60}
              max={70}
              onChange={(e) =>
                onChange({ spouseCPP: { ...spouseCPP, startAge: Number(e.target.value) } })
              }
            />
            <p className="text-xs text-gray-400 mt-1">60–70 · −0.6%/mo before 65 · +0.7%/mo after 65</p>
          </div>
        </div>
      </div>

      {/* Spouse OAS */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Spouse OAS</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">OAS Start Age</label>
            <input
              className="input"
              type="number"
              value={spouseOAS.startAge}
              min={65}
              max={70}
              onChange={(e) =>
                onChange({ spouseOAS: { ...spouseOAS, startAge: Number(e.target.value) } })
              }
            />
          </div>
          <div>
            <label className="label">Years of Canadian Residency</label>
            <input
              className="input"
              type="number"
              value={spouseOAS.residencyYears}
              min={10}
              max={40}
              onChange={(e) =>
                onChange({ spouseOAS: { ...spouseOAS, residencyYears: Number(e.target.value) } })
              }
            />
          </div>
        </div>
      </div>

      {/* Spouse Accounts */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Spouse Accounts</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">RRSP / RRIF ($)</label>
            <input
              className="input"
              type="number"
              value={spouseAccounts.rrsp}
              step={1000}
              onChange={(e) =>
                onChange({ spouseAccounts: { ...spouseAccounts, rrsp: Number(e.target.value) } })
              }
            />
          </div>
          <div>
            <label className="label">TFSA ($)</label>
            <input
              className="input"
              type="number"
              value={spouseAccounts.tfsa}
              step={1000}
              onChange={(e) =>
                onChange({ spouseAccounts: { ...spouseAccounts, tfsa: Number(e.target.value) } })
              }
            />
          </div>
          <div>
            <label className="label">Non-Registered ($)</label>
            <input
              className="input"
              type="number"
              value={spouseAccounts.nonReg ?? 0}
              step={1000}
              onChange={(e) =>
                onChange({ spouseAccounts: { ...spouseAccounts, nonReg: Number(e.target.value) } })
              }
            />
          </div>
          <div>
            <label className="label">Monthly Employer Pension ($)</label>
            <input
              className="input"
              type="number"
              value={spouseAccounts.employerPension}
              min={0}
              onChange={(e) =>
                onChange({
                  spouseAccounts: { ...spouseAccounts, employerPension: Number(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <label className="label">Pension Start Age</label>
            <input
              className="input"
              type="number"
              value={spouseAccounts.employerPensionStartAge}
              min={55}
              max={75}
              onChange={(e) =>
                onChange({
                  spouseAccounts: {
                    ...spouseAccounts,
                    employerPensionStartAge: Number(e.target.value),
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Pension Income Splitting */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={pensionIncomeSplitting}
            onChange={(e) => onChange({ pensionIncomeSplitting: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-600"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Pension Income Splitting (T1032)</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Automatically optimize the split of eligible pension income (RRIF ≥65, DB pension) between spouses to minimize combined tax.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
