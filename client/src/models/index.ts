export type PainLocation =
  | 'left' | 'right' | 'frontal' | 'temporal'
  | 'occipital' | 'behind_eye' | 'neck';

export type Symptom =
  | 'nausea' | 'vomiting' | 'aura' | 'sensitivity_light'
  | 'sensitivity_sound' | 'dizziness' | 'fatigue' | 'brain_fog';

export type Trigger =
  | 'stress' | 'sleep_change' | 'dehydration' | 'caffeine' | 'alcohol'
  | 'weather' | 'hormones' | 'food' | 'screen_time' | 'exertion'
  | 'missed_meal' | 'other';

export const PAIN_LOCATIONS: { value: PainLocation; label: string }[] = [
  { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' },
  { value: 'frontal', label: 'Frontal' }, { value: 'temporal', label: 'Temporal' },
  { value: 'occipital', label: 'Occipital' }, { value: 'behind_eye', label: 'Behind Eye' },
  { value: 'neck', label: 'Neck' },
];

export const SYMPTOMS: { value: Symptom; label: string }[] = [
  { value: 'nausea', label: 'Nausea' }, { value: 'vomiting', label: 'Vomiting' },
  { value: 'aura', label: 'Aura' }, { value: 'sensitivity_light', label: 'Light Sensitivity' },
  { value: 'sensitivity_sound', label: 'Sound Sensitivity' }, { value: 'dizziness', label: 'Dizziness' },
  { value: 'fatigue', label: 'Fatigue' }, { value: 'brain_fog', label: 'Brain Fog' },
];

export const TRIGGERS: { value: Trigger; label: string }[] = [
  { value: 'stress', label: 'Stress' }, { value: 'sleep_change', label: 'Sleep Change' },
  { value: 'dehydration', label: 'Dehydration' }, { value: 'caffeine', label: 'Caffeine' },
  { value: 'alcohol', label: 'Alcohol' }, { value: 'weather', label: 'Weather' },
  { value: 'hormones', label: 'Hormones' }, { value: 'food', label: 'Food' },
  { value: 'screen_time', label: 'Screen Time' }, { value: 'exertion', label: 'Exertion' },
  { value: 'missed_meal', label: 'Missed Meal' }, { value: 'other', label: 'Other' },
];

export interface EntryTrigger { trigger: Trigger; other_text?: string }

export interface Med {
  id: string; entry_id: string; name: string;
  dose: string; time_taken: string; relief: number;
}

export interface MigraineEntry {
  id: string;
  date_time_start: string;
  date_time_end?: string;
  pain_intensity: number;
  locations: PainLocation[];
  symptoms: Symptom[];
  triggers: EntryTrigger[];
  meds: Med[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface InsightData {
  count: number; avgIntensity: number;
  topTriggers: { trigger: string; count: number }[];
  topSymptoms: { symptom: string; count: number }[];
  medsCount: number; rangeDays: number;
}
