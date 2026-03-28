import { ScenarioInputs, Province } from '../../types';

const PROVINCES: { code: Province; name: string }[] = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

interface Props {
  scenario: ScenarioInputs;
  onChange: (updates: Partial<ScenarioInputs>) => void;
}

export function ProfileForm({ scenario, onChange }: Props) {
  const { profile } = scenario;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700">Primary Person</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={profile.name}
            onChange={(e) => onChange({ profile: { ...profile, name: e.target.value } })}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="label">Birth Year</label>
          <input
            className="input"
            type="number"
            value={profile.birthYear}
            min={1940}
            max={2000}
            onChange={(e) =>
              onChange({ profile: { ...profile, birthYear: Number(e.target.value) } })
            }
          />
        </div>
        <div>
          <label className="label">Province</label>
          <select
            className="input"
            value={profile.province}
            onChange={(e) =>
              onChange({ profile: { ...profile, province: e.target.value as Province } })
            }
          >
            {PROVINCES.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Retirement Age</label>
          <input
            className="input"
            type="number"
            value={profile.retirementAge}
            min={55}
            max={75}
            onChange={(e) =>
              onChange({ profile: { ...profile, retirementAge: Number(e.target.value) } })
            }
          />
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!scenario.hasSpouse}
            onChange={(e) => {
              if (e.target.checked) {
                // Ensure all spouse fields have defaults when enabling
                onChange({
                  hasSpouse: true,
                  spouse: scenario.spouse ?? { name: '', birthYear: 1965, retirementAge: 62 },
                  spouseCPP: scenario.spouseCPP ?? { estimatedMonthlyAt65: 700, startAge: 65 },
                  spouseOAS: scenario.spouseOAS ?? { startAge: 65, residencyYears: 40 },
                  spouseAccounts: scenario.spouseAccounts ?? {
                    rrsp: 200000, tfsa: 80000, employerPension: 0, employerPensionStartAge: 65,
                  },
                  pensionIncomeSplitting: scenario.pensionIncomeSplitting ?? true,
                });
              } else {
                onChange({ hasSpouse: false });
              }
            }}
            className="w-4 h-4 rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">Include spouse / partner</span>
        </label>
      </div>
    </div>
  );
}
