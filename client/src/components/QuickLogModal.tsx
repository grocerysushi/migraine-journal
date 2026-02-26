import { useState } from 'react';
import { api } from '../api/client';
import { TRIGGERS } from '../models';
import type { Trigger } from '../models';
import { IntensitySlider } from './IntensitySlider';
import { toFormDateTime, formDateTimeToIso } from '../utils/dateHelpers';

const TOP_TRIGGERS = TRIGGERS.slice(0, 6);

interface Props { open: boolean; onClose: () => void; onSaved: () => void }

export function QuickLogModal({ open, onClose, onSaved }: Props) {
  const [intensity, setIntensity] = useState(5);
  const [startTime, setStartTime] = useState(toFormDateTime(new Date()));
  const [triggers, setTriggers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (v: string) =>
    setTriggers(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const handleLog = async () => {
    setSaving(true);
    try {
      await api.createEntry({
        date_time_start: formDateTimeToIso(startTime),
        pain_intensity: intensity,
        locations: [],
        symptoms: [],
        triggers: triggers.map(t => ({ trigger: t as Trigger })),
        meds: [],
        notes: '',
      });
      onSaved();
      onClose();
      // Reset
      setIntensity(5);
      setStartTime(toFormDateTime(new Date()));
      setTriggers([]);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--surface-card)] rounded-t-3xl p-6 pb-8
                      border-t border-[var(--border)] shadow-2xl motion-safe:animate-slideUp">
        {/* Handle */}
        <div className="w-10 h-1 bg-[var(--muted)] rounded-full mx-auto mb-5" />

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">Quick Log</h2>

        <IntensitySlider value={intensity} onChange={setIntensity} />

        <div className="mb-5">
          <label className="block text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-1.5">
            Start Time
          </label>
          <input
            type="datetime-local"
            className="w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-3 py-3
                       text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]
                       focus:border-transparent min-h-[44px]"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-2">
            Quick Triggers
          </p>
          <div className="flex flex-wrap gap-2">
            {TOP_TRIGGERS.map(t => {
              const active = triggers.includes(t.value);
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => toggle(t.value)}
                  className={`px-4 py-2.5 rounded-full text-[13px] font-medium border
                              motion-safe:transition-all motion-safe:duration-100 min-h-[44px]
                    ${active
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                    }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleLog}
          disabled={saving}
          className="w-full py-4 rounded-2xl text-base font-bold min-h-[56px]
                     bg-[var(--accent)] hover:opacity-90 text-white
                     disabled:opacity-60 motion-safe:transition-colors shadow-sm"
        >
          {saving ? 'Logging…' : 'Log Migraine'}
        </button>
      </div>
    </div>
  );
}
