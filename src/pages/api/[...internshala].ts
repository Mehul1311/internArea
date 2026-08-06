import type { NextApiRequest, NextApiResponse } from 'next';
import app from '../../../backend/index.js';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("Next.js received:", req.method, req.url);
    return app(req, res);
  } catch (error: any) {
    console.error("API Route Init Error:", error);
    return res.status(400).json({ error: "API Route Init Error: " + error.message, stack: error.stack });
  }
}
