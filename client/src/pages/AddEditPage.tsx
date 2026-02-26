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
import { StepWizard } from '../components/StepWizard';
import { toFormDateTime, formDateTimeToIso } from '../utils/dateHelpers';

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

const inputCls = (err?: boolean) =>
  `w-full bg-[var(--surface-elevated)] border rounded-xl px-3.5 py-3 text-sm text-[var(--text-primary)]
   placeholder:text-[var(--muted)] motion-safe:transition-colors min-h-[44px]
   focus:outline-none focus:bg-[var(--surface-card)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
   ${err ? 'border-red-400 bg-red-500/5' : 'border-[var(--border)]'}`;

const STEPS = ['When & How Bad', 'Where & What', 'Why', 'Treatment & Notes'];

export function AddEditPage() {
  const { id }    = useParams<{ id?: string }>();
  const navigate  = useNavigate();
  const isEdit    = Boolean(id);
  const [loading, setLoading]     = useState(isEdit);
  const [saving,  setSaving]      = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [step, setStep]           = useState(0);

  const { control, handleSubmit, reset, watch, setValue, trigger, formState: { errors } } =
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

  const stepFields: (keyof FormValues)[][] = [
    ['date_time_start', 'pain_intensity'],
    ['locations', 'symptoms'],
    ['triggers'],
    ['meds', 'notes'],
  ];

  const handleNext = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full motion-safe:animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[var(--surface)]/90 backdrop-blur-md px-5 pt-10 pb-3 mb-2">
        <div className="flex items-center justify-between">
          {isEdit && (
            <button onClick={() => navigate(-1)} className="text-[var(--accent)] font-semibold text-sm mr-4 min-h-[44px]">
              ← Back
            </button>
          )}
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight flex-1">
            {isEdit ? 'Edit Entry' : 'Log Migraine'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-4 pb-8">
        {serverErr && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl px-4 py-3 mb-3 text-sm">
            {serverErr}
          </div>
        )}

        <StepWizard
          steps={STEPS}
          current={step}
          onBack={() => setStep(s => Math.max(s - 1, 0))}
          onNext={handleNext}
          onSubmit={handleSubmit(onSubmit)}
          submitting={saving}
        >
          {/* Step 1: When & How Bad */}
          {step === 0 && (
            <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] p-5">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">
                  Start Time *
                </label>
                <Controller control={control} name="date_time_start" render={({ field }) => (
                  <input type="datetime-local" className={inputCls(Boolean(errors.date_time_start))} {...field} />
                )} />
                {errors.date_time_start && (
                  <p className="text-red-500 text-xs mt-1">{errors.date_time_start.message}</p>
                )}
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">
                  End Time <span className="text-[var(--muted)] font-normal normal-case">(optional)</span>
                </label>
                <Controller control={control} name="date_time_end" render={({ field }) => (
                  <input type="datetime-local" className={inputCls()} {...field} value={field.value ?? ''} />
                )} />
              </div>
              <Controller control={control} name="pain_intensity" render={({ field }) => (
                <IntensitySlider value={field.value} onChange={field.onChange} label="Pain Intensity" />
              )} />
            </div>
          )}

          {/* Step 2: Where & What */}
          {step === 1 && (
            <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] p-5">
              <Controller control={control} name="locations" render={({ field }) => (
                <MultiSelect label="Pain Location" options={PAIN_LOCATIONS} selected={field.value} onChange={field.onChange} />
              )} />
              <Controller control={control} name="symptoms" render={({ field }) => (
                <MultiSelect label="Symptoms" options={SYMPTOMS} selected={field.value} onChange={field.onChange} />
              )} />
            </div>
          )}

          {/* Step 3: Why */}
          {step === 2 && (
            <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] p-5">
              <Controller control={control} name="triggers" render={({ field }) => (
                <MultiSelect label="Triggers" options={TRIGGERS} selected={field.value} onChange={field.onChange} />
              )} />
              {showOther && (
                <div className="mt-1">
                  <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">
                    Other — describe
                  </label>
                  <Controller control={control} name="trigger_other" render={({ field }) => (
                    <input className={inputCls()} placeholder="What else triggered it?" {...field} />
                  )} />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Treatment & Notes */}
          {step === 3 && (
            <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] p-5">
              <Controller control={control} name="meds" render={({ field }) => (
                <MedsList meds={field.value as MedFormItem[]} onChange={v => setValue('meds', v)} />
              )} />
              <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2.5">Notes</p>
              <Controller control={control} name="notes" render={({ field }) => (
                <textarea
                  rows={3}
                  className={`${inputCls()} resize-none`}
                  placeholder="Anything else worth noting…"
                  {...field}
                />
              )} />
            </div>
          )}
        </StepWizard>
      </form>
    </div>
  );
}
