
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ProjectionResult } from '../../types';

const fmt = (v: number) => `$${(v / 1000).toFixed(0)}k`;

const PALETTE = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed'];

interface Props {
  results: ProjectionResult[];
}

export function BalanceChart({ results }: Props) {
  const ages = results[0]?.projections.map((p) => p.age) ?? [];

  const data = ages.map((age) => {
    const row: Record<string, number | string> = { age };
    for (const result of results) {
      const proj = result.projections.find((p) => p.age === age);
      if (!proj) continue;
      const total = proj.rrspBalance + proj.tfsaBalance + proj.nonRegBalance
        + proj.spouseRrspBalance + proj.spouseTfsaBalance + proj.spouseNonRegBalance;
      row[`${result.label} Total`] = Math.round(total);
    }
    return row;
  });

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-700 mb-4">Account Balances Over Time</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="age" />
          <YAxis tickFormatter={fmt} width={56} />
          <Tooltip formatter={(v) => fmt(Number(v))} />
          <Legend />
          {results.map((result, i) => (
            <Line
              key={`${result.label} Total`}
              type="monotone"
              dataKey={`${result.label} Total`}
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
