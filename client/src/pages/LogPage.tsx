import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { MigraineEntry } from '../models';
import { EntryCard } from '../components/EntryCard';
import { formatMonthGroup } from '../utils/dateHelpers';

function groupByMonth(entries: MigraineEntry[]): [string, MigraineEntry[]][] {
  const map = new Map<string, MigraineEntry[]>();
  for (const e of entries) {
    const key = formatMonthGroup(e.date_time_start);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries());
}

export function LogPage() {
  const [entries, setEntries] = useState<MigraineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    setError('');
    try { setEntries(await api.listEntries()); }
    catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    await api.deleteEntry(id);
    void load();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f0f2f8]/90 backdrop-blur-md px-5 pt-10 pb-3">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Journal</h1>
        {!loading && entries.length > 0 && (
          <p className="text-sm text-slate-400 mt-0.5">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} logged
          </p>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-6">
        {loading && (
          <div className="flex items-center justify-center pt-24">
            <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-4 bg-red-50 text-red-600 rounded-2xl px-4 py-3 text-sm">{error}</div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-24 text-center px-8">
            <div className="w-20 h-20 bg-violet-100 rounded-3xl flex items-center justify-center mb-5">
              <span className="text-4xl">📔</span>
            </div>
            <p className="text-lg font-bold text-slate-700">No entries yet</p>
            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
              Tap <strong>Log</strong> below to record your first migraine entry.
            </p>
          </div>
        )}

        {!loading && !error && groupByMonth(entries).map(([month, group]) => (
          <div key={month} className="mt-5">
            <div className="flex items-center gap-3 mb-3 px-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{month}</p>
              <span className="text-xs font-semibold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">
                {group.length}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {group.map(entry => (
                <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
