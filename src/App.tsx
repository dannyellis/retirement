
import { useStore } from './store/useStore';
import { ScenarioPanel } from './components/inputs/ScenarioPanel';
import { AccumulationPanel } from './components/accumulation/AccumulationPanel';
import { SummaryCards } from './components/results/SummaryCards';
import { IncomeChart } from './components/charts/IncomeChart';
import { BalanceChart } from './components/charts/BalanceChart';
import { TaxChart } from './components/charts/TaxChart';
import { ProjectionTable } from './components/results/ProjectionTable';

export default function App() {
  const {
    scenarios,
    results,
    activeTab,
    updateScenario,
    addScenario,
    removeScenario,
    runProjections,
    applyAccumulation,
    setActiveTab,
  } = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Canadian Retirement Planner</h1>
          <p className="text-xs text-gray-500 mt-0.5">CPP · OAS · RRSP/RRIF · TFSA · Tax — 2024 rates</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            <button
              onClick={() => setActiveTab('inputs')}
              className={`px-4 py-2 ${activeTab === 'inputs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Inputs
            </button>
            <button
              onClick={() => setActiveTab('accumulation')}
              className={`px-4 py-2 ${activeTab === 'accumulation' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Accumulation
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 ${activeTab === 'results' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Results
            </button>
          </div>
          <button onClick={runProjections} className="btn-primary">
            Run Projection
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-[1400px] mx-auto">
        {activeTab === 'inputs' && (
          <div className="space-y-6">
            <div className="flex gap-5">
              {scenarios.map((s) => (
                <ScenarioPanel
                  key={s.id}
                  scenario={s}
                  onChange={(updates) => updateScenario(s.id, updates)}
                  onRemove={() => removeScenario(s.id)}
                  canRemove={scenarios.length > 1}
                />
              ))}
            </div>
            {scenarios.length < 4 && (
              <button onClick={addScenario} className="btn-secondary text-sm">
                + Add Scenario
              </button>
            )}
          </div>
        )}

        {activeTab === 'accumulation' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Project your account balances from today to retirement, then apply them as starting balances for the retirement projection.
            </p>
            <div className="flex gap-5 flex-wrap">
              {scenarios.map((s) => (
                <AccumulationPanel
                  key={s.id}
                  scenario={s}
                  onChange={(updates) => updateScenario(s.id, updates)}
                  onApply={() => applyAccumulation(s.id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && results.length > 0 && (
          <div className="space-y-6">
            <SummaryCards results={results} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <IncomeChart results={results} />
              <BalanceChart results={results} />
            </div>
            <TaxChart results={results} />
            {results.map((r) => (
              <ProjectionTable key={r.scenarioId} result={r} />
            ))}
          </div>
        )}

        {activeTab === 'results' && results.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg">No projection yet.</p>
            <p className="text-sm mt-1">Fill in your inputs and click <strong>Run Projection</strong>.</p>
          </div>
        )}
      </main>
    </div>
  );
}
