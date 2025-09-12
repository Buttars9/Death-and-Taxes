// death-and-taxes/server/routes/signatureRoutes.js

import express from 'express';
import { recordSignature, getSignatureStatus } from '../store/signatureStore.js';

const router = express.Router();

// POST: Record signature
router.post('/:id', (req, res) => {
  const submissionId = req.params.id;

  try {
    recordSignature(submissionId);
    res.status(200).json({ message: 'Signature recorded', submissionId });
  } catch (err) {
    console.error('Signature recording error:', err);
    res.status(500).json({ error: 'Failed to record signature' });
  }
});

// GET: Check signature status
router.get('/:id', (req, res) => {
  const submissionId = req.params.id;
  const status = getSignatureStatus(submissionId);

  if (!status) {
    return res.status(404).json({ error: 'Signature not found' });
  }

  res.status(200).json(status);
});

export default router;