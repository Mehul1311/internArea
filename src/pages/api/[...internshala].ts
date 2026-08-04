import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const app = require('../../../backend/index.js');
    return app(req, res);
  } catch (error: any) {
    console.error("API Route Init Error:", error);
    return res.status(400).json({ error: "API Route Init Error: " + error.message, stack: error.stack });
  }
}
