import type { NextApiRequest, NextApiResponse } from 'next';
const app = require('../../../backend/index.js');

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return app(req, res);
}
