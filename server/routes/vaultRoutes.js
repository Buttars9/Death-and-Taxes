// death-and-taxes/server/routes/vaultRoutes.js

import express from 'express';
import { getFiling } from '../store/filingStore.js';
import { getSignatureStatus } from '../store/signatureStore.js';
import { getPayout } from '../store/payoutStore.js';

const router = express.Router();

// GET: Return all signed filings with payout info
router.get('/', (req, res) => {
  const vault = [];

  for (const [id, filing] of getFiling.entries()) {
    const signature = getSignatureStatus(id);
    const payout = getPayout(id);

    if (filing?.payload?.trustConfirmed && signature?.signedAt) {
      vault.push({
        id,
        refundEstimate: filing.payload.credits?.length || 0,
        signedAt: signature.signedAt,
        payoutStatus: payout?.status || null,
        payoutQueuedAt: payout?.queuedAt || null
      });
    }
  }

  res.status(200).json(vault);
});

export default router;