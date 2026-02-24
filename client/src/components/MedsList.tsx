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
  const add = () => onChange([...meds, { id: uuidv4(), name: '', dose: '', time_taken: toFormDateTime(new Date()), relief: 5 }]);
  const remove = (i: number) => onChange(meds.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof MedFormItem, value: string | number) =>
    onChange(meds.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  return (
    <div className="mb-4">
      <p className="text-sm font-semibold text-gray-700 mb-2">Medications Taken</p>
      {meds.map((med, i) => (
        <div key={med.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700">Med #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name *</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={med.name} onChange={e => update(i, 'name', e.target.value)}
                placeholder="e.g. Ibuprofen"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Dose</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={med.dose} onChange={e => update(i, 'dose', e.target.value)}
                placeholder="e.g. 400mg"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Time Taken</label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={med.time_taken} onChange={e => update(i, 'time_taken', e.target.value)}
            />
          </div>
          <IntensitySlider label="Relief (0–10)" value={med.relief} onChange={v => update(i, 'relief', v)} />
        </div>
      ))}
      <button
        type="button" onClick={add}
        className="w-full border-2 border-dashed border-indigo-400 text-indigo-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-indigo-50 transition-colors"
      >
        + Add Medication
      </button>
    </div>
  );
}
