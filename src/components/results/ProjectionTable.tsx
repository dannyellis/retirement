import { useState } from 'react';
import { ProjectionResult, YearlyProjection } from '../../types';

const money = (v: number) => `$${Math.round(v).toLocaleString()}`;
const signed = (v: number) => v >= 0 ? `+${money(v)}` : `-${money(Math.abs(v))}`;

interface AccountRowProps {
  label: string;
  opening: number;
  growth: number;
  withdrawal: number;
  closing: number;
  meltdown?: number;
  reinvested?: number;
}

function AccountRow({ label, opening, growth, withdrawal, closing, meltdown, reinvested }: AccountRowProps) {
  if (opening === 0 && closing === 0 && growth === 0) return null;
  return (
    <tr className="border-b border-gray-100 text-xs">
      <td className="py-1.5 pr-4 font-medium text-gray-700 whitespace-nowrap">{label}</td>
      <td className="text-right pr-4 text-gray-600">{money(opening)}</td>
      <td className="text-right pr-4 text-green-600">{signed(growth)}</td>
      <td className="text-right pr-4 text-red-500">
        {withdrawal > 0 ? `-${money(withdrawal)}` : '—'}
        {meltdown && meltdown > 0
          ? <span className="text-orange-500 ml-1">({money(meltdown)} meltdown)</span>
          : null}
      </td>
      {reinvested !== undefined && (
        <td className="text-right pr-4 text-blue-600">
          {reinvested > 0 ? `+${money(reinvested)}` : '—'}
        </td>
      )}
      <td className="text-right font-semibold text-gray-800">{money(closing)}</td>
    </tr>
  );
}

function AccountDetail({ proj, hasSpouse }: { proj: YearlyProjection; hasSpouse: boolean }) {
  const rrspOpening = proj.rrspBalance - proj.rrspGrowth + proj.rrspWithdrawal;
  const tfsaOpening = proj.tfsaBalance - proj.tfsaGrowth + proj.tfsaWithdrawal - proj.tfsaReinvested;
  const nonRegOpening = proj.nonRegBalance - proj.nonRegGrowth + proj.nonRegWithdrawal;
  const spouseRrspOpening = proj.spouseRrspBalance - proj.spouseRrspGrowth + proj.spouseRrspWithdrawal;
  const spouseTfsaOpening = proj.spouseTfsaBalance - proj.spouseTfsaGrowth + proj.spouseTfsaWithdrawal;
  const spouseNonRegOpening = proj.spouseNonRegBalance - proj.spouseNonRegGrowth + proj.spouseNonRegWithdrawal;

  const totalOpening = rrspOpening + tfsaOpening + nonRegOpening
    + spouseRrspOpening + spouseTfsaOpening + spouseNonRegOpening;
  const totalGrowth = proj.rrspGrowth + proj.tfsaGrowth + proj.nonRegGrowth
    + proj.spouseRrspGrowth + proj.spouseTfsaGrowth + proj.spouseNonRegGrowth;
  const totalWithdrawals = proj.rrspWithdrawal + proj.tfsaWithdrawal + proj.nonRegWithdrawal
    + proj.spouseRrspWithdrawal + proj.spouseTfsaWithdrawal + proj.spouseNonRegWithdrawal;
  const totalClosing = proj.rrspBalance + proj.tfsaBalance + proj.nonRegBalance
    + proj.spouseRrspBalance + proj.spouseTfsaBalance + proj.spouseNonRegBalance;

  const hasReinvested = proj.tfsaReinvested > 0;

  return (
    <div className="bg-gray-50 border-t border-blue-100 px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Account Detail — Age {proj.age}{hasSpouse && proj.spouseAge > 0 ? ` / ${proj.spouseAge}` : ''} ({proj.year})
      </p>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 border-b border-gray-200">
            <th className="text-left pr-4 pb-1 font-medium">Account</th>
            <th className="text-right pr-4 pb-1 font-medium">Opening</th>
            <th className="text-right pr-4 pb-1 font-medium">Growth</th>
            <th className="text-right pr-4 pb-1 font-medium">Withdrawn</th>
            {hasReinvested && <th className="text-right pr-4 pb-1 font-medium text-blue-600">Reinvested</th>}
            <th className="text-right pb-1 font-medium">Closing</th>
          </tr>
        </thead>
        <tbody>
          <AccountRow
            label="RRSP / RRIF"
            opening={rrspOpening}
            growth={proj.rrspGrowth}
            withdrawal={proj.rrspWithdrawal}
            meltdown={proj.meltdownRrspWithdrawal}
            closing={proj.rrspBalance}
            reinvested={hasReinvested ? 0 : undefined}
          />
          <AccountRow
            label="TFSA"
            opening={tfsaOpening}
            growth={proj.tfsaGrowth}
            withdrawal={proj.tfsaWithdrawal}
            closing={proj.tfsaBalance}
            reinvested={hasReinvested ? proj.tfsaReinvested : undefined}
          />
          <AccountRow
            label="Non-Registered"
            opening={nonRegOpening}
            growth={proj.nonRegGrowth}
            withdrawal={proj.nonRegWithdrawal}
            closing={proj.nonRegBalance}
            reinvested={hasReinvested ? 0 : undefined}
          />
          {hasSpouse && (
            <>
              <AccountRow
                label="Spouse RRSP / RRIF"
                opening={spouseRrspOpening}
                growth={proj.spouseRrspGrowth}
                withdrawal={proj.spouseRrspWithdrawal}
                meltdown={proj.spouseMeltdownRrspWithdrawal}
                closing={proj.spouseRrspBalance}
                reinvested={hasReinvested ? 0 : undefined}
              />
              <AccountRow
                label="Spouse TFSA"
                opening={spouseTfsaOpening}
                growth={proj.spouseTfsaGrowth}
                withdrawal={proj.spouseTfsaWithdrawal}
                closing={proj.spouseTfsaBalance}
                reinvested={hasReinvested ? 0 : undefined}
              />
              <AccountRow
                label="Spouse Non-Registered"
                opening={spouseNonRegOpening}
                growth={proj.spouseNonRegGrowth}
                withdrawal={proj.spouseNonRegWithdrawal}
                closing={proj.spouseNonRegBalance}
                reinvested={hasReinvested ? 0 : undefined}
              />
            </>
          )}
          <tr className="border-t border-gray-300 font-semibold text-gray-700">
            <td className="pt-1.5 pr-4">Total</td>
            <td className="text-right pr-4 pt-1.5">{money(totalOpening)}</td>
            <td className="text-right pr-4 pt-1.5 text-green-600">{signed(totalGrowth)}</td>
            <td className="text-right pr-4 pt-1.5 text-red-500">
              {totalWithdrawals > 0 ? `-${money(totalWithdrawals)}` : '—'}
            </td>
            {hasReinvested && (
              <td className="text-right pr-4 pt-1.5 text-blue-600">+{money(proj.tfsaReinvested)}</td>
            )}
            <td className="text-right pt-1.5">{money(totalClosing)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface Props {
  result: ProjectionResult;
}

export function ProjectionTable({ result }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const hasSpouse = result.projections.some((p) => p.spouseAge > 0);
  const hasMeltdown = result.projections.some(
    (p) => p.meltdownRrspWithdrawal > 0 || p.spouseMeltdownRrspWithdrawal > 0
  );
  const rows = expanded ? result.projections : result.projections.filter((_, i) => i % 5 === 0);

  function handleRowClick(age: number) {
    setSelectedAge((prev) => (prev === age ? null : age));
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">{result.label} — Year-by-Year</h3>
        <button
          className="text-xs text-blue-600 hover:underline"
          onClick={() => { setExpanded(!expanded); setSelectedAge(null); }}
        >
          {expanded ? 'Show every 5 years' : 'Show all years'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left py-1 pr-3">Age{hasSpouse ? ' (both)' : ''}</th>
              <th className="text-right pr-3">CPP</th>
              <th className="text-right pr-3">OAS</th>
              {hasSpouse && <th className="text-right pr-3">Spouse CPP</th>}
              {hasSpouse && <th className="text-right pr-3">Spouse OAS</th>}
              <th className="text-right pr-3">RRSP/RRIF</th>
              {hasMeltdown && <th className="text-right pr-3 text-orange-600">Meltdown</th>}
              <th className="text-right pr-3">TFSA</th>
              {hasSpouse && <th className="text-right pr-3">Split</th>}
              <th className="text-right pr-3">Gross</th>
              <th className="text-right pr-3">Tax</th>
              <th className="text-right pr-3">Net</th>
              <th className="text-right pr-3">Spending</th>
              <th className="text-right pr-3">Surplus</th>
              <th className="text-right">Portfolio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const portfolio =
                p.rrspBalance + p.tfsaBalance + p.nonRegBalance
                + p.spouseRrspBalance + p.spouseTfsaBalance + p.spouseNonRegBalance;
              const totalRRSP = p.rrspWithdrawal + p.spouseRrspWithdrawal;
              const totalTFSA = p.tfsaWithdrawal + p.spouseTfsaWithdrawal;
              const ageLabel = hasSpouse && p.spouseAge > 0
                ? `${p.age} / ${p.spouseAge}`
                : `${p.age}`;
              const isSelected = selectedAge === p.age;

              return (
                <>
                  <tr
                    key={p.age}
                    onClick={() => handleRowClick(p.age)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors
                      ${p.surplus < 0 ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-blue-50'}
                      ${isSelected ? 'bg-blue-100 hover:bg-blue-100' : ''}`}
                  >
                    <td className="py-1.5 pr-3 font-medium whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <span className={`text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`}>▶</span>
                        {ageLabel}
                      </span>
                    </td>
                    <td className="text-right pr-3">{money(p.cppIncome)}</td>
                    <td className="text-right pr-3">{money(p.oasIncome)}</td>
                    {hasSpouse && <td className="text-right pr-3">{money(p.spouseCPP)}</td>}
                    {hasSpouse && <td className="text-right pr-3">{money(p.spouseOAS)}</td>}
                    <td className="text-right pr-3">{money(totalRRSP)}</td>
                    {hasMeltdown && (
                      <td className="text-right pr-3 text-orange-600">
                        {p.meltdownRrspWithdrawal + p.spouseMeltdownRrspWithdrawal > 0
                          ? money(p.meltdownRrspWithdrawal + p.spouseMeltdownRrspWithdrawal)
                          : '—'}
                      </td>
                    )}
                    <td className="text-right pr-3">{money(totalTFSA)}</td>
                    {hasSpouse && (
                      <td className={`text-right pr-3 ${p.pensionIncomeSplit !== 0 ? 'text-purple-600' : ''}`}>
                        {p.pensionIncomeSplit !== 0 ? money(Math.abs(p.pensionIncomeSplit)) : '—'}
                      </td>
                    )}
                    <td className="text-right pr-3">{money(p.totalGrossIncome)}</td>
                    <td className="text-right pr-3 text-red-600">{money(p.householdTax)}</td>
                    <td className="text-right pr-3 font-medium">{money(p.householdNetIncome)}</td>
                    <td className="text-right pr-3">{money(p.spending)}</td>
                    <td className={`text-right pr-3 ${p.surplus < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {money(p.surplus)}
                    </td>
                    <td className="text-right">{money(portfolio)}</td>
                  </tr>
                  {isSelected && (
                    <tr key={`${p.age}-detail`}>
                      <td colSpan={99} className="p-0">
                        <AccountDetail proj={p} hasSpouse={hasSpouse} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
