import { Router } from 'express';
import { getInsights } from '../db/repository';

const router = Router();

// GET /api/insights?days=30
router.get('/', (req, res) => {
  try {
    const days = parseInt(String(req.query.days ?? '30'), 10);
    if (isNaN(days) || days <= 0) return res.status(400).json({ error: 'Invalid days param' });
    res.json(getInsights(days));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
