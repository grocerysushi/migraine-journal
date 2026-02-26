import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { MigraineEntry } from '../models';
import { EntryCard } from '../components/EntryCard';
import { CalendarGrid } from '../components/CalendarGrid';
import { QuickLogModal } from '../components/QuickLogModal';
import { formatMonthGroup } from '../utils/dateHelpers';
import { isSameDay, parseISO } from 'date-fns';

function groupByMonth(entries: MigraineEntry[]): [string, MigraineEntry[]][] {
  const map = new Map<string, MigraineEntry[]>();
  for (const e of entries) {
    const key = formatMonthGroup(e.date_time_start);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries());
}

type View = 'list' | 'calendar';

export function LogPage() {
  const [entries, setEntries] = useState<MigraineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [view, setView]       = useState<View>('list');
  const [quickOpen, setQuickOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const filteredEntries = selectedDate
    ? entries.filter(e => isSameDay(parseISO(e.date_time_start), selectedDate))
    : entries;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--surface)]/90 backdrop-blur-md px-5 pt-10 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Journal</h1>
            {!loading && entries.length > 0 && (
              <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'} logged
              </p>
            )}
          </div>
          {/* View toggle */}
          <div className="flex gap-1 bg-[var(--surface-elevated)] rounded-xl p-1">
            <button
              onClick={() => { setView('list'); setSelectedDate(null); }}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg
                         motion-safe:transition-colors text-sm font-semibold
                ${view === 'list' ? 'bg-[var(--surface-card)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-tertiary)]'}`}
            >
              <ListIcon />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg
                         motion-safe:transition-colors text-sm font-semibold
                ${view === 'calendar' ? 'bg-[var(--surface-card)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-tertiary)]'}`}
            >
              <CalIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-6">
        {loading && (
          <div className="flex items-center justify-center pt-24">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full motion-safe:animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-4 bg-red-500/10 text-red-400 rounded-2xl px-4 py-3 text-sm">{error}</div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-24 text-center px-8">
            <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-3xl flex items-center justify-center mb-5">
              <span className="text-4xl">📔</span>
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">No entries yet</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-1.5 leading-relaxed">
              Tap <strong>Log</strong> below to record your first migraine entry.
            </p>
          </div>
        )}

        {/* Calendar view */}
        {!loading && !error && view === 'calendar' && entries.length > 0 && (
          <div className="mt-3 mb-4">
            <CalendarGrid entries={entries} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            {selectedDate && filteredEntries.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 px-1">
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} on this day
                </p>
                <div className="flex flex-col gap-2.5">
                  {filteredEntries.map(entry => (
                    <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* List view */}
        {!loading && !error && view === 'list' && groupByMonth(entries).map(([month, group]) => (
          <div key={month} className="mt-5">
            <div className="flex items-center gap-3 mb-3 px-1">
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{month}</p>
              <span className="text-xs font-semibold text-[var(--text-tertiary)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded-full">
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

      {/* Quick-log FAB */}
      <button
        onClick={() => setQuickOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[var(--accent)] text-white
                   shadow-lg shadow-[var(--accent)]/30 flex items-center justify-center
                   hover:opacity-90 motion-safe:transition-all motion-safe:duration-150
                   z-40 text-2xl font-light"
        style={{ maxWidth: 'calc(50% + 14rem)' }}
      >
        +
      </button>

      <QuickLogModal open={quickOpen} onClose={() => setQuickOpen(false)} onSaved={load} />
    </div>
  );
}

function ListIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
