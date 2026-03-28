
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ProjectionResult } from '../../types';

const pctFmt = (v: number) => `${(v * 100).toFixed(1)}%`;
const PALETTE = ['#2563eb', '#dc2626', '#059669', '#d97706'];

interface Props {
  results: ProjectionResult[];
}

export function TaxChart({ results }: Props) {
  const ages = results[0]?.projections.map((p) => p.age) ?? [];

  const data = ages.map((age) => {
    const row: Record<string, number | string> = { age };
    for (const result of results) {
      const proj = result.projections.find((p) => p.age === age);
      if (!proj) continue;
      const eff = proj.totalGrossIncome > 0 ? proj.totalTax / proj.totalGrossIncome : 0;
      row[`${result.label} Effective Rate`] = parseFloat(eff.toFixed(4));
      if (proj.oasClawback > 0) {
        row[`${result.label} OAS Clawback`] = Math.round(proj.oasClawback);
      }
    }
    return row;
  });

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-700 mb-4">Effective Tax Rate</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="age" />
          <YAxis tickFormatter={pctFmt} width={56} domain={[0, 0.5]} />
          <Tooltip formatter={(v) => pctFmt(Number(v))} />
          <Legend />
          {results.map((result, i) => (
            <Line
              key={`${result.label} Effective Rate`}
              type="monotone"
              dataKey={`${result.label} Effective Rate`}
              stroke={PALETTE[i % PALETTE.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
