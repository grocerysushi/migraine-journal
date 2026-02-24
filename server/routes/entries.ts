import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  createEntry, updateEntry, deleteEntry,
  getEntryById, listEntries,
} from '../db/repository';
import type { MigraineEntry } from '../models';

const router = Router();

// GET /api/entries
router.get('/', (_req, res) => {
  try {
    res.json(listEntries());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/entries/:id
router.get('/:id', (req, res) => {
  try {
    const entry = getEntryById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Not found' });
    res.json(entry);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/entries
router.post('/', (req, res) => {
  try {
    const now = new Date().toISOString();
    const entry: MigraineEntry = {
      ...req.body as MigraineEntry,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    };
    createEntry(entry);
    res.status(201).json(entry);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// PUT /api/entries/:id
router.put('/:id', (req, res) => {
  try {
    const existing = getEntryById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const entry: MigraineEntry = {
      ...req.body as MigraineEntry,
      id: req.params.id,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    };
    updateEntry(entry);
    res.json(entry);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// DELETE /api/entries/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = getEntryById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    deleteEntry(req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
