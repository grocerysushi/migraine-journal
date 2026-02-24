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
  date_time_start: z.string().min(1, 'Start time is required'),
  date_time_end:   z.string().optional(),
  pain_intensity:  z.number().min(0).max(10),
  locations:       z.array(z.string()),
  symptoms:        z.array(z.string()),
  triggers:        z.array(z.string()),
  trigger_other:   z.string(),
  meds:            z.array(z.object({
    id: z.string(), name: z.string().min(1, 'Required'),
    dose: z.string(), time_taken: z.string(), relief: z.number(),
  })),
  notes: z.string(),
});
type FormValues = z.infer<typeof schema>;

const defaults = (): FormValues => ({
  date_time_start: toFormDateTime(new Date()), date_time_end: '',
  pain_intensity: 5, locations: [], symptoms: [], triggers: [],
  trigger_other: '', meds: [], notes: '',
});

const entryToForm = (e: MigraineEntry): FormValues => ({
  date_time_start: toFormDateTime(new Date(e.date_time_start)),
  date_time_end:   e.date_time_end ? toFormDateTime(new Date(e.date_time_end)) : '',
  pain_intensity:  e.pain_intensity,
  locations: e.locations, symptoms: e.symptoms,
  triggers: e.triggers.map(t => t.trigger),
  trigger_other: e.triggers.find(t => t.trigger === 'other')?.other_text ?? '',
  meds: e.meds.map(m => ({ ...m, time_taken: toFormDateTime(new Date(m.time_taken)) })),
  notes: e.notes,
});

// ─── Form section wrapper ─────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  );
}

const inputCls = (err?: boolean) =>
  `w-full bg-slate-50 border rounded-xl px-3.5 py-3 text-sm text-slate-800
   placeholder:text-slate-300 transition-colors
   focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-400 focus:border-transparent
   ${err ? 'border-red-300 bg-red-50' : 'border-slate-200'}`;

// ─── Component ────────────────────────────────────────────────────────────────
export function AddEditPage() {
  const { id }    = useParams<{ id?: string }>();
  const navigate  = useNavigate();
  const isEdit    = Boolean(id);
  const [loading, setLoading]     = useState(isEdit);
  const [saving,  setSaving]      = useState(false);
  const [serverErr, setServerErr] = useState('');

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults() });

  const triggers  = watch('triggers');
  const showOther = triggers.includes('other');

  useEffect(() => {
    if (!id) { reset(defaults()); return; }
    api.getEntry(id)
      .then(e => { reset(entryToForm(e)); setLoading(false); })
      .catch(console.error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f0f2f8]/90 backdrop-blur-md px-5 pt-10 pb-3 mb-2">
        <div className="flex items-center justify-between">
          {isEdit && (
            <button onClick={() => navigate(-1)} className="text-violet-600 font-semibold text-sm mr-4">
              ← Back
            </button>
          )}
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex-1">
            {isEdit ? 'Edit Entry' : 'Log Migraine'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-4 pb-8">
        {serverErr && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-3 text-sm">
            {serverErr}
          </div>
        )}

        {/* Timing */}
        <Section title="When">
          <div className="mb-3">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Start Time *
            </label>
            <Controller control={control} name="date_time_start" render={({ field }) => (
              <input type="datetime-local" className={inputCls(Boolean(errors.date_time_start))} {...field} />
            )} />
            {errors.date_time_start && (
              <p className="text-red-500 text-xs mt-1">{errors.date_time_start.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              End Time <span className="text-slate-300 font-normal normal-case">(optional)</span>
            </label>
            <Controller control={control} name="date_time_end" render={({ field }) => (
              <input type="datetime-local" className={inputCls()} {...field} value={field.value ?? ''} />
            )} />
          </div>
        </Section>

        {/* Intensity */}
        <Section title="Pain Intensity">
          <Controller control={control} name="pain_intensity" render={({ field }) => (
            <IntensitySlider value={field.value} onChange={field.onChange} />
          )} />
        </Section>

        {/* Location + Symptoms */}
        <Section title="Location & Symptoms">
          <Controller control={control} name="locations" render={({ field }) => (
            <MultiSelect label="Pain Location" options={PAIN_LOCATIONS} selected={field.value} onChange={field.onChange} />
          )} />
          <Controller control={control} name="symptoms" render={({ field }) => (
            <MultiSelect label="Symptoms" options={SYMPTOMS} selected={field.value} onChange={field.onChange} />
          )} />
        </Section>

        {/* Triggers */}
        <Section title="Triggers">
          <Controller control={control} name="triggers" render={({ field }) => (
            <MultiSelect options={TRIGGERS} selected={field.value} onChange={field.onChange} />
          )} />
          {showOther && (
            <div className="mt-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Other — describe
              </label>
              <Controller control={control} name="trigger_other" render={({ field }) => (
                <input className={inputCls()} placeholder="What else triggered it?" {...field} />
              )} />
            </div>
          )}
        </Section>

        {/* Medications */}
        <Section title="Medications">
          <Controller control={control} name="meds" render={({ field }) => (
            <MedsList meds={field.value as MedFormItem[]} onChange={v => setValue('meds', v)} />
          )} />
        </Section>

        {/* Notes */}
        <Section title="Notes">
          <Controller control={control} name="notes" render={({ field }) => (
            <textarea
              rows={3}
              className={`${inputCls()} resize-none`}
              placeholder="Anything else worth noting…"
              {...field}
            />
          )} />
        </Section>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full mt-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800
                     disabled:opacity-60 text-white font-bold py-4 rounded-2xl
                     text-base transition-colors shadow-sm shadow-violet-200"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </span>
          ) : (
            isEdit ? 'Save Changes' : 'Log Migraine'
          )}
        </button>
      </form>
    </div>
  );
}
