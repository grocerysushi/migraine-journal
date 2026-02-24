import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { InsightData } from '../models';
import { intensityColor, intensityLabel } from '../utils/insights';

const RANGES = [7, 30, 90] as const;
type Range = typeof RANGES[number];

export function InsightsPage() {
  const [range, setRange]     = useState<Range>(30);
  const [data,  setData]      = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (r: Range) => {
    setLoading(true);
    try { setData(await api.getInsights(r)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(range); }, [range]);

  const avgColor = data ? intensityColor(Math.round(data.avgIntensity)) : '#94a3b8';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f0f2f8]/90 backdrop-blur-md px-5 pt-10 pb-3">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Insights</h1>
      </div>

      {/* Range pills */}
      <div className="flex gap-2 px-4 mb-4 mt-1">
        {RANGES.map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
              ${range === r
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
          >
            {r} days
          </button>
        ))}
      </div>

      {/* Spinner */}
      {loading && (
        <div className="flex justify-center pt-20">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && (!data || data.count === 0) && (
        <div className="flex flex-col items-center justify-center pt-16 text-center px-10">
          <div className="w-20 h-20 bg-violet-100 rounded-3xl flex items-center justify-center mb-5">
            <span className="text-4xl">📊</span>
          </div>
          <p className="text-lg font-bold text-slate-700">No data yet</p>
          <p className="text-sm text-slate-400 mt-1.5">
            Log some migraines to see your {range}-day summary.
          </p>
        </div>
      )}

      {/* Content */}
      {!loading && data && data.count > 0 && (
        <div className="px-4 pb-8">

          {/* Hero stat */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Last {range} days
            </p>
            <div className="flex items-end gap-1">
              <span className="text-7xl font-black text-slate-900 leading-none">{data.count}</span>
              <span className="text-xl font-semibold text-slate-400 mb-2">
                {data.count === 1 ? 'migraine' : 'migraines'}
              </span>
            </div>
            {/* Mini sparkline-like frequency bar */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-violet-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (data.count / (range / 3)) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                {(data.count / (range / 7)).toFixed(1)}/wk
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard
              label="Avg Intensity"
              value={data.avgIntensity.toString()}
              sub={intensityLabel(Math.round(data.avgIntensity))}
              accent={avgColor}
            />
            <StatCard
              label="Meds Taken"
              value={data.medsCount.toString()}
              sub={data.medsCount === 1 ? 'dose' : 'doses'}
              accent="#6366f1"
            />
          </div>

          {/* Top triggers */}
          {data.topTriggers.length > 0 && (
            <RankList
              title="Top Triggers"
              items={data.topTriggers.map(t => ({ label: t.trigger, count: t.count }))}
              total={data.count}
              color="#f97316"
            />
          )}

          {/* Top symptoms */}
          {data.topSymptoms.length > 0 && (
            <RankList
              title="Top Symptoms"
              items={data.topSymptoms.map(s => ({ label: s.symptom, count: s.count }))}
              total={data.count}
              color="#8b5cf6"
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-4xl font-black leading-none" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-1.5 font-medium">{sub}</p>}
    </div>
  );
}

function RankList({ title, items, total, color }: {
  title: string;
  items: { label: string; count: number }[];
  total: number;
  color: string;
}) {
  const max = items[0]?.count ?? 1;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{title}</p>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const pct = Math.round((item.count / max) * 100);
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300 w-4 tabular-nums">{i + 1}</span>
              <span className="text-sm text-slate-700 font-medium capitalize w-28 truncate">
                {item.label.replace(/_/g, ' ')}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-xs text-slate-400 font-semibold tabular-nums w-5 text-right">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
