import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { InsightData } from '../models';
import { intensityColor, intensityLabel } from '../utils/insights';

const RANGES = [7, 30, 90] as const;
type Range = typeof RANGES[number];

export function InsightsPage() {
  const [range, setRange]     = useState<Range>(30);
  const [data, setData]       = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (r: Range) => {
    setLoading(true);
    try { setData(await api.getInsights(r)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(range); }, [range]);

  return (
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Insights</h1>

      {/* Range selector */}
      <div className="flex gap-2 mb-6">
        {RANGES.map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-colors
              ${range === r ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
          >
            {r}d
          </button>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center h-40 text-gray-400">Loading…</div>}

      {!loading && (!data || data.count === 0) && (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <span className="text-4xl mb-3">📊</span>
          <p className="font-semibold text-gray-500">No data for this period</p>
          <p className="text-sm text-gray-400 mt-1">Log some migraines to see insights.</p>
        </div>
      )}

      {!loading && data && data.count > 0 && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard title="Migraines" value={data.count} sub={`in ${range} days`} />
            <StatCard
              title="Avg Intensity"
              value={data.avgIntensity}
              sub={intensityLabel(Math.round(data.avgIntensity))}
              color={intensityColor(Math.round(data.avgIntensity))}
            />
            <StatCard title="Meds Taken" value={data.medsCount} sub="doses" />
            <StatCard
              title="Per Week"
              value={(data.count / (range / 7)).toFixed(1)}
              sub="avg migraines"
            />
          </div>

          {/* Top triggers */}
          {data.topTriggers.length > 0 && (
            <TopList title="Top Triggers" items={data.topTriggers.map(t => ({ label: t.trigger, count: t.count }))} total={data.count} />
          )}

          {/* Top symptoms */}
          {data.topSymptoms.length > 0 && (
            <TopList title="Top Symptoms" items={data.topSymptoms.map(s => ({ label: s.symptom, count: s.count }))} total={data.count} />
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, sub, color }: { title: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{title}</p>
      <p className="text-4xl font-bold" style={color ? { color } : undefined}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function TopList({ title, items, total }: { title: string; items: { label: string; count: number }[]; total: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <p className="text-sm font-bold text-gray-700 mb-3">{title}</p>
      {items.map(item => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <div key={item.label} className="flex items-center gap-3 mb-2">
            <span className="w-28 text-sm text-gray-700 capitalize truncate">{item.label.replace(/_/g, ' ')}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-400 font-semibold w-6 text-right">{item.count}</span>
          </div>
        );
      })}
    </div>
  );
}
