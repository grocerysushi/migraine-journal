import { Router } from 'express';
import { exportJson, importJson, wipeAllData } from '../db/repository';

const router = Router();

// GET /api/data/export  → download JSON file
router.get('/export', (_req, res) => {
  try {
    const json = exportJson();
    const filename = `migraine-export-${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(json);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/data/import  → body: JSON string
router.post('/import', (req, res) => {
  try {
    const json = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const result = importJson(json);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

// DELETE /api/data/wipe
router.delete('/wipe', (_req, res) => {
  try {
    wipeAllData();
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
