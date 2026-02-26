import express from 'express';
import cors from 'cors';
import path from 'path';
import entriesRouter from './routes/entries';
import insightsRouter from './routes/insights';
import dataRouter from './routes/data';

const app = express();
const PORT = process.env.PORT ?? 4000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb', type: 'application/json' }));

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/entries',  entriesRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/data',     dataRouter);

// ─── Serve React build in production (non-Vercel) ───────────────────────────
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const clientBuild = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuild));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
