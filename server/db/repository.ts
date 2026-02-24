import { getDb } from './database';
import type { MigraineEntry, InsightData, EntryTrigger, Med, PainLocation, Symptom } from '../models';

// ─── Row types ────────────────────────────────────────────────────────────────

interface EntryRow {
  id: string; date_time_start: string; date_time_end: string | null;
  pain_intensity: number; notes: string; created_at: string; updated_at: string;
}
interface LocationRow { entry_id: string; location: string }
interface SymptomRow  { entry_id: string; symptom: string }
interface TriggerRow  { entry_id: string; trigger: string; other_text: string | null }
interface MedRow      { id: string; entry_id: string; name: string; dose: string; time_taken: string; relief: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fetchRelated(entryId: string) {
  const db = getDb();
  const locations = (db.prepare('SELECT * FROM entry_locations WHERE entry_id = ?').all(entryId) as LocationRow[])
    .map(r => r.location as PainLocation);
  const symptoms = (db.prepare('SELECT * FROM entry_symptoms WHERE entry_id = ?').all(entryId) as SymptomRow[])
    .map(r => r.symptom as Symptom);
  const triggers = (db.prepare('SELECT * FROM entry_triggers WHERE entry_id = ?').all(entryId) as TriggerRow[])
    .map(r => ({ trigger: r.trigger as EntryTrigger['trigger'], other_text: r.other_text ?? undefined }));
  const meds = (db.prepare('SELECT * FROM entry_meds WHERE entry_id = ? ORDER BY time_taken').all(entryId) as MedRow[])
    .map(r => ({ ...r } as Med));
  return { locations, symptoms, triggers, meds };
}

function rowToEntry(row: EntryRow): MigraineEntry {
  return {
    ...row,
    date_time_end: row.date_time_end ?? undefined,
    ...fetchRelated(row.id),
  };
}

function upsertRelated(db: ReturnType<typeof getDb>, entry: MigraineEntry): void {
  db.prepare('DELETE FROM entry_locations WHERE entry_id = ?').run(entry.id);
  db.prepare('DELETE FROM entry_symptoms  WHERE entry_id = ?').run(entry.id);
  db.prepare('DELETE FROM entry_triggers  WHERE entry_id = ?').run(entry.id);
  db.prepare('DELETE FROM entry_meds      WHERE entry_id = ?').run(entry.id);

  const insLoc = db.prepare('INSERT INTO entry_locations (entry_id, location) VALUES (?, ?)');
  const insSym = db.prepare('INSERT INTO entry_symptoms (entry_id, symptom) VALUES (?, ?)');
  const insTrg = db.prepare('INSERT INTO entry_triggers (entry_id, trigger, other_text) VALUES (?, ?, ?)');
  const insMed = db.prepare('INSERT INTO entry_meds (id, entry_id, name, dose, time_taken, relief) VALUES (?, ?, ?, ?, ?, ?)');

  for (const loc of entry.locations)  insLoc.run(entry.id, loc);
  for (const sym of entry.symptoms)   insSym.run(entry.id, sym);
  for (const t   of entry.triggers)   insTrg.run(entry.id, t.trigger, t.other_text ?? null);
  for (const m   of entry.meds)       insMed.run(m.id, entry.id, m.name, m.dose, m.time_taken, m.relief);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function createEntry(entry: MigraineEntry): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare(
      `INSERT INTO migraine_entries (id, date_time_start, date_time_end, pain_intensity, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(entry.id, entry.date_time_start, entry.date_time_end ?? null, entry.pain_intensity, entry.notes, entry.created_at, entry.updated_at);
    upsertRelated(db, entry);
  })();
}

export function updateEntry(entry: MigraineEntry): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare(
      `UPDATE migraine_entries SET date_time_start=?, date_time_end=?, pain_intensity=?, notes=?, updated_at=? WHERE id=?`
    ).run(entry.date_time_start, entry.date_time_end ?? null, entry.pain_intensity, entry.notes, entry.updated_at, entry.id);
    upsertRelated(db, entry);
  })();
}

export function deleteEntry(id: string): void {
  getDb().prepare('DELETE FROM migraine_entries WHERE id = ?').run(id);
}

export function getEntryById(id: string): MigraineEntry | null {
  const row = getDb().prepare('SELECT * FROM migraine_entries WHERE id = ?').get(id) as EntryRow | undefined;
  return row ? rowToEntry(row) : null;
}

export function listEntries(): MigraineEntry[] {
  const rows = getDb().prepare('SELECT * FROM migraine_entries ORDER BY date_time_start DESC').all() as EntryRow[];
  return rows.map(rowToEntry);
}

export function getInsights(rangeDays: number): InsightData {
  const db = getDb();
  const since = new Date(Date.now() - rangeDays * 86400000).toISOString();
  const entries = db.prepare('SELECT * FROM migraine_entries WHERE date_time_start >= ?').all(since) as EntryRow[];

  if (!entries.length) return { count: 0, avgIntensity: 0, topTriggers: [], topSymptoms: [], medsCount: 0, rangeDays };

  const ids = entries.map(e => e.id);
  const ph  = ids.map(() => '?').join(',');

  const triggers = db.prepare(`SELECT trigger FROM entry_triggers WHERE entry_id IN (${ph})`).all(...ids) as { trigger: string }[];
  const symptoms = db.prepare(`SELECT symptom FROM entry_symptoms WHERE entry_id IN (${ph})`).all(...ids) as { symptom: string }[];
  const meds     = db.prepare(`SELECT id      FROM entry_meds     WHERE entry_id IN (${ph})`).all(...ids) as { id: string }[];

  const avgIntensity = entries.reduce((s, e) => s + e.pain_intensity, 0) / entries.length;

  const countMap = <T extends string>(arr: T[]) =>
    arr.reduce<Record<string, number>>((acc, v) => { acc[v] = (acc[v] ?? 0) + 1; return acc; }, {});

  const topTriggers = Object.entries(countMap(triggers.map(t => t.trigger)))
    .map(([trigger, count]) => ({ trigger, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  const topSymptoms = Object.entries(countMap(symptoms.map(s => s.symptom)))
    .map(([symptom, count]) => ({ symptom, count })).sort((a, b) => b.count - a.count).slice(0, 5);

  return {
    count: entries.length,
    avgIntensity: Math.round(avgIntensity * 10) / 10,
    topTriggers, topSymptoms,
    medsCount: meds.length,
    rangeDays,
  };
}

export function exportJson(): string {
  return JSON.stringify({ version: 1, exported_at: new Date().toISOString(), entries: listEntries() }, null, 2);
}

export function importJson(json: string): { imported: number; skipped: number } {
  const parsed = JSON.parse(json) as { entries?: MigraineEntry[] };
  if (!Array.isArray(parsed?.entries)) throw new Error('Invalid format');
  let imported = 0, skipped = 0;
  for (const entry of parsed.entries) {
    if (!entry.id || !entry.date_time_start || entry.pain_intensity == null) { skipped++; continue; }
    if (getEntryById(entry.id)) { skipped++; continue; }
    createEntry(entry);
    imported++;
  }
  return { imported, skipped };
}

export function wipeAllData(): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare('DELETE FROM entry_meds').run();
    db.prepare('DELETE FROM entry_triggers').run();
    db.prepare('DELETE FROM entry_symptoms').run();
    db.prepare('DELETE FROM entry_locations').run();
    db.prepare('DELETE FROM migraine_entries').run();
  })();
}
