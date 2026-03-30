import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ScenarioInputs, AccumulationInputs } from '../../types';
import { runAccumulation, defaultAccumulation } from '../../engines/accumulation';

interface Props {
  scenario: ScenarioInputs;
  onChange: (updates: Partial<ScenarioInputs>) => void;
  onApply: () => void;
}

const fmt = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(2)}M`
    : `$${Math.round(v).toLocaleString()}`;

const fmtAxis = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}k`;

function numInput(
  label: string,
  value: number,
  onChange: (v: number) => void,
  step = 1000,
) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type="number"
        value={value}
        step={step}
        min={0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function AccumulationPanel({ scenario, onChange, onApply }: Props) {
  const acc: AccumulationInputs = scenario.accumulation ?? defaultAccumulation();

  const update = (patch: Partial<AccumulationInputs>) =>
    onChange({ accumulation: { ...acc, ...patch } });

  const result = useMemo(() => runAccumulation(scenario), [scenario]);

  const { rows, retirementRrsp, retirementTfsa, retirementNonReg,
          spouseRetirementRrsp, spouseRetirementTfsa, spouseRetirementNonReg,
          currentAge, yearsToRetirement } = result;

  const retirementTotal = retirementRrsp + retirementTfsa + retirementNonReg;
  const spouseRetirementTotal = spouseRetirementRrsp + spouseRetirementTfsa + spouseRetirementNonReg;
  const alreadyRetired = yearsToRetirement <= 0;

  const chartData = rows.map((r) => ({
    age: r.age,
    RRSP: Math.round(r.rrsp),
    TFSA: Math.round(r.tfsa),
    'Non-Reg': Math.round(r.nonReg),
    ...(scenario.hasSpouse
      ? {
          'Spouse RRSP': Math.round(r.spouseRrsp ?? 0),
          'Spouse TFSA': Math.round(r.spouseTfsa ?? 0),
          'Spouse Non-Reg': Math.round(r.spouseNonReg ?? 0),
        }
      : {}),
  }));

  return (
    <div className="card flex-1 min-w-0 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">{scenario.label}</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Age {currentAge} → retire at {scenario.profile.retirementAge}
          {alreadyRetired
            ? ' (already at or past retirement age)'
            : ` · ${yearsToRetirement} year${yearsToRetirement !== 1 ? 's' : ''} to go`}
        </p>
      </div>

      {alreadyRetired ? (
        <p className="text-sm text-amber-600">
          Retirement age is at or before current age — no accumulation period to project.
          Update the retirement age in the Inputs tab.
        </p>
      ) : (
        <>
          {/* Primary Person Inputs */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">
              {scenario.profile.name || 'Primary'} — Current Balances
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {numInput('RRSP ($)', acc.currentRrsp, (v) => update({ currentRrsp: v }))}
              {numInput('TFSA ($)', acc.currentTfsa, (v) => update({ currentTfsa: v }))}
              {numInput('Non-Registered ($)', acc.currentNonReg, (v) => update({ currentNonReg: v }))}
            </div>
            <h3 className="font-semibold text-gray-700 pt-1">Annual Contributions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {numInput('RRSP ($/yr)', acc.annualRrspContribution, (v) => update({ annualRrspContribution: v }))}
              {numInput('TFSA ($/yr)', acc.annualTfsaContribution, (v) => update({ annualTfsaContribution: v }))}
              {numInput('Non-Registered ($/yr)', acc.annualNonRegContribution, (v) => update({ annualNonRegContribution: v }))}
            </div>
          </div>

          {/* Spouse Inputs */}
          {scenario.hasSpouse && (
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-700">
                {scenario.spouse.name || 'Spouse'} — Current Balances
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {numInput('RRSP ($)', acc.spouseCurrentRrsp, (v) => update({ spouseCurrentRrsp: v }))}
                {numInput('TFSA ($)', acc.spouseCurrentTfsa, (v) => update({ spouseCurrentTfsa: v }))}
                {numInput('Non-Registered ($)', acc.spouseCurrentNonReg, (v) => update({ spouseCurrentNonReg: v }))}
              </div>
              <h3 className="font-semibold text-gray-700 pt-1">Annual Contributions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {numInput('RRSP ($/yr)', acc.spouseAnnualRrspContribution, (v) => update({ spouseAnnualRrspContribution: v }))}
                {numInput('TFSA ($/yr)', acc.spouseAnnualTfsaContribution, (v) => update({ spouseAnnualTfsaContribution: v }))}
                {numInput('Non-Registered ($/yr)', acc.spouseAnnualNonRegContribution, (v) => update({ spouseAnnualNonRegContribution: v }))}
              </div>
            </div>
          )}

          {/* Growth rate note */}
          <p className="text-xs text-gray-400">
            Growth rates are shared with the retirement projection — update them in the Inputs → Accounts tab
            (currently RRSP {(scenario.growthRates.rrsp * 100).toFixed(1)}%,
            TFSA {(scenario.growthRates.tfsa * 100).toFixed(1)}%,
            Non-Reg {(scenario.growthRates.nonReg * 100).toFixed(1)}%).
          </p>

          {/* Projected Results */}
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-700">Projected at Retirement (age {scenario.profile.retirementAge})</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary summary */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  {scenario.profile.name || 'Primary'}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">RRSP</span>
                    <span className="font-medium">{fmt(retirementRrsp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TFSA</span>
                    <span className="font-medium">{fmt(retirementTfsa)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Non-Reg</span>
                    <span className="font-medium">{fmt(retirementNonReg)}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-1 font-semibold">
                    <span>Total</span>
                    <span className="text-blue-700">{fmt(retirementTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Spouse summary */}
              {scenario.hasSpouse && (
                <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                    {scenario.spouse.name || 'Spouse'} (age {scenario.spouse.retirementAge})
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">RRSP</span>
                      <span className="font-medium">{fmt(spouseRetirementRrsp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">TFSA</span>
                      <span className="font-medium">{fmt(spouseRetirementTfsa)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Non-Reg</span>
                      <span className="font-medium">{fmt(spouseRetirementNonReg)}</span>
                    </div>
                    <div className="flex justify-between border-t border-purple-200 pt-1 font-semibold">
                      <span>Total</span>
                      <span className="text-purple-700">{fmt(spouseRetirementTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chart */}
            {chartData.length > 1 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="age" tick={{ fontSize: 11 }} label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                    <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v) => fmt(Number(v))} labelFormatter={(l) => `Age ${l}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="RRSP" stroke="#3b82f6" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="TFSA" stroke="#10b981" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="Non-Reg" stroke="#f59e0b" dot={false} strokeWidth={2} />
                    {scenario.hasSpouse && (
                      <>
                        <Line type="monotone" dataKey="Spouse RRSP" stroke="#8b5cf6" dot={false} strokeWidth={2} strokeDasharray="4 2" />
                        <Line type="monotone" dataKey="Spouse TFSA" stroke="#06b6d4" dot={false} strokeWidth={2} strokeDasharray="4 2" />
                        <Line type="monotone" dataKey="Spouse Non-Reg" stroke="#f97316" dot={false} strokeWidth={2} strokeDasharray="4 2" />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Apply button */}
            <div className="flex items-center gap-4 pt-2">
              <button onClick={onApply} className="btn-primary">
                Use These Balances in Retirement Projection
              </button>
              <p className="text-xs text-gray-400">
                Copies projected balances to the Accounts tab and switches to Inputs.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
