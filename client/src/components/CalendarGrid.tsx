import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import type { MigraineEntry } from '../models';
import { intensityColor } from '../utils/insights';

interface Props {
  entries: MigraineEntry[];
  onSelectDate: (date: Date | null) => void;
  selectedDate: Date | null;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({ entries, onSelectDate, selectedDate }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const entryMap = useMemo(() => {
    const map = new Map<string, MigraineEntry[]>();
    for (const e of entries) {
      const key = format(parseISO(e.date_time_start), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [entries]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  return (
    <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border)] p-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl
                     text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] motion-safe:transition-colors"
        >
          ‹
        </button>
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl
                     text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] motion-safe:transition-colors"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-[var(--text-tertiary)] uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(d => {
          const key = format(d, 'yyyy-MM-dd');
          const dayEntries = entryMap.get(key) || [];
          const inMonth = isSameMonth(d, currentMonth);
          const isSelected = selectedDate && isSameDay(d, selectedDate);
          const maxIntensity = dayEntries.length > 0
            ? Math.max(...dayEntries.map(e => e.pain_intensity))
            : -1;

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (dayEntries.length > 0) {
                  onSelectDate(isSelected ? null : d);
                }
              }}
              className={`relative flex flex-col items-center justify-center py-2 rounded-xl
                         min-h-[44px] motion-safe:transition-all motion-safe:duration-100
                ${!inMonth ? 'opacity-30' : ''}
                ${isSelected ? 'bg-[var(--accent)]/15 ring-2 ring-[var(--accent)]' : 'hover:bg-[var(--surface-elevated)]'}
                ${dayEntries.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className={`text-sm font-medium ${isSelected ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-primary)]'}`}>
                {format(d, 'd')}
              </span>
              {dayEntries.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEntries.slice(0, 3).map((e, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: intensityColor(e.pain_intensity) }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
