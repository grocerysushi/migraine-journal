import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { api } from '../api/client';
import type { MigraineEntry, InsightData } from '../models';
import { intensityColor, intensityLabel, bucketByWeek, intensityDistribution } from '../utils/insights';

const RANGES = [7, 30, 90] as const;
type Range = typeof RANGES[number];

export function InsightsPage() {
  const [range, setRange]     = useState<Range>(30);
  const [data,  setData]      = useState<InsightData | null>(null);
  const [entries, setEntries] = useState<MigraineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (r: Range) => {
    setLoading(true);
    try {
      const [insights, allEntries] = await Promise.all([
        api.getInsights(r),
        api.listEntries(),
      ]);
      setData(insights);
      // Filter entries to the selected range
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - r);
      setEntries(allEntries.filter(e => new Date(e.date_time_start) >= cutoff));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(range); }, [range]);

  const avgColor = data ? intensityColor(Math.round(data.avgIntensity)) : 'var(--muted)';
  const weeklyData = bucketByWeek(entries, range);
  const intensityDist = intensityDistribution(entries);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[var(--surface)]/90 backdrop-blur-md px-5 pt-10 pb-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Insights</h1>
      </div>

      {/* Range pills */}
      <div className="flex gap-2 px-4 mb-4 mt-1">
        {RANGES.map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold motion-safe:transition-all min-h-[44px]
              ${range === r
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'bg-[var(--surface-card)] text-[var(--text-tertiary)] border border-[var(--border)] hover:border-[var(--accent-muted)]'}`}
          >
            {r} days
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center pt-20">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full motion-safe:animate-spin" />
        </div>
      )}

      {!loading && (!data || data.count === 0) && (
        <div className="flex flex-col items-center justify-center pt-16 text-center px-10">
          <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-3xl flex items-center justify-center mb-5">
            <span className="text-4xl">📊</span>
          </div>
          <p className="text-lg font-bold text-[var(--text-primary)]">No data yet</p>
          <p className="text-sm text-[var(--text-tertiary)] mt-1.5">
            Log some migraines to see your {range}-day summary.
          </p>
        </div>
      )}

      {!loading && data && data.count > 0 && (
        <div className="px-4 pb-8">

          {/* Hero stat */}
          <div className="bg-[var(--surface-card)] rounded-3xl shadow-sm border border-[var(--border)] p-5 mb-3">
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">
              Last {range} days
            </p>
            <div className="flex items-end gap-1">
              <span className="text-7xl font-black text-[var(--text-primary)] leading-none">{data.count}</span>
              <span className="text-xl font-semibold text-[var(--text-tertiary)] mb-2">
                {data.count === 1 ? 'migraine' : 'migraines'}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-[var(--surface-elevated)] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] rounded-full motion-safe:transition-all"
                  style={{ width: `${Math.min(100, (data.count / (range / 3)) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-[var(--text-tertiary)] font-medium whitespace-nowrap">
                {(data.count / (range / 7)).toFixed(1)}/wk
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard label="Avg Intensity" value={data.avgIntensity.toString()} sub={intensityLabel(Math.round(data.avgIntensity))} accent={avgColor} />
            <StatCard label="Meds Taken" value={data.medsCount.toString()} sub={data.medsCount === 1 ? 'dose' : 'doses'} accent="var(--accent)" />
          </div>

          {/* Frequency chart */}
          {weeklyData.length > 0 && (
            <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] p-5 mb-3">
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Frequency by Week</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--accent)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="var(--accent)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Intensity distribution */}
          {intensityDist.length > 0 && (
            <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] p-5 mb-3">
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Intensity Distribution</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={intensityDist}>
                  <XAxis dataKey="level" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {intensityDist.map(d => (
                      <Cell key={d.level} fill={intensityColor(d.level)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top triggers */}
          {data.topTriggers.length > 0 && (
            <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] p-5 mb-3">
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Top Triggers</p>
              <ResponsiveContainer width="100%" height={Math.max(120, data.topTriggers.length * 36)}>
                <BarChart data={data.topTriggers.map(t => ({ name: t.trigger.replace(/_/g, ' '), count: t.count }))} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)'}} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top symptoms */}
          {data.topSymptoms.length > 0 && (
            <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] p-5 mb-3">
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Top Symptoms</p>
              <ResponsiveContainer width="100%" height={Math.max(120, data.topSymptoms.length * 36)}>
                <BarChart data={data.topSymptoms.map(s => ({ name: s.symptom.replace(/_/g, ' '), count: s.count }))} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)'}} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="var(--accent)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] p-4">
      <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-4xl font-black leading-none" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      {sub && <p className="text-xs text-[var(--text-tertiary)] mt-1.5 font-medium">{sub}</p>}
    </div>
  );
}
