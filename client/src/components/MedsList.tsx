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
      <p className="text-sm font-semibold text-slate-700 mb-2.5">Medications Taken</p>

      {meds.map((med, i) => (
        <div key={med.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-3">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Medication {i + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Name *
              </label>
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5
                           text-sm text-slate-800 placeholder:text-slate-300
                           focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                value={med.name}
                onChange={e => update(i, 'name', e.target.value)}
                placeholder="e.g. Ibuprofen"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Dose
              </label>
              <input
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5
                           text-sm text-slate-800 placeholder:text-slate-300
                           focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                value={med.dose}
                onChange={e => update(i, 'dose', e.target.value)}
                placeholder="e.g. 400mg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Time Taken
            </label>
            <input
              type="datetime-local"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5
                         text-sm text-slate-800
                         focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
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
        className="w-full border-2 border-dashed border-violet-200 text-violet-500
                   rounded-2xl py-3 text-sm font-semibold
                   hover:border-violet-400 hover:bg-violet-50 transition-colors"
      >
        + Add Medication
      </button>
    </div>
  );
}
