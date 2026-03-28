import { useState } from 'react';
import { ScenarioInputs } from '../../types';
import { ProfileForm } from './ProfileForm';
import { IncomeForm } from './IncomeForm';
import { AccountsForm } from './AccountsForm';
import { SpouseForm } from './SpouseForm';

type Tab = 'profile' | 'income' | 'accounts' | 'spouse';

interface Props {
  scenario: ScenarioInputs;
  onChange: (updates: Partial<ScenarioInputs>) => void;
  onRemove?: () => void;
  canRemove: boolean;
}

export function ScenarioPanel({ scenario, onChange, onRemove, canRemove }: Props) {
  const [tab, setTab] = useState<Tab>('profile');

  const tabs: Tab[] = ['profile', 'income', 'accounts', ...(scenario.hasSpouse ? ['spouse' as Tab] : [])];

  // If spouse tab was active and user removes spouse, switch back to profile
  const activeTab = tabs.includes(tab) ? tab : 'profile';

  return (
    <div className="card flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <input
          className="text-lg font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-0"
          value={scenario.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />
        {canRemove && (
          <button onClick={onRemove} className="text-gray-400 hover:text-red-500 text-sm">
            Remove
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-5 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm capitalize border-b-2 -mb-px transition-colors ${
              activeTab === t
                ? 'border-blue-500 text-blue-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'spouse' ? 'Spouse' : t}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && <ProfileForm scenario={scenario} onChange={onChange} />}
      {activeTab === 'income' && <IncomeForm scenario={scenario} onChange={onChange} />}
      {activeTab === 'accounts' && <AccountsForm scenario={scenario} onChange={onChange} />}
      {activeTab === 'spouse' && scenario.hasSpouse && (
        <SpouseForm scenario={scenario} onChange={onChange} />
      )}
    </div>
  );
}
