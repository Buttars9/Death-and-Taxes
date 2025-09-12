// death-and-taxes/server/routes/vaultStatusRoutes.js

import express from 'express';
import { getPayout, queuePayout } from '../store/payoutStore.js';
import { getFiling } from '../store/filingStore.js';
import vaultAuditLogger from '../middleware/vaultAuditLogger.js';
import roleGate from '../middleware/roleGate.js';
import { persistHash } from '../utils/vaultHasher.js';

const router = express.Router();

// POST: Update payout status (RBAC + Audit + Hashing)
router.post('/:id', roleGate(['admin', 'auditor']), vaultAuditLogger, (req, res) => {
  const submissionId = req.params.id;
  const { status } = req.body;

  const payout = getPayout(submissionId);
  const filing = getFiling(submissionId);

  if (!payout || !filing) {
    return res.status(404).json({ error: 'Filing or payout not found' });
  }

  payout.status = status;
  persistHash(submissionId, { payout, filing });

  res.status(200).json({ message: 'Payout status updated and hashed', submissionId, status });
});

export default router;