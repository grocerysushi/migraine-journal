import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;
let initError: string | null = null;

try {
  app = require('../server/index').default;
} catch (e: any) {
  initError = e?.message ?? String(e);
  console.error('Failed to initialize Express app:', e);
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (initError) {
    return res.status(500).json({ error: 'Server initialization failed', details: initError });
  }
  return app(req, res);
}
