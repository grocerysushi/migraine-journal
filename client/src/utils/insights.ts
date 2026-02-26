import { parseISO, startOfWeek, format } from 'date-fns';
import type { MigraineEntry } from '../models';

export function intensityLabel(value: number): string {
  if (value === 0) return 'None';
  if (value <= 2)  return 'Mild';
  if (value <= 4)  return 'Moderate';
  if (value <= 6)  return 'Severe';
  if (value <= 8)  return 'Very Severe';
  return 'Worst Possible';
}

export function intensityColor(value: number): string {
  if (value === 0) return '#6BCB77';
  if (value <= 2)  return '#A8D672';
  if (value <= 4)  return '#FFD93D';
  if (value <= 6)  return '#FF9A3C';
  if (value <= 8)  return '#FF6B6B';
  return '#C62828';
}

export function intensityBg(value: number): string {
  if (value === 0) return 'bg-green-100 text-green-700';
  if (value <= 2)  return 'bg-lime-100 text-lime-700';
  if (value <= 4)  return 'bg-yellow-100 text-yellow-700';
  if (value <= 6)  return 'bg-orange-100 text-orange-700';
  if (value <= 8)  return 'bg-red-100 text-red-700';
  return 'bg-red-200 text-red-900';
}

export function bucketByWeek(entries: MigraineEntry[], rangeDays: number): { label: string; count: number }[] {
  if (entries.length === 0) return [];

  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - rangeDays);

  const buckets = new Map<string, number>();

  for (const e of entries) {
    const date = parseISO(e.date_time_start);
    if (date < cutoff) continue;
    const weekStart = startOfWeek(date);
    const key = format(weekStart, 'MMM d');
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  return Array.from(buckets.entries())
    .map(([label, count]) => ({ label, count }));
}

export function intensityDistribution(entries: MigraineEntry[]): { level: number; count: number }[] {
  const counts = new Array(11).fill(0);
  for (const e of entries) {
    const level = Math.min(10, Math.max(0, Math.round(e.pain_intensity)));
    counts[level]++;
  }
  return counts.map((count, level) => ({ level, count })).filter(d => d.count > 0);
}
