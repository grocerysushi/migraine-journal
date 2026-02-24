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

export interface EntryTrigger {
  trigger: Trigger;
  other_text?: string;
}

export interface Med {
  id: string;
  entry_id: string;
  name: string;
  dose: string;
  time_taken: string;
  relief: number;
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
  count: number;
  avgIntensity: number;
  topTriggers: { trigger: string; count: number }[];
  topSymptoms: { symptom: string; count: number }[];
  medsCount: number;
  rangeDays: number;
}
