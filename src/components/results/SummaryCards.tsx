import { ProjectionResult } from '../../types';

const money = (v: number) => `$${Math.round(v).toLocaleString()}`;

interface Props {
  results: ProjectionResult[];
}

const colClass: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function SummaryCards({ results }: Props) {
  return (
    <div className={`grid gap-4 ${colClass[results.length] ?? 'grid-cols-1 sm:grid-cols-2'}`}>
      {results.map((r) => {
        const first = r.projections[0];
        const last = r.projections[r.projections.length - 1];
        const totalTax = r.projections.reduce((s, p) => s + p.householdTax, 0);
        const hasSpouse = r.projections.some((p) => p.spouseAge > 0);

        const finalPortfolio =
          (last?.rrspBalance ?? 0) + (last?.tfsaBalance ?? 0) + (last?.nonRegBalance ?? 0)
          + (last?.spouseRrspBalance ?? 0) + (last?.spouseTfsaBalance ?? 0) + (last?.spouseNonRegBalance ?? 0);

        return (
          <div key={r.scenarioId} className="card space-y-3">
            <h3 className="font-bold text-gray-800">{r.label}</h3>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">First-Year {hasSpouse ? 'Household' : ''} Net Income</dt>
                <dd className="font-semibold">{money(first?.householdNetIncome ?? 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Lifetime {hasSpouse ? 'Household' : ''} After-Tax Income</dt>
                <dd className="font-semibold">{money(r.lifetimeAfterTaxIncome)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Lifetime Taxes Paid</dt>
                <dd className="font-semibold text-red-600">{money(totalTax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Portfolio at Age 95</dt>
                <dd className="font-semibold">{money(finalPortfolio)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Portfolio Depleted?</dt>
                <dd className={`font-semibold ${r.depletionAge ? 'text-red-600' : 'text-green-600'}`}>
                  {r.depletionAge ? `Age ${r.depletionAge}` : 'No'}
                </dd>
              </div>
            </dl>

            {r.depletionAge && (
              <div className="rounded bg-red-50 border border-red-200 p-2 text-xs text-red-700">
                Savings depleted at age {r.depletionAge}. Consider reducing spending or adjusting CPP/OAS timing.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
