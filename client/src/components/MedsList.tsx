import { v4 as uuidv4 } from 'uuid';
import { toFormDateTime } from '../utils/dateHelpers';
import { IntensitySlider } from './IntensitySlider';

export interface MedFormItem {
  id: string; name: string; dose: string; time_taken: string; relief: number;
}

interface Props {
  meds: MedFormItem[];
  onChange: (meds: MedFormItem[]) => void;
}

export function MedsList({ meds, onChange }: Props) {
  const add = () => onChange([
    ...meds,
    { id: uuidv4(), name: '', dose: '', time_taken: toFormDateTime(new Date()), relief: 5 },
  ]);
  const remove = (i: number) => onChange(meds.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof MedFormItem, value: string | number) =>
    onChange(meds.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2.5">Medications Taken</p>

      {meds.map((med, i) => (
        <div key={med.id} className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-4 mb-3">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
              Medication {i + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs font-semibold text-red-400 hover:text-red-600 motion-safe:transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-1.5">
                Name *
              </label>
              <input
                className="w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-xl px-3 py-3
                           text-sm text-[var(--text-primary)] placeholder:text-[var(--muted)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent min-h-[44px]"
                value={med.name}
                onChange={e => update(i, 'name', e.target.value)}
                placeholder="e.g. Ibuprofen"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-1.5">
                Dose
              </label>
              <input
                className="w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-xl px-3 py-3
                           text-sm text-[var(--text-primary)] placeholder:text-[var(--muted)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent min-h-[44px]"
                value={med.dose}
                onChange={e => update(i, 'dose', e.target.value)}
                placeholder="e.g. 400mg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-1.5">
              Time Taken
            </label>
            <input
              type="datetime-local"
              className="w-full bg-[var(--surface-card)] border border-[var(--border)] rounded-xl px-3 py-3
                         text-sm text-[var(--text-primary)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent min-h-[44px]"
              value={med.time_taken}
              onChange={e => update(i, 'time_taken', e.target.value)}
            />
          </div>

          <IntensitySlider
            label="Relief (0 – 10)"
            value={med.relief}
            onChange={v => update(i, 'relief', v)}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full border-2 border-dashed border-[var(--accent-muted)] text-[var(--accent)]
                   rounded-2xl py-3 text-sm font-semibold min-h-[48px]
                   hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 motion-safe:transition-colors"
      >
        + Add Medication
      </button>
    </div>
  );
}
