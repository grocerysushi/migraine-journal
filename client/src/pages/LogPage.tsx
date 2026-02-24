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
  const [error, setError]   = useState('');

  const load = async () => {
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

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
  if (error)   return <div className="p-6 text-red-500">{error}</div>;

  if (!entries.length) return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-8">
      <span className="text-5xl mb-4">📔</span>
      <p className="text-lg font-semibold text-gray-500">No entries yet</p>
      <p className="text-sm text-gray-400 mt-1">Tap "Log Entry" below to record your first migraine.</p>
    </div>
  );

  return (
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Journal</h1>
      {groupByMonth(entries).map(([month, group]) => (
        <div key={month} className="mb-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{month}</h2>
          <div className="flex flex-col gap-3">
            {group.map(entry => (
              <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
