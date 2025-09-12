// death-and-taxes/server/routes/filings.js

import express from 'express';
import { dbConnect } from '../lib/dbConnect.js';
import Filing from '../models/Filing.js';
import { authGate } from '../middleware/authGate.js';

const router = express.Router();

router.get('/', authGate, async (req, res) => {
  await dbConnect();

  try {
    const { userEmail } = req;
    if (!userEmail) {
      return res.status(400).json({ error: 'Missing user email from auth' });
    }

    const filings = await Filing.find({ 'refund.userEmail': userEmail })
      .sort({ submittedAt: -1 })
      .select('refund submittedAt vaultUrl status');

    const results = filings.map((f) => ({
      filingId: f._id.toString(),
      submittedAt: f.submittedAt,
      refund: f.refund,
      vaultUrl: f.vaultUrl,
      status: f.status,
    }));

    return res.status(200).json({ filings: results });
  } catch (err) {
    console.error('Filings lookup failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;