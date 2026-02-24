import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../api/client';
import { PAIN_LOCATIONS, SYMPTOMS, TRIGGERS } from '../models';
import type { MigraineEntry, PainLocation, Symptom, Trigger, Med } from '../models';
import { MultiSelect } from '../components/MultiSelect';
import { IntensitySlider } from '../components/IntensitySlider';
import { MedsList, type MedFormItem } from '../components/MedsList';
import { toFormDateTime, formDateTimeToIso } from '../utils/dateHelpers';

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  date_time_start:  z.string().min(1, 'Required'),
  date_time_end:    z.string().optional(),
  pain_intensity:   z.number().min(0).max(10),
  locations:        z.array(z.string()),
  symptoms:         z.array(z.string()),
  triggers:         z.array(z.string()),
  trigger_other:    z.string(),
  meds:             z.array(z.object({
    id: z.string(), name: z.string().min(1, 'Required'),
    dose: z.string(), time_taken: z.string(), relief: z.number(),
  })),
  notes: z.string(),
});
type FormValues = z.infer<typeof schema>;

function defaults(): FormValues {
  return {
    date_time_start: toFormDateTime(new Date()), date_time_end: '',
    pain_intensity: 5, locations: [], symptoms: [], triggers: [],
    trigger_other: '', meds: [], notes: '',
  };
}

function entryToForm(e: MigraineEntry): FormValues {
  return {
    date_time_start: toFormDateTime(new Date(e.date_time_start)),
    date_time_end: e.date_time_end ? toFormDateTime(new Date(e.date_time_end)) : '',
    pain_intensity: e.pain_intensity, locations: e.locations, symptoms: e.symptoms,
    triggers: e.triggers.map(t => t.trigger),
    trigger_other: e.triggers.find(t => t.trigger === 'other')?.other_text ?? '',
    meds: e.meds.map(m => ({ ...m, time_taken: toFormDateTime(new Date(m.time_taken)) })),
    notes: e.notes,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AddEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate  = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading]   = useState(isEdit);
  const [saving, setSaving]     = useState(false);
  const [serverErr, setServerErr] = useState('');

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults() });

  const triggers = watch('triggers');
  const showOther = triggers.includes('other');

  useEffect(() => {
    if (!id) { reset(defaults()); return; }
    api.getEntry(id).then(e => { reset(entryToForm(e)); setLoading(false); }).catch(console.error);
  }, [id, reset]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true); setServerErr('');
    try {
      const payload = {
        date_time_start: formDateTimeToIso(values.date_time_start),
        date_time_end:   values.date_time_end ? formDateTimeToIso(values.date_time_end) : undefined,
        pain_intensity:  values.pain_intensity,
        locations:       values.locations as PainLocation[],
        symptoms:        values.symptoms  as Symptom[],
        triggers: values.triggers.map(t => ({
          trigger: t as Trigger,
          other_text: t === 'other' ? values.trigger_other : undefined,
        })),
        meds: values.meds.map(m => ({
          ...m, entry_id: id ?? '', time_taken: formDateTimeToIso(m.time_taken),
        })) as Med[],
        notes: values.notes,
      };
      if (isEdit && id) await api.updateEntry(id, payload);
      else await api.createEntry(payload);
      navigate('/');
    } catch (e) {
      setServerErr(String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;

  const inputCls = (err?: { message?: string }) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
     ${err ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="p-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Edit Entry' : 'Log Migraine'}</h1>

      {serverErr && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{serverErr}</div>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* Start time */}
        <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time *</label>
        <Controller control={control} name="date_time_start" render={({ field }) => (
          <input type="datetime-local" className={inputCls(errors.date_time_start)} {...field} />
        )} />
        {errors.date_time_start && <p className="text-red-500 text-xs mt-1">{errors.date_time_start.message}</p>}

        {/* End time */}
        <label className="block text-sm font-semibold text-gray-700 mt-4 mb-1">End Time (optional)</label>
        <Controller control={control} name="date_time_end" render={({ field }) => (
          <input type="datetime-local" className={inputCls()} {...field} value={field.value ?? ''} />
        )} />

        {/* Pain intensity */}
        <div className="mt-5">
          <Controller control={control} name="pain_intensity" render={({ field }) => (
            <IntensitySlider label="Pain Intensity *" value={field.value} onChange={field.onChange} />
          )} />
        </div>

        {/* Locations */}
        <div className="mt-2">
          <Controller control={control} name="locations" render={({ field }) => (
            <MultiSelect label="Pain Location" options={PAIN_LOCATIONS} selected={field.value} onChange={field.onChange} />
          )} />
        </div>

        {/* Symptoms */}
        <Controller control={control} name="symptoms" render={({ field }) => (
          <MultiSelect label="Symptoms" options={SYMPTOMS} selected={field.value} onChange={field.onChange} />
        )} />

        {/* Triggers */}
        <Controller control={control} name="triggers" render={({ field }) => (
          <MultiSelect label="Triggers" options={TRIGGERS} selected={field.value} onChange={field.onChange} />
        )} />

        {showOther && (
          <>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Other Trigger Detail</label>
            <Controller control={control} name="trigger_other" render={({ field }) => (
              <input className={inputCls()} placeholder="Describe other trigger…" {...field} />
            )} />
          </>
        )}

        {/* Medications */}
        <div className="mt-4">
          <Controller control={control} name="meds" render={({ field }) => (
            <MedsList meds={field.value as MedFormItem[]} onChange={v => setValue('meds', v)} />
          )} />
        </div>

        {/* Notes */}
        <label className="block text-sm font-semibold text-gray-700 mt-2 mb-1">Notes</label>
        <Controller control={control} name="notes" render={({ field }) => (
          <textarea rows={3} className={`${inputCls()} resize-none`} placeholder="Any additional details…" {...field} />
        )} />

        <button
          type="submit" disabled={saving}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Log Migraine'}
        </button>
      </form>
    </div>
  );
}
