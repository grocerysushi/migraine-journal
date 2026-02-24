import type { MigraineEntry, InsightData } from '../models';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
    throw new Error(err.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Entries ──────────────────────────────────────────────────────────────────

export const api = {
  listEntries: () => request<MigraineEntry[]>('/entries'),

  getEntry: (id: string) => request<MigraineEntry>(`/entries/${id}`),

  createEntry: (entry: Omit<MigraineEntry, 'id' | 'created_at' | 'updated_at'>) =>
    request<MigraineEntry>('/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }),

  updateEntry: (id: string, entry: Omit<MigraineEntry, 'id' | 'created_at' | 'updated_at'>) =>
    request<MigraineEntry>(`/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }),

  deleteEntry: (id: string) =>
    request<void>(`/entries/${id}`, { method: 'DELETE' }),

  // ─── Insights ────────────────────────────────────────────────────────────────

  getInsights: (days: number) => request<InsightData>(`/insights?days=${days}`),

  // ─── Data management ─────────────────────────────────────────────────────────

  exportData: async () => {
    const res = await fetch(`${BASE}/data/export`);
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migraine-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData: (json: string) =>
    request<{ imported: number; skipped: number }>('/data/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json,
    }),

  wipeData: () => request<void>('/data/wipe', { method: 'DELETE' }),
};
