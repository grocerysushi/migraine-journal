import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';

export function formatDateTime(iso: string): string {
  try { const d = parseISO(iso); return isValid(d) ? format(d, 'MMM d, yyyy · h:mm a') : iso; }
  catch { return iso; }
}

export function formatMonthGroup(iso: string): string {
  try { const d = parseISO(iso); return isValid(d) ? format(d, 'MMMM yyyy') : ''; }
  catch { return ''; }
}

export function formatTime(iso: string): string {
  try { const d = parseISO(iso); return isValid(d) ? format(d, 'h:mm a') : iso; }
  catch { return iso; }
}

export function toFormDateTime(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function formDateTimeToIso(value: string): string {
  if (!value) return '';
  try { const d = new Date(value); return isValid(d) ? d.toISOString() : ''; }
  catch { return ''; }
}

export function durationMinutes(start: string, end: string): number {
  try { return Math.round((parseISO(end).getTime() - parseISO(start).getTime()) / 60000); }
  catch { return 0; }
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60), m = minutes % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

export function timeAgo(iso: string): string {
  try { const d = parseISO(iso); return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : ''; }
  catch { return ''; }
}
