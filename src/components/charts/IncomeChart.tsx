
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ProjectionResult } from '../../types';

const fmt = (v: number) => `$${(v / 1000).toFixed(0)}k`;

const COLORS = {
  cpp: '#2563eb',
  oas: '#7c3aed',
  pension: '#059669',
  rrsp: '#d97706',
  nonReg: '#dc2626',
  tfsa: '#0891b2',
};

interface Props {
  results: ProjectionResult[];
}

export function IncomeChart({ results }: Props) {
  // Merge all scenarios side-by-side by age
  const ages = results[0]?.projections.map((p) => p.age) ?? [];

  const data = ages.map((age) => {
    const row: Record<string, number | string> = { age };
    for (const result of results) {
      const proj = result.projections.find((p) => p.age === age);
      if (!proj) continue;
      const prefix = result.label;
      row[`${prefix} CPP`] = Math.round(proj.cppIncome + proj.spouseCPP);
      row[`${prefix} OAS`] = Math.round(proj.oasIncome + proj.spouseOAS);
      row[`${prefix} Pension`] = Math.round(proj.employerPension + proj.spouseEmployerPension);
      row[`${prefix} RRSP/RRIF`] = Math.round(proj.rrspWithdrawal + proj.spouseRrspWithdrawal);
      row[`${prefix} Non-Reg`] = Math.round(proj.nonRegWithdrawal);
      row[`${prefix} TFSA`] = Math.round(proj.tfsaWithdrawal + proj.spouseTfsaWithdrawal);
    }
    return row;
  });

  // Only show bars for non-zero sources
  const bars: { key: string; color: string }[] = [];
  for (const result of results) {
    const p = result.label;
    const hasOAS = result.projections.some((r) => r.oasIncome + r.spouseOAS > 0);
    const hasPension = result.projections.some((r) => r.employerPension + r.spouseEmployerPension > 0);
    const hasRRSP = result.projections.some((r) => r.rrspWithdrawal + r.spouseRrspWithdrawal > 0);
    const hasNonReg = result.projections.some((r) => r.nonRegWithdrawal > 0);
    const hasTFSA = result.projections.some((r) => r.tfsaWithdrawal + r.spouseTfsaWithdrawal > 0);

    bars.push({ key: `${p} CPP`, color: COLORS.cpp });
    if (hasOAS) bars.push({ key: `${p} OAS`, color: COLORS.oas });
    if (hasPension) bars.push({ key: `${p} Pension`, color: COLORS.pension });
    if (hasRRSP) bars.push({ key: `${p} RRSP/RRIF`, color: COLORS.rrsp });
    if (hasNonReg) bars.push({ key: `${p} Non-Reg`, color: COLORS.nonReg });
    if (hasTFSA) bars.push({ key: `${p} TFSA`, color: COLORS.tfsa });
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-700 mb-4">Gross Income by Source</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -2 }} />
          <YAxis tickFormatter={fmt} width={56} />
          <Tooltip formatter={(v) => fmt(Number(v))} />
          <Legend />
          {bars.map((b) => (
            <Bar key={b.key} dataKey={b.key} stackId={b.key.split(' ')[0]} fill={b.color} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
