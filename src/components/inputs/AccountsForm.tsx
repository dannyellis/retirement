
import { ScenarioInputs } from '../../types';

interface Props {
  scenario: ScenarioInputs;
  onChange: (updates: Partial<ScenarioInputs>) => void;
}

function pct(v: number) { return (v * 100).toFixed(1); }
function toPct(v: string) { return parseFloat(v) / 100; }

const BRACKET_PRESETS = [
  { label: 'Top of 1st federal bracket ($55,867)', value: 55867 },
  { label: 'OAS clawback threshold ($90,997)', value: 90997 },
  { label: 'Top of 2nd federal bracket ($111,733)', value: 111733 },
];

export function AccountsForm({ scenario, onChange }: Props) {
  const { accounts, growthRates, annualSpending, meltdown, hasSpouse } = scenario;

  return (
    <div className="space-y-6">
      {/* Account Balances */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Account Balances (today's dollars)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">RRSP / RRIF ($)</label>
            <input
              className="input"
              type="number"
              value={accounts.rrsp}
              step={1000}
              onChange={(e) => onChange({ accounts: { ...accounts, rrsp: Number(e.target.value) } })}
            />
          </div>
          <div>
            <label className="label">TFSA ($)</label>
            <input
              className="input"
              type="number"
              value={accounts.tfsa}
              step={1000}
              onChange={(e) => onChange({ accounts: { ...accounts, tfsa: Number(e.target.value) } })}
            />
          </div>
          <div>
            <label className="label">Non-Registered ($)</label>
            <input
              className="input"
              type="number"
              value={accounts.nonReg}
              step={1000}
              onChange={(e) => onChange({ accounts: { ...accounts, nonReg: Number(e.target.value) } })}
            />
          </div>
        </div>
      </div>

      {/* Growth Rates */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Assumed Growth Rates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'rrsp', label: 'RRSP / RRIF' },
            { key: 'tfsa', label: 'TFSA' },
            { key: 'nonReg', label: 'Non-Registered' },
            { key: 'inflation', label: 'Inflation' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="label">{label} (%/yr)</label>
              <input
                className="input"
                type="number"
                value={pct(growthRates[key as keyof typeof growthRates])}
                step={0.1}
                min={0}
                max={15}
                onChange={(e) =>
                  onChange({ growthRates: { ...growthRates, [key]: toPct(e.target.value) } })
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Annual Spending */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Spending</h3>
        <div className="max-w-xs">
          <label className="label">Annual Retirement Spending (today's $)</label>
          <input
            className="input"
            type="number"
            value={annualSpending}
            step={1000}
            onChange={(e) => onChange({ annualSpending: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* RRSP Meltdown */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!meltdown?.enabled}
            onChange={(e) =>
              onChange({ meltdown: { ...(meltdown ?? { targetIncome: 80000, spouseTargetIncome: 80000, reinvestInTFSA: true, annualTfsaRoom: 0 }), enabled: e.target.checked } })
            }
            className="w-4 h-4 rounded border-gray-300 text-blue-600"
          />
          <div>
            <span className="text-sm font-semibold text-gray-700">RRSP Meltdown Strategy</span>
            <p className="text-xs text-gray-500 mt-0.5">
              Deliberately draw down RRSP before mandatory RRIF minimums kick in at 71, filling a target income bracket at lower tax rates.
            </p>
          </div>
        </label>

        {meltdown?.enabled && (
          <div className="ml-7 space-y-4 pt-1">
            {/* Primary target */}
            <div className="space-y-2">
              <label className="label">Primary Target Annual Gross Income (today's $)</label>
              <div className="flex gap-2 flex-wrap">
                {BRACKET_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => onChange({ meltdown: { ...meltdown, targetIncome: p.value } })}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      meltdown.targetIncome === p.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                className="input max-w-xs"
                type="number"
                value={meltdown.targetIncome}
                step={1000}
                onChange={(e) =>
                  onChange({ meltdown: { ...meltdown, targetIncome: Number(e.target.value) } })
                }
              />
              <p className="text-xs text-gray-400">
                Each year the engine draws extra RRSP to bring taxable income up to this level (inflation-adjusted). Has no effect once CPP+OAS+pension already exceed the target.
              </p>
            </div>

            {/* Spouse target (only if spouse enabled) */}
            {hasSpouse && (
              <div className="space-y-2">
                <label className="label">Spouse Target Annual Gross Income (today's $)</label>
                <div className="flex gap-2 flex-wrap">
                  {BRACKET_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => onChange({ meltdown: { ...meltdown, spouseTargetIncome: p.value } })}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        meltdown.spouseTargetIncome === p.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  className="input max-w-xs"
                  type="number"
                  value={meltdown.spouseTargetIncome}
                  step={1000}
                  onChange={(e) =>
                    onChange({ meltdown: { ...meltdown, spouseTargetIncome: Number(e.target.value) } })
                  }
                />
              </div>
            )}

            {/* Reinvest toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!meltdown.reinvestInTFSA}
                onChange={(e) =>
                  onChange({ meltdown: { ...meltdown, reinvestInTFSA: e.target.checked } })
                }
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-xs text-gray-700">
                Reinvest after-tax meltdown surplus into TFSA each year
              </span>
            </label>

            {/* Annual TFSA contribution room cap */}
            {meltdown.reinvestInTFSA && (
              <div className="space-y-1">
                <label className="label">Annual TFSA Contribution Room ($/yr)</label>
                <input
                  className="input max-w-xs"
                  type="number"
                  value={meltdown.annualTfsaRoom || ''}
                  placeholder="CRA scheduled (e.g. 7000)"
                  step={500}
                  min={0}
                  onChange={(e) =>
                    onChange({ meltdown: { ...meltdown, annualTfsaRoom: Number(e.target.value) } })
                  }
                />
                <p className="text-xs text-gray-400">
                  Maximum surplus deposited into TFSA each year. Leave blank to use the CRA-scheduled annual room for each year.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
